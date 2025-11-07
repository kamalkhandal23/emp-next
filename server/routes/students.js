import express from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  enrollInCourse,
  updateEnrollmentStatus,
  getStudentCourses,
  getStudentResults,
  updateProgress
} from '../controllers/studentController.js';

import { auth, authorize } from '../middleware/auth.js';
import Registration from '../models/nextgen/core/Registration.js'; // ✅ import registration model

const router = express.Router();

// ==========================
// 🔹 Multer Setup for File Uploads
// ==========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// ==========================
// 🔹 Student Validation
// ==========================
const studentValidation = [
  body('firstName').trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('phone').isMobilePhone().withMessage('Please provide a valid phone number'),
  body('dateOfBirth').isISO8601().withMessage('Please provide a valid date of birth')
];

// ==========================
// 🔹 ERP Student APIs (Existing)
// ==========================
router.get('/', auth, authorize(['admin', 'hr', 'manager']), getAllStudents);
router.get('/:id', auth, getStudentById);
router.post('/', auth, authorize(['admin', 'hr']), studentValidation, createStudent);
router.put('/:id', auth, authorize(['admin', 'hr']), updateStudent);
router.delete('/:id', auth, authorize(['admin']), deleteStudent);
router.post('/:studentId/enroll/:courseId', auth, authorize(['admin', 'hr']), enrollInCourse);
router.patch('/:studentId/enrollment/:courseId', auth, authorize(['admin', 'hr']), updateEnrollmentStatus);
router.get('/:id/courses', auth, getStudentCourses);
router.get('/:id/results', auth, getStudentResults);
router.patch('/:studentId/progress/:courseId', auth, updateProgress);

// ==========================
// 🔹 NextGen Registration Endpoint
// ==========================
// Handle student registration with passport photo + documents
router.post(
  '/register',
  upload.fields([
    { name: 'passport_photo', maxCount: 1 },
    { name: 'documents', maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      const {
        full_name,
        email,
        phone,
        course_id,
        date_of_birth,
        education,
        experience,
        motivation,
      } = req.body;

      // ✅ Extract uploaded files
      const passport_photo = req.files?.passport_photo?.[0]?.path || null;
      const documents = (req.files?.documents || []).map((file) => ({
        name: file.originalname,
        url: file.path,
        type: file.mimetype,
        uploadedAt: new Date(),
      }));

      // ✅ Create registration entry
      const registration = await Registration.create({
        full_name,
        email,
        phone: phone ? { c: phone, iv: '', tag: '' } : undefined,
        course_id,
        date_of_birth,
        education,
        experience,
        motivation,
        passport_photo,
        documents,
        status: 'submitted',
      });

      res.status(201).json({
        success: true,
        message: 'Registration submitted successfully',
        data: { registration_id: registration._id },
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to register student',
        error: error.message,
      });
    }
  }
);

// ==========================
// 🔹 Exports
// ==========================
export default router;
