import express from 'express';
import { body } from 'express-validator';
import {
  getAllResults,
  getResultById,
  getStudentResults,
  getExamResults,
  updateResult,
  deleteResult,
  getResultAnalytics,
  generateCertificate,
  getResultsSummary
} from '../controllers/resultController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const updateResultValidation = [
  body('answers').optional().isArray().withMessage('Answers must be an array'),
  body('answers.*.questionId').optional().trim().isLength({ min: 1 }).withMessage('Question ID is required'),
  body('answers.*.isCorrect').optional().isBoolean().withMessage('isCorrect must be boolean'),
  body('answers.*.pointsEarned').optional().isFloat({ min: 0 }).withMessage('Points earned must be positive'),
  body('reviewComments').optional().trim().isLength({ max: 1000 }).withMessage('Review comments must be less than 1000 characters'),
  body('status').optional().isIn(['in-progress', 'completed', 'submitted', 'graded', 'under-review', 'flagged']).withMessage('Invalid status')
];

// Get all results
router.get('/', auth, authorize(['admin', 'hr', 'manager']), getAllResults);

// Get results summary
router.get('/summary', auth, authorize(['admin', 'hr', 'manager']), getResultsSummary);

// Get result by ID
router.get('/:id', auth, getResultById);

// Get student's results
router.get('/student/:studentId', auth, getStudentResults);

// Get exam results
router.get('/exam/:examId', auth, authorize(['admin', 'hr', 'manager']), getExamResults);

// Update result (for manual grading)
router.put('/:id', auth, authorize(['admin', 'hr']), updateResultValidation, updateResult);

// Delete result
router.delete('/:id', auth, authorize(['admin']), deleteResult);

// Get result analytics
router.get('/:id/analytics', auth, getResultAnalytics);

// Generate certificate
router.post('/:id/certificate', auth, authorize(['admin', 'hr']), generateCertificate);

export default router;