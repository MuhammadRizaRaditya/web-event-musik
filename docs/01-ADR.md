# Architecture Decision Records (ADR) — Soundwave Fest 2026

> Catatan: Setiap ADR mengikuti format **Context → Decision → Consequences → Alternatives → Status**.

---

## ADR-001: Modular Monolith vs Microservices

**Status:** Accepted  
**Tanggal:** 2026-10-02

### Context
Platform event management & ticketing Soundwave Fest memerlukan arsitektur yang:
- Dapat dikelola tim kecil-menengah (3-5 orang)
- Deployment sederhana pada tahap awal
- Domain boundaries jelas untuk migrasi ke microservices di masa depan
- Menghindari kompleksitas operasional (service discovery, distributed tracing, saga pattern) di MVP

### Decision
Gunakan **Modular Monolith** dengan pemisahan domain yang ketat di level kode (NestJS modules), single deployment unit, single database (PostgreSQL), tapi dengan internal boundaries yang jelas.

### Consequences
- ✅ Development & deployment lebih cepat (satu repo, satu CI/CD, satu DB)
- ✅ Transaksi ACID lintas domain mudah (tidak perlu distributed transaction)
- ✅ Refactoring ke microservices nanti mudah karena domain sudah terpisah di kode
- ⚠️ Scaling vertikal terlebih dahulu; horizontal scaling butuh pemisahan service nanti
- ⚠️ Single point of failure pada database (mitigasi: read replica, connection pooling)

### Alternatives
- **Microservices dari awal** → Ditolak: over-engineering untuk tim kecil, kompleksitas ops tinggi
- **Monolith tanpa modular boundaries** → Ditolak: sulit dipisahkan nanti, spaghetti code risk

---

## ADR-002: Frontend/Backend Split (Next.js + NestJS)

**Status:** Accepted  
**Tanggal:** 2026-10-02

### Context
Perlu pemisahan concern antara presentation layer (SEO, SSR, PWA) dan business logic layer (API, domain logic, integrasi).

### Decision
- **Frontend:** Next.js 14+ (App Router, React 18, TypeScript) — Public website + Admin dashboard + PWA Scanner
- **Backend:** NestJS (TypeScript) — REST API, business logic, domain services
- Komunikasi: HTTP/REST (internal), bisa ganti ke gRPC nanti jika perlu

### Consequences
- ✅ Next.js: SSR/SSG untuk SEO publik, PWA support native, Image optimization
- ✅ NestJS: Modular, DI, Guards, Pipes, Swagger/OpenAPI built-in
- ✅ Tim frontend/backend bisa parallel kerja
- ⚠️ Perlu maintain 2 codebase (monorepo Nx/Turborepo atau npm workspaces)

### Alternatives
- **Next.js API Routes only** → Ditolak: business logic kompleks butuh NestJS structure
- **Remix/Nuxt** → Next.js ekosistem lebih matang untuk PWA + SSR
- **Express/Fastify** → NestJS memberikan structure yang lebih opinionated untuk enterprise

---

## ADR-003: PostgreSQL + Prisma ORM

**Status:** Accepted  
**Tanggal:** 2026-10-02

### Context
Database harus mendukung:
- Transaksi ACID untuk anti-overselling (SELECT ... FOR UPDATE)
- Row-Level Security (RLS) untuk multi-tenant isolation
- JSONB untuk flexible data (social_media, music_links, promo ticket_type_ids)
- UUID native, advisory locks
- Type-safe database access

### Decision
- **Database:** PostgreSQL 16+ (lokal: v18, production: v16)
- **ORM:** Prisma (type-safe, migration management, multi-provider support)

### Consequences
- ✅ Prisma Client type-safe, auto-completion IDE
- ✅ Migration version control (prisma migrate)
- ✅ Multi-provider: development=PostgreSQL lokal, production=PostgreSQL cloud (kode sama)
- ✅ JSONB, UUID, RLS native support
- ⚠️ Prisma connection pooling butuh PgBouncer di production scale tinggi

