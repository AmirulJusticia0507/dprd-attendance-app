# DPRD Attendance App

Backend REST API untuk sistem absensi DPRD Kabupaten Sleman. Proyek awalnya hanya berisi `backend/` tanpa README, test, migrasi, atau dokumentasi setup. Dokumen ini mencatat kondisi awal, perbaikan yang sudah dilakukan, dan sisa pekerjaan.

## 1. Gambaran umum

| Aspek | Kondisi saat ini |
| --- | --- |
| Lingkup | Hanya `backend/`; frontend belum ada |
| Arsitektur | Express 5, JavaScript CommonJS, REST API monolitik |
| Database | PostgreSQL (`dprd_db`), SQL inline di controller, migrasi + seeder tersedia |
| Autentikasi | JWT access token ber-expiry, reset password via token sekali pakai di DB |
| Validasi | Zod untuk body/query/params |
| Dokumentasi API | Swagger UI `/api-docs`, JSON `/api-docs.json` |
| Runtime | Node `>=20` (teruji di v22.12.0), npm 10.9.0 |

## 2. Struktur proyek

```
dprd-attendance-app/
├── README.md
└── backend/
    ├── .env.example / .gitignore / .eslintrc.json
    ├── app.js                       # Express app (testable)
    ├── server.js                    # Start server + graceful shutdown
    ├── controllers/                 # auth, user, absensi, anggota, rapat
    ├── database/
    │   ├── migrate.js
    │   ├── migrations/001_align_schema.sql
    │   └── seeds/anggota-2024-2029.js
    ├── middlewares/                 # auth, role
    ├── models/                      # db.js (Pool), queryHelpers.js
    ├── routes/                      # 8 router + anotasi Swagger
    ├── swagger/swagger.js
    ├── tests/api.test.js
    └── utils/                       # config, AppError, validate, schemas, emailSender, dll.
```

## 3. Instalasi & menjalankan

```bash
cd backend
npm install
cp .env.example .env
# isi kredensial PostgreSQL, JWT_SECRET, dan ALLOWED_ORIGINS
npm run db:setup     # migrasi + seed 50 anggota DPRD 2024-2029
npm start            # atau: npm run dev
```

Server: `http://localhost:5000` · Swagger: `http://localhost:5000/api-docs` · OpenAPI JSON: `http://localhost:5000/api-docs.json`

Script lain: `npm run migrate`, `npm run seed`, `npm run lint`, `npm test`.

## 4. Data anggota DPRD 2024-2029

