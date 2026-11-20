const express = require('express');
const router = express.Router();
const periodeController = require('../controllers/periodeController');
const authMiddleware = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/roleMiddleware');
const { validate } = require('../utils/validate');
const schemas = require('../utils/schemas');

router.use(authMiddleware);

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
 *     summary: Ambil semua periode
 *     tags: [Periode]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10 } }
 *     responses:
 *       200: { description: Daftar periode }
 */
router.get('/', validate(schemas.pagination, 'query'), periodeController.getAllPeriode);

/**
 * @swagger
 * /api/periode/{id}:
 *   get:
 *     summary: Detail periode berdasarkan ID
 *     tags: [Periode]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Detail periode }
 *       404: { description: Periode tidak ditemukan }
 */
router.get('/:id', validate(schemas.idParam, 'params'), periodeController.getPeriodeById);

/**
 * @swagger
 * /api/periode:
 *   post:
 *     summary: Tambah periode baru (Admin Only)
 *     tags: [Periode]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nama, tahun_mulai, tahun_berakhir]
 *             properties:
 *               nama: { type: string, example: "2024-2029" }
 *               tahun_mulai: { type: integer, example: 2024 }
 *               tahun_berakhir: { type: integer, example: 2029 }
 *     responses:
 *       201: { description: Periode berhasil ditambahkan }
 *       400: { description: Input tidak valid }
 *       409: { description: Nama periode sudah ada }
 */
router.post(
  '/',
  restrictTo('admin'),
  validate(schemas.createPeriode),
  periodeController.createPeriode
);

/**
 * @swagger
 * /api/periode/{id}:
 *   put:
 *     summary: Perbarui periode (Admin Only)
 *     tags: [Periode]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nama: { type: string }
 *               tahun_mulai: { type: integer }
 *               tahun_berakhir: { type: integer }
 *     responses:
 *       200: { description: Periode berhasil diperbarui }
 *       404: { description: Periode tidak ditemukan }
 */
router.put(
  '/:id',
  restrictTo('admin'),
  validate(schemas.idParam, 'params'),
  validate(schemas.updatePeriode),
  periodeController.updatePeriode
);

/**
 * @swagger
 * /api/periode/{id}:
 *   delete:
 *     summary: Hapus periode (Admin Only)
 *     tags: [Periode]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Periode berhasil dihapus }
 *       400: { description: Periode masih digunakan }
 *       404: { description: Periode tidak ditemukan }
 */
router.delete(
  '/:id',
  restrictTo('admin'),
  validate(schemas.idParam, 'params'),
  periodeController.deletePeriode
);

module.exports = router;
