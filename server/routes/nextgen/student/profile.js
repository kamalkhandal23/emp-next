import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import Student from '../../../models/nextgen/student-management/Student.js';
import User from '../../../models/nextgen/core/User.js';
import NG_Approved_Students from '../../../models/nextgen/core/NG_ApprovedStudents.js';
import { auth } from '../../../middleware/auth.js';
import { studentAuth } from '../../../middleware/studentAuth.js';
import { encrypt, decrypt } from '../../../utils/crypto.js';

const router = express.Router();

// @desc    Get NextGen Student Profile (Simple - for NG_Approved_Students)
// @route   GET /api/nextgen/student/profile
// @access  Private (Student)
router.get('/', studentAuth, async (req, res) => {
  try {
    // Student is already attached by studentAuth middleware
    const student = req.student;

    // Decrypt phone if it exists and is encrypted
    let decryptedPhone = student.phone;
    if (student.phone) {
      try {
        const phoneObj = JSON.parse(student.phone);
        decryptedPhone = decrypt(phoneObj);
      } catch (e) {
        // If decryption fails, phone might not be encrypted or invalid format
        decryptedPhone = student.phone;
      }
    }

    // Get date_of_birth from registrationRef if available
    let dateOfBirth = student.date_of_birth;
    if (student.registrationRef?.date_of_birth) {
      dateOfBirth = student.registrationRef.date_of_birth;
    }

    const profileData = {
      _id: student._id,
      student_id: student.student_id,
      fullName: student.fullName,
      email: student.email,
      phone: decryptedPhone,
      date_of_birth: dateOfBirth,
      status: student.status,
      enrollment_date: student.enrollment_date,
      registeredAt: student.registeredAt,
      createdAt: student.createdAt,
      course: student.course,
      address: student.address || {},
      emergency_contact: student.emergency_contact || {},
      progress: student.progress || {
        overall_percentage: 0,
        completed_modules: 0,
        total_modules: 0,
        current_module: '',
      },
      performance: student.performance || {
        overall_gpa: 0,
        total_assignments: 0,
        completed_assignments: 0,
        average_score: 0,
      },
    };

    res.json({
      success: true,
      data: { student: profileData },
    });
  } catch (error) {
    console.error('Get student profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile',
    });
  }
});

// Middleware to ensure user is a student
const ensureStudent = async (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Student role required.',
    });
  }

  // Get student profile
  const student = await Student.findOne({ user_id: req.user._id });
  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student profile not found',
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
    const student = await Student.findById(req.student._id).populate(
      'user_id',
      'login_id email role status last_login_at'
    );

    // Decrypt sensitive information for display
    const profileData = {
      id: student._id,
      student_id: student.student_id,
      user: student.user_id,
      personal_info: {
        full_name: student.full_name,
        email: student.email,
        phone: student.phone ? decrypt(student.phone) : null,
        date_of_birth: student.date_of_birth
          ? decrypt(student.date_of_birth)
          : null,
      },
      address: student.address
        ? {
            street: student.address.street
              ? decrypt(student.address.street)
              : null,
            city: student.address.city ? decrypt(student.address.city) : null,
            state: student.address.state
              ? decrypt(student.address.state)
              : null,
            postal_code: student.address.postal_code
              ? decrypt(student.address.postal_code)
              : null,
            country: student.address.country
              ? decrypt(student.address.country)
              : null,
          }
        : null,
      emergency_contact: student.emergency_contact.name
        ? {
            name: decrypt(student.emergency_contact.name),
            relationship: decrypt(student.emergency_contact.relationship),
            phone: decrypt(student.emergency_contact.phone),
            email: decrypt(student.emergency_contact.email),
          }
        : null,
      academic_info: student.academic_info,
      profile: student.profile,
      status: student.status,
      enrollment_date: student.enrollment_date,
      performance: student.performance,
      preferences: student.preferences,
      documents: student.documents.map((doc) => ({
        id: doc._id,
        type: doc.type,
        name: doc.name,
        verified: doc.verified,
        uploaded_at: doc.uploaded_at,
      })),
      created_at: student.created_at,
      updated_at: student.updated_at,
    };

    res.json({
      success: true,
      data: { student: profileData },
    });
  } catch (error) {
    console.error('Get student profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile',
    });
  }
});

