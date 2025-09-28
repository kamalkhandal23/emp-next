import express from 'express';
import { body } from 'express-validator';
import {
  getAllExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  getExamForStudent,
  submitExam,
  getExamStatistics,
  updateExamStatus
} from '../controllers/examController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const examValidation = [
  body('title').trim().isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
  body('description').trim().isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
  body('course').isMongoId().withMessage('Valid course ID is required'),
  body('type').isIn(['quiz', 'midterm', 'final', 'assignment', 'project']).withMessage('Invalid exam type'),
  body('questions').isArray({ min: 1 }).withMessage('At least one question is required'),
  body('questions.*.questionId').trim().isLength({ min: 1 }).withMessage('Question ID is required'),
  body('questions.*.type').isIn(['multiple-choice', 'true-false', 'short-answer', 'essay', 'coding']).withMessage('Invalid question type'),
  body('questions.*.question').trim().isLength({ min: 10 }).withMessage('Question must be at least 10 characters'),
  body('questions.*.points').isInt({ min: 1 }).withMessage('Points must be at least 1'),
  body('settings.duration').isInt({ min: 5 }).withMessage('Duration must be at least 5 minutes'),
  body('settings.passingScore').isInt({ min: 0, max: 100 }).withMessage('Passing score must be between 0 and 100'),
  body('settings.attemptsAllowed').isInt({ min: 1 }).withMessage('At least 1 attempt must be allowed'),
  body('schedule.startDate').isISO8601().withMessage('Valid start date is required'),
  body('schedule.endDate').isISO8601().withMessage('Valid end date is required')
];

const submitExamValidation = [
  body('answers').isArray().withMessage('Answers must be an array'),
  body('answers.*.questionId').trim().isLength({ min: 1 }).withMessage('Question ID is required'),
  body('startTime').isISO8601().withMessage('Valid start time is required'),
  body('endTime').isISO8601().withMessage('Valid end time is required')
];

// Get all exams
router.get('/', auth, authorize(['admin', 'hr', 'manager']), getAllExams);

// Get exam by ID (admin/instructor view)
router.get('/:id', auth, authorize(['admin', 'hr', 'manager']), getExamById);

// Create new exam
router.post('/', auth, authorize(['admin', 'hr']), examValidation, createExam);

// Update exam
router.put('/:id', auth, authorize(['admin', 'hr']), updateExam);

// Delete exam
router.delete('/:id', auth, authorize(['admin']), deleteExam);

// Get exam for student (without answers)
router.get('/:id/take', auth, authorize(['student']), getExamForStudent);

// Submit exam
router.post('/:id/submit', auth, authorize(['student']), submitExamValidation, submitExam);

// Get exam statistics
router.get('/:id/statistics', auth, authorize(['admin', 'hr', 'manager']), getExamStatistics);

// Update exam status
router.patch('/:id/status', auth, authorize(['admin', 'hr']), [
  body('status').isIn(['draft', 'published', 'active', 'completed', 'cancelled']).withMessage('Invalid status')
], updateExamStatus);

export default router;