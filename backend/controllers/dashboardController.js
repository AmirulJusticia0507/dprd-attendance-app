const { query } = require('../models/queryHelpers');
const asyncHandler = require('../utils/asyncHandler');
const getPagination = require('../utils/pagination');
const { badRequest } = require('../utils/AppError');

const findAnggotaAktif = async (userId) =>
  query(
    `SELECT a.id AS anggota_id, u.nama, u.email, a.fraksi, a.partai, a.jabatan,
            a.jabatan_fraksi, a.dapil, p.nama AS periode
     FROM anggota_dprd a
     JOIN users u ON u.id = a.user_id
     JOIN periode p ON p.id = a.periode_id
     WHERE a.user_id = $1 AND a.aktif = true
     ORDER BY p.tahun_mulai DESC
     LIMIT 1`,
    [userId]
  );

exports.getAnggotaDashboard = asyncHandler(async (req, res) => {
  const profilResult = await findAnggotaAktif(req.user.id);
  if (profilResult.rowCount === 0)
    throw badRequest('Akun ini tidak terdaftar sebagai anggota aktif');
  const profil = profilResult.rows[0];

  const statsResult = await query(
    `SELECT COUNT(ab.id)::int AS total,
            COUNT(ab.id) FILTER (WHERE ab.status = 'hadir')::int AS hadir,
            COUNT(ab.id) FILTER (WHERE ab.status = 'izin')::int AS izin,
            COUNT(ab.id) FILTER (WHERE ab.status = 'alpha')::int AS alpha
     FROM absensi ab
     WHERE ab.anggota_id = $1`,
    [profil.anggota_id]
  );
  const stats = statsResult.rows[0];

  const recentResult = await query(
    `SELECT ab.id, ab.status, ab.jam_masuk, ab.keterangan,
            r.id AS rapat_id, r.judul AS nama_rapat, r.jenis_rapat, r.sub_jenis,
            r.tanggal, r.tempat
     FROM absensi ab
     JOIN rapat r ON r.id = ab.rapat_id
     WHERE ab.anggota_id = $1
     ORDER BY r.tanggal DESC, ab.id DESC
     LIMIT 5`,
    [profil.anggota_id]
  );

  const upcomingResult = await query(
    `SELECT r.id, r.judul, r.jenis_rapat, r.sub_jenis, r.tanggal,
            r.waktu_mulai, r.waktu_selesai, r.tempat, ab.status AS status_absensi
     FROM rapat r
     LEFT JOIN absensi ab ON ab.rapat_id = r.id AND ab.anggota_id = $1
     WHERE r.tanggal >= CURRENT_DATE
     ORDER BY r.tanggal, r.waktu_mulai NULLS LAST
     LIMIT 5`,
    [profil.anggota_id]
  );

  res.json({
    data: {
      profil,
      statistik: {
        ...stats,
        persentase_hadir: stats.total ? Math.round((Number(stats.hadir) / stats.total) * 100) : 0,
      },
      absensi_terbaru: recentResult.rows,
      rapat_mendatang: upcomingResult.rows,
    },
  });
});

exports.getAbsensiSaya = asyncHandler(async (req, res) => {
  const profilResult = await findAnggotaAktif(req.user.id);
  if (profilResult.rowCount === 0)
    throw badRequest('Akun ini tidak terdaftar sebagai anggota aktif');
  const anggotaId = profilResult.rows[0].anggota_id;
  const pagination = getPagination(req.validated.query);

  const result = await query(
    `SELECT ab.id, ab.status, ab.jam_masuk, ab.keterangan,
            r.id AS rapat_id, r.judul AS nama_rapat, r.jenis_rapat, r.sub_jenis,
            r.tanggal, r.tempat
     FROM absensi ab
     JOIN rapat r ON r.id = ab.rapat_id
     WHERE ab.anggota_id = $1
     ORDER BY r.tanggal DESC, ab.id DESC
     LIMIT $2 OFFSET $3`,
    [anggotaId, pagination.limit, pagination.offset]
  );
  const count = await query('SELECT COUNT(*)::int AS total FROM absensi WHERE anggota_id = $1', [
    anggotaId,
  ]);

  res.json({ data: result.rows, meta: { ...pagination, total: count.rows[0].total } });
});

exports.getAdminDashboard = asyncHandler(async (req, res) => {
  const totalsResult = await query(
    `SELECT (SELECT COUNT(*)::int FROM users) AS total_users,
            (SELECT COUNT(*)::int FROM anggota_dprd WHERE aktif = true) AS total_anggota,
            (SELECT COUNT(*)::int FROM rapat) AS total_rapat,
            (SELECT COUNT(*)::int FROM absensi) AS total_absensi,
            (SELECT COUNT(*)::int FROM absensi WHERE status = 'hadir') AS total_hadir`
  );
  const totals = totalsResult.rows[0];
  totals.persentase_hadir = totals.total_absensi
    ? Math.round((Number(totals.total_hadir) / totals.total_absensi) * 100)
    : 0;

  const rekapResult = await query(
    `SELECT a.id AS anggota_id, u.nama, a.fraksi,
            COUNT(ab.id)::int AS total,
            COUNT(ab.id) FILTER (WHERE ab.status = 'hadir')::int AS hadir,
            COUNT(ab.id) FILTER (WHERE ab.status = 'izin')::int AS izin,
            COUNT(ab.id) FILTER (WHERE ab.status = 'alpha')::int AS alpha
     FROM anggota_dprd a
     JOIN users u ON u.id = a.user_id
     LEFT JOIN absensi ab ON ab.anggota_id = a.id
     WHERE a.aktif = true
     GROUP BY a.id, u.nama, a.fraksi
     ORDER BY hadir DESC, u.nama
     LIMIT 5`
  );
  const rekap = rekapResult.rows.map((row) => ({
    ...row,
    persentase_hadir: row.total ? Math.round((Number(row.hadir) / row.total) * 100) : 0,
  }));

  const recentResult = await query(
    `SELECT ab.id, ab.status, ab.jam_masuk, u.nama AS nama_anggota,
            r.judul AS nama_rapat, r.tanggal
     FROM absensi ab
     JOIN anggota_dprd a ON a.id = ab.anggota_id
     JOIN users u ON u.id = a.user_id
     JOIN rapat r ON r.id = ab.rapat_id
     ORDER BY r.tanggal DESC, ab.id DESC
     LIMIT 5`
  );

  const fraksiResult = await query(
    `SELECT fraksi, COUNT(*)::int AS total
     FROM anggota_dprd
     WHERE aktif = true
     GROUP BY fraksi
     ORDER BY total DESC, fraksi`
  );

  res.json({
    data: {
      statistik: totals,
      rekap_teratas: rekap,
      absensi_terbaru: recentResult.rows,
      fraksi: fraksiResult.rows,
    },
  });
});
