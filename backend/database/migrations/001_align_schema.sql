BEGIN;

ALTER TABLE anggota_dprd ADD COLUMN IF NOT EXISTS partai varchar(50);
ALTER TABLE anggota_dprd ADD COLUMN IF NOT EXISTS jabatan_fraksi varchar(100);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'anggota_dprd_user_periode_key') THEN
    ALTER TABLE anggota_dprd ADD CONSTRAINT anggota_dprd_user_periode_key UNIQUE (user_id, periode_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'absensi_rapat_anggota_key') THEN
    ALTER TABLE absensi ADD CONSTRAINT absensi_rapat_anggota_key UNIQUE (rapat_id, anggota_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'periode_nama_key') THEN
    ALTER TABLE periode ADD CONSTRAINT periode_nama_key UNIQUE (nama);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_anggota_periode ON anggota_dprd (periode_id);
CREATE INDEX IF NOT EXISTS idx_anggota_fraksi ON anggota_dprd (fraksi);
CREATE INDEX IF NOT EXISTS idx_absensi_rapat ON absensi (rapat_id);
CREATE INDEX IF NOT EXISTS idx_absensi_anggota ON absensi (anggota_id);
CREATE INDEX IF NOT EXISTS idx_rapat_tanggal ON rapat (tanggal DESC);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets (token);

COMMIT;
