import express from 'express';
import {
  createExam,
  getAllExams,
  getExamById,
  getExamByName,
  updateExamStatus,
  deleteExam
} from '../../controllers/nextgen/examController.js';

const router = express.Router();

// Create a new exam
router.post('/create', createExam);

// Get all exams (with optional filters)
router.get('/', getAllExams);

// Get exam by ID
router.get('/id/:id', getExamById);

// Get exam by name
router.get('/name/:examName', getExamByName);

// Update exam status
router.patch('/:id/status', updateExamStatus);

// Delete exam
router.delete('/:id', deleteExam);

export default router;
