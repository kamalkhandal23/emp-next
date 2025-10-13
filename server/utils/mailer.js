// mailer.js
import { sendEmail } from '../config/email.js';

export const sendMail = async (to, subject, html, text = '') => {
  return await sendEmail(to, subject, html, text);
};

export const sendWelcomeEmail = async (to, name, tempPassword) => {
  const subject = 'Welcome to Lifebox NextGen - Account Created';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Welcome to Lifebox NextGen!</h2>
      <p>Dear ${name},</p>
      <p>Your account has been successfully created. Here are your login credentials:</p>
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Temporary Password:</strong> ${tempPassword}</p>
      </div>
      <p>Please log in and change your password immediately for security purposes.</p>
      <p>Best regards,<br>Lifebox NextGen Team</p>
    </div>
  `;
  
  return await sendEmail(to, subject, html);
};

export default {
  sendMail,
  sendWelcomeEmail
};
