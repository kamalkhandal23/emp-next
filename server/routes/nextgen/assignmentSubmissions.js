import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  submitAssignment,
  getSubmission,
  getAssignmentSubmissions,
  gradeSubmission,
  getStudentSubmissions,
} from '../../controllers/nextgen/assignmentSubmissionController.js';

const router = express.Router();

// Configure multer for file uploads (using memory storage for Supabase)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept documents, images, code files
  const allowedTypes =
    /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|rar|js|py|java|cpp|c|html|css|json|xml/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type. Only documents, images, and code files are allowed.'
      )
    );
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter,
});

// Submit assignment (with file uploads)
router.post('/submit', upload.array('files', 5), submitAssignment);

// Get student's submission for an assignment
router.get('/:assignmentId/student/:studentId', getSubmission);

// Get all submissions for an assignment (instructor)
router.get('/:assignmentId/submissions', getAssignmentSubmissions);

// Grade a submission
router.post('/:submissionId/grade', gradeSubmission);

// Get all submissions by a student
router.get('/student/:studentId/history', getStudentSubmissions);

export default router;
