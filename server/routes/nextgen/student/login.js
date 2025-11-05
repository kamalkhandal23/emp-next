import Router from "express"
import NG_Approved_Students from '../../../models/nextgen/core/NG_ApprovedStudents.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const router = Router()

// @desc    Student Login
// @route   POST /api/nextgen/student/login
// @access  Public
router.post("/student/login", async (req, res) => {
  try {

    const { identifier, password } = req.body;
    console.log(identifier)
    console.log(password)

    // Check for missing fields
    if (!identifier || !password) {
      return res.status(400).json({ message: "Email/Student ID and password are required." });
    }


    // Find by email or student_id
    const student = await NG_Approved_Students.findOne({
      $or: [{ email: identifier.toLowerCase() }, { student_id: identifier }],
    }).populate('course', 'title');

    if (!student) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Compare passwords (bcrypt)
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: student._id, role: "student" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      data: {
        token,
        student: {
          id: student._id,
          student_id: student.student_id,
          fullName: student.fullName,
          email: student.email,
          course: student.course,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});


export default router
