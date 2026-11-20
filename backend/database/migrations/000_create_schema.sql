CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'anggota' CONSTRAINT users_role_check CHECK (role IN ('admin', 'anggota')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS periode (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(100) NOT NULL UNIQUE,
  tahun_mulai INTEGER NOT NULL,
  tahun_berakhir INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS anggota_dprd (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
  periode_id INTEGER REFERENCES periode (id) ON DELETE CASCADE,
  fraksi VARCHAR(100),
  dapil VARCHAR(100),
  jabatan VARCHAR(100),
  aktif BOOLEAN DEFAULT true,
  partai VARCHAR(50),
  jabatan_fraksi VARCHAR(100),
  CONSTRAINT anggota_dprd_user_periode_key UNIQUE (user_id, periode_id)
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
  rapat_id INTEGER REFERENCES rapat (id) ON DELETE CASCADE,
  anggota_id INTEGER REFERENCES anggota_dprd (id) ON DELETE CASCADE,
  status VARCHAR(10) CONSTRAINT absensi_status_check CHECK (status IN ('hadir', 'izin', 'alpha')),
  jam_masuk TIME,
  keterangan TEXT,
  CONSTRAINT absensi_rapat_anggota_key UNIQUE (rapat_id, anggota_id)
);

CREATE TABLE IF NOT EXISTS partisipasi (
  id SERIAL PRIMARY KEY,
  rapat_id INTEGER REFERENCES rapat (id) ON DELETE CASCADE,
  anggota_id INTEGER REFERENCES anggota_dprd (id) ON DELETE CASCADE,
  bicara BOOLEAN DEFAULT false,
  catatan TEXT
);

CREATE TABLE IF NOT EXISTS logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS password_resets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expired_at TIMESTAMP NOT NULL
);

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at') THEN
    CREATE TRIGGER set_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;
