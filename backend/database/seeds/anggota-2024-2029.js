const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const bcrypt = require('bcryptjs');
const pool = require('../../models/db');

const dapil = {
  1: 'Sleman 1 (Tempel, Turi, Sleman)',
  2: 'Sleman 2 (Cangkringan, Pakem, Ngaglik)',
  3: 'Sleman 3 (Prambanan, Kalasan, Ngemplak)',
  4: 'Sleman 4 (Depok, Berbah)',
  5: 'Sleman 5 (Gamping, Mlati)',
  6: 'Sleman 6 (Godean, Moyudan, Seyegan, Minggir)',
};

const anggota = [
  ['H. Wawan Prasetia, S.E., M.M.', 1, 'PKB', 'Anggota'],
  ['Ani Martanti, S.T.', 2, 'PKB', 'Anggota', 'Wakil Ketua I DPRD'],
  ['Hery Setiyawan, S.T.', 3, 'PKB', 'Anggota'],
  ['H. Wiratno, S.E., M.M.', 3, 'PKB', 'Ketua'],
  ['Wanto', 4, 'PKB', 'Wakil Ketua'],
  ['Herman Budi Pramono, S.E.', 5, 'PKB', 'Anggota'],
  ['Syukron Arif Muttaqin, S.E., M.A.P.', 6, 'PKB', 'Sekretaris'],
  ['H. R Sukaptana, S.H.', 1, 'Gerindra', 'Anggota', 'Wakil Ketua III DPRD'],
  ['Happy Brilliant Srikandy, S.E.', 2, 'Gerindra', 'Anggota'],
  ['Tri Mulia Wijayanti, S.S.T.', 3, 'Gerindra', 'Sekretaris'],
  ['M. Arif Priyosusanto, S.Si.', 4, 'Gerindra', 'Anggota'],
  ['Dara Ayu Suharto, S.H.', 5, 'Gerindra', 'Wakil Ketua'],
  ['Shodiqul Qiyar, S.IP.', 6, 'Gerindra', 'Ketua'],
  ['Wahyudi Kurniawan, S.IP.', 1, 'PDI Perjuangan', 'Anggota'],
  ['Aditya Bima Santosa Putra, S.T., S.H.', 1, 'PDI Perjuangan', 'Anggota'],
  ['Gani Sadat, S.H., M.Kn.', 2, 'PDI Perjuangan', 'Anggota'],
  ['Timbul Saptowo, S.T.', 2, 'PDI Perjuangan', 'Wakil Ketua'],
  ['Nila Rifianti, S.PD.', 3, 'PDI Perjuangan', 'Anggota'],
  ['Benedicte Rury Tyas Pramuri, S.E.', 3, 'PDI Perjuangan', 'Sekretaris'],
  ['Chisya Ayu Puspitaweni, S.T.', 4, 'PDI Perjuangan', 'Anggota'],
  ['H. Dedie Kusuma, S.T.', 4, 'PDI Perjuangan', 'Anggota'],
  ['Budi Sanyata, S.Pd.', 4, 'PDI Perjuangan', 'Anggota'],
  ['Y. Gustan Ganda, S.T.', 5, 'PDI Perjuangan', 'Anggota', 'Ketua DPRD'],
  ['Lilik Dwi Wahyana, S.E.', 5, 'PDI Perjuangan', 'Anggota'],
  ['F. Bambang Sigit Sulaksana, S.T.', 6, 'PDI Perjuangan', 'Ketua'],
  ['RB. Ramelan, S.E.', 6, 'PDI Perjuangan', 'Anggota'],
  ['Indra Bangsawan, S.E.', 1, 'Golkar', 'Sekretaris'],
  ['Banudoyo Manggolo, S.Kom.', 2, 'Golkar', 'Ketua'],
  ['Marsono', 3, 'Golkar', 'Anggota'],
  ['Guntur Yoga Purnawan, S.T.', 4, 'Golkar', 'Anggota'],
  ['H. Suryana, A.Md.Kes.', 5, 'Golkar', 'Wakil Ketua'],
  ['Sukamto, S.H.', 6, 'Golkar', 'Anggota'],
  ['H. Surana, S.E.', 3, 'NasDem', 'Anggota', null, 'PPP NasDem'],
  ['Hj. Ismi Sutarti, S.H.', 5, 'NasDem', 'Sekretaris', null, 'PPP NasDem'],
  ['Suharyono, S.Pd.', 6, 'NasDem', 'Wakil Ketua', null, 'PPP NasDem'],
  ['Agus Riyanto, S.Si.', 1, 'PKS', 'Anggota'],
  ['Yani Fathu Rahman, S.Pd.I.', 2, 'PKS', 'Ketua'],
  ['Hj. Sumaryatin, S.Sos., M.A.', 3, 'PKS', 'Anggota'],
  ['Ali Imron, S.Pd.', 4, 'PKS', 'Anggota'],
  ['Hasto Karyantoro, S.I.P.', 5, 'PKS', 'Anggota', 'Wakil Ketua II DPRD'],
  ['Muh. Zuhdan, S.Pd., M.A.P.', 6, 'PKS', 'Sekretaris'],
  ['dr. Raudi Akmal', 1, 'PAN', 'Anggota'],
  ['Ir. H. Abdul Kadir, M.H.', 2, 'PAN', 'Ketua'],
  ['H. Bondan Triyana, S.Sos., M.M.', 3, 'PAN', 'Anggota'],
  ['Galuh Saraswati Leksono, S.Pd.', 4, 'PAN', 'Anggota'],
  ['Respati Agus Sasangka, S.I.P.', 5, 'PAN', 'Wakil Ketua'],
  ['Erna Ekawati, S.E., M.M.', 6, 'PAN', 'Anggota'],
  ['Nurlia Ardianti Putri, S.TP.', 2, 'PPP', 'Anggota', null, 'PPP NasDem'],
  ['Fika Chusnul Chotimah, S.H.', 5, 'PPP', 'Anggota', null, 'PPP NasDem'],
  ['Untung Basuki Rahmad, S.Ag.', 6, 'PPP', 'Ketua', null, 'PPP NasDem'],
];

