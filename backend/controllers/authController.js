const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, withTransaction } = require('../models/queryHelpers');
const { sendResetEmail } = require('../utils/emailSender');
const asyncHandler = require('../utils/asyncHandler');
const { conflict, badRequest, unauthorized } = require('../utils/AppError');
const {
  jwtSecret,
  jwtExpiresIn,
  jwtRefreshSecret,
  jwtRefreshExpiresIn,
  resetTtlMinutes,
} = require('../utils/config');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const issueTokens = async (user, executor = query) => {
  const token = jwt.sign({ id: user.id, role: user.role, type: 'access' }, jwtSecret, {
    expiresIn: jwtExpiresIn,
  });
  const refreshToken = jwt.sign(
    { id: user.id, type: 'refresh', jti: crypto.randomUUID() },
    jwtRefreshSecret,
    { expiresIn: jwtRefreshExpiresIn }
  );
  const decoded = jwt.decode(refreshToken);
  await executor(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [user.id, hashToken(refreshToken), new Date(decoded.exp * 1000)]
  );
  return { token, refreshToken };
};

exports.signup = asyncHandler(async (req, res) => {
  const { nama, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    await query('INSERT INTO users (nama, email, password, role) VALUES ($1, $2, $3, $4)', [
      nama,
      email,
      hashed,
      'anggota',
    ]);
    res.status(201).json({ message: 'User berhasil didaftarkan' });
  } catch (err) {
    if (err.code === '23505') throw conflict('Email sudah terdaftar');
    throw err;
  }
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await query('SELECT id, nama, email, password, role FROM users WHERE email = $1', [
    email,
  ]);
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw unauthorized('Email atau password salah');
  }
  const tokens = await issueTokens(user);
  res.json({
    ...tokens,
    user: { id: user.id, nama: user.nama, email: user.email, role: user.role },
  });
});

exports.refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  let payload;
  try {
    payload = jwt.verify(refreshToken, jwtRefreshSecret);
  } catch (err) {
    throw unauthorized('Refresh token tidak valid atau sudah kedaluwarsa');
  }
  if (payload.type !== 'refresh') {
    throw unauthorized('Jenis token tidak valid');
  }
  const stored = await query(
    `SELECT id, user_id FROM refresh_tokens
     WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > NOW()`,
    [hashToken(refreshToken)]
  );
  if (stored.rowCount === 0) {
    throw unauthorized('Refresh token tidak valid atau sudah dicabut');
  }
  const userResult = await query('SELECT id, nama, email, role FROM users WHERE id = $1', [
    stored.rows[0].user_id,
  ]);
  if (userResult.rowCount === 0) throw unauthorized('User tidak ditemukan');
  const user = userResult.rows[0];
  const tokens = await withTransaction(async (client) => {
    const executor = (text, params) => client.query(text, params);
    await executor('UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1', [
      stored.rows[0].id,
    ]);
    return issueTokens(user, executor);
  });
  res.json({
    ...tokens,
    user: { id: user.id, nama: user.nama, email: user.email, role: user.role },
  });
});

exports.logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body || {};
  if (refreshToken) {
    await query(
      'UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1 AND user_id = $2',
      [hashToken(refreshToken), req.user.id]
    );
  } else {
    await query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1', [req.user.id]);
  }
  res.json({ message: 'Logout berhasil' });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await query('SELECT id, email FROM users WHERE email = $1', [email]);
  if (result.rowCount === 0) {
    return res.json({ message: 'Jika email terdaftar, tautan reset telah dikirim' });
  }
  const user = result.rows[0];
  const token = crypto.randomBytes(32).toString('hex');
  await query(
    "INSERT INTO password_resets (user_id, token, expired_at) VALUES ($1, $2, NOW() + ($3::int * INTERVAL '1 minute'))",
    [user.id, hashToken(token), resetTtlMinutes]
  );
  try {
    await sendResetEmail(user.email, token);
  } catch (err) {
    await query('DELETE FROM password_resets WHERE token = $1', [hashToken(token)]);
    throw err;
  }
  res.json({ message: 'Jika email terdaftar, tautan reset telah dikirim' });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  const result = await query(
    'SELECT user_id FROM password_resets WHERE token = $1 AND expired_at > NOW()',
    [hashToken(token)]
  );
  if (result.rowCount === 0) throw badRequest('Token reset tidak valid atau kedaluwarsa');
  const userId = result.rows[0].user_id;
  const hashed = await bcrypt.hash(newPassword, 10);
  await withTransaction(async (client) => {
    await client.query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [
      hashed,
      userId,
    ]);
    await client.query('DELETE FROM password_resets WHERE user_id = $1', [userId]);
    await client.query('INSERT INTO logs (user_id, action) VALUES ($1, $2)', [
      userId,
      'reset_password',
    ]);
    await client.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1', [userId]);
  });
  res.json({ message: 'Password berhasil diperbarui' });
});
