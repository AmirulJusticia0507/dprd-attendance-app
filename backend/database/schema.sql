-- DPRD Attendance Database Schema
-- Database: dprd_db

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'anggota',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS periode (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    tahun_mulai INT NOT NULL,
    tahun_berakhir INT NOT NULL
);

CREATE TABLE IF NOT EXISTS anggota_dprd (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    periode_id INT REFERENCES periode(id) ON DELETE SET NULL,
    fraksi VARCHAR(100),
    dapil VARCHAR(100),
    jabatan VARCHAR(100),
    aktif BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS rapat (
    id SERIAL PRIMARY KEY,
    judul TEXT NOT NULL,
    tanggal DATE NOT NULL,
    waktu_mulai TIME,
    waktu_selesai TIME,
    tempat TEXT
);

CREATE TABLE IF NOT EXISTS absensi (
    id SERIAL PRIMARY KEY,
    rapat_id INT REFERENCES rapat(id) ON DELETE CASCADE,
    anggota_id INT REFERENCES anggota_dprd(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'hadir',
    jam_masuk TIME,
    keterangan TEXT
);

CREATE TABLE IF NOT EXISTS partisipasi (
    id SERIAL PRIMARY KEY,
    rapat_id INT REFERENCES rapat(id) ON DELETE CASCADE,
    anggota_id INT REFERENCES anggota_dprd(id) ON DELETE CASCADE,
    bicara BOOLEAN DEFAULT false,
    catatan TEXT
);

CREATE TABLE IF NOT EXISTS password_resets (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expired_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
