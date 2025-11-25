// routes/nextgenStudentRoutes.js
import express from "express";

import {
  upload,
  registerWithDocs,
  getAllRegistrations,
  enroll,
  login,
  me,
  approve,
  setPassword,
} from "../controllers/nextgenStudentController.js";

import NgExam from "../models/nextgen/education/ng_exams.js";
import NgExamSubmission from "../models/nextgen/education/NGSubmissionExams.js";
import Student from "../models/nextgen/core/NG_ApprovedStudents.js";
const router = express.Router();

router.post(
  "/register",
  upload.fields([
    { name: "passport_photo", maxCount: 1 },
    { name: "documents", maxCount: 10 },
  ]),
  registerWithDocs
);

router.get("/registrations", getAllRegistrations);

/**
 * GET /api/nextgen/student/exams
 * Student ke liye exams list
 */
router.get("/student/exams", async (req, res) => {
  try {
    const { courseName } = req.query;

    const query = {};
    if (courseName) {
      query.courseName = courseName; // sirf ussi course ke exams
    }

    // Testing ke liye: saare status allow
    // Agar sirf published dikhana ho to: query.status = "published";
    const exams = await NgExam.find(query).sort({ createdAt: 1 });

    return res.json({
      success: true,
      data: { exams },
    });
  } catch (error) {
    console.error("Error fetching student exams:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch exams",
    });
  }
});


router.post("/student/exams/:examId/submit", async (req, res) => {
  try {
    const { examId } = req.params;
    const { studentId, answers, score, startedAt } = req.body;

    if (!studentId || !answers) {
      return res.status(400).json({
        success: false,
        message: "studentId and answers are required",
      });
    }

    // Optional: check exam exists
    const exam = await NgExam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    // ✅ Optional: prevent duplicate submissions (one per student per exam)
    const existing = await NgExamSubmission.findOne({ examId, studentId });

    let submission;
    if (existing) {
      existing.answers = answers;
      if (typeof score === "number") {
        existing.score = score;
      }
      if (startedAt) {
        existing.startedAt = startedAt;
      }
      existing.completedAt = new Date();
      existing.status = "submitted";
      submission = await existing.save();
    } else {
      submission = await NgExamSubmission.create({
        examId,
        studentId,
        answers,
        score: typeof score === "number" ? score : 0,
        startedAt,
        completedAt: new Date(),
        status: "submitted",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Exam submitted successfully",
      data: {
        submission,
      },
    });
  } catch (error) {
    console.error("Error submitting exam:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit exam",
    });
  }
});


export default router;
