import express from 'express';
import { body, validationResult } from 'express-validator';
import Student from '../../../models/nextgen/student-management/Student.js';
import User from '../../../models/nextgen/core/User.js';
import { auth } from '../../../middleware/auth.js';
import { decrypt } from '../../../utils/crypto.js';

const router = express.Router();

// Middleware to ensure user is a student
const ensureStudent = async (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Student role required.'
    });
  }
  
  // Get student profile
  const student = await Student.findOne({ user_id: req.user._id });
  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student profile not found'
    });
  }
  
  req.student = student;
  next();
};

// @desc    Get Student Profile
// @route   GET /api/nextgen/student/profile
// @access  Private (Student)
router.get('/', auth, ensureStudent, async (req, res) => {
  try {
    const student = await Student.findById(req.student._id)
      .populate('user_id', 'login_id email role status last_login_at');

    // Decrypt sensitive information for display
    const profileData = {
      id: student._id,
      student_id: student.student_id,
      user: student.user_id,
      personal_info: {
        full_name: student.full_name,
        email: student.email,
        phone: student.phone ? decrypt(student.phone) : null,
        date_of_birth: student.date_of_birth ? decrypt(student.date_of_birth) : null
      },
      address: student.address ? {
        street: student.address.street ? decrypt(student.address.street) : null,
        city: student.address.city ? decrypt(student.address.city) : null,
        state: student.address.state ? decrypt(student.address.state) : null,
        postal_code: student.address.postal_code ? decrypt(student.address.postal_code) : null,
        country: student.address.country ? decrypt(student.address.country) : null
      } : null,
      emergency_contact: student.emergency_contact.name ? {
        name: decrypt(student.emergency_contact.name),
        relationship: decrypt(student.emergency_contact.relationship),
        phone: decrypt(student.emergency_contact.phone),
        email: decrypt(student.emergency_contact.email)
      } : null,
      academic_info: student.academic_info,
      profile: student.profile,
      status: student.status,
      enrollment_date: student.enrollment_date,
      performance: student.performance,
      preferences: student.preferences,
      documents: student.documents.map(doc => ({
        id: doc._id,
        type: doc.type,
        name: doc.name,
        verified: doc.verified,
        uploaded_at: doc.uploaded_at
      })),
      created_at: student.created_at,
      updated_at: student.updated_at
    };

    res.json({
      success: true,
      data: { student: profileData }
    });
  } catch (error) {
    console.error('Get student profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile'
    });
  }
});

// @desc    Update Student Profile
// @route   PUT /api/nextgen/student/profile
// @access  Private (Student)
router.put('/', auth, ensureStudent, [
  body('profile.bio').optional().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
  body('profile.interests').optional().isArray().withMessage('Interests must be an array'),
  body('profile.skills').optional().isArray().withMessage('Skills must be an array'),
  body('profile.goals').optional().isLength({ max: 1000 }).withMessage('Goals cannot exceed 1000 characters'),
  body('academic_info.highest_qualification').optional().isIn(['high_school', 'diploma', 'bachelor', 'master', 'phd', 'other']).withMessage('Invalid qualification'),
  body('preferences.notifications.email').optional().isBoolean().withMessage('Email notification preference must be boolean'),
  body('preferences.notifications.sms').optional().isBoolean().withMessage('SMS notification preference must be boolean'),
  body('preferences.notifications.push').optional().isBoolean().withMessage('Push notification preference must be boolean')
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

    const allowedUpdates = [
      'profile.bio',
      'profile.interests',
      'profile.skills',
      'profile.goals',
      'profile.preferred_learning_style',
      'academic_info.highest_qualification',
      'academic_info.institution',
      'academic_info.field_of_study',
      'academic_info.graduation_year',
      'academic_info.gpa',
      'preferences.notifications',
      'preferences.privacy',
      'preferences.learning'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Handle nested updates
    if (req.body.profile) {
      Object.keys(req.body.profile).forEach(key => {
        if (allowedUpdates.includes(`profile.${key}`)) {
          if (!updates.profile) updates.profile = {};
          updates.profile[key] = req.body.profile[key];
        }
      });
    }

    if (req.body.academic_info) {
      Object.keys(req.body.academic_info).forEach(key => {
        if (allowedUpdates.includes(`academic_info.${key}`)) {
          if (!updates.academic_info) updates.academic_info = {};
          updates.academic_info[key] = req.body.academic_info[key];
        }
      });
    }

    if (req.body.preferences) {
      Object.keys(req.body.preferences).forEach(key => {
        if (allowedUpdates.includes(`preferences.${key}`)) {
          if (!updates.preferences) updates.preferences = {};
          updates.preferences[key] = req.body.preferences[key];
        }
      });
    }

    const student = await Student.findByIdAndUpdate(
      req.student._id,
      { $set: updates, updated_by: req.user._id },
      { new: true, runValidators: true }
    ).populate('user_id', 'login_id email role status');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { student }
    });
  } catch (error) {
    console.error('Update student profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
});

