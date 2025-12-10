import express from "express";
import {
  getAttendanceByStudent,
  getAttendanceByDate,
  getAllAttendance, getCourseDetails
} from "../../controllers/getAttendenceController.js"; 
import {auth, authorize} from "../../middleware/auth.js";

const router = express.Router();



router.get("/getCourse/:managerId",auth,authorize(["course_manager","admin"]), getCourseDetails);
// GET attendance for a specific student in a course
// Example: /api/attendance/student/COURSE_ID/STUDENT_ID
router.get("/student/:courseId/:studentId",auth,authorize(["course_manager","admin"]), getAttendanceByStudent);

// GET attendance for all students on a specific date
// Example: /api/attendance/date/COURSE_ID?date=2025-12-05
router.get("/date/:courseId",auth,authorize(["course_manager","admin"]), getAttendanceByDate);

router.get("/all/:courseId",auth,authorize(["course_manager","admin"]),getAllAttendance);

export default router;
