const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const required = ['DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT', 'DB_NAME', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(`Konfigurasi env belum lengkap: ${missing.join(', ')}`);
}

module.exports = {
  port: Number(process.env.PORT) || 5000,
  appUrl: process.env.APP_URL || `http://localhost:${process.env.PORT || 5000}`,
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  resetTtlMinutes: Number(process.env.RESET_TTL_MINUTES) || 15,
};
