const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../app');
const pool = require('../models/db');
const { jwtSecret } = require('../utils/config');

const adminEmail = 'test-admin@example.test';
const memberEmail = 'test-member@example.test';
const testPassword = 'TestPassword123!';
let adminToken;
let memberToken;

before(async () => {
  const hash = await bcrypt.hash(testPassword, 10);
  for (const [nama, email, role] of [
    ['Test Admin', adminEmail, 'admin'],
    ['Test Anggota', memberEmail, 'anggota'],
  ]) {
    await pool.query(
      `INSERT INTO users (nama, email, password, role) VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role`,
      [nama, email, hash, role]
    );
  }
  const adminLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: adminEmail, password: testPassword });
  const memberLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: memberEmail, password: testPassword });
  adminToken = adminLogin.body.token;
  memberToken = memberLogin.body.token;
});

after(async () => {
  await pool.query('DELETE FROM users WHERE email IN ($1, $2)', [adminEmail, memberEmail]);
  await pool.end();
});

test('GET / returns API info', async () => {
  const response = await request(app).get('/');
  assert.equal(response.status, 200);
  assert.equal(response.body.docs, '/api-docs');
  assert.equal(response.body.portal, '/portal');
});

test('GET /portal serves the web portal', async () => {
  const response = await request(app).get('/portal/');
  assert.equal(response.status, 200);
  assert.match(response.text, /Portal Absensi DPRD/);
});

test('login returns an access token with expiry', async () => {
  assert.ok(adminToken);
  const payload = jwt.verify(adminToken, jwtSecret);
  assert.equal(payload.type, 'access');
  assert.ok(payload.exp > payload.iat);
});

test('protected route rejects missing token with 401', async () => {
  const response = await request(app).get('/api/users');
  assert.equal(response.status, 401);
});

test('non-admin cannot access user management', async () => {
  const response = await request(app)
    .get('/api/users')
    .set('Authorization', `Bearer ${memberToken}`);
  assert.equal(response.status, 403);
});

test('admin can list users with pagination metadata', async () => {
  const response = await request(app)
    .get('/api/users?page=1&limit=5')
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(response.status, 200);
  assert.equal(response.body.meta.limit, 5);
  assert.ok(Array.isArray(response.body.data));
});

test('signup rejects invalid email', async () => {
  const response = await request(app)
    .post('/api/auth/signup')
    .send({ nama: 'Test User', email: 'bukan-email', password: 'Password123!' });
  assert.equal(response.status, 400);
  assert.equal(response.body.error, 'Validasi gagal');
  assert.ok(response.body.details.length > 0);
});

test('absensi rejects invalid foreign key with 400', async () => {
  const response = await request(app)
    .post('/api/absensi')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ rapat_id: 999999, anggota_id: 999999, status: 'hadir' });
  assert.equal(response.status, 400);
});

test('rekap absensi is available for seeded anggota', async () => {
  const response = await request(app)
    .get('/api/absensi/rekap?limit=5')
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(response.status, 200);
  assert.ok(response.body.data.length > 0);
});

test('health check reports connected database', async () => {
  const response = await request(app).get('/api/health');
  assert.equal(response.status, 200);
  assert.equal(response.body.status, 'UP');
  assert.equal(response.body.database.status, 'CONNECTED');
});

test('admin can list periode and partisipasi with pagination metadata', async () => {
  for (const path of ['/api/periode', '/api/partisipasi']) {
    const response = await request(app)
      .get(`${path}?page=1&limit=5`)
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(response.status, 200);
    assert.equal(response.body.meta.limit, 5);
    assert.ok(Array.isArray(response.body.data));
  }
});

test('periode rejects invalid year range', async () => {
  const response = await request(app)
    .post('/api/periode')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ nama: 'Periode Invalid', tahun_mulai: 2029, tahun_berakhir: 2024 });
  assert.equal(response.status, 400);
});

test('non-admin cannot create periode', async () => {
  const response = await request(app)
    .post('/api/periode')
    .set('Authorization', `Bearer ${memberToken}`)
    .send({ nama: 'Periode Test', tahun_mulai: 2024, tahun_berakhir: 2029 });
  assert.equal(response.status, 403);
});

test('refresh token rotates and logout revokes sessions', async () => {
  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: adminEmail, password: testPassword });
  const firstRefresh = login.body.refreshToken;

  const refreshed = await request(app)
    .post('/api/auth/refresh')
    .send({ refreshToken: firstRefresh });
  assert.equal(refreshed.status, 200);
  assert.ok(refreshed.body.token);

  const reused = await request(app).post('/api/auth/refresh').send({ refreshToken: firstRefresh });
  assert.equal(reused.status, 401);

  const secondRefresh = refreshed.body.refreshToken;
  const loggedOut = await request(app)
    .post('/api/auth/logout')
    .set('Authorization', `Bearer ${refreshed.body.token}`)
    .send({ refreshToken: secondRefresh });
  assert.equal(loggedOut.status, 200);

  const afterLogout = await request(app)
    .post('/api/auth/refresh')
    .send({ refreshToken: secondRefresh });
  assert.equal(afterLogout.status, 401);
});

test('rekap CSV export returns downloadable content', async () => {
  const response = await request(app)
    .get('/api/absensi/rekap/csv?limit=5')
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(response.status, 200);
  assert.match(response.headers['content-type'], /text\/csv/);
  assert.match(response.text, /anggota_id,nama,fraksi/);
});

test('unknown route returns 404', async () => {
  const response = await request(app).get('/api/tidak-ada');
  assert.equal(response.status, 404);
});
