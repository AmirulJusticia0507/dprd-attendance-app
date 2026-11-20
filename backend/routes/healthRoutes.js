const express = require('express');
const router = express.Router();
const pool = require('../models/db');

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: Pemantauan kesehatan server dan database
 */

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Cek status kesehatan server dan koneksi database
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server dan database dalam kondisi normal (UP)
 *       503:
 *         description: Database tidak terhubung (DEGRADED)
 */
router.get('/', async (req, res) => {
  try {
    const dbStart = Date.now();
    await pool.query('SELECT 1');
    const dbLatencyMs = Date.now() - dbStart;

    res.json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: {
        status: 'CONNECTED',
        latencyMs: dbLatencyMs,
      },
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (err) {
    console.error('Health check DB error:', err);
    res.status(503).json({
      status: 'DEGRADED',
      timestamp: new Date().toISOString(),
      database: {
        status: 'DISCONNECTED',
        error: 'Koneksi ke database PostgreSQL gagal',
      },
    });
  }
});

module.exports = router;
