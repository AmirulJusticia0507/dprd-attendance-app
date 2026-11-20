const express = require('express');
const router = express.Router();
const partisipasiController = require('../controllers/partisipasiController');
const authMiddleware = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/roleMiddleware');
const { validate } = require('../utils/validate');
const schemas = require('../utils/schemas');

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Partisipasi
 *   description: Pencatatan keaktifan bicara anggota dewan dalam rapat
 */

/**
 * @swagger
 * /api/partisipasi:
 *   get:
 *     summary: Ambil data partisipasi rapat
 *     tags: [Partisipasi]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: rapat_id, schema: { type: integer } }
 *       - { in: query, name: anggota_id, schema: { type: integer } }
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10 } }
 *     responses:
 *       200: { description: Daftar partisipasi }
 */
router.get('/', validate(schemas.partisipasiFilter, 'query'), partisipasiController.getPartisipasi);

/**
 * @swagger
 * /api/partisipasi/{id}:
 *   get:
 *     summary: Detail partisipasi
 *     tags: [Partisipasi]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Detail partisipasi }
 *       404: { description: Tidak ditemukan }
 */
router.get('/:id', validate(schemas.idParam, 'params'), partisipasiController.getPartisipasiById);

/**
 * @swagger
 * /api/partisipasi:
 *   post:
 *     summary: Catat partisipasi anggota dalam rapat (Admin Only)
 *     tags: [Partisipasi]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rapat_id, anggota_id]
 *             properties:
 *               rapat_id: { type: integer }
 *               anggota_id: { type: integer }
 *               bicara: { type: boolean, default: false }
 *               catatan: { type: string }
 *     responses:
 *       201: { description: Partisipasi berhasil dicatat }
 *       400: { description: Input tidak valid }
 */
router.post('/', restrictTo('admin'), validate(schemas.createPartisipasi), partisipasiController.createPartisipasi);

/**
 * @swagger
 * /api/partisipasi/{id}:
 *   put:
 *     summary: Perbarui catatan partisipasi (Admin Only)
 *     tags: [Partisipasi]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bicara: { type: boolean }
 *               catatan: { type: string }
 *     responses:
 *       200: { description: Partisipasi diperbarui }
 *       404: { description: Tidak ditemukan }
 */
router.put('/:id', restrictTo('admin'), validate(schemas.idParam, 'params'), validate(schemas.updatePartisipasi), partisipasiController.updatePartisipasi);

/**
 * @swagger
 * /api/partisipasi/{id}:
 *   delete:
 *     summary: Hapus catatan partisipasi (Admin Only)
 *     tags: [Partisipasi]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Partisipasi dihapus }
 *       404: { description: Tidak ditemukan }
 */
router.delete('/:id', restrictTo('admin'), validate(schemas.idParam, 'params'), partisipasiController.deletePartisipasi);

module.exports = router;
