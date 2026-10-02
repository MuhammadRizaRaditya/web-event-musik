# BRD Lanjutan — Functional Requirements Detail
**Soundwave Fest 2026** | Versi 1.0 | Build Execution

---

## 1. Modul: Authentication & Authorization

### FR-AUTH-001: Registrasi Customer
**Given** user mengakses `/register`  
**When** user submit email, password, nama, telepon  
**Then** sistem:
- Validasi email unique, password min 8 char (huruf+angka)
- Hash password bcrypt cost 12
- Kirim email verifikasi (token JWT 24h)
- Return 201 Created, user status `is_active=false` sampai verifikasi

### FR-AUTH-002: Verifikasi Email
**Given** user klik link verifikasi email  
**When** token valid & not expired  
**Then** `email_verified_at` = now, `is_active=true`, redirect ke login dengan success message

### FR-AUTH-003: Login
**Given** user submit email + password  
**When** kredensial valid & `is_active=true`  
**Then** return:
- Access Token (JWT RS256, 15 min, claims: `sub`, `email`, `roles`, `permissions`)
- Refresh Token (opaque, 7 hari, httpOnly Secure SameSite=Strict cookie, rotation enabled)
- User profile (id, name, email, roles)

### FR-AUTH-004: Refresh Token Rotation
**Given** client POST `/auth/refresh` dengan refresh token cookie  
**When** token valid & not revoked  
**Then** issue new access token + new refresh token (rotate), revoke old refresh token, return new access token

### FR-AUTH-005: Logout
**Given** user POST `/auth/logout`  
**When** access token valid  
**Then** revoke refresh token (soft delete), clear cookie, return 200

### FR-AUTH-006: Forgot/Reset Password
**Given** user request reset → email kirim token (1h expiry)  
**When** user submit token + password baru  
**Then** validasi token, hash password baru, revoke all refresh tokens, return success

---

## 2. Modul: Event Management (Admin)

### FR-EVT-001: Create Event
**Given** Event Organizer POST `/admin/events` dengan payload valid  
**When** data valid (slug unique, start_date < end_date, venue exists)  
**Then** create event dengan `organizer_id` = current user, status=`draft`, return 201

### FR-EVT-002: Publish Event
**Given** Event Organizer PUT `/admin/events/:id/status` ke `published`  
**When** event punya minimal 1 ticket_type dengan quota > 0 & sale_start <= now  
**Then** status=`published`, event muncul di publik API

### FR-EVT-003: Event Status Transition
| Dari | Ke | Syarat |
|---|---|---|
| draft | published | Ticket type ready |
| published | ongoing | now >= start_date |
| ongoing | completed | now >= end_date |
| * | cancelled | Manual admin (cascade: ticket_type status=closed, order pending→cancelled) |

### FR-EVT-004: RLS Enforcement
**Policy:** `CREATE POLICY event_organizer_isolation ON events USING (organizer_id = current_setting('app.current_user_id')::uuid)`  
**Effect:** Event Organizer hanya CRUD event miliknya; SuperAdmin bypass.

---

## 3. Modul: Ticketing

### FR-TKT-001: Create Ticket Type
**Given** Event Organizer POST `/admin/events/:eventId/ticket-types`  
**When** validasi: price >= 0, quota > 0, sale_start < sale_end, max_per_customer > 0 atau null  
**Then** create ticket_type, status=`available`, sold_count=0

### FR-TKT-002: Auto Status Update
**Trigger:** Setiap perubahan `sold_count` atau waktu  
**Logic:**
```
IF now < sale_start              → status = 'closed' (belum mulai)
ELSE IF now > sale_end           → status = 'closed' (sudah berakhir)
ELSE IF sold_count >= quota      → status = 'sold_out'
ELSE IF sold_count >= quota*0.9  → status = 'almost_sold_out'
ELSE                              → status = 'available'
```

### FR-TKT-003: Capacity Validation
**Constraint:** `CHECK (sold_count <= quota)` pada tabel `ticket_types` — **database-level guard**.

---

## 4. Modul: Checkout & Order

