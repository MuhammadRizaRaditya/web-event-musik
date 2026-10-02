# Backlog MVP — Soundwave Fest 2026

> **Sprint duration:** 2 minggu | **Total:** 6 sprint (3 bulan) | **Story Point baseline:** 1 SP = ~0.5 hari dev

---

## User Story Map (MVP Scope)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            SOUNDWAVE FEST MVP                               │
├──────────────┬──────────────┬──────────────┬──────────────┬──────────────┤
│  EVENT MGMT  │  TICKETING   │  CHECKOUT    │  PAYMENT     │  E-TICKET    │
├──────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ CRUD Event   │ CRUD Type    │ Pilih Tiket  │ Midtrans     │ Generate QR  │
│ CRUD Venue   │ Kuota/Harga  │ Form Buyer   │ Webhook      │ (JWT RS256)  │
│ CRUD Stage   │ Periode Jual │ Ringkasan    │ Verifikasi   │ Email PDF    │
│ CRUD Artist  │ Status Auto  │ Create Order │ Idempotency  │ Download     │
│ Lineup/      │ Anti-Oversell│ Expired Job  │ Refund API   │ Resend       │
│   Schedule   │ (FOR UPDATE) │              │              │              │
├──────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│  CHECK-IN    │  AUTH/RBAC   │  ADMIN DASH  │  PWA/INFRA   │              │
├──────────────┼──────────────┼──────────────┼──────────────┤
│ Scanner PWA  │ JWT + Refresh│ Dashboard    │ Service      │              │
│ Offline Mode │ RBAC Guards  │  Summary     │  Worker      │              │
│ Delta Sync   │ RLS Policies │  Sales Chart │  Manifest    │              │
│ Gate UI      │ Roles/Perms  │  Check-in    │  Install     │              │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

---

## Sprint 1 (Minggu 1-2) — Foundation & Auth

| ID | User Story | SP | Priority | Acceptance Criteria |
|---|---|---|---|---|
| US-001 | **Sebagai Developer**, saya ingin monorepo npm workspaces terstruktur sehingga bisa develop web & api paralel | 3 | Must | `npm install` di root jalan; `apps/web`, `apps/api`, `packages/*` terpisah; shared TypeScript config |
| US-002 | **Sebagai Developer**, saya ingin PostgreSQL + Prisma setup sehingga schema terdefinisi & migrate jalan | 5 | Must | `prisma migrate dev` berhasil; 29 tabel terbuat; seed data dasar jalan |
| US-003 | **Sebagai Developer**, saya ingin JWT Auth (access 15m + refresh 7d httpOnly cookie + rotation) sehingga user bisa login aman | 5 | Must | POST `/auth/login` return access+refresh; refresh token rotate; logout revoke; protected route butuh valid access |
| US-004 | **Sebagai Developer**, saya ingin RBAC + RLS foundation sehingga role SuperAdmin/EventOrg/GateStaff/Finance/Customer ter-enforce | 5 | Must | Roles/permissions seed; Guards di NestJS; RLS policies aktif di PG; test: EventOrg hanya lihat event sendiri |
| US-005 | **Sebagai Developer**, saya ingin CI/CD GitHub Actions (lint, typecheck, test, build) sehingga kode ter-validate otomatis | 3 | Must | Push ke branch → Actions jalan; fail jika lint/typecheck/test error; artifact build tersimpan |

**Total SP Sprint 1: 21**

---

## Sprint 2 (Minggu 3-4) — Event & Ticketing Core

| ID | User Story | SP | Priority | Acceptance Criteria |
|---|---|---|---|---|
| US-006 | **Sebagai Event Organizer**, saya ingin CRUD Event (nama, slug, deskripsi, tanggal, venue, banner, status, SEO) sehingga event bisa dipublish | 5 | Must | CRUD API + Admin UI; slug unique; status draft/published/ongoing/completed/cancelled; organizer_id auto dari user login |
| US-007 | **Sebagai Event Organizer**, saya ingin CRUD Venue & Stage sehingga lokasi & stage terdefinisi | 3 | Must | Venue: nama, alamat, kota, lat/long, kapasitas; Stage: nama, kapasitas, event_id |
| US-008 | **Sebagai Event Organizer**, saya ingin CRUD Artist & Lineup sehingga artis bisa ditambah ke event | 3 | Must | Artist: nama, bio, genre, foto, social_media(JSONB), music_links(JSONB); Lineup: event_artist junction (is_headliner, display_order) |
| US-009 | **Sebagai Event Organizer**, saya ingin CRUD Schedule (Running Order) per hari & stage sehingga jadwal otomatis tampil di publik | 3 | Must | Schedule: event_id, stage_id, artist_id, day, start_time, end_time, duration, status |
| US-010 | **Sebagai Event Organizer**, saya ingin CRUD Ticket Type (nama, harga, kuota, periode jual, max/customer, access_type, service_fee, tax) sehingga tiket terjual terkendali | 5 | Must | TicketType: event_id FK; CHECK sold_count<=quota; status auto (available/almost_sold_out/sold_out/closed); sale_start/sale_end |
| US-011 | **Sebagai System**, saya ingin anti-overselling via `SELECT ... FOR UPDATE` pada ticket_type saat create order sehingga tidak oversell | 5 | Must | Transaksi order: lock row ticket_type → cek quota → increment sold_count → release; concurrent test: 100 request paralell → hanya kuota yg terjual |

