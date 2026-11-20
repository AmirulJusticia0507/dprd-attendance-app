ALTER TABLE rapat
  ADD COLUMN IF NOT EXISTS jenis_rapat VARCHAR(20) NOT NULL DEFAULT 'Lainnya',
  ADD COLUMN IF NOT EXISTS sub_jenis VARCHAR(100);

DO $$
BEGIN
  ALTER TABLE rapat DROP CONSTRAINT IF EXISTS rapat_jenis_rapat_check;
  ALTER TABLE rapat
    ADD CONSTRAINT rapat_jenis_rapat_check
    CHECK (jenis_rapat IN ('Paripurna', 'Komisi', 'Badan', 'Lainnya'));

  ALTER TABLE rapat DROP CONSTRAINT IF EXISTS rapat_sub_jenis_badan_check;
  ALTER TABLE rapat
    ADD CONSTRAINT rapat_sub_jenis_badan_check
    CHECK (
      jenis_rapat <> 'Badan'
      OR (
        sub_jenis IS NOT NULL
        AND sub_jenis IN ('Banggar', 'Badan Musyawarah', 'Badan Kehormatan', 'Bapemperda')
      )
    );
END $$;
