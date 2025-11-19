import express from 'express';
import {
  createCodingExam,
  getAllCodingExams,
  getCodingExamById,
  getCodingExamByName,
  updateCodingExamStatus,
  updateCodingExam,
  deleteCodingExam
} from '../../controllers/nextgen/codingExamController.js';

const router = express.Router();

// Create a new coding exam
router.post('/create', createCodingExam);

// Get all coding exams (with optional filters)
router.get('/', getAllCodingExams);

// Get coding exam by ID
router.get('/id/:id', getCodingExamById);

// Get coding exam by name
router.get('/name/:examName', getCodingExamByName);

// Update coding exam status
router.patch('/:id/status', updateCodingExamStatus);

// Update entire coding exam
router.put('/:id', updateCodingExam);

// Delete coding exam
router.delete('/:id', deleteCodingExam);

export default router;
