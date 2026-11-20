const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autentikasi dan profil pengguna
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrasi anggota baru
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nama, email, password]
 *             properties:
 *               nama:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registrasi berhasil
 *       400:
 *         description: Email sudah terdaftar atau input tidak valid
 */
router.post('/register', auth.signup);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login pengguna
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login berhasil, mengembalikan token JWT dan data user
 *       401:
 *         description: Kredensial tidak valid
 */
router.post('/login', auth.login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Ambil profil pengguna yang sedang login
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informasi profil pengguna
 *       401:
 *         description: Tidak terautentikasi
 */
router.get('/me', authMiddleware, auth.getProfile);

/**
 * @swagger
 * /api/auth/forgot:
 *   post:
 *     summary: Kirim tautan reset kata sandi ke email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Respon reset diproses
 */
router.post('/forgot', auth.forgotPassword);

/**
 * @swagger
 * /api/auth/reset:
 *   post:
 *     summary: Reset kata sandi menggunakan token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword]
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Kata sandi berhasil diperbarui
 *       400:
 *         description: Token tidak valid atau kedaluwarsa
 */
router.post('/reset', auth.resetPassword);

module.exports = router;
