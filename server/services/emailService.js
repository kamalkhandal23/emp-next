// emailService.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', // Or your actual email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send email notification for new assignment
export const sendNewAssignmentEmail = async (
  studentEmail,
  studentName,
  assignmentName,
  courseName
) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: studentEmail,
      subject: `New Assignment: ${assignmentName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">New Assignment Available</h2>
          <p>Hello ${studentName},</p>
          <p>A new assignment has been created for your course:</p>
          <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Course:</strong> ${courseName}</p>
            <p><strong>Assignment:</strong> ${assignmentName}</p>
          </div>
          <p>Please log in to your student portal to view the assignment details and submit your work.</p>
          <a href="${
            process.env.CLIENT_URL || 'http://localhost:5173'
          }/nextgen/assignments" 
             style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; margin: 20px 0;">
            View Assignment
          </a>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Best regards,<br>
            NextGen Education Team
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`New assignment email sent to ${studentEmail}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending new assignment email:', error);
    return { success: false, error: error.message };
  }
};

// Send email notification when assignment is graded
export const sendGradedAssignmentEmail = async (
  studentEmail,
  studentName,
  assignmentName,
  score,
  feedback
) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: studentEmail,
      subject: `Assignment Graded: ${assignmentName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #22c55e;">Your Assignment Has Been Graded</h2>
          <p>Hello ${studentName},</p>
          <p>Your assignment submission has been graded by your instructor.</p>
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
            <p><strong>Assignment:</strong> ${assignmentName}</p>
            <p style="font-size: 24px; color: #22c55e; margin: 10px 0;">
              <strong>Score: ${score}%</strong>
            </p>
            ${
              feedback
                ? `
              <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #bbf7d0;">
                <p><strong>Instructor Feedback:</strong></p>
                <p style="color: #374151; white-space: pre-wrap;">${feedback}</p>
              </div>
            `
                : ''
            }
          </div>
          <p>Log in to your student portal to view complete details.</p>
          <a href="${
            process.env.CLIENT_URL || 'http://localhost:5173'
          }/nextgen/assignments" 
             style="display: inline-block; background: #22c55e; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; margin: 20px 0;">
            View Details
          </a>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Best regards,<br>
            NextGen Education Team
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Graded assignment email sent to ${studentEmail}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending graded assignment email:', error);
    return { success: false, error: error.message };
  }
};

export default transporter;
