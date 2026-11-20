class AppError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

module.exports = {
  AppError,
  badRequest: (message = 'Permintaan tidak valid', details) => new AppError(400, message, details),
  unauthorized: (message = 'Autentikasi diperlukan') => new AppError(401, message),
  forbidden: (message = 'Akses ditolak') => new AppError(403, message),
  notFound: (message = 'Data tidak ditemukan') => new AppError(404, message),
  conflict: (message = 'Data sudah digunakan') => new AppError(409, message),
};
