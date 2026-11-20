const jwt = require('jsonwebtoken');
const { unauthorized } = require('../utils/AppError');
const { jwtSecret } = require('../utils/config');

module.exports = (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(unauthorized('Token bearer tidak ditemukan'));
  }
  try {
    const decoded = jwt.verify(token, jwtSecret);
    if (decoded.type !== 'access') {
      return next(unauthorized('Jenis token tidak valid'));
    }
    req.user = decoded;
    next();
  } catch (err) {
    next(unauthorized('Token tidak valid atau sudah kedaluwarsa'));
  }
};