### Alternatives
- **TypeORM** → Ditolak: API kurang type-safe, migration lebih kompleks
- **Drizzle ORM** → Ditolak: lebih baru, ekosistem Prisma lebih matang
- **Raw SQL / Knex** → Ditolak: kehilangan type-safety

---

## ADR-004: Redis (Cache + Queue)

**Status:** Accepted  
**Tanggal:** 2026-10-02

### Context
Butuh:
- Session store (JWT refresh token blacklist)
- Rate limiting (sliding window)
- Background job queue (email, webhook retry, report generation, check-in sync)
- Cache untuk public event data (CDN-level cache di Cloudflare sudah ada, Redis untuk app-level)

### Decision
Redis single instance (development), Redis Cluster/Sentinel (production). Gunakan **BullMQ** untuk queue.

### Consequences
- ✅ BullMQ: reliable, retry, delayed jobs, priority, rate-limited queues
- ✅ Redis: sub-ms latency, TTL native, pub/sub untuk real-time
- ⚠️ Single Redis = SPOF (production: Redis Sentinel/Cluster)

### Alternatives
- **RabbitMQ** → Ditolak: lebih kompleks, Redis sudah cukup untuk use case ini
- **Database-based queue** → Ditolak: performa lebih rendah, polling overhead

---

## ADR-005: Payment Gateway (Midtrans/Xendit)

**Status:** Accepted  
**Tanggal:** 2026-10-02

### Context
Payment gateway Indonesia yang resmi, mendukung VA, QRIS, e-wallet, kartu, dengan webhook & sandbox.

### Decision
**Primary: Midtrans** (Snap API + Core API), **Fallback: Xendit**. Implementasi abstraction layer (`PaymentGatewayInterface`) agar bisa switch/tambah provider.

### Consequences
- ✅ Midtrans: coverage metode pembayaran lengkap, sandbox lengkap, dokumen baik
- ✅ Abstraction layer: vendor lock-in minimal, mudah tambah provider
- ⚠️ Webhook security critical: HMAC verification + idempotency wajib

### Alternatives
- **Doku/Faspay** → Coverage metode lebih terbatas
- **Stripe** → Tidak support metode lokal Indonesia (VA, QRIS, e-wallet lokal)

---

## ADR-006: QR Code Signing Strategy (JWT RS256)

**Status:** Accepted  
**Tanggal:** 2026-10-02

### Context
E-ticket QR code harus:
- Tidak bisa di-falsifikasi (anti-tiket palsu)
- Verifiable offline (PWA scanner di venue tanpa internet)
- Tampilkan info holder + ticket type tanpa query DB saat scan

### Decision
QR code berisi **Signed JWT (RS256)**:
- **Private key** (backend only): sign JWT saat generate e-ticket
- **Public key** (bundled di PWA scanner): verify signature offline
- Payload: `ticket_id`, `ticket_number`, `holder_name`, `event_id`, `ticket_type`, `exp` (event end + buffer), `iat`
- QR format: `data:text/plain;base64,<jwt_token>` atau raw JWT string

### Consequences
- ✅ Offline verification: PWA scanner verify signature tanpa internet
- ✅ Tamper-proof: private key hanya di backend
- ✅ Payload self-contained: tidak perlu query DB untuk info dasar
- ✅ Expiry built-in: token expired otomatis setelah event
- ⚠️ Key rotation: perlu mekanisme rotate key tanpa invalidasi tiket lama (solution: key ID di header, multiple public keys di PWA)

### Alternatives
- **Random UUID + DB lookup** → Ditolak: butuh internet saat scan, rawan double check-in
- **HMAC (shared secret)** → Ditolak: secret harus di PWA scanner (bisa diekstrak), RS256 lebih aman
- **JWT HS256** → Ditolak: symmetric key sama masalah HMAC

---

## ADR-007: Offline Check-in Strategy (IndexedDB + Delta Sync)

**Status:** Accepted  
**Tanggal:** 2026-10-02

