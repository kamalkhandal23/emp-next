import jwt from 'jsonwebtoken';
import NG_Approved_Students from '../models/nextgen/core/NG_ApprovedStudents.js';

/**
 * Authentication middleware specifically for NextGen students
 * Validates JWT token and attaches student data to req. Student
 */
export const studentAuth = async (req, res, next) => {
  try {
    let authHeader = req.headers.authorization || req.header('Authorization');
   

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Missing or invalid Authorization header.',
      });
    }
    if (authHeader.includes(',')) {
      authHeader = authHeader.split(',')[0].trim();
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Token missing.',
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message:
          err.name === 'TokenExpiredError'
            ? 'Session expired. Please log in again.'
            : 'Invalid or tampered token.',
      });
    }

    // Verify role is student
    if (decoded.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Student role required.',
      });
    }

    // Find student in NG_Approved_Students
    const student = await NG_Approved_Students.findById(decoded.id)
      .select('-password')
      .populate({
        path: 'course',
        model: 'Ng_Courses',
        select: 'title subtitle duration',
      })
      .populate({
        path: 'registrationRef',
        model: 'NG_Registration',
        select: 'date_of_birth',
      });

    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Student not found.',
      });
    }

    // Check if student is active
    // if (student.status !== 'active') {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Your account is inactive. Contact support.',
    //   });
    // }

    // Attach student to request
    req.student = student;
    req.user = { _id: student._id, role: 'student' }; // For compatibility

    console.log(
      '✅ Authenticated Student:',
      student.fullName,
      student.student_id
    );

    next();
  } catch (error) {
    console.error('Student Auth Middleware Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.',
    });
  }
};
