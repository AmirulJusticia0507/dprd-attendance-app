const { query } = require('../models/queryHelpers');

// GET all rapat
exports.getAllRapat = async (req, res) => {
  try {
    const result = await query('SELECT * FROM rapat ORDER BY tanggal DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
  }
};

// CREATE rapat
exports.createRapat = async (req, res) => {
  const { judul, tanggal, lokasi, deskripsi } = req.body;
  try {
    await query(
      'INSERT INTO rapat (judul, tanggal, lokasi, deskripsi) VALUES ($1, $2, $3, $4)',
      [judul, tanggal, lokasi, deskripsi]
    );
    res.status(201).json({ message: 'Rapat berhasil ditambahkan' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE rapat
exports.updateRapat = async (req, res) => {
  const { id } = req.params;
  const { judul, tanggal, lokasi, deskripsi } = req.body;
  try {
    const result = await query(
      'UPDATE rapat SET judul = $1, tanggal = $2, lokasi = $3, deskripsi = $4 WHERE id = $5',
      [judul, tanggal, lokasi, deskripsi, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Rapat tidak ditemukan' });
    }
    res.json({ message: 'Rapat berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE rapat
exports.deleteRapat = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM rapat WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Rapat tidak ditemukan' });
    }
    res.json({ message: 'Rapat berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
