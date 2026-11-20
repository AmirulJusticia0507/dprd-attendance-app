const { query } = require('../models/queryHelpers');
const asyncHandler = require('../utils/asyncHandler');
const getPagination = require('../utils/pagination');
const { badRequest, conflict } = require('../utils/AppError');

exports.getAbsensi = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.validated.query);
  const filters = req.validated.query;
  const conditions = [];
  const params = [];
  for (const field of ['rapat_id', 'anggota_id', 'status']) {
    if (filters[field]) {
      params.push(filters[field]);
      conditions.push(`ab.${field} = $${params.length}`);
    }
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await query(
    `SELECT ab.*, u.nama AS nama_anggota, r.judul AS nama_rapat, r.tanggal
     FROM absensi ab
     LEFT JOIN anggota_dprd a ON a.id = ab.anggota_id
     LEFT JOIN users u ON u.id = a.user_id
     LEFT JOIN rapat r ON r.id = ab.rapat_id
     ${where}
     ORDER BY r.tanggal DESC NULLS LAST, ab.id DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, pagination.limit, pagination.offset]
  );
  const count = await query(`SELECT COUNT(*)::int AS total FROM absensi ab ${where}`, params);
  res.json({ data: result.rows, meta: { ...pagination, total: count.rows[0].total } });
});

exports.createAbsensi = asyncHandler(async (req, res) => {
  const { rapat_id, anggota_id, status, jam_masuk, keterangan } = req.body;
  try {
    const result = await query(
      `INSERT INTO absensi (rapat_id, anggota_id, status, jam_masuk, keterangan)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [rapat_id, anggota_id, status, jam_masuk || null, keterangan || null]
    );
    res.status(201).json({ message: 'Absensi ditambahkan', data: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') throw conflict('Anggota sudah memiliki absensi untuk rapat ini');
    if (err.code === '23503') throw badRequest('rapat_id atau anggota_id tidak valid');
    if (err.code === '23514') throw badRequest('Status kehadiran tidak valid');
    throw err;
  }
});

exports.getRekap = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.validated.query);
  const { periode_id, fraksi } = req.validated.query;
  const result = await query(
    `SELECT a.id AS anggota_id, u.nama, a.fraksi, a.partai, p.nama AS periode,
            COUNT(ab.id)::int AS total,
            COUNT(ab.id) FILTER (WHERE ab.status = 'hadir')::int AS hadir,
            COUNT(ab.id) FILTER (WHERE ab.status = 'izin')::int AS izin,
            COUNT(ab.id) FILTER (WHERE ab.status = 'alpha')::int AS alpha
     FROM anggota_dprd a
     JOIN users u ON u.id = a.user_id
     JOIN periode p ON p.id = a.periode_id
     LEFT JOIN absensi ab ON ab.anggota_id = a.id
     WHERE ($1::int IS NULL OR a.periode_id = $1)
       AND ($2::text IS NULL OR a.fraksi = $2)
     GROUP BY a.id, u.nama, a.fraksi, a.partai, p.nama
     ORDER BY hadir DESC, u.nama
     LIMIT $3 OFFSET $4`,
    [periode_id || null, fraksi || null, pagination.limit, pagination.offset]
  );
  res.json({
    data: result.rows.map((row) => ({
      ...row,
      persentase_hadir: row.total
        ? Math.round((Number(row.hadir) / Number(row.total)) * 100)
        : 0,
    })),
    meta: pagination,
  });
});
