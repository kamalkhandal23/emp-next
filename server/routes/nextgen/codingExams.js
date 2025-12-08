import express from 'express';
import { auth,authorize } from '../../middleware/auth.js';
import {
  createCodingExam,
  getAllCodingExams,
  getCodingExamById,
  getCodingExamByName,
  updateCodingExamStatus,
  updateCodingExam,
  deleteCodingExam,
  runCode,
  submitCodingExam,
  getCodingExamsForManager
} from '../../controllers/nextgen/codingExamController.js';

const router = express.Router();

// geta coding exam on the basis of course assingned to the course manager

router.get("/my-codingexam",auth,authorize(["course_manager","admin"]),getCodingExamsForManager)

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

// Run code on sample inputs
router.post('/run-code', runCode);

// Submit coding exam
router.post('/submit', submitCodingExam);

export default router;
