const { query } = require('../models/queryHelpers');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendResetEmail } = require('../utils/emailSender');

exports.signup = async (req, res) => {
  const { nama, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    await query('INSERT INTO users(nama, email, password, role) VALUES ($1, $2, $3, $4)', [nama, email, hashed, 'anggota']);
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await query('SELECT * FROM users WHERE email=$1', [email]);
    if (result.rowCount === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '15m' });
  console.log('Reset token:', token); // ← Tambahkan ini untuk debug
  await sendResetEmail(email, token);
  res.json({ message: 'Reset link sent' });
};


exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hashed = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password=$1, updated_at=NOW() WHERE email=$2', [hashed, decoded.email]);
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(400).json({ error: 'Invalid or expired token' });
  }
};


