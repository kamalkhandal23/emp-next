import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../../models/nextgen/core/User.js';
import Registration from '../../../models/nextgen/core/Registration.js';
import Student from '../../../models/nextgen/student-management/Student.js';
import { auth, authorize } from '../../../middleware/auth.js';
import { encrypt } from '../../../utils/crypto.js';
import { sendEmail, emailTemplates } from '../../../config/email.js';

const router = express.Router();

// @desc    Student Registration (Public)
// @route   POST /api/nextgen/student/register
//route should be  POST /api/nextgen/student/registartion/register
// @access  Public
router.post('/register', [
  body('full_name').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('phone').isMobilePhone().withMessage('Please enter a valid phone number'),
  body('course_id').isMongoId().withMessage('Valid course ID is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { full_name, email, phone, course_id } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Check if registration already exists for this course
    const existingRegistration = await Registration.findOne({
      email,
      course_id,
      status: { $in: ['submitted', 'under_review', 'accepted', 'activated'] }
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'Registration already exists for this course'
      });
    }

    // Create registration record
    const registration = await Registration.create({
      full_name,
      email,
      phone: encrypt(phone),
      course_id,
      status: 'submitted'
    });

    // Send confirmation email
    try {
      await sendEmail(
        email,
        'Registration Submitted - Lifebox NextGen',
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Registration Submitted Successfully!</h2>
            <p>Dear ${full_name},</p>
            <p>Thank you for your interest in our course. Your registration has been submitted and is currently under review.</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Registration Details:</strong></p>
              <p>Name: ${full_name}</p>
              <p>Email: ${email}</p>
              <p>Status: Under Review</p>
            </div>
            <p>You will receive an email notification once your registration is reviewed and approved.</p>
            <p>Best regards,<br>Lifebox NextGen Team</p>
          </div>
        `
      );
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the registration if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Registration submitted successfully',
      data: {
        registration_id: registration._id,
        status: registration.status,
        message: 'You will receive an email notification once your registration is reviewed.'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @desc    Get Registration Status
// @route   GET /api/nextgen/student/registration-status/:email
// @access  Public
router.get('/registration-status/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const registrations = await Registration.find({ email })
      .populate('course_id', 'title slug')
      .populate('reviewed_by', 'full_name')
      .sort({ created_at: -1 });

    if (registrations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No registrations found for this email'
      });
    }

    res.json({
      success: true,
      data: {
        registrations: registrations.map(reg => ({
          id: reg._id,
          course: reg.course_id,
          status: reg.status,
          submitted_at: reg.created_at,
          reviewed_at: reg.reviewed_at,
          reviewed_by: reg.reviewed_by?.full_name,
          notes: reg.notes
        }))
      }
    });
  } catch (error) {
    console.error('Get registration status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching registration status'
    });
  }
});

// @desc    Set Password (After Approval)
// @route   POST /api/nextgen/student/set-password
// @access  Public (with token)
router.post('/set-password', [
  body('token').notEmpty().withMessage('Token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { token, password } = req.body;

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Find the registration
    const registration = await Registration.findById(decoded.registrationId);
    if (!registration || registration.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Invalid registration or not approved yet'
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email: registration.email });
    if (user && user.password_hash) {
      return res.status(400).json({
        success: false,
        message: 'Password already set for this account'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);

    if (!user) {
      // Create user account
      user = await User.create({
        full_name: registration.full_name,
        email: registration.email,
        phone: registration.phone,
        role: 'student',
        status: 'active',
        password_hash
      });
    } else {
      // Update existing user
      user.password_hash = password_hash;
      user.status = 'active';
      await user.save();
    }

    // Create student profile
    const student = await Student.create({
      user_id: user._id,
      full_name: registration.full_name,
      email: registration.email,
      phone: registration.phone,
      status: 'active',
      enrollment_date: new Date()
    });

    // Update registration status
    registration.status = 'activated';
    registration.user_id = user._id;
    await registration.save();

    // Generate login token
    const loginToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      message: 'Password set successfully. You can now log in.',
      data: {
        user: {
          id: user._id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          status: user.status
        },
        student: {
          id: student._id,
          student_id: student.student_id,
          status: student.status
        },
        token: loginToken
      }
    });
  } catch (error) {
    console.error('Set password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error setting password'
    });
  }
});

// @desc    Student Login
// @route   POST /api/nextgen/student/login
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email, role: 'student' });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Account is not active. Please contact support.'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Get student profile
    const student = await Student.findOne({ user_id: user._id });

    // Update last login
    user.last_login_at = new Date();
    await user.save();

    if (student) {
      student.last_activity = new Date();
      student.login_count += 1;
      await student.save();
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role, studentId: student?._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          status: user.status,
          last_login: user.last_login_at
        },
        student: student ? {
          id: student._id,
          student_id: student.student_id,
          status: student.status,
          enrollment_date: student.enrollment_date,
          performance: student.performance
        } : null,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

export default router;