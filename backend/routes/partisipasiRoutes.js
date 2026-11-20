const express = require('express');
const router = express.Router();
const partisipasiController = require('../controllers/partisipasiController');
const authMiddleware = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Partisipasi
 *   description: Pencatatan keaktifan dan partisipasi bicara anggota dewan dalam rapat
 */

/**
 * @swagger
 * /api/partisipasi:
 *   get:
 *     summary: Ambil seluruh data partisipasi rapat
 *     tags: [Partisipasi]
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
 *     responses:
 *       200:
 *         description: Daftar partisipasi berhasil diambil
 */
router.get('/', authMiddleware, partisipasiController.getPartisipasi);

/**
 * @swagger
 * /api/partisipasi/{id}:
 *   get:
 *     summary: Ambil detail partisipasi berdasarkan ID
 *     tags: [Partisipasi]
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
 *         description: Detail partisipasi ditemukan
 *       404:
 *         description: Data partisipasi tidak ditemukan
 */
router.get('/:id', authMiddleware, partisipasiController.getPartisipasiById);

/**
 * @swagger
 * /api/partisipasi:
 *   post:
 *     summary: Catat partisipasi baru
 *     tags: [Partisipasi]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rapat_id]
 *             properties:
 *               rapat_id:
 *                 type: integer
 *                 example: 1
 *               anggota_id:
 *                 type: integer
 *                 description: Opsional untuk admin menginput anggota tertentu
 *                 example: 1
 *               bicara:
 *                 type: boolean
 *                 default: false
 *                 example: true
 *               catatan:
 *                 type: string
 *                 example: Menyampaikan pandangan fraksi terkait anggaran pendidikan
 *     responses:
 *       201:
 *         description: Partisipasi berhasil dicatat
 *       400:
 *         description: Input tidak valid
 *       403:
 *         description: Bukan anggota dewan
 */
router.post('/', authMiddleware, partisipasiController.createPartisipasi);

/**
 * @swagger
 * /api/partisipasi/{id}:
 *   put:
 *     summary: Update catatan partisipasi
 *     tags: [Partisipasi]
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
 *               bicara:
 *                 type: boolean
 *               catatan:
 *                 type: string
 *     responses:
 *       200:
 *         description: Partisipasi berhasil diupdate
 *       404:
 *         description: Data tidak ditemukan
 */
router.put('/:id', authMiddleware, partisipasiController.updatePartisipasi);

/**
 * @swagger
 * /api/partisipasi/{id}:
 *   delete:
 *     summary: Hapus catatan partisipasi (Admin Only)
 *     tags: [Partisipasi]
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
 *         description: Catatan partisipasi berhasil dihapus
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Data tidak ditemukan
 */
router.delete('/:id', authMiddleware, restrictTo('admin'), partisipasiController.deletePartisipasi);

module.exports = router;
