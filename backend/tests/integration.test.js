const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const request = require('supertest');
require('../utils/config');

const backendDir = path.join(__dirname, '..');
const tempDb = `dprd_integration_${process.pid}_${Date.now()}`;
const adminEmail = 'integration-admin@example.test';
let adminPool;
let tempPool;
let app;
let pool;
let token;

before(async () => {
  const base = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
  };
  adminPool = new Pool({ ...base, database: 'postgres' });
  await adminPool.query(`CREATE DATABASE ${tempDb}`);
  tempPool = new Pool({ ...base, database: tempDb });

  const env = { ...process.env, DB_NAME: tempDb };
  execFileSync(process.execPath, [path.join(backendDir, 'database', 'migrate.js')], {
    cwd: backendDir,
    env,
    stdio: 'ignore',
  });
  execFileSync(
    process.execPath,
    [path.join(backendDir, 'database', 'seeds', 'anggota-2024-2029.js')],
    { cwd: backendDir, env, stdio: 'ignore' }
  );

  process.env.DB_NAME = tempDb;
  app = require('../app');
  pool = require('../models/db');

  const hash = await bcrypt.hash('Integration123!', 10);
  await pool.query(
    `INSERT INTO users (nama, email, password, role) VALUES ('Integration Admin', $1, $2, 'admin')`,
    [adminEmail, hash]
  );
  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: adminEmail, password: 'Integration123!' });
  token = login.body.token;
});

after(async () => {
  try {
    if (pool) await pool.end();
    if (tempPool) await tempPool.end();
    if (adminPool) {
      await adminPool
        .query(
          'SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()',
          [tempDb]
        )
        .catch(() => {});
      await adminPool.query(`DROP DATABASE IF EXISTS ${tempDb}`).catch(() => {});
      await adminPool.end();
    }
  } catch (_err) {
    return;
  }
});

test('migrasi dan seed menghasilkan data yang diharapkan', async () => {
  const result = await tempPool.query(
    `SELECT (SELECT COUNT(*)::int FROM anggota_dprd) AS anggota,
            (SELECT COUNT(*)::int FROM users) AS users,
            (SELECT COUNT(*)::int FROM periode) AS periode`
  );
  assert.equal(result.rows[0].anggota, 50);
  assert.equal(result.rows[0].users, 51);
  assert.equal(result.rows[0].periode, 1);
});

test('API membaca data dari database sementara', async () => {
  const response = await request(app)
    .get('/api/absensi/rekap?limit=5')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(response.status, 200);
  assert.ok(response.body.data.length > 0);
  assert.equal(response.body.data[0].periode, '2024-2029');
});
