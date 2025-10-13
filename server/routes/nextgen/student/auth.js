import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../../models/nextgen/core/User.js';
import Student from '../../../models/nextgen/student-management/Student.js';
import Registration from '../../../models/nextgen/core/Registration.js';

const router = express.Router();

// @desc    Student Login
// @route   POST /api/nextgen/student/login
// @access  Public
router.post('/login', [
  body('identifier').trim().notEmpty().withMessage('Email or Student ID is required'),
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

    const { identifier, password } = req.body;

    // Find user by email or student ID
    let user;
    let student;

    // Try to find by email first
    user = await User.findOne({ email: identifier, role: 'student' });
    
    if (!user) {
      // Try to find by student ID
      student = await Student.findOne({ student_id: identifier });
      if (student) {
        user = await User.findById(student.user_id);
      }
    } else {
      student = await Student.findOne({ user_id: user._id });
    }

    if (!user || !student) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Account is not active. Please contact support.'
      });
    }

    // Check if student is active
    if (student.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Student account is not active. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.last_login_at = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id,
        email: user.email,
        role: user.role,
        student_id: student.student_id
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          last_login: user.last_login_at
        },
        student: {
          id: student._id,
          student_id: student.student_id,
          full_name: student.full_name,
          status: student.status,
          enrollment_date: student.enrollment_date
        }
      }
    });
  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @desc    Validate Password Setup Token
// @route   POST /api/nextgen/student/validate-token
// @access  Public
router.post('/validate-token', [
  body('token').notEmpty().withMessage('Token is required')
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

    const { token } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find registration
    const registration = await Registration.findById(decoded.registrationId)
      .populate('course_id', 'title slug');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    if (registration.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Registration is not approved'
      });
    }

    res.json({
      success: true,
      data: {
        full_name: registration.full_name,
        email: registration.email,
        course_title: registration.course_id?.title
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    console.error('Token validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error validating token'
    });
  }
});

// @desc    Set Password for Approved Student
// @route   POST /api/nextgen/student/set-password
// @access  Public (with valid token)
router.post('/set-password', [
  body('token').notEmpty().withMessage('Token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find registration
    const registration = await Registration.findById(decoded.registrationId)
      .populate('course_id', 'title slug');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    if (registration.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Registration is not approved'
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email: registration.email });
    
    if (!user) {
      // Create new user
      const hashedPassword = await bcrypt.hash(password, 12);
      
      user = new User({
        login_id: `student_${Date.now()}`,
        full_name: registration.full_name,
        email: registration.email,
        role: 'student',
        status: 'active',
        password_hash: hashedPassword
      });
      
      await user.save();
    } else {
      // Update existing user password
      const hashedPassword = await bcrypt.hash(password, 12);
      user.password_hash = hashedPassword;
      user.status = 'active';
      await user.save();
    }

    // Create or update student profile
    let student = await Student.findOne({ email: registration.email });
    
    if (!student) {
      // Generate student ID
      const studentCount = await Student.countDocuments();
      const studentId = `NGE${new Date().getFullYear()}${String(studentCount + 1).padStart(3, '0')}`;

      student = new Student({
        student_id: studentId,
        user_id: user._id,
        full_name: registration.full_name,
        email: registration.email,
        phone: registration.phone,
        status: 'active',
        enrollment_date: new Date()
      });
      
      await student.save();
    } else {
      student.user_id = user._id;
      student.status = 'active';
      await student.save();
    }

    // Update registration status
    registration.status = 'activated';
    await registration.save();

    // Generate login token
    const loginToken = jwt.sign(
      { 
        id: user._id,
        email: user.email,
        role: user.role,
        student_id: student.student_id
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      message: 'Password set successfully. Account activated.',
      data: {
        token: loginToken,
        user: {
          id: user._id,
          email: user.email,
          role: user.role
        },
        student: {
          id: student._id,
          student_id: student.student_id,
          full_name: student.full_name,
          status: student.status
        }
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    console.error('Set password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error setting password'
    });
  }
});

export default router;