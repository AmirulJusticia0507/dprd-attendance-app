const express = require('express');
const router = express.Router();
const periodeController = require('../controllers/periodeController');
const authMiddleware = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Periode
 *   description: Manajemen periode masa jabatan DPRD
 */

/**
 * @swagger
 * /api/periode:
 *   get:
 *     summary: Ambil semua periode masa jabatan
 *     tags: [Periode]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar periode berhasil diambil
 */
router.get('/', authMiddleware, periodeController.getAllPeriode);

/**
 * @swagger
 * /api/periode/{id}:
 *   get:
 *     summary: Ambil detail periode berdasarkan ID
 *     tags: [Periode]
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
 *         description: Detail periode ditemukan
 *       404:
 *         description: Periode tidak ditemukan
 */
router.get('/:id', authMiddleware, periodeController.getPeriodeById);

/**
 * @swagger
 * /api/periode:
 *   post:
 *     summary: Tambah periode baru (Admin Only)
 *     tags: [Periode]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nama, tahun_mulai, tahun_berakhir]
 *             properties:
 *               nama:
 *                 type: string
 *                 example: Periode 2024-2029
 *               tahun_mulai:
 *                 type: integer
 *                 example: 2024
 *               tahun_berakhir:
 *                 type: integer
 *                 example: 2029
 *     responses:
 *       201:
 *         description: Periode berhasil ditambahkan
 *       400:
 *         description: Input tidak valid
 *       403:
 *         description: Akses ditolak
 */
router.post('/', authMiddleware, restrictTo('admin'), periodeController.createPeriode);

/**
 * @swagger
 * /api/periode/{id}:
 *   put:
 *     summary: Update periode (Admin Only)
 *     tags: [Periode]
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
 *               nama:
 *                 type: string
 *               tahun_mulai:
 *                 type: integer
 *               tahun_berakhir:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Periode berhasil diupdate
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Periode tidak ditemukan
 */
router.put('/:id', authMiddleware, restrictTo('admin'), periodeController.updatePeriode);

/**
 * @swagger
 * /api/periode/{id}:
 *   delete:
 *     summary: Hapus periode (Admin Only)
 *     tags: [Periode]
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
 *         description: Periode berhasil dihapus
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Periode tidak ditemukan
 */
router.delete('/:id', authMiddleware, restrictTo('admin'), periodeController.deletePeriode);

module.exports = router;
