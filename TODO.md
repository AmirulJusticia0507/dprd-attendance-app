# TODO

## Sudah selesai

- [x] Analisis kondisi awal dan dokumentasi kekurangan (`README.md` bagian 6).
- [x] Migrasi schema + seed 50 anggota DPRD 2024-2029 (`backend/database/`).
- [x] Hardening auth: JWT expiry, role admin, token reset di-hash, tanpa logging token.
- [x] Validasi request Zod, pagination/filter, error handler dan 404 terpusat.
- [x] CORS whitelist, Helmet, rate limit, dan graceful shutdown.
- [x] Absensi sesuai schema DB + endpoint rekap.
- [x] Swagger UI dan OpenAPI JSON (`/api-docs`, `/api-docs.json`).
- [x] `.env.example`, `.gitignore`, ESLint, dan test Supertest.
- [x] Modul `periode` & `partisipasi` direfactor (Zod, pagination, role admin).
- [x] Endpoint health check `GET /api/health`.
- [x] Hapus `validateMiddleware.js` duplikat; `healthRoutes.js` di-mount di `app.js`.
- [x] Commit & push perbaikan awal ke `origin/main` (`6e554c4`, `eda74cf`, `16e6c56`, `bc6cf66`).
- [x] Refresh token berputar + logout/revocation + tabel `refresh_tokens`.
- [x] Ekspor rekap absensi ke CSV (`GET /api/absensi/rekap/csv`).
- [x] Migrasi fresh DB (`000_create_schema.sql`) + test integrasi DB sementara.
- [x] Portal web minimal `/portal` (login, rekap, absensi, filter, CSV, logout, auto-refresh).
- [x] Halaman reset password `/portal/reset.html`.
- [x] Rotasi `JWT_SECRET`, `JWT_REFRESH_SECRET`, dan password seed di `backend/.env` (lokal).
- [x] Dockerfile, `docker-compose.yml`, GitHub Actions CI, Prettier, dan TypeScript `checkJs`.
- [x] Verifikasi akhir: lint/format/typecheck 0 error, 18/18 test lulus, audit 0 vulnerability.

## Belum

### Perlu kredensial eksternal

- [ ] Konfigurasi SMTP nyata agar `POST /api/auth/forgot` bisa mengirim email; saat ini sengaja mengembalikan `503` bila `SMTP_HOST` kosong (`backend/utils/emailSender.js`).

### Fitur lanjutan

- [ ] Check-in/check-out, QR code, geolocation, upload lampiran, dan notifikasi.
- [ ] Ekspor XLSX/PDF (CSV sudah tersedia).

### Deployment

- [ ] Kelola secret/DB password di lingkungan produksimelalui secret manager masing-masing.

## Referensi

Ringkasan perbaikan ada di `README.md` bagian 6, status verifikasi di bagian 8.
