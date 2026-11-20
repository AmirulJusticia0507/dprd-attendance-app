const app = require('./app');
const pool = require('./models/db');
const { port } = require('./utils/config');

const server = app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
  console.log(`Dokumentasi API di http://localhost:${port}/api-docs`);
});

const shutdown = (signal) => {
  console.log(`Menerima ${signal}, menutup server...`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
