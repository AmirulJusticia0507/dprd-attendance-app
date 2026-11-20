const { query } = require('../models/queryHelpers');
const asyncHandler = require('../utils/asyncHandler');
const getPagination = require('../utils/pagination');
const { badRequest, conflict, notFound } = require('../utils/AppError');

const columns = `a.id, a.user_id, a.periode_id, a.fraksi, a.partai, a.jabatan_fraksi,
  a.jabatan, a.dapil, a.aktif, u.nama, u.email, p.nama AS periode`;

const joins = `FROM anggota_dprd a
  JOIN users u ON a.user_id = u.id
  JOIN periode p ON a.periode_id = p.id`;

const buildFilter = (filters) => {
  const conditions = [];
  const params = [];
  if (filters.fraksi) {
    params.push(filters.fraksi);
    conditions.push(`a.fraksi = $${params.length}`);
  }
  if (filters.periode_id) {
    params.push(filters.periode_id);
    conditions.push(`a.periode_id = $${params.length}`);
  }
  if (filters.aktif) {
    params.push(filters.aktif === 'true');
    conditions.push(`a.aktif = $${params.length}`);
  }
  return { where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '', params };
};

exports.getAllAnggota = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.validated.query);
  const { where, params } = buildFilter(req.validated.query);
  const result = await query(
    `SELECT ${columns} ${joins} ${where} ORDER BY a.id LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, pagination.limit, pagination.offset]
  );
  const count = await query(`SELECT COUNT(*)::int AS total ${joins} ${where}`, params);
  res.json({ data: result.rows, meta: { ...pagination, total: count.rows[0].total } });
});

exports.getAnggotaById = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const result = await query(`SELECT ${columns} ${joins} WHERE a.id = $1`, [id]);
  if (result.rowCount === 0) throw notFound('Anggota tidak ditemukan');
  res.json(result.rows[0]);
});

exports.createAnggota = asyncHandler(async (req, res) => {
  const { user_id, periode_id, fraksi, partai, jabatan_fraksi, jabatan, dapil, aktif } = req.body;
  try {
    const result = await query(
      `INSERT INTO anggota_dprd (user_id, periode_id, fraksi, partai, jabatan_fraksi, jabatan, dapil, aktif)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [user_id, periode_id, fraksi, partai, jabatan_fraksi, jabatan, dapil, aktif]
    );
    res.status(201).json({ message: 'Anggota berhasil ditambahkan', data: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') throw conflict('Anggota pada periode ini sudah terdaftar');
    if (err.code === '23503') throw badRequest('user_id atau periode_id tidak valid');
    throw err;
  }
});

exports.updateAnggota = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const fields = req.body;
  const keys = Object.keys(fields);
  if (keys.length === 0) throw badRequest('Minimal satu field harus diisi');
  const assignments = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
  try {
    const result = await query(
      `UPDATE anggota_dprd SET ${assignments} WHERE id = $${keys.length + 1} RETURNING *`,
      [...keys.map((key) => fields[key]), id]
    );
    if (result.rowCount === 0) throw notFound('Anggota tidak ditemukan');
    res.json({ message: 'Anggota berhasil diperbarui', data: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') throw conflict('Anggota pada periode ini sudah terdaftar');
    if (err.code === '23503') throw badRequest('user_id atau periode_id tidak valid');
    throw err;
  }
});

exports.deleteAnggota = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const result = await query('DELETE FROM anggota_dprd WHERE id = $1 RETURNING *', [id]);
  if (result.rowCount === 0) throw notFound('Anggota tidak ditemukan');
  res.json({ message: 'Anggota berhasil dihapus', data: result.rows[0] });
});
