const { query } = require('../models/queryHelpers');

exports.getAbsensi = async (req, res) => {
  try {
    const result = await query('SELECT * FROM absensi ORDER BY tanggal DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createAbsensi = async (req, res) => {
  const { user_id, status_kehadiran, catatan } = req.body;
  try {
    await query('INSERT INTO absensi(user_id, status_kehadiran, catatan) VALUES ($1, $2, $3)', [user_id, status_kehadiran, catatan]);
    res.status(201).json({ message: 'Absensi ditambahkan' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};