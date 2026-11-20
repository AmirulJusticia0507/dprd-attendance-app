const express = require('express');
const router = express.Router();
const absensi = require('../controllers/absensiController');
const authMiddleware = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Absensi
 *   description: Manajemen absensi rapat DPRD
 */

/**
 * @swagger
 * /api/absensi:
 *   get:
 *     summary: Ambil semua data absensi (bisa difilter)
 *     tags: [Absensi]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: rapat_id
 *         schema:
 *           type: integer
 *         description: Filter berdasarkan ID rapat
 *       - in: query
 *         name: anggota_id
 *         schema:
 *           type: integer
 *         description: Filter berdasarkan ID anggota DPRD
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter berdasarkan status (hadir, izin, sakit, alpa)
 *     responses:
 *       200:
 *         description: Daftar data absensi berhasil diambil
 *       401:
 *         description: Tidak terautentikasi
 */
router.get('/', authMiddleware, absensi.getAbsensi);

/**
 * @swagger
 * /api/absensi/{id}:
 *   get:
 *     summary: Ambil detail absensi berdasarkan ID
 *     tags: [Absensi]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detail absensi ditemukan
 *       404:
 *         description: Data absensi tidak ditemukan
 */
router.get('/:id', authMiddleware, absensi.getAbsensiById);

/**
 * @swagger
 * /api/absensi:
 *   post:
 *     summary: Catat absensi kehadiran baru
 *     tags: [Absensi]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rapat_id
 *             properties:
 *               rapat_id:
 *                 type: integer
 *                 example: 1
 *               anggota_id:
 *                 type: integer
 *                 description: Opsional jika admin mengabsenkan anggota lain. Jika kosong/user role anggota, otomatis menggunakan profil login.
 *                 example: 1
 *               status:
 *                 type: string
 *                 enum: [hadir, izin, sakit, alpa]
 *                 default: hadir
 *               jam_masuk:
 *                 type: string
 *                 example: "09:05:00"
 *               keterangan:
 *                 type: string
 *                 example: "Hadir tepat waktu"
 *     responses:
 *       201:
 *         description: Absensi berhasil dicatat
 *       400:
 *         description: Sudah pernah absen atau input tidak valid
 *       403:
 *         description: Pengguna belum terdaftar sebagai anggota dewan
 */
router.post('/', authMiddleware, absensi.createAbsensi);

/**
 * @swagger
 * /api/absensi/{id}:
 *   put:
 *     summary: Update status atau keterangan absensi
 *     tags: [Absensi]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [hadir, izin, sakit, alpa]
 *               jam_masuk:
 *                 type: string
 *               keterangan:
 *                 type: string
 *     responses:
 *       200:
 *         description: Absensi berhasil diperbarui
 *       404:
 *         description: Data absensi tidak ditemukan
 */
router.put('/:id', authMiddleware, absensi.updateAbsensi);

/**
 * @swagger
 * /api/absensi/{id}:
 *   delete:
 *     summary: Hapus catatan absensi (Admin Only)
 *     tags: [Absensi]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Catatan absensi berhasil dihapus
 *       403:
 *         description: Akses ditolak (Bukan Admin)
 *       404:
 *         description: Data absensi tidak ditemukan
 */
router.delete('/:id', authMiddleware, restrictTo('admin'), absensi.deleteAbsensi);

module.exports = router;
