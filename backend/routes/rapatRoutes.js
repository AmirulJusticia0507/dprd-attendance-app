const express = require('express');
const router = express.Router();
const rapatController = require('../controllers/rapatController');
const authMiddleware = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Rapat
 *   description: Manajemen rapat DPRD
 */

/**
 * @swagger
 * /api/rapat:
 *   get:
 *     summary: Ambil semua rapat
 *     tags: [Rapat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar rapat
 *       401:
 *         description: Tidak terautentikasi
 */
router.get('/', authMiddleware, rapatController.getAllRapat);

/**
 * @swagger
 * /api/rapat/{id}:
 *   get:
 *     summary: Ambil detail rapat
 *     tags: [Rapat]
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
 *         description: Detail rapat
 *       404:
 *         description: Rapat tidak ditemukan
 */
router.get('/:id', authMiddleware, rapatController.getRapatById);

/**
 * @swagger
 * /api/rapat:
 *   post:
 *     summary: Tambah rapat baru (Admin Only)
 *     tags: [Rapat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - judul
 *               - tanggal
 *             properties:
 *               judul:
 *                 type: string
 *                 example: Rapat Paripurna Penetapan APBD
 *               tanggal:
 *                 type: string
 *                 format: date
 *                 example: "2026-11-20"
 *               waktu_mulai:
 *                 type: string
 *                 example: "09:00:00"
 *               waktu_selesai:
 *                 type: string
 *                 example: "12:00:00"
 *               tempat:
 *                 type: string
 *                 example: Ruang Sidang Paripurna Lantai 3
 *     responses:
 *       201:
 *         description: Rapat berhasil ditambahkan
 *       400:
 *         description: Input tidak valid
 *       403:
 *         description: Akses ditolak (Bukan Admin)
 */
router.post('/', authMiddleware, restrictTo('admin'), rapatController.createRapat);

/**
 * @swagger
 * /api/rapat/{id}:
 *   put:
 *     summary: Update rapat (Admin Only)
 *     tags: [Rapat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               judul:
 *                 type: string
 *               tanggal:
 *                 type: string
 *                 format: date
 *               waktu_mulai:
 *                 type: string
 *               waktu_selesai:
 *                 type: string
 *               tempat:
 *                 type: string
 *     responses:
 *       200:
 *         description: Rapat diperbarui
 *       403:
 *         description: Akses ditolak (Bukan Admin)
 *       404:
 *         description: Rapat tidak ditemukan
 */
router.put('/:id', authMiddleware, restrictTo('admin'), rapatController.updateRapat);

/**
 * @swagger
 * /api/rapat/{id}:
 *   delete:
 *     summary: Hapus rapat (Admin Only)
 *     tags: [Rapat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Rapat dihapus
 *       403:
 *         description: Akses ditolak (Bukan Admin)
 *       404:
 *         description: Rapat tidak ditemukan
 */
router.delete('/:id', authMiddleware, restrictTo('admin'), rapatController.deleteRapat);

module.exports = router;
