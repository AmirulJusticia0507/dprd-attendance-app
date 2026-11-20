const fs = require('fs');
const path = require('path');
const { query } = require('../models/queryHelpers');

const directory = path.join(__dirname, 'migrations');

const run = async () => {
  const files = fs
    .readdirSync(directory)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(directory, file), 'utf8');
    await query(sql);
    console.log(`Migrasi berhasil: ${file}`);
  }

  const result = await query('SELECT COUNT(*)::int AS total FROM anggota_dprd');
  console.log(`Anggota tersimpan: ${result.rows[0].total}`);
};

run()
  .catch((err) => {
    console.error('Migrasi gagal:', err.message);
    process.exitCode = 1;
  })
  .finally(() => require('../models/db').end());
