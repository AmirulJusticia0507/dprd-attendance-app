const { query } = require('../models/queryHelpers');

// GET all absensi with rich relational data and optional query filters
exports.getAbsensi = async (req, res) => {
  const { rapat_id, anggota_id, status } = req.query;

  try {
    const result = await query(
      `SELECT 
        ab.id,
        ab.rapat_id,
        r.judul AS judul_rapat,
        r.tanggal AS tanggal_rapat,
        r.tempat AS tempat_rapat,
        ab.anggota_id,
        u.nama AS nama_anggota,
        a.fraksi,
        a.jabatan,
        a.dapil,
        ab.status,
        ab.jam_masuk,
        ab.keterangan
      FROM absensi ab
      JOIN rapat r ON ab.rapat_id = r.id
      JOIN anggota_dprd a ON ab.anggota_id = a.id
      JOIN users u ON a.user_id = u.id
      WHERE ($1::INT IS NULL OR ab.rapat_id = $1)
        AND ($2::INT IS NULL OR ab.anggota_id = $2)
        AND ($3::VARCHAR IS NULL OR ab.status ILIKE $3)
      ORDER BY r.tanggal DESC, ab.jam_masuk DESC`,
      [rapat_id || null, anggota_id || null, status || null]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error in getAbsensi:', err);
    res.status(500).json({ error: 'Gagal mengambil data absensi' });
  }
};

// GET absensi by ID
exports.getAbsensiById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query(
      `SELECT 
        ab.id,
        ab.rapat_id,
        r.judul AS judul_rapat,
        r.tanggal AS tanggal_rapat,
        r.tempat AS tempat_rapat,
        ab.anggota_id,
        u.nama AS nama_anggota,
        a.fraksi,
        a.jabatan,
        a.dapil,
        ab.status,
        ab.jam_masuk,
        ab.keterangan
      FROM absensi ab
      JOIN rapat r ON ab.rapat_id = r.id
      JOIN anggota_dprd a ON ab.anggota_id = a.id
      JOIN users u ON a.user_id = u.id
      WHERE ab.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Data absensi tidak ditemukan' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error in getAbsensiById:', err);
    res.status(500).json({ error: 'Gagal mengambil detail absensi' });
  }
};

// CREATE absensi
exports.createAbsensi = async (req, res) => {
  const { rapat_id, status = 'hadir', jam_masuk, keterangan } = req.body;
  let targetAnggotaId = req.body.anggota_id;

  if (!rapat_id) {
    return res.status(400).json({ error: 'rapat_id wajib diisi' });
  }

  try {
    // 1. Validasi apakah rapat ada
    const rapatCheck = await query('SELECT id FROM rapat WHERE id = $1', [rapat_id]);
    if (rapatCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Rapat tidak ditemukan' });
    }

    // 2. Tentukan anggota_id
    if (!targetAnggotaId || req.user.role !== 'admin') {
      // Ambil anggota_id berdasarkan user yang sedang login
      const anggotaRes = await query('SELECT id FROM anggota_dprd WHERE user_id = $1', [req.user.id]);
      if (anggotaRes.rows.length === 0) {
        return res.status(403).json({ error: 'Pengguna ini belum terdaftar di tabel anggota DPRD' });
      }
      targetAnggotaId = anggotaRes.rows[0].id;
    }

    // 3. Cek apakah sudah pernah absen di rapat ini
    const existing = await query(
      'SELECT id FROM absensi WHERE rapat_id = $1 AND anggota_id = $2',
      [rapat_id, targetAnggotaId]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Anggota sudah melakukan absensi pada rapat ini' });
    }

    // 4. Insert data absensi
    const insertRes = await query(
      `INSERT INTO absensi (rapat_id, anggota_id, status, jam_masuk, keterangan)
       VALUES ($1, $2, $3, COALESCE($4, CURRENT_TIME), $5)
       RETURNING *`,
      [rapat_id, targetAnggotaId, status, jam_masuk || null, keterangan || null]
    );

    res.status(201).json({
      message: 'Absensi berhasil dicatat',
      data: insertRes.rows[0],
    });
  } catch (err) {
    console.error('Error in createAbsensi:', err);
    res.status(500).json({ error: 'Gagal mencatat absensi' });
  }
};

// UPDATE absensi
exports.updateAbsensi = async (req, res) => {
  const { id } = req.params;
  const { status, jam_masuk, keterangan } = req.body;

  try {
    const result = await query(
      `UPDATE absensi
       SET status = COALESCE($1, status),
           jam_masuk = COALESCE($2, jam_masuk),
           keterangan = COALESCE($3, keterangan)
       WHERE id = $4
       RETURNING *`,
      [status, jam_masuk, keterangan, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Data absensi tidak ditemukan' });
    }

    res.json({ message: 'Data absensi berhasil diperbarui', data: result.rows[0] });
  } catch (err) {
    console.error('Error in updateAbsensi:', err);
    res.status(500).json({ error: 'Gagal memperbarui absensi' });
  }
};

// DELETE absensi (Admin only)
exports.deleteAbsensi = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query('DELETE FROM absensi WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Data absensi tidak ditemukan' });
    }

    res.json({ message: 'Data absensi berhasil dihapus', data: result.rows[0] });
  } catch (err) {
    console.error('Error in deleteAbsensi:', err);
    res.status(500).json({ error: 'Gagal menghapus absensi' });
  }
};
