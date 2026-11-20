const { query } = require('../models/queryHelpers');

// GET all partisipasi (with optional filters)
exports.getPartisipasi = async (req, res) => {
  const { rapat_id, anggota_id } = req.query;

  try {
    const result = await query(
      `SELECT 
        p.id,
        p.rapat_id,
        r.judul AS judul_rapat,
        r.tanggal AS tanggal_rapat,
        p.anggota_id,
        u.nama AS nama_anggota,
        a.fraksi,
        a.jabatan,
        p.bicara,
        p.catatan
      FROM partisipasi p
      JOIN rapat r ON p.rapat_id = r.id
      JOIN anggota_dprd a ON p.anggota_id = a.id
      JOIN users u ON a.user_id = u.id
      WHERE ($1::INT IS NULL OR p.rapat_id = $1)
        AND ($2::INT IS NULL OR p.anggota_id = $2)
      ORDER BY r.tanggal DESC, p.id ASC`,
      [rapat_id || null, anggota_id || null]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error in getPartisipasi:', err);
    res.status(500).json({ error: 'Gagal mengambil data partisipasi' });
  }
};

// GET partisipasi by ID
exports.getPartisipasiById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query(
      `SELECT 
        p.id,
        p.rapat_id,
        r.judul AS judul_rapat,
        r.tanggal AS tanggal_rapat,
        p.anggota_id,
        u.nama AS nama_anggota,
        a.fraksi,
        a.jabatan,
        p.bicara,
        p.catatan
      FROM partisipasi p
      JOIN rapat r ON p.rapat_id = r.id
      JOIN anggota_dprd a ON p.anggota_id = a.id
      JOIN users u ON a.user_id = u.id
      WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Data partisipasi tidak ditemukan' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error in getPartisipasiById:', err);
    res.status(500).json({ error: 'Gagal mengambil detail partisipasi' });
  }
};

// CREATE partisipasi
exports.createPartisipasi = async (req, res) => {
  const { rapat_id, bicara = false, catatan } = req.body;
  let targetAnggotaId = req.body.anggota_id;

  if (!rapat_id) {
    return res.status(400).json({ error: 'rapat_id wajib diisi' });
  }

  try {
    // 1. Validasi rapat
    const rapatCheck = await query('SELECT id FROM rapat WHERE id = $1', [rapat_id]);
    if (rapatCheck.rowCount === 0) {
      return res.status(404).json({ error: 'Rapat tidak ditemukan' });
    }

    // 2. Anggota target
    if (!targetAnggotaId || req.user.role !== 'admin') {
      const anggotaRes = await query('SELECT id FROM anggota_dprd WHERE user_id = $1', [req.user.id]);
      if (anggotaRes.rowCount === 0) {
        return res.status(403).json({ error: 'Pengguna ini belum terdaftar sebagai anggota dewan' });
      }
      targetAnggotaId = anggotaRes.rows[0].id;
    }

    const result = await query(
      'INSERT INTO partisipasi (rapat_id, anggota_id, bicara, catatan) VALUES ($1, $2, $3, $4) RETURNING *',
      [rapat_id, targetAnggotaId, Boolean(bicara), catatan || null]
    );

    res.status(201).json({
      message: 'Partisipasi berhasil dicatat',
      data: result.rows[0],
    });
  } catch (err) {
    console.error('Error in createPartisipasi:', err);
    res.status(500).json({ error: 'Gagal mencatat partisipasi' });
  }
};

// UPDATE partisipasi
exports.updatePartisipasi = async (req, res) => {
  const { id } = req.params;
  const { bicara, catatan } = req.body;

  try {
    const result = await query(
      `UPDATE partisipasi 
       SET bicara = COALESCE($1, bicara), 
           catatan = COALESCE($2, catatan) 
       WHERE id = $3 
       RETURNING *`,
      [bicara !== undefined ? Boolean(bicara) : null, catatan, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Data partisipasi tidak ditemukan' });
    }

    res.json({ message: 'Data partisipasi berhasil diperbarui', data: result.rows[0] });
  } catch (err) {
    console.error('Error in updatePartisipasi:', err);
    res.status(500).json({ error: 'Gagal memperbarui partisipasi' });
  }
};

// DELETE partisipasi (Admin only)
exports.deletePartisipasi = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query('DELETE FROM partisipasi WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Data partisipasi tidak ditemukan' });
    }

    res.json({ message: 'Data partisipasi berhasil dihapus' });
  } catch (err) {
    console.error('Error in deletePartisipasi:', err);
    res.status(500).json({ error: 'Gagal menghapus partisipasi' });
  }
};
