const { forbidden, unauthorized } = require('../utils/AppError');

module.exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) return next(unauthorized());
    if (!roles.includes(req.user.role)) return next(forbidden());
    next();
  };
