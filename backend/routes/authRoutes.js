const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autentikasi (login, reset password)
 */

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
 *         description: Token berhasil diberikan
 */
router.post('/login', auth.login);

/**
 * @swagger
 * /api/auth/forgot:
 *   post:
 *     summary: Kirim email reset password
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
 *         description: Tautan reset dikirim
 */
router.post('/forgot', auth.forgotPassword);

/**
 * @swagger
 * /api/auth/reset:
 *   post:
 *     summary: Reset password pakai token
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
 *         description: Password berhasil diperbarui
 */
router.post('/reset', auth.resetPassword);

module.exports = router;
