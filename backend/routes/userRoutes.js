const express = require('express');
const router = express.Router();
const user = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/roleMiddleware');
const { validate } = require('../utils/validate');
const schemas = require('../utils/schemas');

router.use(authMiddleware, restrictTo('admin'));

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Manajemen pengguna (khusus admin)
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Ambil daftar pengguna (pagination)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10 } }
 *     responses:
 *       200: { description: Daftar pengguna }
 *       401: { description: Belum login }
 *       403: { description: Bukan admin }
 */
router.get('/', validate(schemas.pagination, 'query'), user.getAllUsers);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Tambah pengguna
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nama, email, password]
 *             properties:
 *               nama: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               role: { type: string, enum: [admin, anggota], default: anggota }
 *     responses:
 *       201: { description: Pengguna berhasil ditambahkan }
 *       409: { description: Email sudah terdaftar }
 */
router.post('/', validate(schemas.createUser), user.createUser);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Perbarui pengguna
 *     tags: [Users]
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
 *               email: { type: string, format: email }
 *               role: { type: string, enum: [admin, anggota] }
 *     responses:
 *       200: { description: Pengguna berhasil diperbarui }
 *       404: { description: Pengguna tidak ditemukan }
 */
router.put('/:id', validate(schemas.idParam, 'params'), validate(schemas.updateUser), user.updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Hapus pengguna
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Pengguna berhasil dihapus }
 *       400: { description: Admin terakhir tidak dapat dihapus }
 *       404: { description: Pengguna tidak ditemukan }
 */
router.delete('/:id', validate(schemas.idParam, 'params'), user.deleteUser);

module.exports = router;
