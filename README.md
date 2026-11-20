# DPRD Attendance App — Analisis & Dokumentasi Kesenjangan

> Dokumen ini dibuat 20 November 2026 dari analisis statis seluruh kode sumber. Sebelumnya proyek ini tidak memiliki README maupun dokumentasi setup.

## 1. Gambaran umum

| Aspek | Kondisi saat ini |
| --- | --- |
| Lingkup | Hanya `backend/`; belum ada frontend, mobile app, atau portal web |
| Arsitektur | REST API monolitik, Express 5, JavaScript CommonJS |
| Database | PostgreSQL via `pg.Pool`, query SQL ditulis inline di controller |
| Autentikasi | JWT stateless (login, forgot/reset password) |
| Dokumentasi API | Swagger/OpenAPI 3.0 di `/api-docs` |
| Runtime lokal | Node v22.12.0, npm 10.9.0 (tidak dideklarasikan di `package.json`) |
| Jumlah file sumber | 17 file JS (5 controller, 5 route, 2 middleware, 2 model, 1 util, 1 swagger, 1 entry point) |

## 2. Struktur proyek

```
dprd-attendance-app/
└── backend/
    ├── .env                  # Kredensial DB + JWT secret (plaintext)
    ├── package.json          # Hanya script start & test (placeholder)
    ├── package-lock.json
    ├── server.js             # Bootstrap Express, mount route, error handler
    ├── controllers/          # auth, user, absensi, anggota, rapat
    ├── middlewares/          # authMiddleware, roleMiddleware
    ├── models/               # db.js (Pool), queryHelpers.js
    ├── routes/               # 5 router + anotasi Swagger
    ├── swagger/swagger.js    # Konfigurasi OpenAPI
    ├── utils/emailSender.js  # Stub: console.log
    └── node_modules/
```

Tidak ada folder `tests/`, `docs/`, `database/`, `migrations/`, `seeders/`, `.github/`, dan tidak ada `Dockerfile`, `docker-compose.yml`, `.gitignore`, atau `.env.example`.

## 3. Cara menjalankan (kondisi saat ini)

```bash
cd backend
npm install
# Siapkan PostgreSQL dan database "dprd_db" secara manual
# Buat file .env sendiri (tidak ada template)
npm start
```

Server: `http://localhost:5000` · Swagger: `http://localhost:5000/api-docs`

Script `npm test` **selalu gagal** karena masih placeholder (`backend/package.json:6`). Tidak ada script `dev`, `lint`, `build`, `migrate`, atau `seed`.

## 4. Endpoint yang tersedia

| Grup | Endpoint | Proteksi |
| --- | --- | --- |
| Auth | `POST /api/auth/login`, `/forgot`, `/reset` | Publik |
| Users | `GET/POST /api/users`, `PUT/DELETE /api/users/:id` | JWT saja |
| Absensi | `GET/POST /api/absensi` | JWT saja |
| Anggota | `GET/POST /api/anggota`, `GET/PUT/DELETE /api/anggota/:id` | JWT + role `admin` |
| Rapat | `GET/POST /api/rapat`, `GET/PUT/DELETE /api/rapat/:id` | JWT saja |
| Lain | `GET /`, `GET /api-docs` | Publik |

Fungsi `signup` sudah ditulis di `backend/controllers/authController.js:6` tetapi **tidak dipasang** sebagai route di `backend/routes/authRoutes.js:34-80`.

## 5. Fitur yang sudah ada

Login + hash bcrypt, reset password (simulasi email), CRUD user, CRUD anggota DPRD dengan JOIN `users`/`periode`, CRUD rapat, list & tambah absensi, middleware JWT dan role admin, Swagger UI, error handler global 500.

Schema yang **hanya bisa ditebak dari query**: `users`, `absensi`, `rapat`, `anggota_dprd`, `periode`; role: `admin`, `anggota`.

## 6. Kesenjangan dalam proyek

### Prioritas kritis

| # | Kekurangan | Bukti |
| --- | --- | --- |
| 1 | Kredensial DB dan `JWT_SECRET` tersimpan plaintext di `.env`, dan tidak ada `.gitignore` untuk mencegahnya masuk ke VCS | `backend/.env:1-6` |
| 2 | Token reset password dicetak ke console (debug artefak) | `backend/controllers/authController.js:35` |
| 3 | Token login JWT tidak memiliki masa berlaku (`expiresIn`) | `backend/controllers/authController.js:25` |
| 4 | CRUD user hanya pakai JWT, tanpa pembatasan role → user biasa bisa membuat/update user menjadi `admin` (privilege escalation) | `backend/routes/userRoutes.js:25,60,94,114`, `backend/controllers/userController.js:29-32` |
| 5 | Pengecekan token di `createUser` hanya mengecek keberadaan header, tidak memverifikasi token | `backend/controllers/userController.js:18-27` |
| 6 | `forgotPassword` tidak punya `try/catch`, selalu membalas sukses, dan tidak mengecek keberadaan email; `resetPassword` tidak mengecek `rowCount` | `backend/controllers/authController.js:32-51` |
| 7 | Email reset hanya `console.log`; URL hardcode `localhost:5000` | `backend/utils/emailSender.js:1-3` |

