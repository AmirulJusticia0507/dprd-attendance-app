const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger/swagger');
const { allowedOrigins } = require('./utils/config');
const { AppError } = require('./utils/AppError');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const absensiRoutes = require('./routes/absensiRoutes');
const anggotaRoutes = require('./routes/anggotaRoutes');
const rapatRoutes = require('./routes/rapatRoutes');
const periodeRoutes = require('./routes/periodeRoutes');
const partisipasiRoutes = require('./routes/partisipasiRoutes');
const healthRoutes = require('./routes/healthRoutes');

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new AppError(403, 'Origin tidak diizinkan'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
);
app.use(express.json({ limit: '100kb' }));
app.use('/portal', express.static(path.join(__dirname, 'public')));

app.use(
  '/api/auth',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 50,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Terlalu banyak percobaan, coba lagi nanti' },
  }),
  authRoutes
);
app.use('/api/users', userRoutes);
app.use('/api/absensi', absensiRoutes);
app.use('/api/anggota', anggotaRoutes);
app.use('/api/rapat', rapatRoutes);
app.use('/api/periode', periodeRoutes);
app.use('/api/partisipasi', partisipasiRoutes);
app.use('/api/health', healthRoutes);
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.json({ message: 'DPRD Attendance App API', docs: '/api-docs', portal: '/portal' });
});

app.use((req, res, next) => {
  next(new AppError(404, `Route ${req.method} ${req.path} tidak ditemukan`));
});

app.use((err, req, res, _next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }
  if (err.code === '23505') return res.status(409).json({ error: 'Data duplikat' });
  if (err.code === '23503') return res.status(400).json({ error: 'Referensi data tidak valid' });
  console.error(err);
  res.status(500).json({ error: 'Terjadi kesalahan pada server' });
});

module.exports = app;
