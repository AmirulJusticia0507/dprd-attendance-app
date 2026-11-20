const { query } = require('../models/queryHelpers');

// GET all periode
exports.getAllPeriode = async (req, res) => {
  try {
    const result = await query('SELECT * FROM periode ORDER BY tahun_mulai DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error in getAllPeriode:', err);
    res.status(500).json({ error: 'Gagal mengambil data periode' });
  }
};

// GET periode by ID
exports.getPeriodeById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('SELECT * FROM periode WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Periode tidak ditemukan' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error in getPeriodeById:', err);
    res.status(500).json({ error: 'Gagal mengambil detail periode' });
  }
};

// CREATE periode (Admin only)
exports.createPeriode = async (req, res) => {
  const { nama, tahun_mulai, tahun_berakhir } = req.body;

  if (!nama || !tahun_mulai || !tahun_berakhir) {
    return res.status(400).json({ error: 'Nama, tahun_mulai, dan tahun_berakhir wajib diisi' });
  }

  try {
    const result = await query(
      'INSERT INTO periode (nama, tahun_mulai, tahun_berakhir) VALUES ($1, $2, $3) RETURNING *',
      [nama, tahun_mulai, tahun_berakhir]
    );
    res.status(201).json({ message: 'Periode berhasil ditambahkan', data: result.rows[0] });
  } catch (err) {
    console.error('Error in createPeriode:', err);
    res.status(500).json({ error: 'Gagal menambahkan periode' });
  }
};

// UPDATE periode (Admin only)
exports.updatePeriode = async (req, res) => {
  const { id } = req.params;
  const { nama, tahun_mulai, tahun_berakhir } = req.body;

  try {
    const result = await query(
      `UPDATE periode 
       SET nama = COALESCE($1, nama), 
           tahun_mulai = COALESCE($2, tahun_mulai), 
           tahun_berakhir = COALESCE($3, tahun_berakhir) 
       WHERE id = $4 
       RETURNING *`,
      [nama, tahun_mulai, tahun_berakhir, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Periode tidak ditemukan' });
    }

    res.json({ message: 'Periode berhasil diperbarui', data: result.rows[0] });
  } catch (err) {
    console.error('Error in updatePeriode:', err);
    res.status(500).json({ error: 'Gagal memperbarui periode' });
  }
};

// DELETE periode (Admin only)
exports.deletePeriode = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query('DELETE FROM periode WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Periode tidak ditemukan' });
    }
    res.json({ message: 'Periode berhasil dihapus' });
  } catch (err) {
    console.error('Error in deletePeriode:', err);
    res.status(500).json({ error: 'Gagal menghapus periode (mungkin masih terkait data anggota)' });
  }
};
