const express = require('express');
const { rateLimit } = require('express-rate-limit');
const controller = require('../controllers/absensiQrController');
const { validate } = require('../utils/validate');
const schemas = require('../utils/schemas');

const router = express.Router();

router.post(
  '/check-in',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 60,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Terlalu banyak percobaan scan, coba lagi nanti' },
  }),
  validate(schemas.checkInQr),
  controller.checkInWithQr
);

module.exports = router;
