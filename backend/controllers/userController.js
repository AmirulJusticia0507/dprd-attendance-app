const bcrypt = require('bcryptjs');
const { query, withTransaction } = require('../models/queryHelpers');
const asyncHandler = require('../utils/asyncHandler');
const getPagination = require('../utils/pagination');
const { badRequest, conflict, forbidden, notFound } = require('../utils/AppError');

exports.getAllUsers = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.validated.query);
  const result = await query(
    'SELECT id, nama, email, role, created_at FROM users ORDER BY id LIMIT $1 OFFSET $2',
    [pagination.limit, pagination.offset]
  );
  const count = await query('SELECT COUNT(*)::int AS total FROM users');
  res.json({ data: result.rows, meta: { ...pagination, total: count.rows[0].total } });
});

exports.createUser = asyncHandler(async (req, res) => {
  const { nama, email, password, role } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    const result = await query(
      'INSERT INTO users (nama, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, nama, email, role',
      [nama, email, hashed, role]
    );
    await query('INSERT INTO logs (user_id, action) VALUES ($1, $2)', [
      req.user.id,
      `create_user:${result.rows[0].id}`,
    ]);
    res.status(201).json({ message: 'User berhasil ditambahkan', data: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') throw conflict('Email sudah terdaftar');
    throw err;
  }
});

exports.updateUser = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const { nama, email, role } = req.body;
  if (!nama && !email && !role) throw badRequest('Minimal satu field harus diisi');

  const result = await withTransaction(async (client) => {
    const target = await client.query('SELECT id, role FROM users WHERE id = $1 FOR UPDATE', [id]);
    if (target.rowCount === 0) throw notFound('User tidak ditemukan');
    if (target.rows[0].role === 'admin' && role === 'anggota') {
      const admins = await client.query(
        "SELECT COUNT(*)::int AS total FROM users WHERE role = 'admin'"
      );
      if (admins.rows[0].total <= 1) throw badRequest('Tidak dapat menurunkan admin terakhir');
    }
    try {
      return await client.query(
        'UPDATE users SET nama = COALESCE($1, nama), email = COALESCE($2, email), role = COALESCE($3, role), updated_at = NOW() WHERE id = $4 RETURNING id, nama, email, role',
        [nama || null, email || null, role || null, id]
      );
    } catch (err) {
      if (err.code === '23505') throw conflict('Email sudah terdaftar');
      throw err;
    }
  });

  res.json({ message: 'User berhasil diperbarui', data: result.rows[0] });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  if (Number(id) === Number(req.user.id)) throw forbidden('Tidak dapat menghapus akun sendiri');

  await withTransaction(async (client) => {
    const target = await client.query('SELECT id, role FROM users WHERE id = $1 FOR UPDATE', [id]);
    if (target.rowCount === 0) throw notFound('User tidak ditemukan');
    if (target.rows[0].role === 'admin') {
      const admins = await client.query(
        "SELECT COUNT(*)::int AS total FROM users WHERE role = 'admin'"
      );
      if (admins.rows[0].total <= 1) throw badRequest('Tidak dapat menghapus admin terakhir');
    }
    await client.query('DELETE FROM users WHERE id = $1', [id]);
  });

  res.json({ message: 'User berhasil dihapus' });
});
