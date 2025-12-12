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
import CodingPracticeStats from "../models/education/ng_coding_practice_stats.js";
import { executeCode } from "../services/codeExecutionService.js";
import ngApprovedStudent from "../models/nextgen/core/NG_ApprovedStudents.js";
import addActivity from "../services/addActivityServiceImpl.js";
import ng_exams from "../models/nextgen/education/ng_exams.js";

const router = express.Router();
// 🔥 Helper: streak + total_solved update
// 🧠 NEW FINAL VERSION: streak logic exact rules
const updateCodingStatsForStudent = async (studentId) => {
  const now = new Date();
  let stats = await CodingPracticeStats.findOne({ student_id: studentId });

  // ⭐ First-time solve
  if (!stats) {
    return await CodingPracticeStats.create({
      student_id: studentId,
      total_solved: 1,
      streak: 1,
      last_solved_at: now,
      last_streak_increment: now
    });
  }

  let { total_solved, streak, last_solved_at, last_streak_increment } = stats;
  total_solved += 1;

  // -----------------------------------------
  // 🔥 AUTO DECAY LOGIC (run every solve)
  // -----------------------------------------

  if (last_solved_at) {
    const diffHours = Math.floor((now - last_solved_at) / (1000 * 60 * 60));

    if (diffHours >= 24) {
      // Calculate how many 24hr windows passed
      const periods = Math.floor(diffHours / 24);

      // decay multiple times if many days inactive
      streak = Math.floor(streak / Math.pow(2, periods));

      if (streak < 0) streak = 0;
    }
  }

  // -----------------------------------------
  // ✨ STREAK INCREMENT — only once per 24 hours
  // -----------------------------------------

  let hoursSinceStreakUpdate = last_streak_increment
    ? (now - last_streak_increment) / (1000 * 60 * 60)
    : Infinity;

  if (hoursSinceStreakUpdate >= 24 || streak === 0) {
    streak += 1;
    last_streak_increment = now;
  }

  // update solve timestamp
  last_solved_at = now;

  // save updates
  stats.total_solved = total_solved;
  stats.streak = streak;
  stats.last_solved_at = last_solved_at;
  stats.last_streak_increment = last_streak_increment;

  await stats.save();
  return stats;
};

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
    const { courseName } = req.params;

    const query = courseName;

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
    const { studentId, answers, score, feedback } = req.body;
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

    // ✅ Model ke field names ke hisaab se payload banao
    const submissionPayload = {
      student_id: studentId,       // model me student_id hai
      exam_id: examId,             // model me exam_id hai
      submission_data: answers,    // answers ko submission_data me daal rahe hain
      status: "submitted",
    };

    // Score ko grade me save karte hain agar diya ho
    if (typeof score === "number") {
      submissionPayload.grade = score;
    }

    if (feedback) {
      submissionPayload.feedback = feedback;
    }

    // ✅ Unique index (exam_id + student_id) ke hisaab se upsert
    const submission = await NgExamSubmission.findOneAndUpdate(
      { exam_id: examId, student_id: studentId },
      submissionPayload,
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );
    //Update score and recent Activity
    const student = await ngApprovedStudent.findById(studentId);
    const examForUpdate = await ng_exams.findById(examId);
    student.leaderboardValue.score +=25;
    student.save();
    await addActivity(student._id, "Exam submission", `Submited ${examForUpdate.examName} exam`, {Date: new Date()});

    return res.status(201).json({
      success: true,
      message: "Exam submitted successfully",
      data: { submission },
    });
  } catch (error) {
    console.error("Error submitting exam:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit exam",
      error: error.message,
    });
  }
});

router.post("/coding/practice-run", async (req, res) => {
  try {
    const { language, code, input, studentId } = req.body;

    if (!language || !code) {
      return res.status(400).json({
        success: false,
        message: "language and code are required",
      });
    }

    const inputs = input ? [input] : [];

    const result = await executeCode(code, language, inputs, [], false);
    // result: { verdict, output, error, executionTime, memory }

    let stats = null;
    const isSuccess = !result.error; // sirf tab count karein jab error na ho

    if (isSuccess && studentId) {
      stats = await updateCodingStatsForStudent(studentId);
    }

    return res.json({
      success: true,
      data: {
        ...result,
        stats,
      },
    });
  } catch (err) {
    console.error("Error in coding practice run:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to run code",
    });
  }
});

/**
 * GET /api/nextgen/coding/stats/:studentId
 * Dashboard ke liye coding streak + total solved
 */
router.get("/coding/stats/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    const stats = await CodingPracticeStats.findOne({ student_id: studentId });

    return res.json({
      success: true,
      data: {
        streak: stats?.streak ?? 0,
        total_solved: stats?.total_solved ?? 0,
      },
    });
  } catch (err) {
    console.error("Error fetching coding stats:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch coding stats",
    });
  }
});

// ================================================
// GET SPECIFIC EXAM QUESTIONS (DYNAMIC QUESTIONS)
// ================================================
router.get("/student/exams/:examId/questions", async (req, res) => {
  try {
    const { examId } = req.params;

    // Fetch exam by ID
    const exam = await NgExam.findById(examId)
      .populate("courseId", "title"); // <-- for course name

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    return res.json({
      success: true,
      data: {
        examId: exam._id,
        title: exam.examName,
        courseName: exam.courseId?.title || "Unknown",
        totalQuestions: exam.totalQuestions,
        questions: exam.questions,   // <-- ALL QUESTIONS COME FROM HERE
      },
    });
  } catch (error) {
    console.error("Error fetching exam questions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch exam questions",
    });
  }
});



export default router;