### Context
Venue sering koneksi buruk. Gate staff butuh scan QR tanpa internet, tapi data harus sinkron ke server saat online.

### Decision
- **PWA Scanner** (Next.js + Workbox) cache:
  - Public keys untuk JWT verification
  - Event config (gate list, ticket types)
  - Recent scan log (append-only)
- **IndexedDB** store: `pending_checkins` (append-only log: ticket_id, gate_id, scanned_at, device_id, staff_id)
- **Delta Sync** saat online: POST `/api/v1/check-in/sync` dengan array log baru → server validasi ulang + insert `ticket_checkins` + update `tickets.status`
- **Conflict resolution**: Server authoritative; duplicate ticket_id → reject (already used), network error → retry dengan exponential backoff

### Consequences
- ✅ Fully offline-capable scan
- ✅ Append-only log = audit trail, tidak bisa dihapus/diubah
- ✅ Delta sync efisien (hanya kirim yang baru)
- ⚠️ Race condition: dua gate scan tiket sama offline → sinkron salah satu reject (mitigasi: server unique constraint `ticket_checkins.ticket_id` + status check)

### Alternatives
- **Service Worker Background Sync** → Ditolak: browser support terbatas, kontrol lebih sedikit
- **LocalStorage** → Ditolak: ukuran terbatas, tidak queryable

---

## ADR-008: PWA Strategy (Workbox)

**Status:** Accepted  
**Tanggal:** 2026-10-02

### Context
Platform harus installable, offline-capable untuk halaman publik & scanner, push notification untuk reminder.

### Decision
- **Workbox** (via `next-pwa` / custom SW) untuk Service Worker
- Caching strategy:
  - **Static assets** (JS, CSS, images): `CacheFirst` + `expiration` 30 hari
  - **API GET** (event, lineup, schedule): `NetworkFirst` + `timeout` 3s + fallback cache
  - **Navigation** (HTML): `NetworkFirst` + offline fallback page
  - **Scanner page**: `CacheFirst` (harus jalan offline total)
- **Web App Manifest**: name, icons, theme_color, display: standalone
- **Push Notification**: Web Push API (VAPID keys), subscribe di client, kirim via backend (web-push library)

### Consequences
- ✅ Installable di Android/iOS (iOS 16.4+ support Web Push)
- ✅ Offline halaman publik + scanner
- ✅ Background sync untuk check-in log
- ⚠️ iOS Safari PWA limitations: no background sync, push butuh user gesture

### Alternatives
- **Custom Service Worker** → Ditolak: Workbox handle edge cases (opaque responses, range requests)
- **Native App (Capacitor/Tauri)** → Ditolak: scope MVP adalah PWA only

---

## ADR-009: Authentication & Authorization (JWT + RBAC + RLS)

**Status:** Accepted  
**Tanggal:** 2026-10-02

### Context
Multi-role system: Super Admin, Event Organizer, Gate Staff, Finance, Customer. Perlu isolation data per event/organisasi.

### Decision
- **Auth:** JWT Access Token (15 min) + Refresh Token (7 hari, httpOnly cookie + rotation)
- **RBAC:** Role → Permission mapping (table `roles`, `permissions`, `role_permissions`, `user_roles`)
- **RLS (PostgreSQL Row-Level Security):** Policy per tabel untuk enforce `organizer_id` / `event_id` isolation di level DB
- **Guards:** NestJS `@UseGuards(AuthGuard, RolesGuard, PermissionsGuard)` di setiap endpoint

### Consequences
- ✅ Defense in depth: JWT (authN) + RBAC (authZ) + RLS (data isolation)
- ✅ RLS: bahkan raw SQL bypass aplikasi tetap aman
- ✅ Refresh token rotation: mitigasi token theft
- ⚠️ RLS policies perlu testing thorough (unit test + integration test)

### Alternatives
- **Session/Cookie only** → Ditolak: stateless scaling butuh JWT
- **ABAC (Attribute-Based)** → Overkill untuk MVP, RBAC cukup

---

## ADR-010: Anti-Overselling Mechanism

