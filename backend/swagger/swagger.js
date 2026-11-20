const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const { appUrl } = require('../utils/config');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DPRD Attendance API',
      version: '1.0.0',
      description: 'API absensi, pengguna, anggota DPRD, dan rapat.',
    },
    servers: [{ url: appUrl, description: 'Server aplikasi' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Autentikasi dan password' },
      { name: 'Users', description: 'Manajemen pengguna' },
      { name: 'Anggota', description: 'Manajemen anggota DPRD' },
      { name: 'Rapat', description: 'Manajemen rapat' },
      { name: 'Absensi', description: 'Absensi dan rekap kehadiran' },
    ],
  },
  apis: [path.join(__dirname, '../routes/*.js')],
};

module.exports = swaggerJsdoc(options);