// @desc    Update Contact Information
// @route   PUT /api/nextgen/student/profile/contact
// @access  Private (Student)
router.put('/contact', auth, ensureStudent, [
  body('phone').optional().isMobilePhone().withMessage('Please enter a valid phone number'),
  body('date_of_birth').optional().isISO8601().withMessage('Please enter a valid date'),
  body('address.street').optional().trim().isLength({ max: 200 }).withMessage('Street address too long'),
  body('address.city').optional().trim().isLength({ max: 100 }).withMessage('City name too long'),
  body('address.state').optional().trim().isLength({ max: 100 }).withMessage('State name too long'),
  body('address.postal_code').optional().trim().isLength({ max: 20 }).withMessage('Postal code too long'),
  body('address.country').optional().trim().isLength({ max: 100 }).withMessage('Country name too long'),
  body('emergency_contact.name').optional().trim().isLength({ max: 100 }).withMessage('Emergency contact name too long'),
  body('emergency_contact.relationship').optional().trim().isLength({ max: 50 }).withMessage('Relationship too long'),
  body('emergency_contact.phone').optional().isMobilePhone().withMessage('Please enter a valid emergency contact phone'),
  body('emergency_contact.email').optional().isEmail().withMessage('Please enter a valid emergency contact email')
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

    const updates = {};
    
    // Handle direct fields that need encryption
    if (req.body.phone) updates.phone = req.body.phone;
    if (req.body.date_of_birth) updates.date_of_birth = req.body.date_of_birth;
    
    // Handle address updates
    if (req.body.address) {
      updates.address = {};
      Object.keys(req.body.address).forEach(key => {
        if (req.body.address[key]) {
          updates.address[key] = req.body.address[key];
        }
      });
    }
    
    // Handle emergency contact updates
    if (req.body.emergency_contact) {
      updates.emergency_contact = {};
      Object.keys(req.body.emergency_contact).forEach(key => {
        if (req.body.emergency_contact[key]) {
          updates.emergency_contact[key] = req.body.emergency_contact[key];
        }
      });
    }

    const student = await Student.findByIdAndUpdate(
      req.student._id,
      { $set: updates, updated_by: req.user._id },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Contact information updated successfully',
      data: { 
        message: 'Contact information has been encrypted and stored securely'
      }
    });
  } catch (error) {
    console.error('Update contact information error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating contact information'
    });
  }
});

// @desc    Upload Document
// @route   POST /api/nextgen/student/profile/documents
// @access  Private (Student)
router.post('/documents', auth, ensureStudent, [
  body('type').isIn(['id_proof', 'address_proof', 'academic_transcript', 'photo', 'other']).withMessage('Invalid document type'),
  body('name').trim().notEmpty().withMessage('Document name is required'),
  body('url').isURL().withMessage('Valid document URL is required')
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

    const { type, name, url } = req.body;

    const student = await Student.findById(req.student._id);
    
    // Check if document type already exists
    const existingDoc = student.documents.find(doc => doc.type === type);
    if (existingDoc) {
      return res.status(400).json({
        success: false,
        message: `Document of type '${type}' already exists. Please update the existing document.`
      });
    }

    student.addDocument({ type, name, url });

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        message: 'Document has been uploaded and is pending verification'
      }
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error uploading document'
    });
  }
});

// @desc    Get Academic Performance
// @route   GET /api/nextgen/student/profile/performance
// @access  Private (Student)
router.get('/performance', auth, ensureStudent, async (req, res) => {
  try {
    const student = await Student.findById(req.student._id);

    const performanceData = {
      academic_performance: student.performance,
      academic_status: student.academic_status,
      enrollment_info: {
        enrollment_date: student.enrollment_date,
        graduation_date: student.graduation_date,
        status: student.status
      }
    };

    res.json({
      success: true,
      data: performanceData
    });
  } catch (error) {
    console.error('Get performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching performance data'
    });
  }
});

export default router;