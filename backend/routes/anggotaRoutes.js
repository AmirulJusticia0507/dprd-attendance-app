const express = require('express');
const router = express.Router();
const anggotaController = require('../controllers/anggotaController');
const authMiddleware = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/roleMiddleware');
const { validate } = require('../utils/validate');
const schemas = require('../utils/schemas');

router.use(authMiddleware, restrictTo('admin'));

/**
 * @swagger
 * tags:
 *   name: Anggota
 *   description: Manajemen anggota DPRD (khusus admin)
 */

/**
 * @swagger
 * /api/anggota:
 *   get:
 *     summary: Ambil daftar anggota DPRD
 *     tags: [Anggota]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: fraksi, schema: { type: string } }
 *       - { in: query, name: periode_id, schema: { type: integer } }
 *       - { in: query, name: aktif, schema: { type: boolean } }
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10 } }
 *     responses:
 *       200: { description: Daftar anggota }
 */
router.get('/', validate(schemas.paginationWithFilter, 'query'), anggotaController.getAllAnggota);

/**
 * @swagger
 * /api/anggota/{id}:
 *   get:
 *     summary: Detail anggota DPRD
 *     tags: [Anggota]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Detail anggota }
 *       404: { description: Anggota tidak ditemukan }
 */
router.get('/:id', validate(schemas.idParam, 'params'), anggotaController.getAnggotaById);

/**
 * @swagger
 * /api/anggota:
 *   post:
 *     summary: Tambah anggota DPRD
 *     tags: [Anggota]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id, periode_id, fraksi]
 *             properties:
 *               user_id: { type: integer }
 *               periode_id: { type: integer }
 *               fraksi: { type: string }
 *               partai: { type: string }
 *               jabatan_fraksi: { type: string }
 *               jabatan: { type: string }
 *               dapil: { type: string }
 *               aktif: { type: boolean, default: true }
 *     responses:
 *       201: { description: Anggota berhasil ditambahkan }
 *       409: { description: Anggota sudah terdaftar pada periode ini }
 */
router.post('/', validate(schemas.createAnggota), anggotaController.createAnggota);

/**
 * @swagger
 * /api/anggota/{id}:
 *   put:
 *     summary: Perbarui anggota DPRD
 *     tags: [Anggota]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fraksi: { type: string }
 *               partai: { type: string }
 *               jabatan_fraksi: { type: string }
 *               jabatan: { type: string }
 *               dapil: { type: string }
 *               aktif: { type: boolean }
 *     responses:
 *       200: { description: Anggota berhasil diperbarui }
 *       404: { description: Anggota tidak ditemukan }
 */
router.put('/:id', validate(schemas.idParam, 'params'), validate(schemas.updateAnggota), anggotaController.updateAnggota);

/**
 * @swagger
 * /api/anggota/{id}:
 *   delete:
 *     summary: Hapus anggota DPRD
 *     tags: [Anggota]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Anggota berhasil dihapus }
 *       404: { description: Anggota tidak ditemukan }
 */
router.delete('/:id', validate(schemas.idParam, 'params'), anggotaController.deleteAnggota);

module.exports = router;