**Status:** Accepted  
**Tanggal:** 2026-10-02

### Context
Flash sale tiket butuh garansi **tidak overselling** (tiket terjual > kuota).

### Decision
Layered defense:
1. **Database Constraint:** `CHECK (sold_count <= quota)` pada `ticket_types`
2. **Row-Level Locking:** `SELECT ... FOR UPDATE` pada `ticket_types` saat create order (within transaction)
3. **Application-level:** Redis-based distributed lock (`SET NX` dengan TTL) untuk flash sale extreme (optional layer)
4. **Idempotency:** Order creation idempotent key (client-generated) prevent double-submit

### Consequences
- ✅ Database constraint = last line of defense (tidak bisa bypass)
- ✅ Row-lock = serialisasi transaksi per ticket_type, throughput cukup untuk 10k concurrent (PostgreSQL handle row locks efisien)
- ✅ Redis lock = additional protection untuk spike traffic
- ⚠️ Row-lock contention pada flash sale extreme → butuh load test & tuning (connection pool, lock timeout)

### Alternatives
- **Redis-only decrement** → Ditolak: race condition jika Redis crash, tidak ACID
- **Queue-based (Kafka)** → Overkill untuk MVP

---

## ADR-011: Monorepo Tooling (npm Workspaces)

**Status:** Accepted  
**Tanggal:** 2026-10-02

### Context
Perlu manage multiple packages (web, api, shared ui, config, prisma) dalam satu repo.

### Decision
**npm Workspaces** (native npm 7+) — tidak perlu Nx/Turborepo untuk ukuran tim ini.

Structure:
```
soundwave-fest/
├── package.json (workspaces: ["apps/*", "packages/*"])
├── apps/
│   ├── web/          # Next.js
│   └── api/          # NestJS
├── packages/
│   ├── ui/           # Shared React components (shadcn/ui based)
│   ├── config/       # Shared configs (ESLint, TypeScript, Tailwind)
│   └── prisma/       # Prisma schema & client (shared)
└── docs/
```

### Consequences
- ✅ Zero config, native npm, ringan
- ✅ Shared dependencies hoisted, disk space efisien
- ✅ Single `npm install` di root
- ⚠️ Build orchestration manual (turbo bisa ditambah nanti jika perlu)

### Alternatives
- **Nx** → Powerful tapi learning curve & config overhead untuk tim kecil
- **Turborepo** → Butuh config terpisah, npm workspaces sudah cukup
- **Yarn Workspaces / pnpm** → npm sudah built-in, konsisten dengan CI

---

## ADR-012: Deployment Local Production (PM2 + Nginx)

**Status:** Accepted  
**Tanggal:** 2026-10-02

### Context
Deployment produksi di laptop ini (Windows) tanpa Docker daemon. Apache XAMPP sudah pakai port 80/443.

### Decision
- **Process Manager:** PM2 (cross-platform, Windows support via `pm2-windows-service` atau `pm2` native)
- **Reverse Proxy:** Nginx (Windows binary) listen port 8080/8443 → proxy ke Next.js (3000) & NestJS (4000)
- **SSL:** Self-signed untuk local, atau Cloudflare Tunnel untuk HTTPS valid
- **Database:** PostgreSQL lokal (sudah jalan sebagai service Windows)
- **Redis:** Redis Windows (memurai) atau Docker container (jika Docker daemon dinyalakan nanti)

### Consequences
- ✅ Tidak bergantung Docker daemon
- ✅ PM2: auto-restart, log rotation, clustering, monitoring
- ✅ Nginx: production-grade reverse proxy, rate limit, SSL termination
- ⚠️ Windows production bukan ideal (Linux preferred), tapi OK untuk demo/staging lokal

### Alternatives
- **Docker Compose** → Butuh Docker daemon running
- **IIS + ARR** → Konfigurasi lebih kompleks, Nginx lebih familiar
- **Cloud deploy (Vercel/Railway/Render)** → User mau lokal production

---

*Document version: 1.0 — Generated during build execution*