### FR-ORD-001: Create Order (Anti-Overselling)
**Given** Customer POST `/api/v1/orders` dengan `{event_id, items:[{ticket_type_id, quantity}], buyer, holder[], promo_code?}`  
**When** dalam transaksi DB:
```sql
BEGIN;
SELECT * FROM ticket_types WHERE id IN (...) FOR UPDATE; -- LOCK ROWS
-- Validasi per item:
--   ticket_type.status = 'available'
--   now BETWEEN sale_start AND sale_end
--   quantity <= max_per_customer (jika set)
--   (sold_count + quantity) <= quota
-- Hitung subtotal, service_fee, tax, discount, total
INSERT INTO orders (...) VALUES (...) RETURNING id;
INSERT INTO order_items (...) VALUES (...);
UPDATE ticket_types SET sold_count = sold_count + quantity WHERE id = ...;
COMMIT;
```
**Then** return order_id, order_code, payment_deadline (30 menit), payment_url (Midtrans Snap)

### FR-ORD-002: Order Expiry Job
**Cron:** Setiap 5 menit  
**Action:** `UPDATE orders SET status='expired' WHERE status='pending' AND payment_deadline < now()`  
**Cascade:** Release kuota ticket_type (decrement sold_count) — **DALAM TRANSAKSI SAMA** dengan lock FOR UPDATE

### FR-ORD-003: Cancel Order (Customer)
**Given** Customer POST `/api/v1/orders/:id/cancel`  
**When** order.status = `pending` DAN order.customer_id = current_user  
**Then** status=`cancelled`, release kuota (decrement sold_count dalam transaksi)

---

## 5. Modul: Payment (Midtrans)

### FR-PAY-001: Create Transaction
**Given** Order created (status=pending)  
**When** backend call Midtrans Snap API dengan `order_id`, `gross_amount`, `customer_details`, `item_details`  
**Then** return `payment_url` (redirect Snap), simpan `payment.id` dengan `idempotency_key` = `order_id`

### FR-PAY-002: Webhook Handler (Critical Security)
**Endpoint:** `POST /api/v1/payments/webhook` (public, no auth)  
**Flow:**
```
1. Raw body capture (Express: app.use(express.raw({type: 'application/json'})))
2. Verify HMAC SHA512 signature: header 'X-Signature' vs hash(raw_body + server_key)
3. Parse JSON → event notification
4. Check idempotency: SELECT 1 FROM payments WHERE idempotency_key = event.transaction_id
   → IF EXISTS: return 200 OK (already processed)
5. Verify status ke Midtrans Core API (GET /v2/{order_id}/status)
6. IF status = 'settlement'/'capture':
      BEGIN TRANSACTION
      UPDATE orders SET status='paid', paid_at=now() WHERE order_code=event.order_id
      INSERT INTO payments (...) VALUES (...)
      CALL generate_e_tickets(order_id)  -- see FR-ETK-001
      COMMIT
   ELSE IF status = 'expire'/'cancel'/'deny':
      UPDATE orders SET status='expired'/'cancelled'/'failed'
      RELEASE quota (decrement sold_count) — WITH FOR UPDATE
7. Return 200 OK
```

### FR-PAY-003: Polling Fallback
**Given** Webhook gagal/delay  
**When** Customer buka halaman status / cron job  
**Then** GET `/api/v1/payments/:orderId/status` → call Midtrans API → sync status seperti webhook

---

## 6. Modul: E-Ticket & QR Code

### FR-ETK-001: Generate E-Tickets
**Trigger:** Order status → `paid` (dari webhook)  
**For each** `order_items` (quantity N):
```
LOOP N times:
  ticket_number = `${event_code}-${random_alphanum(8)}` -- unique
  jwt_payload = {
    tid: ticket_id,
    tno: ticket_number,
    hn: holder_name,
    eid: event_id,
    tty: ticket_type_name,
    exp: event_end_date + 1 hour,
    iat: now()
  }
  qr_token = RS256_sign(jwt_payload, private_key)
  qr_image = generate_qr_code_png(qr_token)
  pdf = generate_pdf({event, holder, ticket_number, qr_image})
  INSERT INTO tickets (..., qr_code_data=qr_token, status='valid')
  Email PDF to holder_email (queue BullMQ)
```

### FR-ETK-002: QR Verification (Offline-Capable)
**Public Key** (PEM) bundled di PWA Scanner build time.  
**Verify Logic (client-side):**
```
1. Decode QR → JWT string
2. Verify RS256 signature dengan public key
3. Check exp > now()
4. Check event_id matches current event
5. Display: holder_name, ticket_type, status (from local cache if offline)
```

