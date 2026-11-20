const { badRequest } = require('./AppError');

const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.') || source,
      message: issue.message,
    }));
    return next(badRequest('Validasi gagal', details));
  }
  req.validated = req.validated || {};
  req.validated[source] = result.data;
  if (source === 'body') req.body = result.data;
  next();
};

module.exports = { validate };