Sumber: [halaman resmi DPRD Kabupaten Sleman](https://dprd.slemankab.go.id/anggota-dprd-2019-2024/) dan PDF SK Gubernur DIY No. 306/KEP/2024.

- **50 anggota** sudah diinsert ke `users` + `anggota_dprd` pada periode `2024-2029`.
- Komposisi fraksi: PKB 7, Gerindra 6, PDI Perjuangan 13, Golkar 6, PPP NasDem 6, PKS 6, PAN 6.
- Tersimpan juga `partai`, `fraksi`, `jabatan_fraksi`, `jabatan`, dan `dapil`.
- Email dibuat otomatis dari nama, mis. `wawan.prasetia@dprd.slemankab.go.id`.
- Password awal: `Sleman2024!` (bisa diubah lewat `SEED_DEFAULT_PASSWORD`). **Ganti password ini sebelum dipakai publik.**
- Seed bersifat idempotent: `ON CONFLICT` pada email dan `(user_id, periode_id)`.

Pimpinan: Ketua `Y. Gustan Ganda, S.T.`; Wakil I `Ani Martanti, S.T.`; Wakil II `Hasto Karyantoro, S.I.P.`; Wakil III `H. R Sukaptana, S.H.`

## 5. Endpoint utama

| Grup | Endpoint | Proteksi |
| --- | --- | --- |
| Auth | `POST /api/auth/signup`, `/login`, `/forgot`, `/reset` | Publik |
| Users | `GET/POST /api/users`, `PUT/DELETE /api/users/:id` | JWT + admin |
| Anggota | `GET/POST /api/anggota`, `GET/PUT/DELETE /api/anggota/:id` | JWT + admin |
| Rapat | `GET/POST /api/rapat`, `GET/PUT/DELETE /api/rapat/:id` | JWT (mutasi: admin) |
| Absensi | `GET/POST /api/absensi`, `GET /api/absensi/rekap` | JWT |
| Periode | `GET/POST /api/periode`, `GET/PUT/DELETE /api/periode/:id` | JWT (mutasi: admin) |
| Partisipasi | `GET/POST /api/partisipasi`, `GET/PUT/DELETE /api/partisipasi/:id` | JWT (mutasi: admin) |
| Sistem | `GET /`, `GET /api/health`, `GET /api-docs`, `GET /api-docs.json` | Publik |

Semua endpoint list mendukung `page` dan `limit`; anggota bisa difilter dengan `fraksi`, `periode_id`, `aktif`; absensi dengan `rapat_id`, `anggota_id`, `status`.

## 6. Kesenjangan awal & status perbaikannya

| # | Kesenjangan awal | Status |
| --- | --- | --- |
| 1 | Secret plaintext tanpa `.gitignore` | `.gitignore` + `.env.example` ditambahkan; secret tetap perlu dirotasi sebelum produksi |
| 2 | Token reset dicetak ke console | Token acak 32 byte disimpan sebagai SHA-256 di `password_resets`, tidak ada logging token |
| 3 | JWT tanpa expiry | `expiresIn` (`JWT_EXPIRES_IN`, default `8h`) + `type: 'access'` |
| 4 | CRUD user tanpa role guard | `restrictTo('admin')` di semua route user |
| 5 | Cek token palsu di `createUser` | Dihapus; verifikasi terpusat di `authMiddleware` |
| 6 | `forgotPassword`/`resetPassword` tidak aman | Generic response, token expiry, hash token, `rowCount` dicek, transaksi DB |
| 7 | Email reset hanya `console.log` | Nodemailer + `SMTP_*`; jika belum dikonfigurasi, endpoint mengembalikan `503` |
| 8 | Tanpa schema/migrasi/seeder | `database/migrations` + `database/seeds`, `npm run db:setup` |
| 9 | Tanpa validasi input | Zod + `validate()` pada semua route |
| 10 | `npm test` placeholder | 13 test otomatis (Node test runner + Supertest) |
| 11 | Tanpa lint/env example | ESLint, `.env.example`, script `dev`/`migrate`/`seed` |
| 12 | Error membocorkan `err.message` | `AppError` + error handler terpusat; 500 generik |
| 13 | CORS terbuka, tanpa helmet/rate limit | `ALLOWED_ORIGINS`, Helmet, rate limit `/api/auth` |
| 14 | Absensi tidak terhubung rapat/anggota, tanpa rekap | Sesuai schema DB: `rapat_id`, `anggota_id`, `status`, `jam_masuk`, `keterangan`; unique `(rapat_id, anggota_id)` + endpoint rekap |
| 15 | Tanpa logout/refresh/revoke | **Belum** — JWT masih stateless |
| 16 | Swagger `nama_rapat` vs `judul` | Diselaraskan ke schema DB (`judul`, `tempat`) |
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

Perbaikan tambahan: transaksi DB untuk update/reset password, audit `logs`, proteksi FK/unique, modul `periode`/`partisipasi` mengikuti pola Zod+pagination+role admin, endpoint health check, `npm audit` 0 vulnerability, dan Swagger JSON yang bisa diunduh.

## 7. Sisa pekerjaan

1. **Frontend/portal** untuk login, absensi, dan rekap kehadiran.
2. **Konfigurasi SMTP nyata** agar `POST /api/auth/forgot` bisa mengirim email (sekarang sengaja `503` jika belum ada SMTP).
3. **Rotasi kredensial** `.env` dan password seed sebelum dipakai di lingkungan publik.
4. **Logout/refresh token/revocation** jika diperlukan (mis. simpan session di Redis).
5. **Docker/CI/CD**, typecheck/TypeScript, formatter, dan test integrasi terhadap database sementara.
6. Fitur lanjutan: check-in/out, QR/geolocation, notifikasi, upload, dan laporan ekspor.

## 8. Verifikasi terakhir

- `npm run db:setup` → migrasi sukses, 50 anggota tersimpan.
- `npm run lint` → 0 error.
- `npm test` → 13/13 lulus.
- `npm audit --omit=dev` → 0 vulnerability.
- Smoke test: `GET /`, `GET /api/health`, login anggota, `GET /api/absensi/rekap`, dan Swagger JSON semuanya `200`.
