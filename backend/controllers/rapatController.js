const { query } = require('../models/queryHelpers');

// GET all rapat
exports.getAllRapat = async (req, res) => {
  try {
    const result = await query('SELECT * FROM rapat ORDER BY tanggal DESC, waktu_mulai ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error in getAllRapat:', err);
    res.status(500).json({ error: 'Gagal mengambil data rapat' });
  }
};

// GET rapat by ID
exports.getRapatById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('SELECT * FROM rapat WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Rapat tidak ditemukan' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error in getRapatById:', err);
    res.status(500).json({ error: 'Gagal mengambil detail rapat' });
  }
};

// CREATE rapat (Admin only)
exports.createRapat = async (req, res) => {
  const { judul, tanggal, waktu_mulai, waktu_selesai, tempat } = req.body;
  if (!judul || !tanggal) {
    return res.status(400).json({ error: 'Judul dan tanggal rapat wajib diisi' });
  }
  try {
    const result = await query(
      'INSERT INTO rapat (judul, tanggal, waktu_mulai, waktu_selesai, tempat) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [judul, tanggal, waktu_mulai || null, waktu_selesai || null, tempat || null]
    );
    res.status(201).json({ message: 'Rapat berhasil ditambahkan', data: result.rows[0] });
  } catch (err) {
    console.error('Error in createRapat:', err);
    res.status(500).json({ error: 'Gagal menambahkan rapat' });
  }
};

// UPDATE rapat (Admin only)
exports.updateRapat = async (req, res) => {
  const { id } = req.params;
  const { judul, tanggal, waktu_mulai, waktu_selesai, tempat } = req.body;
  try {
    const result = await query(
      `UPDATE rapat 
       SET judul = COALESCE($1, judul),
           tanggal = COALESCE($2, tanggal),
           waktu_mulai = COALESCE($3, waktu_mulai),
           waktu_selesai = COALESCE($4, waktu_selesai),
           tempat = COALESCE($5, tempat)
       WHERE id = $6
       RETURNING *`,
      [judul, tanggal, waktu_mulai, waktu_selesai, tempat, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Rapat tidak ditemukan' });
    }
    res.json({ message: 'Rapat berhasil diperbarui', data: result.rows[0] });
  } catch (err) {
    console.error('Error in updateRapat:', err);
    res.status(500).json({ error: 'Gagal memperbarui rapat' });
  }
};

// DELETE rapat (Admin only)
exports.deleteRapat = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM rapat WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Rapat tidak ditemukan' });
    }
    res.json({ message: 'Rapat berhasil dihapus', data: result.rows[0] });
  } catch (err) {
    console.error('Error in deleteRapat:', err);
    res.status(500).json({ error: 'Gagal menghapus rapat' });
  }
};
