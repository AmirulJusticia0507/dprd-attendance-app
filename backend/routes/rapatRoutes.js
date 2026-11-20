const express = require('express');
const router = express.Router();
const rapatController = require('../controllers/rapatController');
const authMiddleware = require('../middlewares/authMiddleware');

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
 */
router.get('/:id', authMiddleware, rapatController.getRapatById);

/**
 * @swagger
 * /api/rapat:
 *   post:
 *     summary: Tambah rapat
 *     tags: [Rapat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nama_rapat:
 *                 type: string
 *               tanggal:
 *                 type: string
 *               lokasi:
 *                 type: string
 *     responses:
 *       201:
 *         description: Rapat ditambahkan
 */
router.post('/', authMiddleware, rapatController.createRapat);

/**
 * @swagger
 * /api/rapat/{id}:
 *   put:
 *     summary: Update rapat
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
 *               nama_rapat:
 *                 type: string
 *               tanggal:
 *                 type: string
 *               lokasi:
 *                 type: string
 *     responses:
 *       200:
 *         description: Rapat diperbarui
 */
router.put('/:id', authMiddleware, rapatController.updateRapat);

/**
 * @swagger
 * /api/rapat/{id}:
 *   delete:
 *     summary: Hapus rapat
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
 */
router.delete('/:id', authMiddleware, rapatController.deleteRapat);

module.exports = router;