**Total SP Sprint 2: 24**

---

## Sprint 3 (Minggu 5-6) — Checkout & Payment

| ID | User Story | SP | Priority | Acceptance Criteria |
|---|---|---|---|---|
| US-012 | **Sebagai Customer**, saya ingin halaman publik Event (hero, countdown, lineup, schedule, ticket list, FAQ) sehingga bisa pilih tiket | 5 | Must | Next.js SSR/SSG; data dari API publik; responsive; countdown real-time; SEO meta dari event |
| US-013 | **Sebagai Customer**, saya ingin Checkout flow: pilih tiket → form buyer/holder → ringkasan → create order (pending) → redirect payment | 8 | Must | Validasi kuota real-time (FOR UPDATE); form buyer + holder (array per qty); hitung subtotal, service_fee, tax, discount, total; order status=pending; payment_deadline 30 menit; redirect ke Midtrans Snap |
| US-014 | **Sebagai System**, saya ingin Midtrans Webhook handler (HMAC verify + idempotency + status verify ke API) sehingga pembayaran terverifikasi aman | 5 | Must | POST `/payments/webhook`; verifikasi signature raw body; idempotency_key unique; verifikasi status ke Midtrans API sebelum fulfill; update order→paid; generate e-ticket |
| US-015 | **Sebagai Customer**, saya ingin halaman Payment Status (success/failed/pending) & email konfirmasi sehingga tahu status pembayaran | 3 | Must | Halaman `/checkout/status/:orderId` polling status; email Order Confirmation + Payment Success via Resend/SendGrid |

**Total SP Sprint 3: 21**

---

## Sprint 4 (Minggu 7-8) — E-Ticket & QR System

| ID | User Story | SP | Priority | Acceptance Criteria |
|---|---|---|---|---|
| US-016 | **Sebagai System**, saya ingin generate E-Ticket (QR JWT RS256) per ticket setelah paid sehingga tiket aman & offline-verifiable | 8 | Must | Private key sign JWT (RS256); payload: ticket_id, ticket_number, holder_name, event_id, ticket_type, exp=event_end+1h; QR code image (PNG) + PDF download; simpan qr_code_data di DB |
| US-017 | **Sebagai Customer**, saya ingin lihat & download E-Ticket (PDF + QR) di My Account sehingga bisa disimpan/cetak | 3 | Must | My Account → Tickets list → Download PDF; PDF berisi event info, holder, QR code, ticket_number |
| US-018 | **Sebagai Gate Staff**, saya ingin PWA Scanner (camera + QR decode + JWT verify offline) sehingga bisa check-in tanpa internet | 8 | Must | PWA page `/scanner`; camera access; jsQR/scan decode; verify JWT signature dengan public key (cached); tampil Valid/Used/Invalid; simpan ke IndexedDB offline |
| US-019 | **Sebagai System**, saya ingin Delta Sync check-in log (IndexedDB → Server) sehingga data offline tersinkron | 5 | Must | Background sync saat online; POST `/check-in/sync` array log; server validasi ulang + insert ticket_checkins + update ticket status=used; conflict handling (duplicate → reject) |

**Total SP Sprint 4: 24**

---

## Sprint 5 (Minggu 9-10) — Admin Dashboard & Reporting