### Prioritas tinggi

| # | Kekurangan | Bukti |
| --- | --- | --- |
| 8 | Tidak ada schema SQL, migrasi, seeder, atau ORM — database mustahil direproduksi di mesin lain | seluruh proyek (tidak ada `*.sql`) |
| 9 | Tidak ada validasi input sama sekuali (body, email, password, enum role, param `id`) | `backend/package.json:13-23`, `backend/controllers/*.js` |
| 10 | Tidak ada test; cakupan 0% | `backend/package.json:6` |
| 11 | Tidak ada lint, typecheck, formatter, Docker, CI/CD, atau `.env.example` | `backend/package.json:5-8` |
| 12 | Error 500 membocorkan `err.message` (detail SQL/internal) ke klien | hampir semua controller, mis. `backend/controllers/authController.js:13,28` |
| 13 | CORS terbuka untuk semua origin, tanpa `helmet`, rate limiting, atau proteksi brute-force | `backend/server.js:22` |
| 14 | Absensi tidak memiliki `rapat_id`, tidak ada validasi `status_kehadiran`, pencegahan duplikat, rekap, statistik, atau laporan kehadiran | `backend/controllers/absensiController.js:3-20` |
| 15 | Tidak ada endpoint logout, refresh token, atau revocation | `backend/controllers/authController.js`, `backend/middlewares/authMiddleware.js` |

### Prioritas sedang / perbaikan kualitas

| # | Kekurangan | Bukti |
| --- | --- | --- |
| 16 | Swagger mendokumentasikan `nama_rapat`, controller mengharapkan `judul` → request sesuai docs menyimpan NULL | `backend/routes/rapatRoutes.js:62,95` vs `backend/controllers/rapatController.js:29,32` |
| 17 | `authMiddleware` mengembalikan 403 untuk "no token" (semestinya 401) | `backend/middlewares/authMiddleware.js:5,8` |
| 18 | `roleMiddleware` mengakses `req.user.role` tanpa pengecekan `req.user` | `backend/middlewares/roleMiddleware.js:3` |
| 19 | `dotenv.config()` dipanggil dua kali | `backend/server.js:9`, `backend/models/db.js:3` |
| 20 | Path Swagger `./routes/*.js` bergantung pada CWD | `backend/swagger/swagger.js:34` |
| 21 | Semua endpoint list tanpa pagination/filter | `backend/controllers/{user,absensi,rapat,anggota}Controller.js` |
| 22 | Email duplikat tidak dicek; `deleteUser` bisa menghapus admin/akun terakhir | `backend/controllers/userController.js:29-32,54-61` |
| 23 | Tidak ada handler 404 untuk route yang tidak ditemukan; error handler global selalu 500 | `backend/server.js:38-42` |
| 24 | Dependensi `bcrypt` tidak dipakai (kode memakai `bcryptjs`); `engines` tidak dideklarasikan | `backend/package.json:14-15`, `backend/controllers/authController.js:2` |
| 25 | Tidak ada graceful shutdown untuk `pg.Pool` | `backend/models/db.js:5-13`, `backend/server.js:45-49` |
| 26 | Artefak development masih tertinggal (komentar debug, emoji log, bahasa campur) | `backend/controllers/authController.js:35`, `backend/server.js:47-48` |

## 7. Rekomendasi urutan kerja

1. **Amankan dulu:** `.gitignore` + `.env.example`, rotasi secret, hapus logging token, beri `expiresIn` pada JWT, pasang `restrictTo('admin')` pada semua route user.
2. **Buat database reproducible:** migrasi SQL + seeder untuk `users`, `rapat`, `absensi`, `anggota_dprd`, `periode` (termasuk FK dan constraint).
3. **Rapikan kontrak API:** validasi request (mis. Zod/Joi), samakan `nama_rapat` ↔ `judul`, perbaiki status code, sentralisasi error response.
4. **Lengkapi fitur inti absensi:** relasi `rapat_id`, status kehadiran terdefinisi, pencegahan duplikat, rekap per anggota/rapat/periode.
5. **Tingkatkan kualitas:** test (Supertest + Jest), ESLint/Prettier, CI, Dockerfile + compose, pagination, logging dan graceful shutdown.
