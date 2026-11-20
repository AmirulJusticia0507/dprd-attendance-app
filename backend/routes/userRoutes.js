const express = require('express');
const router = express.Router();
const user = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Manajemen pengguna
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Ambil semua pengguna
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar pengguna
 */
router.get('/', authMiddleware, user.getAllUsers);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Tambah pengguna baru
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nama
 *               - email
 *               - password
 *               - role
 *             properties:
 *               nama:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, anggota]
 *     responses:
 *       201:
 *         description: Pengguna berhasil ditambahkan
 */
router.post('/', authMiddleware, user.createUser);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update pengguna berdasarkan ID
 *     tags: [Users]
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
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, anggota]
 *     responses:
 *       200:
 *         description: Pengguna berhasil diperbarui
 */
router.put('/:id', authMiddleware, user.updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Hapus pengguna berdasarkan ID
 *     tags: [Users]
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
 *         description: Pengguna dihapus
 */
router.delete('/:id', authMiddleware, user.deleteUser);

module.exports = router;
