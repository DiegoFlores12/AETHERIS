const nodemailer = require('nodemailer');
require('dotenv').config();

async function sendMail({ to, subject, text }) {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    console.log('\n--- CORREO SIMULADO ---');
    console.log('Para:', to);
    console.log('Asunto:', subject);
    console.log(text);
    console.log('-----------------------\n');
    return { simulated: true };
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
  });

  return transporter.sendMail({
    from: `Aetheris <${process.env.MAIL_USER}>`,
    to,
    subject,
    text
  });
}

module.exports = { sendMail };
