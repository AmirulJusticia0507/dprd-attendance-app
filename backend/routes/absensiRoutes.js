const express = require('express');
const router = express.Router();
const absensi = require('../controllers/absensiController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Absensi
 *   description: Manajemen absensi
 */

/**
 * @swagger
 * /api/absensi:
 *   get:
 *     summary: Ambil semua data absensi
 *     tags: [Absensi]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data absensi
 */
router.get('/', authMiddleware, absensi.getAbsensi);

/**
 * @swagger
 * /api/absensi:
 *   post:
 *     summary: Tambahkan absensi baru
 *     tags: [Absensi]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *               status_kehadiran:
 *                 type: string
 *               catatan:
 *                 type: string
 *     responses:
 *       201:
 *         description: Absensi ditambahkan
 */
router.post('/', authMiddleware, absensi.createAbsensi);

module.exports = router;
