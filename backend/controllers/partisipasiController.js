const { query } = require('../models/queryHelpers');
const asyncHandler = require('../utils/asyncHandler');
const getPagination = require('../utils/pagination');
const { notFound, badRequest } = require('../utils/AppError');

const columns = `
  p.id, p.rapat_id, p.anggota_id, p.bicara, p.catatan,
  r.judul AS judul_rapat, r.tanggal AS tanggal_rapat,
  u.nama AS nama_anggota, a.fraksi, a.jabatan`;

const joins = `
  FROM partisipasi p
  JOIN rapat r ON r.id = p.rapat_id
  JOIN anggota_dprd a ON a.id = p.anggota_id
  JOIN users u ON u.id = a.user_id`;

exports.getPartisipasi = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.validated.query);
  const filters = req.validated.query;
  const conditions = [];
  const params = [];
  for (const field of ['rapat_id', 'anggota_id']) {
    if (filters[field]) {
      params.push(filters[field]);
      conditions.push(`p.${field} = $${params.length}`);
    }
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await query(
    `SELECT ${columns} ${joins} ${where} ORDER BY r.tanggal DESC, p.id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, pagination.limit, pagination.offset]
  );
  const count = await query(`SELECT COUNT(*)::int AS total FROM partisipasi p ${where}`, params);
  res.json({ data: result.rows, meta: { ...pagination, total: count.rows[0].total } });
});

exports.getPartisipasiById = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const result = await query(`SELECT ${columns} ${joins} WHERE p.id = $1`, [id]);
  if (result.rowCount === 0) throw notFound('Data partisipasi tidak ditemukan');
  res.json(result.rows[0]);
});

exports.createPartisipasi = asyncHandler(async (req, res) => {
  const { rapat_id, anggota_id, bicara = false, catatan } = req.body;
  try {
    const result = await query(
      'INSERT INTO partisipasi (rapat_id, anggota_id, bicara, catatan) VALUES ($1, $2, $3, $4) RETURNING *',
      [rapat_id, anggota_id, Boolean(bicara), catatan || null]
    );
    res.status(201).json({ message: 'Partisipasi berhasil dicatat', data: result.rows[0] });
  } catch (err) {
    if (err.code === '23503') throw badRequest('rapat_id atau anggota_id tidak valid');
    throw err;
  }
});

exports.updatePartisipasi = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const fields = req.body;
  const keys = Object.keys(fields);
  if (keys.length === 0) throw badRequest('Minimal satu field harus diisi');
  const assignments = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
  const result = await query(
    `UPDATE partisipasi SET ${assignments} WHERE id = $${keys.length + 1} RETURNING *`,
    [...keys.map((key) => fields[key]), id]
  );
  if (result.rowCount === 0) throw notFound('Data partisipasi tidak ditemukan');
  res.json({ message: 'Partisipasi berhasil diperbarui', data: result.rows[0] });
});

exports.deletePartisipasi = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const result = await query('DELETE FROM partisipasi WHERE id = $1 RETURNING *', [id]);
  if (result.rowCount === 0) throw notFound('Data partisipasi tidak ditemukan');
  res.json({ message: 'Partisipasi berhasil dihapus' });
});
