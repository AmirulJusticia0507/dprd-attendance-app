const express = require('express');
const router = express.Router();
const user = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Manajemen pengguna (Admin & Anggota DPRD)
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Ambil semua pengguna (Admin Only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar pengguna
 *       403:
 *         description: Akses ditolak (Bukan Admin)
 */
router.get('/', authMiddleware, restrictTo('admin'), user.getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Ambil detail pengguna berdasarkan ID
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
 *         description: Detail pengguna
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Pengguna tidak ditemukan
 */
router.get('/:id', authMiddleware, user.getUserById);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Tambah pengguna baru (Admin atau Registrasi Admin Pertama)
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
 *       400:
 *         description: Email sudah terdaftar atau input tidak valid
 *       403:
 *         description: Akses ditolak
 */
router.post('/', user.createUser);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update pengguna (Admin Only)
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
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pengguna berhasil diperbarui
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Pengguna tidak ditemukan
 */
router.put('/:id', authMiddleware, restrictTo('admin'), user.updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Hapus pengguna berdasarkan ID (Admin Only)
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
 *       400:
 *         description: Tidak dapat menghapus akun sendiri
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Pengguna tidak ditemukan
 */
router.delete('/:id', authMiddleware, restrictTo('admin'), user.deleteUser);

module.exports = router;
