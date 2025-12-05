import express from "express";
import {
  getAttendanceByStudent,
  getAttendanceByDate,
  getAllAttendance
} from "../../controllers/getAttendenceController.js"; // ✅ named import

const router = express.Router();

// GET attendance for a specific student in a course
// Example: /api/attendance/student/COURSE_ID/STUDENT_ID
router.get("/student/:courseId/:studentId", getAttendanceByStudent);

// GET attendance for all students on a specific date
// Example: /api/attendance/date/COURSE_ID?date=2025-12-05
router.get("/date/:courseId", getAttendanceByDate);

router.get("/all/:courseId",getAllAttendance);

export default router;
