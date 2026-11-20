const { query } = require('../models/queryHelpers');
const bcrypt = require('bcryptjs');

exports.getAllUsers = async (req, res) => {
  try {
    const result = await query('SELECT id, nama, email, role FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createUser = async (req, res) => {
  const { nama, email, password, role } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  try {
    const check = await query('SELECT * FROM users WHERE role = $1', ['admin']);

    // Cek token hanya jika sudah ada admin
    if (check.rowCount > 0) {
      const bearer = req.headers.authorization;
      if (!bearer) return res.status(401).json({ error: 'No token' });

      const token = bearer.split(' ')[1];
      if (!token) return res.status(401).json({ error: 'Invalid token' });
    }

    await query(
      'INSERT INTO users(nama, email, password, role) VALUES ($1, $2, $3, $4)',
      [nama, email, hashed, role]
    );

    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { nama, email, role } = req.body;
  try {
    await query(
      'UPDATE users SET nama=$1, email=$2, role=$3 WHERE id=$4',
      [nama, email, role, id]
    );
    res.json({ message: 'User updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM users WHERE id=$1', [id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
