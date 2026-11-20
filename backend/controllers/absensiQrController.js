const crypto = require('crypto');
const { query, withTransaction } = require('../models/queryHelpers');
const { qrTtlMinutes } = require('../utils/config');
const asyncHandler = require('../utils/asyncHandler');
const { badRequest, conflict, notFound } = require('../utils/AppError');

const QR_PREFIX = 'DPRD-ABSEN:';

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const parseToken = (value) => {
  const token = value.startsWith(QR_PREFIX) ? value.slice(QR_PREFIX.length) : value;
  if (!/^[a-f0-9]{64}$/.test(token)) throw badRequest('QR code tidak valid');
  return token;
};

exports.generateQrTokens = asyncHandler(async (req, res) => {
  const rapatId = req.validated.params.id;
  const rapat = await query('SELECT id, judul, tanggal FROM rapat WHERE id = $1', [rapatId]);
  if (rapat.rowCount === 0) throw notFound('Rapat tidak ditemukan');

  const periode = await query('SELECT id, nama FROM periode ORDER BY tahun_mulai DESC LIMIT 1');
  if (periode.rowCount === 0) throw badRequest('Periode aktif belum tersedia');

  const members = await query(
    `SELECT a.id AS anggota_id, u.nama, a.fraksi, a.jabatan
     FROM anggota_dprd a
     JOIN users u ON u.id = a.user_id
     WHERE a.periode_id = $1 AND a.aktif = true
     ORDER BY u.nama`,
    [periode.rows[0].id]
  );
  if (members.rowCount === 0) throw badRequest('Belum ada anggota aktif pada periode ini');

  const expiresAt = new Date(Date.now() + qrTtlMinutes * 60 * 1000);
  const tokens = await withTransaction(async (client) => {
    await client.query('DELETE FROM absensi_qr_tokens WHERE rapat_id = $1', [rapatId]);
    const created = [];
    for (const member of members.rows) {
      const token = crypto.randomBytes(32).toString('hex');
      const inserted = await client.query(
        `INSERT INTO absensi_qr_tokens (rapat_id, anggota_id, token_hash, expires_at)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [rapatId, member.anggota_id, hashToken(token), expiresAt]
      );
      created.push({
        id: inserted.rows[0].id,
        anggota_id: member.anggota_id,
        nama: member.nama,
        fraksi: member.fraksi,
        jabatan: member.jabatan,
        token,
        qrPayload: `${QR_PREFIX}${token}`,
      });
    }
    return created;
  });

  res.status(201).json({
    message: `QR absensi dibuat untuk ${tokens.length} anggota`,
    data: { rapat: rapat.rows[0], expires_at: expiresAt, tokens },
  });
});

exports.checkInWithQr = asyncHandler(async (req, res) => {
  const token = parseToken(req.body.token);
  const tokenHash = hashToken(token);

  const result = await withTransaction(async (client) => {
    const found = await client.query(
      `SELECT q.id, q.rapat_id, q.anggota_id, q.expires_at, q.used_at,
              r.judul AS nama_rapat, r.tanggal,
              u.nama AS nama_anggota, a.fraksi, a.jabatan
       FROM absensi_qr_tokens q
       JOIN rapat r ON r.id = q.rapat_id
       JOIN anggota_dprd a ON a.id = q.anggota_id
       JOIN users u ON u.id = a.user_id
       WHERE q.token_hash = $1
       FOR UPDATE OF q`,
      [tokenHash]
    );
    if (found.rowCount === 0) throw badRequest('QR tidak dikenal atau sudah diganti');
    const record = found.rows[0];
    if (record.used_at) throw conflict('QR ini sudah digunakan untuk absensi');
    if (new Date(record.expires_at).getTime() < Date.now())
      throw badRequest('QR sudah kedaluwarsa');

    let absensi;
    try {
      absensi = await client.query(
        `INSERT INTO absensi (rapat_id, anggota_id, status, jam_masuk, keterangan)
         VALUES ($1, $2, 'hadir', TO_CHAR(NOW() AT TIME ZONE 'Asia/Jakarta', 'HH24:MI')::time, 'Check-in QR')
         RETURNING id, status, jam_masuk, keterangan`,
        [record.rapat_id, record.anggota_id]
      );
    } catch (err) {
      if (err.code === '23505') throw conflict('Anggota sudah memiliki absensi untuk rapat ini');
      throw err;
    }

    await client.query('UPDATE absensi_qr_tokens SET used_at = NOW() WHERE id = $1', [record.id]);
    return { record, absensi: absensi.rows[0] };
  });

  res.json({
    message: 'Absensi berhasil tercatat',
    data: {
      absensi_id: result.absensi.id,
      status: result.absensi.status,
      jam_masuk: result.absensi.jam_masuk,
      anggota: {
        id: result.record.anggota_id,
        nama: result.record.nama_anggota,
        fraksi: result.record.fraksi,
        jabatan: result.record.jabatan,
      },
      rapat: {
        id: result.record.rapat_id,
        judul: result.record.nama_rapat,
        tanggal: result.record.tanggal,
      },
    },
  });
});