### FR-ETK-003: Server-Side Validation (Check-in API)
**Endpoint:** `POST /api/v1/check-in/validate` (Gate Staff)  
**Body:** `{qr_token, gate_id}`  
**Flow:**
```
1. Verify RS256 signature (server private key not needed, public key)
2. Decode payload → ticket_id
3. SELECT * FROM tickets WHERE id = ticket_id FOR UPDATE
4. IF not found → 404 "Tiket tidak ditemukan"
5. IF status != 'valid' → 409 "Tiket sudah digunakan/dibatalkan"
6. IF event_id != current_event → 403 "Tiket bukan untuk event ini"
7. INSERT INTO ticket_checkins (ticket_id, gate_id, staff_id, scanned_at, is_offline=false)
8. UPDATE tickets SET status='used', checked_in_at=now(), checked_in_gate=gate_id, checked_in_by=staff_id
9. Return 200 {ticket_id, ticket_number, holder_name, ticket_type, message: 'Check-in berhasil'}
```

---

## 7. Modul: Check-in (PWA Scanner)

### FR-CHK-001: Offline Scan
**Given** Gate Staff buka `/scanner` (PWA, sudah di-cache)  
**When** offline (no navigator.onLine)  
**Then:**
- Camera jalan, QR decode jalan
- JWT verify dengan public key (cached di IndexedDB)
- Local validation: check `exp`, `event_id`, status dari local cache `tickets_cache`
- Simpan ke IndexedDB `pending_checkins`: `{ticket_id, gate_id, staff_id, scanned_at, device_id, is_offline: true}`
- UI tampil: "Tersimpan offline, akan sinkron saat online"

### FR-CHK-002: Delta Sync
**Trigger:** `navigator.onLine` true + periodic (30s)  
**Action:**
```
pending = getAll(pending_checkins WHERE synced_at IS NULL)
IF pending.length > 0:
  POST /api/v1/check-in/sync {checkins: pending}
  ON SUCCESS: update each pending SET synced_at=now()
  ON CONFLICT (ticket_id): mark local as 'conflict_rejected', notify UI
```

---

## 8. Modul: Admin Dashboard & Reporting

### FR-RPT-001: Real-time Dashboard Widgets
**Query Examples:**
```sql
-- Total Tickets Sold (real-time)
SELECT SUM(sold_count) FROM ticket_types WHERE event_id IN (assigned_events);

-- Revenue (paid orders only)
SELECT SUM(total_amount) FROM orders WHERE status='paid' AND event_id IN (...);

-- Check-in Progress
SELECT 
  COUNT(*) FILTER (WHERE status='used') as checked_in,
  COUNT(*) as total_tickets
FROM tickets WHERE event_id = ...;
```

### FR-RPT-002: Financial Reports (Finance Role)
| Report | Query Key |
|---|---|
| Penjualan Tiket | `orders` + `order_items` + `ticket_types` (filter paid) |
| Transaksi Payment | `payments` JOIN `orders` (filter gateway=midtrans) |
| Revenue Kotor | `SUM(total_amount)` paid orders |
| Service Fee | `SUM(service_fee)` paid orders |
| Tax Collected | `SUM(tax_amount)` paid orders |
| Discount/Voucher | `SUM(discount_amount)` paid orders + `promo_usages` |
| Refund | `refunds` JOIN `orders` |
| Settlement | `payments` WHERE status=success GROUP BY DATE(paid_at) |
| Net Revenue | Revenue - Refund - Service Fee |

### FR-RPT-003: Export CSV/Excel
**Endpoint:** `GET /admin/reports/:type/export?format=csv&date_from=&date_to=&event_id=`  
**Implementation:** Streaming response, chunked query (cursor) untuk dataset besar.

---

## 9. Modul: Promo/Voucher

### FR-PRM-001: Apply Promo at Checkout
**Given** Checkout request dengan `promo_code`  
**When** validasi:
- `promo_codes.code` = input & `is_active=true`
- `now` BETWEEN `valid_from` AND `valid_until`
- `used_count` < `max_uses` (jika set)
- `promo_usages` count untuk customer < `max_uses_per_customer`
- `ticket_type_ids` contains item.ticket_type_id (jika restricted)
**Then** hitung diskon:
- `percentage`: `discount = subtotal * value / 100` (max `value`%)
- `fixed_amount`: `discount = value`
**Insert** `promo_usages` record (atomic dalam transaksi order)

---

## 10. Modul: Notification