// @desc    Update NextGen Student Profile (Simple - for NG_Approved_Students)
// @route   PUT /api/nextgen/student/profile
// @access  Private (Student)
router.put('/', studentAuth, async (req, res) => {
  try {
    const { phone, address, emergency_contact } = req.body;
    const student = req.student;

    // Update allowed fields
    if (phone) {
      // Encrypt phone before storing (stringify the encrypted object)
      const encryptedPhone = encrypt(phone);
      student.phone = JSON.stringify(encryptedPhone);
    }
    if (address) student.address = { ...student.address, ...address };
    if (emergency_contact) {
      student.emergency_contact = {
        ...student.emergency_contact,
        ...emergency_contact,
      };
    }

    await student.save();

    // Return decrypted phone for display
    const responseStudent = student.toObject();
    if (responseStudent.phone) {
      try {
        const phoneObj = JSON.parse(responseStudent.phone);
        responseStudent.phone = decrypt(phoneObj);
      } catch (e) {
        responseStudent.phone = '';
      }
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { student: responseStudent },
    });
  } catch (error) {
    console.error('Update student profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile',
    });
  }
});

// @desc    Change Password for NextGen Student
// @route   PUT /api/nextgen/student/profile/change-password
// @access  Private (Student)
router.put(
  '/change-password',
  studentAuth,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword'),
    /*   .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ) */ body('confirmPassword')
      .notEmpty()
      .withMessage('Please confirm your new password')
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error('Passwords do not match');
        }
        return true;
      }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { currentPassword, newPassword } = req.body;

      // Fetch student with password field (middleware excludes it)
      const studentWithPassword = await NG_Approved_Students.findById(
        req.student._id
      );

      if (!studentWithPassword) {
        return res.status(404).json({
          success: false,
          message: 'Student not found.',
        });
      }

      // Check if student has a password set
      if (!studentWithPassword.password) {
        return res.status(400).json({
          success: false,
          message: 'No password set for this account. Please contact support.',
        });
      }

      // Verify current password
      const isMatch = await bcrypt.compare(
        currentPassword,
        studentWithPassword.password
      );
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect',
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password
      studentWithPassword.password = hashedPassword;
      await studentWithPassword.save();

      res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error changing password',
      });
    }
  }
);

// ========================================================================
// LEGACY ROUTES BELOW (for Student model, not NG_Approved_Students)
// ========================================================================

