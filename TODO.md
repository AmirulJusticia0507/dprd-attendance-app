# TODO

## Sudah selesai

- [x] Analisis kondisi awal dan dokumentasi kekurangan (`README.md` bagian 6).
- [x] Migrasi schema + seed 50 anggota DPRD 2024-2029 (`backend/database/`).
- [x] Hardening auth: JWT expiry, role admin, token reset di-hash, tanpa logging token.
- [x] Validasi request Zod, pagination/filter, error handler dan 404 terpusat.
- [x] CORS whitelist, Helmet, rate limit, dan graceful shutdown.
- [x] Absensi sesuai schema DB + endpoint rekap.
- [x] Swagger UI dan OpenAPI JSON (`/api-docs`, `/api-docs.json`).
- [x] `.env.example`, `.gitignore`, ESLint, dan 9 test Supertest.
- [x] Verifikasi: lint 0 error, test 9/9, audit 0 vulnerability, smoke API 200.
- [x] Commit & push perbaikan ke `origin/main` (`6e554c4`).

## Belum

### Prioritas tinggi

- [ ] Konfigurasi SMTP nyata agar `POST /api/auth/forgot` bisa mengirim email; saat ini sengaja mengembalikan `503` bila `SMTP_HOST` kosong (`backend/utils/emailSender.js`, `backend/controllers/authController.js`).
- [ ] Rotasi `JWT_SECRET`, kredensial PostgreSQL, dan password seed `Sleman2024!` sebelum dipakai di lingkungan publik (`backend/.env`, `backend/database/seeds/anggota-2024-2029.js`).
- [ ] Bangun frontend/portal untuk login, pencatatan absensi, dan rekap kehadiran.

### Fitur backend lanjutan

- [ ] Tambah logout, refresh token, dan revocation/session (mis. Redis atau tabel session).
- [ ] Tambah check-in/check-out, QR code, geolocation, upload lampiran, dan notifikasi.
- [ ] Tambah ekspor laporan rekap ke CSV/XLSX/PDF.

### Kualitas & infrastruktur

- [ ] Tambah `Dockerfile` dan `docker-compose.yml` untuk backend + PostgreSQL.
- [ ] Tambah GitHub Actions untuk `npm run lint`, `npm test`, dan `npm audit`.
- [ ] Tambahkan typecheck/TypeScript dan formatter (Prettier).
- [ ] Tambah test integrasi dengan database PostgreSQL sementara.
- [ ] Putuskan nasib 2 file untracked lama: `backend/middlewares/validateMiddleware.js` dan `backend/routes/healthRoutes.js` (hapus atau integrasikan/mount route health).

## Referensi

Ringkasan perbaikan ada di `README.md` bagian 6, status verifikasi di bagian 8.
