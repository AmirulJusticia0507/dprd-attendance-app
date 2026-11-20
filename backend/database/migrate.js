const fs = require('fs');
const path = require('path');
const { query } = require('../models/queryHelpers');

const file = path.join(__dirname, 'migrations', '001_align_schema.sql');
const sql = fs.readFileSync(file, 'utf8');

query(sql)
  .then(() => {
    console.log(`Migrasi berhasil: ${path.basename(file)}`);
    return query('SELECT COUNT(*)::int AS total FROM anggota_dprd');
  })
  .then((result) => {
    console.log(`Anggota tersimpan: ${result.rows[0].total}`);
  })
  .catch((err) => {
    console.error('Migrasi gagal:', err.message);
    process.exitCode = 1;
  })
  .finally(() => require('../models/db').end());
