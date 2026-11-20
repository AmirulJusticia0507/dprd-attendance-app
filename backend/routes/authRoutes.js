const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const { validate } = require('../utils/validate');
const schemas = require('../utils/schemas');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autentikasi dan pengelolaan password
 */

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Daftar akun anggota baru
 *     tags: [Auth]
 *     security: []
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
 *     responses:
 *       201: { description: Akun berhasil dibuat }
 *       400: { description: Validasi gagal }
 *       409: { description: Email sudah terdaftar }
 */
router.post('/signup', validate(schemas.signup), auth.signup);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login dan dapatkan JWT
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: Token JWT beserta data user }
 *       401: { description: Kredensial salah }
 */
router.post('/login', validate(schemas.login), auth.login);

/**
 * @swagger
 * /api/auth/forgot:
 *   post:
 *     summary: Kirim tautan reset password via email
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200: { description: Tautan dikirim jika email terdaftar }
 *       503: { description: SMTP belum dikonfigurasi }
 */
router.post('/forgot', validate(schemas.forgot), auth.forgotPassword);

/**
 * @swagger
 * /api/auth/reset:
 *   post:
 *     summary: Reset password dengan token
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword]
 *             properties:
 *               token: { type: string }
 *               newPassword: { type: string, minLength: 8 }
 *     responses:
 *       200: { description: Password berhasil diperbarui }
 *       400: { description: Token tidak valid atau kedaluwarsa }
 */
router.post('/reset', validate(schemas.reset), auth.resetPassword);

module.exports = router;
