import express from 'express';
import {auth,authorize} from '../../middleware/auth.js';
import {
  createExam,
  getAllExams,
  getExamById,
  getExamByName,
  checkExamAvailability,
  updateExamStatus,
  updateExam,
  deleteExam,
  getSubmissionsForExam,
  submitExam,
  gradeSubmission,
  getMyExams,
} from '../../controllers/nextgen/examController.js';

const router = express.Router();
// get exams on the basis on course assingned to the course manager
router.get("/my-exams", auth, authorize(["course_manager", "admin"]), getMyExams);
// Create a new exam
router.post('/create', createExam);

// Get all exams (with optional filters)
router.get('/', getAllExams);

// Get exam by ID
router.get('/id/:id', getExamById);

// Check exam availability (time-based)
router.get('/:id/availability', checkExamAvailability);

// Get exam by name
router.get('/name/:examName', getExamByName);

// Update exam status
router.patch('/:id/status', updateExamStatus);

// Update entire exam
router.put('/:id', updateExam);

// Delete exam
router.delete('/:id', deleteExam);

// Get submissions for a specific exam
router.get('/:id/submissions', getSubmissionsForExam);

// Submit an exam
router.post('/submit', submitExam);

// Grade a submission
router.put('/grade/:submissionId', gradeSubmission);

export default router;
