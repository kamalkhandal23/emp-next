// emailService.js
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail', // Or your actual email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
module.exports = transporter;
