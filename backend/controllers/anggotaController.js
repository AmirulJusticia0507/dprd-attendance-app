const pool = require('../models/db'); // pastikan file db.js sudah buat koneksi ke PostgreSQL

// GET semua anggota
exports.getAllAnggota = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, u.nama AS nama_user, p.nama AS nama_periode
      FROM anggota_dprd a
      JOIN users u ON a.user_id = u.id
      JOIN periode p ON a.periode_id = p.id
      ORDER BY a.id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET detail anggota by ID
exports.getAnggotaById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT a.*, u.nama AS nama_user, p.nama AS nama_periode
      FROM anggota_dprd a
      JOIN users u ON a.user_id = u.id
      JOIN periode p ON a.periode_id = p.id
      WHERE a.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Anggota tidak ditemukan' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST tambah anggota
exports.createAnggota = async (req, res) => {
  const { user_id, periode_id, fraksi, jabatan, dapil, aktif } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO anggota_dprd (user_id, periode_id, fraksi, jabatan, dapil, aktif)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [user_id, periode_id, fraksi, jabatan, dapil, aktif]);

    res.status(201).json({ message: 'Anggota berhasil ditambahkan', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT update anggota
exports.updateAnggota = async (req, res) => {
  const { id } = req.params;
  const { user_id, periode_id, fraksi, jabatan, dapil, aktif } = req.body;
  try {
    const result = await pool.query(`
      UPDATE anggota_dprd
      SET user_id = $1,
          periode_id = $2,
          fraksi = $3,
          jabatan = $4,
          dapil = $5,
          aktif = $6
      WHERE id = $7
      RETURNING *
    `, [user_id, periode_id, fraksi, jabatan, dapil, aktif, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Anggota tidak ditemukan' });
    }

    res.json({ message: 'Anggota berhasil diupdate', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE anggota
exports.deleteAnggota = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`DELETE FROM anggota_dprd WHERE id = $1 RETURNING *`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Anggota tidak ditemukan' });
    }

    res.json({ message: 'Anggota berhasil dihapus', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
