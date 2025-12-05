import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import multer from 'multer';

import User from '../../../models/nextgen/core/User.js';
import Registration from '../../../models/nextgen/core/Registration.js';
import Student from '../../../models/nextgen/student-management/Student.js';
import NG_Approved_Students from '../../../models/nextgen/core/NG_ApprovedStudents.js';
import { auth, authorize } from '../../../middleware/auth.js';
import { encrypt } from '../../../utils/crypto.js';
import { sendEmail, emailTemplates } from '../../../config/email.js';



// ----------------------------------------------------
// Ensure uploads directory exists
// ----------------------------------------------------
// ----------------------------------------------------
// Vercel-safe Upload Directory
// ----------------------------------------------------
let UPLOAD_DIR;

if (process.env.VERCEL) {
  // Running on Vercel → only /tmp is writable
  UPLOAD_DIR = "/tmp/uploads";
} else {
  // Local development → use normal folder
  UPLOAD_DIR = path.join(process.cwd(), "server", "uploads");
}

// Create directory if not exists
if (!fs.existsSync(UPLOAD_DIR)) {
  /* removed mkdir for Vercel compatibility */
}


// ----------------------------------------------------
// Multer setup (disk storage)
// ----------------------------------------------------
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // passport_photo -> only images; documents -> allow common types
  const isImage =
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/webp' ||
    file.mimetype === 'image/jpg';

  const isDoc =
    isImage ||
    file.mimetype === 'application/pdf' ||
    file.mimetype === 'application/msword' ||
    file.mimetype ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  // field wise filter
  if (file.fieldname === 'passport_photo') {
    return cb(null, isImage);
  }
  if (file.fieldname === 'documents') {
    return cb(null, isDoc);
  }
  cb(null, false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 8 * 1024 * 1024, // 8MB per file
  },
});

const router = express.Router();

/* =========================================================================
   POST /api/nextgen/student/register
   Public — multipart/form-data (passport_photo + documents[])
   Fields:
     - full_name (required)
     - email (required)
     - phone (required)
     - course_id (required, ObjectId)
     - date_of_birth, education, experience, motivation (optional)
     - passport_photo (file, single)  -> field name: passport_photo
     - documents (files, multiple)    -> field name: documents
   ======================================================================= */
