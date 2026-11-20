const express = require('express');
const router = express.Router();
const anggotaController = require('../controllers/anggotaController');
const authMiddleware = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Anggota
 *   description: API untuk manajemen anggota DPRD
 */

/**
 * @swagger
 * /api/anggota:
 *   get:
 *     summary: Ambil semua anggota DPRD
 *     tags: [Anggota]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar anggota berhasil diambil
 */
router.get('/', authMiddleware, restrictTo('admin'), anggotaController.getAllAnggota);

/**
 * @swagger
 * /api/anggota/{id}:
 *   get:
 *     summary: Ambil detail anggota DPRD berdasarkan ID
 *     tags: [Anggota]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detail anggota ditemukan
 *       404:
 *         description: Anggota tidak ditemukan
 */
router.get('/:id', authMiddleware, restrictTo('admin'), anggotaController.getAnggotaById);

/**
 * @swagger
 * /api/anggota:
 *   post:
 *     summary: Tambah anggota DPRD baru
 *     tags: [Anggota]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id, periode_id, fraksi, jabatan, dapil]
 *             properties:
 *               user_id:
 *                 type: integer
 *               periode_id:
 *                 type: integer
 *               fraksi:
 *                 type: string
 *               jabatan:
 *                 type: string
 *               dapil:
 *                 type: string
 *               aktif:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Anggota berhasil ditambahkan
 */
router.post('/', authMiddleware, restrictTo('admin'), anggotaController.createAnggota);

/**
 * @swagger
 * /api/anggota/{id}:
 *   put:
 *     summary: Update data anggota DPRD
 *     tags: [Anggota]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
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
 *               user_id:
 *                 type: integer
 *               periode_id:
 *                 type: integer
 *               fraksi:
 *                 type: string
 *               jabatan:
 *                 type: string
 *               dapil:
 *                 type: string
 *               aktif:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Data anggota berhasil diupdate
 */
router.put('/:id', authMiddleware, restrictTo('admin'), anggotaController.updateAnggota);

/**
 * @swagger
 * /api/anggota/{id}:
 *   delete:
 *     summary: Hapus anggota DPRD berdasarkan ID
 *     tags: [Anggota]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Anggota berhasil dihapus
 *       404:
 *         description: Anggota tidak ditemukan
 */
router.delete('/:id', authMiddleware, restrictTo('admin'), anggotaController.deleteAnggota);

module.exports = router;
