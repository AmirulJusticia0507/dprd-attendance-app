/**
 * Middleware validasi request berbasis skema (mendukung Zod)
 */
const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    // Replace with parsed/sanitized data if schema parses them
    if (parsed.body) req.body = parsed.body;
    next();
  } catch (err) {
    if (err.errors) {
      return res.status(400).json({
        error: 'Validasi input gagal',
        details: err.errors.map((e) => ({
          field: e.path.filter((p) => p !== 'body').join('.'),
          message: e.message,
        })),
      });
    }
    return res.status(400).json({ error: 'Validasi input gagal' });
  }
};

module.exports = validate;
