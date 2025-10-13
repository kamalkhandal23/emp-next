import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send email function
export const sendEmail = async (to, subject, html, text = '') => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Lifebox NextGen" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Email templates
export const emailTemplates = {
  welcome: (name, tempPassword) => ({
    subject: 'Welcome to Lifebox NextGen - Account Created',
    html: `
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
    `
  }),

  passwordReset: (name, resetToken) => ({
    subject: 'Password Reset Request - Lifebox NextGen',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        <p>Dear ${name},</p>
        <p>You have requested to reset your password. Click the link below to reset it:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}/reset-password?token=${resetToken}" 
             style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            Reset Password
          </a>
        </div>
        <p>This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>Lifebox NextGen Team</p>
      </div>
    `
  }),

  leaveApproval: (employeeName, leaveType, status, reason = '') => ({
    subject: `Leave Request ${status} - Lifebox NextGen`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${status === 'approved' ? '#10b981' : '#ef4444'};">
          Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)}
        </h2>
        <p>Dear ${employeeName},</p>
        <p>Your ${leaveType} leave request has been <strong>${status}</strong>.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>Please check your portal for more details.</p>
        <p>Best regards,<br>HR Department</p>
      </div>
    `
  }),

  taskAssignment: (employeeName, taskTitle, dueDate) => ({
    subject: 'New Task Assigned - Lifebox NextGen',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Task Assigned</h2>
        <p>Dear ${employeeName},</p>
        <p>A new task has been assigned to you:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Task:</strong> ${taskTitle}</p>
          <p><strong>Due Date:</strong> ${dueDate}</p>
        </div>
        <p>Please check your portal for complete details.</p>
        <p>Best regards,<br>Project Management Team</p>
      </div>
    `
  })
};

export default { sendEmail, emailTemplates };