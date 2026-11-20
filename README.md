# DPRD Attendance App

Backend REST API + portal web ringan untuk sistem absensi DPRD Kabupaten Sleman. Projekt awalnya hanya berisi `backend/` tanpa README, test, migrasi, atau dokumentasi setup.

## 1. Gambaran umum

| Aspek | Kondisi saat ini |
| --- | --- |
| Lingkup | Backend API + portal statis di `/portal` |
| Arsitektur | Express 5, JavaScript CommonJS, REST API monolitik |
| Database | PostgreSQL (`dprd_db`), migrasi SQL + seeder, 18 test (unit + integrasi) |
| Autentikasi | Access token + refresh token berputar, logout/revocation, reset password via token sekali pakai |
| Validasi | Zod untuk body/query/params |
| Dokumentasi API | Swagger UI `/api-docs`, JSON `/api-docs.json` |
| Kualitas | ESLint, Prettier, TypeScript `checkJs`, GitHub Actions CI, Docker Compose |
| Runtime | Node `>=20` (teruji di v22.12.0), npm 10.9.0 |

## 2. Struktur proyek

```
dprd-attendance-app/
├── README.md / TODO.md
├── docker-compose.yml
├── .github/workflows/ci.yml
└── backend/
    ├── .env.example / .gitignore / .dockerignore
    ├── .eslintrc.json / .prettierrc.json / tsconfig.json
    ├── Dockerfile
    ├── app.js                       # Express app + static portal
    ├── server.js                    # Start server + graceful shutdown
    ├── controllers/                 # auth, user, absensi, anggota, rapat, periode, partisipasi
    ├── database/
    │   ├── migrate.js
    │   ├── migrations/000_create_schema.sql
    │   ├── migrations/001_align_schema.sql
    │   ├── migrations/002_refresh_tokens.sql
    │   └── seeds/anggota-2024-2029.js
    ├── middlewares/                 # auth, role
    ├── models/                      # db.js (Pool), queryHelpers.js
    ├── public/                      # portal: index.html, app.js, styles.css, reset.html
    ├── routes/                      # 8 router + anotasi Swagger
    ├── tests/                       # api.test.js, integration.test.js
    ├── swagger/swagger.js
    └── utils/                       # config, AppError, validate, schemas, emailSender, dll.
```

## 3. Instalasi & menjalankan

```bash
cp backend/.env.example backend/.env
# isi kredensial PostgreSQL, JWT_SECRET, JWT_REFRESH_SECRET, dan ALLOWED_ORIGINS
cd backend
npm install
npm run db:setup     # migrasi + seed 50 anggota DPRD 2024-2029
npm start            # atau: npm run dev
```

Atau dengan Docker: `docker compose up --build` dari root repo.

- API: `http://localhost:5000`
- Portal: `http://localhost:5000/portal/`
- Swagger: `http://localhost:5000/api-docs`
- OpenAPI JSON: `http://localhost:5000/api-docs.json`

Script lain: `npm run migrate`, `npm run seed`, `npm run lint`, `npm run typecheck`, `npm run format`, `npm test`, `npm run test:integration`.

## 4. Data anggota DPRD 2024-2029

