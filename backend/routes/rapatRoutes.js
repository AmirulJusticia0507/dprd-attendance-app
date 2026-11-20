const express = require('express');
const router = express.Router();
const rapatController = require('../controllers/rapatController');
const absensiQrController = require('../controllers/absensiQrController');
const authMiddleware = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/roleMiddleware');
const { validate } = require('../utils/validate');
const schemas = require('../utils/schemas');

router.use(authMiddleware);

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
 *     summary: Ambil daftar rapat
 *     tags: [Rapat]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10 } }
 *     responses:
 *       200: { description: Daftar rapat }
 */
router.get('/', validate(schemas.pagination, 'query'), rapatController.getAllRapat);

/**
 * @swagger
 * /api/rapat/{id}:
 *   get:
 *     summary: Detail rapat
 *     tags: [Rapat]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Detail rapat }
 *       404: { description: Rapat tidak ditemukan }
 */
router.get('/:id', validate(schemas.idParam, 'params'), rapatController.getRapatById);

router.post(
  '/:id/absensi-qr',
  restrictTo('admin'),
  validate(schemas.idParam, 'params'),
  absensiQrController.generateQrTokens
);

router.post(
  '/:id/absensi-qr/shared',
  restrictTo('admin'),
  validate(schemas.idParam, 'params'),
  absensiQrController.generateRapatQr
);

/**
 * @swagger
 * /api/rapat:
 *   post:
 *     summary: Tambah rapat
 *     tags: [Rapat]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [judul, tanggal]
 *             properties:
 *               judul: { type: string }
 *               jenis_rapat: { type: string, enum: [Paripurna, Komisi, Badan, Lainnya], default: Lainnya }
 *               sub_jenis: { type: string, example: "Banggar" }
 *               tanggal: { type: string, format: date }
 *               waktu_mulai: { type: string, example: "09:00" }
 *               waktu_selesai: { type: string, example: "11:00" }
 *               tempat: { type: string }
 *     responses:
 *       201: { description: Rapat berhasil ditambahkan }
 *       400: { description: Validasi rapat gagal }
 */
router.post('/', restrictTo('admin'), validate(schemas.createRapat), rapatController.createRapat);

/**
 * @swagger
 * /api/rapat/{id}:
 *   put:
 *     summary: Perbarui rapat
 *     tags: [Rapat]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               judul: { type: string }
 *               jenis_rapat: { type: string, enum: [Paripurna, Komisi, Badan, Lainnya] }
 *               sub_jenis: { type: string, nullable: true, example: "Banggar" }
 *               tanggal: { type: string, format: date }
 *               waktu_mulai: { type: string }
 *               waktu_selesai: { type: string }
 *               tempat: { type: string }
 *     responses:
 *       200: { description: Rapat berhasil diperbarui }
 *       400: { description: Validasi rapat gagal }
 *       404: { description: Rapat tidak ditemukan }
 */
router.put(
  '/:id',
  restrictTo('admin'),
  validate(schemas.idParam, 'params'),
  validate(schemas.updateRapat),
  rapatController.updateRapat
);

/**
 * @swagger
 * /api/rapat/{id}:
 *   delete:
 *     summary: Hapus rapat
 *     tags: [Rapat]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Rapat berhasil dihapus }
 *       404: { description: Rapat tidak ditemukan }
 */
router.delete(
  '/:id',
  restrictTo('admin'),
  validate(schemas.idParam, 'params'),
  rapatController.deleteRapat
);

module.exports = router;
