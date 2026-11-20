const { query } = require('../models/queryHelpers');
const asyncHandler = require('../utils/asyncHandler');
const getPagination = require('../utils/pagination');
const { badRequest, notFound } = require('../utils/AppError');

exports.getAllRapat = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.validated.query);
  const result = await query(
    'SELECT * FROM rapat ORDER BY tanggal DESC, id DESC LIMIT $1 OFFSET $2',
    [pagination.limit, pagination.offset]
  );
  const count = await query('SELECT COUNT(*)::int AS total FROM rapat');
  res.json({ data: result.rows, meta: { ...pagination, total: count.rows[0].total } });
});

exports.getRapatById = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const result = await query('SELECT * FROM rapat WHERE id = $1', [id]);
  if (result.rowCount === 0) throw notFound('Rapat tidak ditemukan');
  res.json(result.rows[0]);
});

exports.createRapat = asyncHandler(async (req, res) => {
  const { judul, tanggal, waktu_mulai, waktu_selesai, tempat } = req.body;
  if (waktu_selesai && waktu_mulai && waktu_selesai <= waktu_mulai) {
    throw badRequest('waktu_selesai harus setelah waktu_mulai');
  }
  const result = await query(
    `INSERT INTO rapat (judul, tanggal, waktu_mulai, waktu_selesai, tempat)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [judul, tanggal, waktu_mulai || null, waktu_selesai || null, tempat || null]
  );
  res.status(201).json({ message: 'Rapat berhasil ditambahkan', data: result.rows[0] });
});

exports.updateRapat = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const fields = req.body;
  const keys = Object.keys(fields);
  if (keys.length === 0) throw badRequest('Minimal satu field harus diisi');
  const assignments = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
  const result = await query(
    `UPDATE rapat SET ${assignments} WHERE id = $${keys.length + 1} RETURNING *`,
    [...keys.map((key) => fields[key]), id]
  );
  if (result.rowCount === 0) throw notFound('Rapat tidak ditemukan');
  res.json({ message: 'Rapat berhasil diperbarui', data: result.rows[0] });
});

exports.deleteRapat = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const result = await query('DELETE FROM rapat WHERE id = $1 RETURNING *', [id]);
  if (result.rowCount === 0) throw notFound('Rapat tidak ditemukan');
  res.json({ message: 'Rapat berhasil dihapus', data: result.rows[0] });
});
