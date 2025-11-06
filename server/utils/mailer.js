// mailer.js
import { sendEmail } from "../config/email.js";

/**
 * Generic mail sender
 */
export const sendMail = async (to, subject, html, text = "") => {
  return await sendEmail(to, subject, html, text);
};

/**
 * Welcome email with login credentials
 */
export const sendWelcomeEmail = async (to, name, tempPassword, studentId) => {
  const subject = "🎉 Welcome to Lifebox NextGen - Your Login Details";

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f9fafb; padding: 25px; border-radius: 10px; max-width: 600px; margin: auto; border: 1px solid #e5e7eb;">
      <div style="text-align: center; padding-bottom: 10px;">
        <img src="https://lifebox.in/assets/logo.png" alt="Lifebox Logo" style="width: 120px; margin-bottom: 10px;" />
      </div>
      
      <h2 style="color: #2563eb; text-align: center;">Welcome to Lifebox NextGen!</h2>
      <p>Dear <strong>${name}</strong>,</p>
      <p>We’re excited to let you know that your registration has been <span style="color: #10b981; font-weight: bold;">approved</span>. Your account has been created successfully!</p>

      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Student ID:</strong> ${studentId}</p>
        <p><strong>Temporary Password:</strong> ${tempPassword}</p>
      </div>

      <p style="margin-bottom: 20px;">Please log in to your student portal using the link below and <strong>change your password immediately</strong> for security reasons.</p>

      <div style="text-align: center; margin-bottom: 25px;">
        <a href="https://nextgen.lifebox.in/login" 
           style="background-color: #2563eb; color: white; text-decoration: none; padding: 12px 20px; border-radius: 6px; font-weight: 500;">
          Go to Login Page
        </a>
      </div>

      <p>Best regards,<br><strong>The Lifebox NextGen Team</strong></p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;" />
      <p style="font-size: 12px; color: #6b7280; text-align: center;">
        © ${new Date().getFullYear()} Lifebox NextGen. All rights reserved.
      </p>
    </div>
  `;

  return await sendEmail(to, subject, html);
};

export const sendRejectionEmail = async (to, name, reason) => {
  const subject = "Registration Rejected - Lifebox NextGen";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ef4444;">Registration Rejected</h2>
      <p>Dear ${name},</p>
      <p>We regret to inform you that your registration could not be approved.</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>If you believe this was a mistake, you can contact our support team.</p>
      <p>Regards,<br><strong>Lifebox NextGen Team</strong></p>
    </div>
  `;
  return await sendEmail(to, subject, html);
};

export default {
  sendMail,
  sendWelcomeEmail,
};