// Middleware to ensure user is a student
/* LEGACY - Commented out to avoid conflicts with new routes above
router.put(
  '/',
  auth,
  ensureStudent,
  [
    body('profile.bio')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Bio cannot exceed 500 characters'),
    body('profile.interests')
      .optional()
      .isArray()
      .withMessage('Interests must be an array'),
    body('profile.skills')
      .optional()
      .isArray()
      .withMessage('Skills must be an array'),
    body('profile.goals')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Goals cannot exceed 1000 characters'),
    body('academic_info.highest_qualification')
      .optional()
      .isIn(['high_school', 'diploma', 'bachelor', 'master', 'phd', 'other'])
      .withMessage('Invalid qualification'),
    body('preferences.notifications.email')
      .optional()
      .isBoolean()
      .withMessage('Email notification preference must be boolean'),
    body('preferences.notifications.sms')
      .optional()
      .isBoolean()
      .withMessage('SMS notification preference must be boolean'),
    body('preferences.notifications.push')
      .optional()
      .isBoolean()
      .withMessage('Push notification preference must be boolean'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
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
        'preferences.learning',
      ];

      const updates = {};
      Object.keys(req.body).forEach((key) => {
        if (allowedUpdates.includes(key)) {
          updates[key] = req.body[key];
        }
      });

      // Handle nested updates
      if (req.body.profile) {
        Object.keys(req.body.profile).forEach((key) => {
          if (allowedUpdates.includes(`profile.${key}`)) {
            if (!updates.profile) updates.profile = {};
            updates.profile[key] = req.body.profile[key];
          }
        });
      }

      if (req.body.academic_info) {
        Object.keys(req.body.academic_info).forEach((key) => {
          if (allowedUpdates.includes(`academic_info.${key}`)) {
            if (!updates.academic_info) updates.academic_info = {};
            updates.academic_info[key] = req.body.academic_info[key];
          }
        });
      }

      if (req.body.preferences) {
        Object.keys(req.body.preferences).forEach((key) => {
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
        data: { student },
      });
    } catch (error) {
      console.error('Update student profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error updating profile',
      });
    }
  }
);

// @desc    Update Contact Information
// @route   PUT /api/nextgen/student/profile/contact
// @access  Private (Student)
router.put(
  '/contact',
  auth,
  ensureStudent,
  [
    body('phone')
      .optional()
      .isMobilePhone()
      .withMessage('Please enter a valid phone number'),
    body('date_of_birth')
      .optional()
      .isISO8601()
      .withMessage('Please enter a valid date'),
    body('address.street')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Street address too long'),
    body('address.city')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('City name too long'),
    body('address.state')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('State name too long'),
    body('address.postal_code')
      .optional()
      .trim()
      .isLength({ max: 20 })
      .withMessage('Postal code too long'),
    body('address.country')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Country name too long'),
    body('emergency_contact.name')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Emergency contact name too long'),
    body('emergency_contact.relationship')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Relationship too long'),
    body('emergency_contact.phone')
      .optional()
      .isMobilePhone()
      .withMessage('Please enter a valid emergency contact phone'),
    body('emergency_contact.email')
      .optional()
      .isEmail()
      .withMessage('Please enter a valid emergency contact email'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const updates = {};

      // Handle direct fields that need encryption
      if (req.body.phone) updates.phone = req.body.phone;
      if (req.body.date_of_birth)
        updates.date_of_birth = req.body.date_of_birth;

      // Handle address updates
      if (req.body.address) {
        updates.address = {};
        Object.keys(req.body.address).forEach((key) => {
          if (req.body.address[key]) {
            updates.address[key] = req.body.address[key];
          }
        });
      }

      // Handle emergency contact updates
      if (req.body.emergency_contact) {
        updates.emergency_contact = {};
        Object.keys(req.body.emergency_contact).forEach((key) => {
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
          message: 'Contact information has been encrypted and stored securely',
        },
      });
    } catch (error) {
      console.error('Update contact information error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error updating contact information',
      });
    }
  }
);

// @desc    Upload Document
// @route   POST /api/nextgen/student/profile/documents
// @access  Private (Student)
router.post(
  '/documents',
  auth,
  ensureStudent,
  [
    body('type')
      .isIn([
        'id_proof',
        'address_proof',
        'academic_transcript',
        'photo',
        'other',
      ])
      .withMessage('Invalid document type'),
    body('name').trim().notEmpty().withMessage('Document name is required'),
    body('url').isURL().withMessage('Valid document URL is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { type, name, url } = req.body;

      const student = await Student.findById(req.student._id);

      // Check if document type already exists
      const existingDoc = student.documents.find((doc) => doc.type === type);
      if (existingDoc) {
        return res.status(400).json({
          success: false,
          message: `Document of type '${type}' already exists. Please update the existing document.`,
        });
      }

      student.addDocument({ type, name, url });

      res.status(201).json({
        success: true,
        message: 'Document uploaded successfully',
        data: {
          message: 'Document has been uploaded and is pending verification',
        },
      });
    } catch (error) {
      console.error('Upload document error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error uploading document',
      });
    }
  }
);

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
        status: student.status,
      },
    };

    res.json({
      success: true,
      data: performanceData,
    });
  } catch (error) {
    console.error('Get performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching performance data',
    });
  }
});
*/ // END LEGACY ROUTES COMMENT

export default router;
