const { query } = require('../models/queryHelpers');
const asyncHandler = require('../utils/asyncHandler');
const getPagination = require('../utils/pagination');
const { notFound, conflict, badRequest } = require('../utils/AppError');

exports.getAllPeriode = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.validated.query);
  const result = await query(
    'SELECT * FROM periode ORDER BY tahun_mulai DESC LIMIT $1 OFFSET $2',
    [pagination.limit, pagination.offset]
  );
  const count = await query('SELECT COUNT(*)::int AS total FROM periode');
  res.json({ data: result.rows, meta: { ...pagination, total: count.rows[0].total } });
});

exports.getPeriodeById = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const result = await query('SELECT * FROM periode WHERE id = $1', [id]);
  if (result.rowCount === 0) throw notFound('Periode tidak ditemukan');
  res.json(result.rows[0]);
});

exports.createPeriode = asyncHandler(async (req, res) => {
  const { nama, tahun_mulai, tahun_berakhir } = req.body;
  if (tahun_berakhir <= tahun_mulai) {
    throw badRequest('tahun_berakhir harus lebih besar dari tahun_mulai');
  }
  try {
    const result = await query(
      'INSERT INTO periode (nama, tahun_mulai, tahun_berakhir) VALUES ($1, $2, $3) RETURNING *',
      [nama, tahun_mulai, tahun_berakhir]
    );
    res.status(201).json({ message: 'Periode berhasil ditambahkan', data: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') throw conflict('Nama periode sudah ada');
    throw err;
  }
});

exports.updatePeriode = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const fields = req.body;
  const keys = Object.keys(fields);
  if (keys.length === 0) throw badRequest('Minimal satu field harus diisi');
  const assignments = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
  try {
    const result = await query(
      `UPDATE periode SET ${assignments} WHERE id = $${keys.length + 1} RETURNING *`,
      [...keys.map((key) => fields[key]), id]
    );
    if (result.rowCount === 0) throw notFound('Periode tidak ditemukan');
    res.json({ message: 'Periode berhasil diperbarui', data: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') throw conflict('Nama periode sudah ada');
    throw err;
  }
});

exports.deletePeriode = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  try {
    const result = await query('DELETE FROM periode WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) throw notFound('Periode tidak ditemukan');
    res.json({ message: 'Periode berhasil dihapus' });
  } catch (err) {
    if (err.code === '23503') throw badRequest('Periode masih digunakan oleh anggota DPRD');
    throw err;
  }
});
