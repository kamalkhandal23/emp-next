// mailer.js
const transporter = require('../services/emailService');
exports.sendMail = async (options) => {
  return transporter.sendMail(options);
};