router.post(
  '/register',
  upload.fields([
    { name: 'passport_photo', maxCount: 1 },
    { name: 'documents', maxCount: 10 },
  ]),
  [
    body('full_name').trim().notEmpty().withMessage('Full name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
    body('phone').trim().notEmpty().withMessage('Please enter a valid phone number'),
    body('course_id').isMongoId().withMessage('Valid course ID is required'),
  ],
  async (req, res) => {
    try {
      // Validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { full_name, email, phone, course_id } = req.body;

    // Check if user already exists
    const existingUser = await Registration.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

      // Prevent duplicate active registration for same course
      const existingRegistration = await Registration.findOne({
        email,
        course_id,
        status: { $in: ['submitted', 'under_review', 'accepted', 'activated'] },
      });

      if (existingRegistration) {
        return res.status(400).json({
          success: false,
          message: 'Registration already exists for this course',
        });
      }

      // Files from multer
      const passportPhotoPath = req.files?.passport_photo?.[0]?.path
        ?.replace(process.cwd(), '')
        .replace(/\\/g, '/')
        .replace(/^\/?/, ''); // store relative path

      const documentPaths = (req.files?.documents || [])
        .map((f) =>
          f.path
            .replace(process.cwd(), '')
            .replace(/\\/g, '/')
            .replace(/^\/?/, '')
        );

      // Create registration
      const registration = await Registration.create({
        full_name,
        email,
        phone: encrypt(phone),
        course_id,
        status: 'submitted',
        date_of_birth: req.body.date_of_birth || null,
        education: req.body.education || '',
        experience: req.body.experience || '',
        motivation: req.body.motivation || '',
        passport_photo: passportPhotoPath || null,
        documents: documentPaths,
      });

      
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
              <p>Best regards,<br/>Lifebox NextGen Team</p>
            </div>
          `
        );
      } catch (e) {
        console.error('Email sending failed:', e?.message || e);
      }

      return res.status(201).json({
        success: true,
        message: 'Registration submitted successfully',
        data: {
          registration_id: registration._id,
          status: registration.status,
          passport_photo: registration.passport_photo,
          documents: registration.documents,
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error during registration',
      });
    }
  }
);

/* =========================================================================
   GET /api/nextgen/student/registration-status/:email
   Public
   ======================================================================= */
router.get('/registration-status/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const registrations = await Registration.find({ email })
      .populate('course_id', 'title slug')
      .populate('reviewed_by', 'full_name')
      .sort({ created_at: -1 });

    if (!registrations?.length) {
      return res.status(404).json({
        success: false,
        message: 'No registrations found for this email',
      });
    }

    return res.json({
      success: true,
      data: {
        registrations: registrations.map((reg) => ({
          id: reg._id,
          course: reg.course_id,
          status: reg.status,
          submitted_at: reg.created_at,
          reviewed_at: reg.reviewed_at,
          reviewed_by: reg.reviewed_by?.full_name,
          notes: reg.notes,
          passport_photo: reg.passport_photo || null,
          documents: reg.documents || [],
        })),
      },
    });
  } catch (error) {
    console.error('Get registration status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching registration status',
    });
  }
});

/* =========================================================================
   POST /api/nextgen/student/set-password
   Public (token from approval email)
   ======================================================================= */
router.post(
  '/set-password',
  [
    body('token').notEmpty().withMessage('Token is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
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

      const { token, password } = req.body;

      // Verify token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (_e) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired token',
        });
      }

      // Find registration
      const registration = await Registration.findById(decoded.registrationId);
      if (!registration || registration.status !== 'accepted') {
        return res.status(400).json({
          success: false,
          message: 'Invalid registration or not approved yet',
        });
      }

      // Existing user?
      let user = await User.findOne({ email: registration.email });
      if (user && user.password_hash) {
        return res.status(400).json({
          success: false,
          message: 'Password already set for this account',
        });
      }

      const salt = await bcrypt.genSalt(12);
      const password_hash = await bcrypt.hash(password, salt);

      if (!user) {
        user = await User.create({
          full_name: registration.full_name,
          email: registration.email,
          phone: registration.phone,
          role: 'student',
          status: 'active',
          password_hash,
        });
      } else {
        user.password_hash = password_hash;
        user.status = 'active';
        await user.save();
      }

      const student = await Student.create({
        user_id: user._id,
        full_name: registration.full_name,
        email: registration.email,
        phone: registration.phone,
        status: 'active',
        enrollment_date: new Date(),
      });

      registration.status = 'activated';
      registration.user_id = user._id;
      await registration.save();

      const loginToken = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      return res.json({
        success: true,
        message: 'Password set successfully. You can now log in.',
        data: {
          user: {
            id: user._id,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            status: user.status,
          },
          student: {
            id: student._id,
            student_id: student.student_id,
            status: student.status,
          },
          token: loginToken,
        },
      });
    } catch (error) {
      console.error('Set password error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error setting password',
      });
    }
  }
);

// // @desc    Student Login
// // @route   POST /api/nextgen/student/login
// // @access  Public
// router.post("/student/login", async (req, res) => {
//   try {
    
//     const { identifier, password } = req.body;
//     console.log(identifier)
//     console.log(password)

//     // Check for missing fields
//     if (!identifier || !password) {
//       return res.status(400).json({ message: "Email/Student ID and password are required." });
//     }
    

//     // Find by email or student_id
//     const student = await NG_Approved_Students.findOne({
//       $or: [{ email: identifier.toLowerCase() }, { student_id: identifier }],
//     });

//     if (!student) {
//       return res.status(401).json({ message: "Invalid credentials." });
//     }

//     // Compare passwords (bcrypt)
//     const isMatch = await bcrypt.compare(password, student.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid credentials." });
//     }

//     // Generate JWT token
//     const token = jwt.sign(
//       { id: student._id, role: "student" },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     res.status(200).json({
//       message: "Login successful",
//       data: {
//         token,
//         student: {
//           id: student._id,
//           student_id: student.student_id,
//           fullName: student.fullName,
//           email: student.email,
//           course: student.course,
//         },
//       },
//     });
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({ message: "Server error during login" });
//   }
// });


// get register student to show on admin student management 

export default router;
