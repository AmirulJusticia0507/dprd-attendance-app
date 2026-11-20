const express = require('express');
const router = express.Router();
const absensi = require('../controllers/absensiController');
const authMiddleware = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/roleMiddleware');
const { validate } = require('../utils/validate');
const schemas = require('../utils/schemas');

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Absensi
 *   description: Absensi rapat dan rekap kehadiran
 */

/**
 * @swagger
 * /api/absensi:
 *   get:
 *     summary: Ambil daftar absensi dengan filter
 *     tags: [Absensi]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: rapat_id, schema: { type: integer } }
 *       - { in: query, name: anggota_id, schema: { type: integer } }
 *       - { in: query, name: status, schema: { type: string, enum: [hadir, izin, alpha] } }
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10 } }
 *     responses:
 *       200: { description: Daftar absensi }
 */
router.get('/', validate(schemas.absensiFilter, 'query'), absensi.getAbsensi);

/**
 * @swagger
 * /api/absensi/rekap:
 *   get:
 *     summary: Rekap kehadiran anggota per periode/fraksi
 *     tags: [Absensi]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: periode_id, schema: { type: integer } }
 *       - { in: query, name: fraksi, schema: { type: string } }
 *     responses:
 *       200: { description: Rekap kehadiran }
 */
router.get('/rekap', validate(schemas.rekapFilter, 'query'), absensi.getRekap);

/**
 * @swagger
 * /api/absensi/rekap/csv:
 *   get:
 *     summary: Unduh rekap kehadiran sebagai CSV
 *     tags: [Absensi]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: periode_id, schema: { type: integer } }
 *       - { in: query, name: fraksi, schema: { type: string } }
 *     responses:
 *       200:
 *         description: File CSV
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */
router.get('/rekap/csv', validate(schemas.rekapFilter, 'query'), absensi.exportRekapCsv);

/**
 * @swagger
 * /api/absensi:
 *   post:
 *     summary: Tambah absensi anggota untuk suatu rapat
 *     tags: [Absensi]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rapat_id, anggota_id, status]
 *             properties:
 *               rapat_id: { type: integer }
 *               anggota_id: { type: integer }
 *               status: { type: string, enum: [hadir, izin, alpha] }
 *               jam_masuk: { type: string, example: "08:15" }
 *               keterangan: { type: string }
 *     responses:
 *       201: { description: Absensi ditambahkan }
 *       409: { description: Absensi untuk rapat dan anggota ini sudah ada }
 */
router.post(
  '/',
  restrictTo('admin', 'anggota'),
  validate(schemas.createAbsensi),
  absensi.createAbsensi
);

module.exports = router;
