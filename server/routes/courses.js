import express from 'express';
import { body } from 'express-validator';
import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseStatistics,
  getEnrolledStudents,
  addReview,
  updateCourseStatus,
  getCategories,
  getPopularCourses
} from '../controllers/courseController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const courseValidation = [
  body('courseCode').trim().isLength({ min: 3 }).withMessage('Course code must be at least 3 characters'),
  body('title').trim().isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
  body('description').trim().isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
  body('category').isIn(['Technology', 'Business', 'Design', 'Marketing', 'Healthcare', 'Education', 'Other']).withMessage('Invalid category'),
  body('level').isIn(['Beginner', 'Intermediate', 'Advanced']).withMessage('Invalid level'),
  body('duration.weeks').isInt({ min: 1 }).withMessage('Duration weeks must be at least 1'),
  body('duration.hoursPerWeek').isInt({ min: 1 }).withMessage('Hours per week must be at least 1'),
  body('credits').isInt({ min: 1, max: 6 }).withMessage('Credits must be between 1 and 6'),
  body('instructor.name').trim().isLength({ min: 2 }).withMessage('Instructor name is required'),
  body('instructor.email').isEmail().withMessage('Valid instructor email is required'),
  body('enrollment.capacity').isInt({ min: 1 }).withMessage('Enrollment capacity must be at least 1'),
  body('schedule.startDate').isISO8601().withMessage('Valid start date is required'),
  body('schedule.endDate').isISO8601().withMessage('Valid end date is required'),
  body('pricing.amount').isFloat({ min: 0 }).withMessage('Price must be a positive number')
];

// Public routes
router.get('/popular', getPopularCourses);
router.get('/categories', getCategories);
router.get('/', getAllCourses);
router.get('/:id', getCourseById);

// Protected routes
router.use(auth);

// Create new course
router.post('/', authorize(['admin', 'hr']), courseValidation, createCourse);




// Update course
router.put('/:id', authorize(['admin', 'hr']), updateCourse);

// Delete course
router.delete('/:id', authorize(['admin']), deleteCourse);

// Get course statistics
router.get('/:id/statistics', authorize(['admin', 'hr', 'manager']), getCourseStatistics);

// Get enrolled students
router.get('/:id/students', authorize(['admin', 'hr', 'manager']), getEnrolledStudents);

// Add course review (students only)
router.post('/:id/review', authorize(['student']), [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 500 }).withMessage('Comment must be less than 500 characters')
], addReview);

// Update course status
router.patch('/:id/status', authorize(['admin', 'hr']), [
  body('status').isIn(['draft', 'published', 'archived', 'cancelled']).withMessage('Invalid status')
], updateCourseStatus);

export default router;