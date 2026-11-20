const pool = require('./db');

const query = async (text, params) => {
  const res = await pool.query(text, params);
  return res;
};

module.exports = { query };