### FR-NTF-001: Email Templates (DB-Driven)
| Code | Trigger | Channel | Variables |
|---|---|---|---|
| `order_created` | Order pending | Email | `order_code`, `payment_deadline`, `payment_url` |
| `payment_success` | Order paid | Email+Push | `order_code`, `ticket_download_url` |
| `ticket_issued` | E-ticket generated | Email | `ticket_number`, `pdf_attachment` |
| `payment_reminder` | H-1 payment_deadline | Email+Push | `order_code`, `hours_left` |
| `event_reminder` | H-1 event start | Email+Push | `event_name`, `date`, `venue` |
| `schedule_change` | Schedule updated | Email+Push | `event_name`, `changes` |
| `refund_processed` | Refund completed | Email | `order_code`, `amount` |

### FR-NTF-002: Queue Processing
**BullMQ Queue:** `notifications`  
**Worker:** Process job → render template → send via Resend → update `notifications` status (`sent`/`failed`) → retry 3x exponential backoff

---

## 11. Business Rules (BR) — Traceability

| BR Code | Description | Implementation Ref |
|---|---|---|
| BR-01 | Tiket hanya diterbitkan setelah payment verified | FR-PAY-002 step 6, FR-ETK-001 |
| BR-02 | Tiket used tidak bisa check-in lagi | FR-ETK-003 step 5, unique constraint ticket_checkins |
| BR-03 | Order expired otomatis release quota | FR-ORD-002 cron job |
| BR-04 | Kuota tidak boleh > kapasitas venue | CHECK constraint + app validation |
| BR-05 | Harga diambil dari server, bukan frontend | FR-ORD-001 hitung ulang di backend |
| BR-06 | Payment verified via webhook + API verify | FR-PAY-002 step 5 |
| BR-07 | Satu QR = satu check-in valid | FR-ETK-003 step 7-8, append-only log |
| BR-08 | Tiket cancelled/refunded → status invalid | FR-ETK-003 step 5 |
| BR-09 | Organizer isolasi data event (RLS) | FR-EVT-004 RLS policy |
| BR-10 | Audit log semua perubahan penting | FR-RPT-003, NestJS Interceptor |
| BR-11 | Refund policy per event configurable | `events.refund_policy` field |
| BR-12 | Hanya event published yang bisa beli | FR-ORD-001 validasi event.status |

---

## 12. State Machines

### Order Status
```
PENDING → PAID → COMPLETED (event done)
    │         └─ REFUNDED
    ├─ EXPIRED (cron)
    └─ CANCELLED (customer)
```

### Ticket Status
```
VALID → USED (check-in)
    ├─ CANCELLED (event cancelled)
    ├─ REFUNDED (order refunded)
    └─ EXPIRED (event end + grace period)
```

### Payment Status
```
PENDING → SUCCESS (settlement/capture)
    ├─ FAILED (deny)
    ├─ EXPIRED (gateway expiry)
    └─ REFUNDED (via refund API)
```

---

## 13. Error Codes (API Standard)

| HTTP | Code | Message | When |
|---|---|---|---|
| 400 | VALIDATION_ERROR | Input tidak valid | Zod/class-validator fail |
| 401 | UNAUTHORIZED | Token tidak valid/expired | JWT verify fail |
| 403 | FORBIDDEN | Tidak memiliki akses | RBAC/RLS deny |
| 404 | NOT_FOUND | Resource tidak ditemukan | Entity not found |
| 409 | CONFLICT | Tiket sudah digunakan / Oversell | Ticket used, quota exceeded |
| 422 | UNPROCESSABLE_ENTITY | Bisnis rule violated | Promo invalid, event not published |
| 429 | RATE_LIMITED | Terlalu banyak request | Redis rate limit |
| 500 | INTERNAL_ERROR | Kesalahan server | Unhandled exception |

**Response Format:**
```json
{
  "success": false,
  "error": { "code": "CONFLICT", "message": "Tiket sudah digunakan pada 2026-09-13T09:30:00Z di GATE_A" }
}
```

---

## 14. Non-Functional Requirements (Testable)

| NFR | Target | Test Method |
|---|---|---|
| API P95 latency | < 500ms | k6 load test |
| Page load (3G) | < 3s | Lighthouse CI |
| Concurrent users | 10,000 (flash sale) | k6 spike test |
| Uptime | 99.5% | Synthetic monitoring |
| OWASP Top 10 | Compliant | OWASP ZAP scan |
| WCAG 2.1 AA | Pass | axe-core + manual |
| PWA Lighthouse | > 90 | Lighthouse CI |
| Test coverage | > 80% | Jest/Vitest + Playwright |

---

*BRD complete — traceable to User Stories in Backlog-MVP.md*