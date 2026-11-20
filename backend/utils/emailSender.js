const nodemailer = require('nodemailer');
const { AppError } = require('./AppError');
const { appUrl } = require('./config');

let transporter;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
        : undefined,
    });
  }
  return transporter;
};

exports.sendResetEmail = async (email, token) => {
  if (!process.env.SMTP_HOST) {
    throw new AppError(503, 'Layanan email belum dikonfigurasi');
  }
  const link = `${appUrl}/reset?token=${encodeURIComponent(token)}`;
  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'Reset Password DPRD Attendance App',
    text: `Gunakan tautan berikut untuk mengatur ulang password Anda: ${link}`,
    html: `<p>Gunakan tautan berikut untuk mengatur ulang password Anda:</p><p><a href="${link}">${link}</a></p>`,
  });
};