const slugify = (nama) =>
  nama
    .split(/[\s,]+/)
    .filter((word) => !word.endsWith('.'))
    .join('.')
    .toLowerCase();

const seed = async () => {
  const password = await bcrypt.hash(process.env.SEED_DEFAULT_PASSWORD || 'Sleman2024!', 10);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const periode = await client.query(
      `INSERT INTO periode (nama, tahun_mulai, tahun_berakhir)
       VALUES ('2024-2029', 2024, 2029)
       ON CONFLICT (nama) DO UPDATE
       SET tahun_mulai = EXCLUDED.tahun_mulai, tahun_berakhir = EXCLUDED.tahun_berakhir
       RETURNING id`
    );
    const periodeId = periode.rows[0].id;

    for (const [nama, dapilNo, partai, peranFraksi, jabatanDprd, fraksi] of anggota) {
      const email = `${slugify(nama)}@dprd.slemankab.go.id`;
      const user = await client.query(
        `INSERT INTO users (nama, email, password, role)
         VALUES ($1, $2, $3, 'anggota')
         ON CONFLICT (email) DO UPDATE SET nama = EXCLUDED.nama, updated_at = NOW()
         RETURNING id`,
        [nama, email, password]
      );
      const fraksiName = fraksi || partai;
      await client.query(
        `INSERT INTO anggota_dprd
           (user_id, periode_id, fraksi, partai, jabatan_fraksi, jabatan, dapil, aktif)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true)
         ON CONFLICT (user_id, periode_id) DO UPDATE SET
           fraksi = EXCLUDED.fraksi,
           partai = EXCLUDED.partai,
           jabatan_fraksi = EXCLUDED.jabatan_fraksi,
           jabatan = EXCLUDED.jabatan,
           dapil = EXCLUDED.dapil,
           aktif = true`,
        [
          user.rows[0].id,
          periodeId,
          fraksiName,
          partai,
          `${peranFraksi} Fraksi ${fraksiName}`,
          jabatanDprd || 'Anggota DPRD',
          dapil[dapilNo],
        ]
      );
    }
    await client.query('COMMIT');
    console.log(`Seed selesai: ${anggota.length} anggota, periode 2024-2029.`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed gagal:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

seed();
