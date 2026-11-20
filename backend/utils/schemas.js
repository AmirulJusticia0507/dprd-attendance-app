const { z } = require('zod');

const email = z.string().trim().toLowerCase().email('Format email tidak valid').max(150);
const password = z.string().min(8, 'Password minimal 8 karakter').max(100);
const id = z.coerce.number().int().positive();
const pagination = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});
const idParam = z.object({ id });

module.exports = {
  login: z.object({ email, password: z.string().min(1, 'Password wajib diisi') }),
  signup: z.object({ nama: z.string().trim().min(3).max(150), email, password }),
  forgot: z.object({ email }),
  reset: z.object({ token: z.string().min(20), newPassword: password }),
  refresh: z.object({ refreshToken: z.string().min(20) }),
  logout: z.object({ refreshToken: z.string().min(20).optional() }),
  createUser: z.object({
    nama: z.string().trim().min(3).max(150),
    email,
    password,
    role: z.enum(['admin', 'anggota']).default('anggota'),
  }),
  updateUser: z.object({
    nama: z.string().trim().min(3).max(150).optional(),
    email: email.optional(),
    role: z.enum(['admin', 'anggota']).optional(),
  }),
  createAnggota: z.object({
    user_id: id,
    periode_id: id,
    fraksi: z.string().trim().min(2).max(50),
    partai: z.string().trim().min(2).max(50).optional(),
    jabatan_fraksi: z.string().trim().max(100).optional(),
    jabatan: z.string().trim().max(100).optional(),
    dapil: z.string().trim().max(150).optional(),
    aktif: z.boolean().optional().default(true),
  }),
  updateAnggota: z.object({
    user_id: id.optional(),
    periode_id: id.optional(),
    fraksi: z.string().trim().min(2).max(50).optional(),
    partai: z.string().trim().min(2).max(50).optional(),
    jabatan_fraksi: z.string().trim().max(100).optional(),
    jabatan: z.string().trim().max(100).optional(),
    dapil: z.string().trim().max(150).optional(),
    aktif: z.boolean().optional(),
  }),
  createRapat: z.object({
    judul: z.string().trim().min(3).max(200),
    tanggal: z.coerce.date(),
    waktu_mulai: z
      .string()
      .trim()
      .regex(/^\d{2}:\d{2}$/)
      .optional(),
    waktu_selesai: z
      .string()
      .trim()
      .regex(/^\d{2}:\d{2}$/)
      .optional(),
    tempat: z.string().trim().min(2).max(200).optional(),
  }),
  updateRapat: z.object({
    judul: z.string().trim().min(3).max(200).optional(),
    tanggal: z.coerce.date().optional(),
    waktu_mulai: z
      .string()
      .trim()
      .regex(/^\d{2}:\d{2}$/)
      .optional(),
    waktu_selesai: z
      .string()
      .trim()
      .regex(/^\d{2}:\d{2}$/)
      .optional(),
    tempat: z.string().trim().min(2).max(200).optional(),
  }),
  createAbsensi: z.object({
    rapat_id: id,
    anggota_id: id,
    status: z.enum(['hadir', 'izin', 'alpha']),
    jam_masuk: z
      .string()
      .trim()
      .regex(/^\d{2}:\d{2}$/)
      .optional(),
    keterangan: z.string().trim().max(500).optional(),
  }),
  checkInQr: z.object({ token: z.string().trim().min(20).max(200) }),
  pagination,
  paginationWithFilter: pagination.extend({
    fraksi: z.string().trim().max(50).optional(),
    periode_id: z.coerce.number().int().positive().optional(),
    aktif: z.enum(['true', 'false']).optional(),
  }),
  absensiFilter: pagination.extend({
    rapat_id: z.coerce.number().int().positive().optional(),
    anggota_id: z.coerce.number().int().positive().optional(),
    status: z.enum(['hadir', 'izin', 'alpha']).optional(),
  }),
  rekapFilter: pagination.extend({
    periode_id: z.coerce.number().int().positive().optional(),
    fraksi: z.string().trim().max(50).optional(),
  }),
  createPeriode: z.object({
    nama: z.string().trim().min(2).max(100),
    tahun_mulai: z.coerce.number().int().min(2000).max(2100),
    tahun_berakhir: z.coerce.number().int().min(2000).max(2100),
  }),
  updatePeriode: z.object({
    nama: z.string().trim().min(2).max(100).optional(),
    tahun_mulai: z.coerce.number().int().min(2000).max(2100).optional(),
    tahun_berakhir: z.coerce.number().int().min(2000).max(2100).optional(),
  }),
  createPartisipasi: z.object({
    rapat_id: id,
    anggota_id: id,
    bicara: z.boolean().optional().default(false),
    catatan: z.string().trim().max(500).optional(),
  }),
  updatePartisipasi: z.object({
    bicara: z.boolean().optional(),
    catatan: z.string().trim().max(500).optional(),
  }),
  partisipasiFilter: pagination.extend({
    rapat_id: z.coerce.number().int().positive().optional(),
    anggota_id: z.coerce.number().int().positive().optional(),
  }),
  idParam,
};