Sumber: [halaman resmi DPRD Kabupaten Sleman](https://dprd.slemankab.go.id/anggota-dprd-2019-2024/) dan PDF SK Gubernur DIY No. 306/KEP/2024.

- **50 anggota** tersimpan di `users` + `anggota_dprd` pada periode `2024-2029`.
- Komposisi fraksi: PKB 7, Gerindra 6, PDI Perjuangan 13, Golkar 6, PPP NasDem 6, PKS 6, PAN 6.
- Tersimpan juga `partai`, `fraksi`, `jabatan_fraksi`, `jabatan`, dan `dapil`.
- Email dibuat otomatis dari nama, mis. `wawan.prasetia@dprd.slemankab.go.id`.
- Password seed diambil dari `SEED_DEFAULT_PASSWORD` di `backend/.env` (sudah dirotasi lokal). Template memakai placeholder.
- Seed idempotent: `ON CONFLICT` pada email dan `(user_id, periode_id)`.

Pimpinan: Ketua `Y. Gustan Ganda, S.T.`; Wakil I `Ani Martanti, S.T.`; Wakil II `Hasto Karyantoro, S.I.P.`; Wakil III `H. R Sukaptana, S.H.`

## 5. Endpoint utama

| Grup | Endpoint | Proteksi |
| --- | --- | --- |
| Auth | `POST /api/auth/signup`, `/login`, `/refresh`, `/logout`, `/forgot`, `/reset` | Publik kecuali `/logout` |
| Users | `GET/POST /api/users`, `PUT/DELETE /api/users/:id` | JWT + admin |
| Anggota | `GET/POST /api/anggota`, `GET/PUT/DELETE /api/anggota/:id` | JWT + admin |
| Rapat | `GET/POST /api/rapat`, `GET/PUT/DELETE /api/rapat/:id` | JWT (mutasi: admin) |
| Absensi | `GET/POST /api/absensi`, `GET /api/absensi/rekap`, `GET /api/absensi/rekap/csv` | JWT |
| Periode | `GET/POST /api/periode`, `GET/PUT/DELETE /api/periode/:id` | JWT (mutasi: admin) |
| Partisipasi | `GET/POST /api/partisipasi`, `GET/PUT/DELETE /api/partisipasi/:id` | JWT (mutasi: admin) |
| Sistem | `GET /`, `GET /api/health`, `GET /api-docs`, `GET /api-docs.json`, `GET /portal/` | Publik |

Semua endpoint list mendukung `page` dan `limit`; anggota bisa difilter dengan `fraksi`, `periode_id`, `aktif`; absensi dengan `rapat_id`, `anggota_id`, `status`; rekap dengan `periode_id`, `fraksi`.

## 6. Kesenjangan awal & status perbaikannya

| # | Kesenjangan awal | Status |
| --- | --- | --- |
| 1 | Secret plaintext tanpa `.gitignore` | `.gitignore` + `.env.example`; secret lokal sudah dirotasi |
| 2 | Token reset dicetak ke console | Token acak 32 byte disimpan sebagai SHA-256 di `password_resets` |
| 3 | JWT tanpa expiry | `expiresIn` access + refresh, `type` terpisah |
| 4 | CRUD user tanpa role guard | `restrictTo('admin')` di semua route user |
| 5 | Cek token palsu di `createUser` | Verifikasi terpusat di `authMiddleware` |
| 6 | `forgotPassword`/`resetPassword` tidak aman | Generic response, expiry, hash token, transaksi DB |
| 7 | Email reset hanya `console.log` | Nodemailer + `SMTP_*`; butuh kredensial SMTP nyata |
| 8 | Tanpa schema/migrasi/seeder | 3 file migrasi + seeder, `npm run db:setup` |
| 9 | Tanpa validasi input | Zod + `validate()` pada semua route |
| 10 | `npm test` placeholder | 18 test: Supertest + integrasi DB sementara |
| 11 | Tanpa lint/env example | ESLint + Prettier + TypeScript check + `.env.example` |
| 12 | Error membocorkan detail internal | `AppError` + error handler terpusat |
| 13 | CORS terbuka, tanpa helmet/rate limit | `ALLOWED_ORIGINS`, Helmet, rate limit `/api/auth` |
| 14 | Absensi tidak terhubung rapat/anggota | Relasi FK, unique, status, rekap, dan ekspor CSV |
| 15 | Tanpa logout/refresh/revoke | Refresh token rotates, logout/revocation, reset mencabut sesi |
| 16 | Swagger `nama_rapat` vs `judul` | Diselaraskan ke schema DB |
| 17 | 403 untuk "no token" | 401 |
| 18 | `roleMiddleware` tidak defensif | Cek `req.user` dulu |
| 19 | `dotenv.config()` dobel | Satu kali di `utils/config.js` |
| 20 | Path Swagger bergantung CWD | `path.join(__dirname, ...)` |
| 21 | Tanpa pagination/filter | Ditambahkan di semua list |
| 22 | Duplikat email & hapus admin terakhir | 409 untuk duplikat; guard admin terakhir & self-delete |
| 23 | Tidak ada 404 handler | 404 terpusat |
| 24 | `bcrypt` tidak terpakai, `engines` kosong | Dependency dihapus, `engines: >=20` |
| 25 | Tanpa graceful shutdown | `SIGINT`/`SIGTERM` menutup server & pool |
| 26 | Artefak debug/emoji/bahasa campur | Dibersihkan |

Perbaikan tambahan: portal web `/portal`, halaman reset `/portal/reset.html`, Docker Compose, GitHub Actions, health check, refresh-token migration, CSV export, dan `npm audit` 0 vulnerability.

## 7. Sisa pekerjaan

1. **Kredensial SMTP nyata** agar `POST /api/auth/forgot` mengirim email (tanpa SMTP endpoint tetap `503`).
2. **Fitur lanjutan**: check-in/out, QR/geolocation, notifikasi, dan upload lampiran.
3. **Rotasi kredensial di lingkungan deployment** (secret lokal sudah diganti, tetapi secret produksi tetap harus dikelola sendiri).

## 8. Verifikasi terakhir

- `npm run db:setup` dan migrasi fresh DB → sukses, 50 anggota tersimpan.
- `npm run lint` → 0 error; `npm run format:check` → bersih; `npm run typecheck` → 0 error.
- `npm test` → 18/18 lulus (termasuk refresh token, CSV, portal, dan DB sementara).
- `npm audit --omit=dev` → 0 vulnerability.
- Smoke API: `/`, `/api/health`, `/portal/`, login, rekap, Swagger JSON semuanya `200`.
