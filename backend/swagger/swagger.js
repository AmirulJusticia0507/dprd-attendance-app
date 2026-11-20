const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DPRD Attendance API',
      version: '1.0.0',
      description: 'API untuk sistem absensi, pengguna, anggota DPRD, dan rapat.',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Users', description: 'Manajemen pengguna (admin dan anggota DPRD)' },
      { name: 'Absensi', description: 'Manajemen absensi rapat DPRD' },
      { name: 'Anggota', description: 'Manajemen anggota DPRD' },
      { name: 'Rapat', description: 'Manajemen rapat DPRD' },
    ],
  },
  apis: ['./routes/*.js'],
};


const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
