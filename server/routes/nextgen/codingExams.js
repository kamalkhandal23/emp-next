import express from "express";
import { auth, authorize } from "../../middleware/auth.js";
import verifyStudentToken from "../../middleware/verifyStudentToken.js"; 

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
  getCodingExamsForManager,
  getAllSubmissions,
} from "../../controllers/nextgen/codingExamController.js";

const router = express.Router();



// Get coding exams assigned to course manager
router.get(
  "/my-codingexam",
  auth,
  authorize(["course_manager", "admin"]),
  getCodingExamsForManager
);

// Get all submissions (manager/admin only)
router.get(
  "/all-submissions",
  auth,
  authorize(["course_manager", "admin"]),
  getAllSubmissions
);

// Create a new coding exam (admin/manager)
router.post(
  "/create",
  auth,
  authorize(["course_manager", "admin"]),
  createCodingExam
);

// Update coding exam status
router.patch(
  "/:id/status",
  auth,
  authorize(["course_manager", "admin"]),
  updateCodingExamStatus
);

// Update entire coding exam
router.put(
  "/:id",
  auth,
  authorize(["course_manager", "admin"]),
  updateCodingExam
);

// Delete coding exam
router.delete(
  "/:id",
  auth,
  authorize(["course_manager", "admin"]),
  deleteCodingExam
);



// Get all coding exams
router.get("/", getAllCodingExams);

// Get coding exam by ID
router.get("/id/:id", getCodingExamById);

// Get coding exam by name
router.get("/name/:examName", getCodingExamByName);


router.post(
  "/run-code",
  verifyStudentToken,
  runCode
);

router.post(
  "/submit",
  verifyStudentToken,   
  submitCodingExam
);

export default router;