| ID | User Story | SP | Priority | Acceptance Criteria |
|---|---|---|---|---|
| US-020 | **Sebagai Admin**, saya ingin Dashboard Admin (total events, tickets sold, revenue, orders, customers, check-ins, sales chart, ticket breakdown, payment status pie, check-in progress) sehingga monitoring real-time | 8 | Must | Dashboard widgets real-time (SWRefetchInterval 30s); chart Recharts/Chart.js; role-based data (SuperAdmin=all, EventOrg=assigned) |
| US-021 | **Sebagai Admin**, saya ingin Order Management (list, filter, detail, cancel, refund) sehingga operasional order terkendali | 5 | Must | Table paginated; filter status/date/event; detail modal; cancel (jika pending); refund initiate (Finance only) |
| US-022 | **Sebagai Finance**, saya ingin Laporan Keuangan (penjualan tiket, transaksi payment, revenue kotor, service fee, tax, discount, refund, settlement, net revenue) sehingga rekonsiliasi akurat | 5 | Must | Export CSV/Excel; filter date range/event; settlement report match Midtrans dashboard; net revenue = revenue - refund - fee |
| US-023 | **Sebagai Admin**, saya ingin Audit Log (user, action, entity, old/new, IP, UA, timestamp) sehingga traceability penuh | 3 | Must | Auto-log pada CRUD entitas penting; UI read-only paginated; filter user/action/date |

**Total SP Sprint 5: 21**

---

## Sprint 6 (Minggu 11-12) — PWA, CMS, Polish & Hardening

| ID | User Story | SP | Priority | Acceptance Criteria |
|---|---|---|---|---|
| US-024 | **Sebagai Customer**, saya ingin PWA installable (manifest, SW, install prompt, offline fallback) sehingga bisa install di HP | 5 | Must | Lighthouse PWA > 90; install prompt muncul; offline page `/offline` jalan; countdown timer akurat offline |
| US-025 | **Sebagai Admin**, saya ingin CMS dasar (Homepage sections, Banner, FAQ, Sponsor, SEO, Media Library) sehingga konten kelola sendiri | 5 | Should | Drag-drop sections (hero, lineup, schedule, gallery, FAQ); banner carousel; FAQ accordion; media upload (validasi MIME/size/scan) |
| US-026 | **Sebagai Customer**, saya ingin Promo/Voucher (kode, type percentage/fixed, max_uses, valid_date, ticket_type filter) sehingga diskon otomatis | 5 | Should | Apply di checkout; validasi server-side; usage tracking promo_usages; max_uses_per_customer enforce |
| US-027 | **Sebagai System**, saya ingin Notification (email templates, trigger: order_created, payment_success, ticket_issued, payment_reminder, event_reminder, schedule_change, refund) sehingga komunikasi otomatis | 5 | Should | Template DB-driven; queue via BullMQ; Resend/SendGrid send; retry failed; log notification status |
| US-028 | **Sebagai Developer**, saya ingin Testing & Hardening (unit 80%+, integration API, E2E critical flows, load test 10k concurrent, security scan) sehingga production-ready | 8 | Must | Jest/Vitest unit; Supertest integration; Playwright E2E (purchase, check-in); k6 load test; OWASP ZAP scan; fix critical findings |

**Total SP Sprint 6: 28**

---

## Summary

| Sprint | Focus | Total SP | Cumulative |
|---|---|---|---|
| 1 | Foundation, Auth, CI/CD | 21 | 21 |
| 2 | Event, Venue, Artist, Schedule, Ticket Type, Anti-Oversell | 24 | 45 |
| 3 | Public Event, Checkout, Payment Webhook, Email | 21 | 66 |
| 4 | E-Ticket QR (JWT RS256), Scanner PWA, Delta Sync | 24 | 90 |
| 5 | Admin Dashboard, Reports, Audit Log | 21 | 111 |
| 6 | PWA, CMS, Promo, Notification, Testing | 28 | 139 |

**Grand Total: ~139 Story Points** (≈ 70 hari dev untuk 1 orang; tim 3 orang ~24 hari/sprint → realistic dengan parallelisasi)

---

## Definition of Done (DoD) per Story

- [ ] Code review approved (min 1 reviewer)
- [ ] Unit test coverage ≥ 80% untuk business logic baru
- [ ] Integration test untuk API endpoint baru
- [ ] TypeScript strict mode pass (`npm run typecheck`)
- [ ] ESLint + Prettier pass (`npm run lint`)
- [ ] Documentation updated (API spec, README jika perlu)
- [ ] Deploy ke staging berhasil
- [ ] Manual QA pass (checklist per story)

---

## MoSCoW Mapping (MVP = Must + Should)

| Priority | Stories |
|---|---|
| **Must Have (MVP)** | US-001 to US-022, US-024, US-028 |
| **Should Have (Fase 2)** | US-023, US-025, US-026, US-027 |
| **Could Have (Fase 3)** | Gallery/Memories, Playlist, Multi-event, Advanced Analytics, External Integrations |
| **Won't Have (MVP)** | Native apps, Seat map, Full accounting, Live streaming |

---

*Generated during build execution — ready for sprint planning*