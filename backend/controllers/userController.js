const { query } = require('../models/queryHelpers');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// GET all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const result = await query(
      'SELECT id, nama, email, role, created_at, updated_at FROM users ORDER BY id ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error in getAllUsers:', err);
    res.status(500).json({ error: 'Gagal mengambil daftar pengguna' });
  }
};

// GET user by ID
exports.getUserById = async (req, res) => {
  const { id } = req.params;

  // Non-admin hanya boleh melihat profilnya sendiri
  if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
    return res.status(403).json({ error: 'Akses ditolak' });
  }

  try {
    const result = await query(
      'SELECT id, nama, email, role, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error in getUserById:', err);
    res.status(500).json({ error: 'Gagal mengambil detail pengguna' });
  }
};

// CREATE user (Admin or Initial Bootstrap)
exports.createUser = async (req, res) => {
  const { nama, email, password, role = 'anggota' } = req.body;

  if (!nama || !email || !password) {
    return res.status(400).json({ error: 'Nama, email, dan password wajib diisi' });
  }

  try {
    const adminCheck = await query("SELECT id FROM users WHERE role = 'admin'");
    const hasAdmin = adminCheck.rowCount > 0;

    // Jika sudah ada admin di database, wajib otentikasi admin
    if (hasAdmin) {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ error: 'Memerlukan token otentikasi' });

      const token = authHeader.split(' ')[1];
      if (!token) return res.status(401).json({ error: 'Token tidak valid' });

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'admin') {
          return res.status(403).json({ error: 'Hanya admin yang dapat menambahkan pengguna' });
        }
      } catch (tokenErr) {
        return res.status(401).json({ error: 'Token kedaluwarsa atau tidak valid' });
      }
    }

    // Cek apakah email sudah terdaftar
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rowCount > 0) {
      return res.status(400).json({ error: 'Email sudah terdaftar' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const assignedRole = hasAdmin ? role : 'admin'; // User pertama otomatis admin

    const insertResult = await query(
      'INSERT INTO users(nama, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, nama, email, role, created_at',
      [nama, email, hashed, assignedRole]
    );

    res.status(201).json({
      message: hasAdmin ? 'Pengguna berhasil ditambahkan' : 'Admin pertama berhasil dibuat',
      user: insertResult.rows[0],
    });
  } catch (err) {
    console.error('Error in createUser:', err);
    res.status(500).json({ error: 'Gagal membuat pengguna' });
  }
};

// UPDATE user (Admin only)
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { nama, email, role, password } = req.body;

  try {
    let queryText;
    let queryParams;

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      queryText = `UPDATE users 
                   SET nama = COALESCE($1, nama), 
                       email = COALESCE($2, email), 
                       role = COALESCE($3, role), 
                       password = $4,
                       updated_at = NOW() 
                   WHERE id = $5 
                   RETURNING id, nama, email, role, updated_at`;
      queryParams = [nama, email, role, hashed, id];
    } else {
      queryText = `UPDATE users 
                   SET nama = COALESCE($1, nama), 
                       email = COALESCE($2, email), 
                       role = COALESCE($3, role), 
                       updated_at = NOW() 
                   WHERE id = $4 
                   RETURNING id, nama, email, role, updated_at`;
      queryParams = [nama, email, role, id];
    }

    const result = await query(queryText, queryParams);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    res.json({ message: 'Pengguna berhasil diperbarui', user: result.rows[0] });
  } catch (err) {
    console.error('Error in updateUser:', err);
    res.status(500).json({ error: 'Gagal memperbarui pengguna' });
  }
};

// DELETE user (Admin only)
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  if (req.user && req.user.id === parseInt(id)) {
    return res.status(400).json({ error: 'Anda tidak dapat menghapus akun Anda sendiri' });
  }

  try {
    const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    res.json({ message: 'Pengguna berhasil dihapus' });
  } catch (err) {
    console.error('Error in deleteUser:', err);
    res.status(500).json({ error: 'Gagal menghapus pengguna' });
  }
};
