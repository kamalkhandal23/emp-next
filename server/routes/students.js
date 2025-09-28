import express from 'express';
import { body } from 'express-validator';
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

const router = express.Router();

// Validation rules
const studentValidation = [
  body('firstName').trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('phone').isMobilePhone().withMessage('Please provide a valid phone number'),
  body('dateOfBirth').isISO8601().withMessage('Please provide a valid date of birth')
];

// Get all students
router.get('/', auth, authorize(['admin', 'hr', 'manager']), getAllStudents);

// Get student by ID
router.get('/:id', auth, getStudentById);

// Create new student
router.post('/', auth, authorize(['admin', 'hr']), studentValidation, createStudent);

// Update student
router.put('/:id', auth, authorize(['admin', 'hr']), updateStudent);

// Delete student
router.delete('/:id', auth, authorize(['admin']), deleteStudent);

// Enroll student in course
router.post('/:studentId/enroll/:courseId', auth, authorize(['admin', 'hr']), enrollInCourse);

// Update enrollment status
router.patch('/:studentId/enrollment/:courseId', auth, authorize(['admin', 'hr']), updateEnrollmentStatus);

// Get student's courses
router.get('/:id/courses', auth, getStudentCourses);

// Get student's exam results
router.get('/:id/results', auth, getStudentResults);

// Update student progress
router.patch('/:studentId/progress/:courseId', auth, updateProgress);

export default router;