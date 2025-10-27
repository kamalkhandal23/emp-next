import Student from '../models/education/studentModel.js';
import Course from '../models/education/courseModel.js';
import { sendEmail, emailTemplates } from '../config/email.js';
import { validationResult } from 'express-validator';

// Get all students
export const getAllStudents = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, course } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.status = status;
    if (course) query['enrolledCourses.course'] = course;

    const students = await Student.find(query)
      .populate('enrolledCourses.course', 'title courseCode')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Student.countDocuments(query);

    res.json({
      students,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
};

// Get student by ID
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('enrolledCourses.course')
      .populate('examResults.exam');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student', error: error.message });
  }
};

// Create new student
export const createStudent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Generate student ID
    const studentCount = await Student.countDocuments();
    const studentId = `STU${String(studentCount + 1).padStart(6, '0')}`;

    const studentData = {
      ...req.body,
      studentId
    };

    const student = new Student(studentData);
    await student.save();

    // Send welcome email
    if (student.email) {
      const tempPassword = Math.random().toString(36).slice(-8);
      await sendEmail(
        student.email,
        emailTemplates.welcome(student.fullName, tempPassword).subject,
        emailTemplates.welcome(student.fullName, tempPassword).html
      );
    }

    res.status(201).json({
      message: 'Student created successfully',
      student: {
        id: student._id,
        studentId: student.studentId,
        fullName: student.fullName,
        email: student.email
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Error creating student', error: error.message });
  }
};

// Update student
export const updateStudent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('enrolledCourses.course');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({
      message: 'Student updated successfully',
      student
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating student', error: error.message });
  }
};

// Delete student
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting student', error: error.message });
  }
};

// Enroll student in course
export const enrollInCourse = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    const student = await Student.findById(studentId);
    const course = await Course.findById(courseId);

    if (!student || !course) {
      return res.status(404).json({ message: 'Student or course not found' });
    }

    // Check if already enrolled
    const existingEnrollment = student.enrolledCourses.find(
      enrollment => enrollment.course.toString() === courseId
    );

    if (existingEnrollment) {
      return res.status(400).json({ message: 'Student already enrolled in this course' });
    }

    // Check course capacity
    if (!course.canEnroll()) {
      return res.status(400).json({ message: 'Course is full or not available for enrollment' });
    }

    // Add enrollment
    student.enrolledCourses.push({
      course: courseId,
      enrollmentDate: new Date(),
      status: 'active'
    });

    await student.save();
    await course.updateEnrollment(1);

    res.json({
      message: 'Student enrolled successfully',
      enrollment: student.enrolledCourses[student.enrolledCourses.length - 1]
    });
  } catch (error) {
    res.status(500).json({ message: 'Error enrolling student', error: error.message });
  }
};

// Update enrollment status
export const updateEnrollmentStatus = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    const { status } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const enrollment = student.enrolledCourses.find(
      enrollment => enrollment.course.toString() === courseId
    );

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    enrollment.status = status;
    await student.save();

    res.json({
      message: 'Enrollment status updated successfully',
      enrollment
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating enrollment', error: error.message });
  }
};

// Get student's courses
export const getStudentCourses = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('enrolledCourses.course');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student.enrolledCourses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student courses', error: error.message });
  }
};

// Get student's exam results
export const getStudentResults = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('examResults.exam');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student.examResults);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student results', error: error.message });
  }
};

// Update student progress
export const updateProgress = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    const { progress } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const enrollment = student.enrolledCourses.find(
      enrollment => enrollment.course.toString() === courseId
    );

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    enrollment.progress = Math.min(100, Math.max(0, progress));

    // Auto-complete if progress reaches 100%
    if (enrollment.progress === 100 && enrollment.status === 'active') {
      enrollment.status = 'completed';
    }

    await student.save();

    res.json({
      message: 'Progress updated successfully',
      progress: enrollment.progress,
      status: enrollment.status
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating progress', error: error.message });
  }
};

export default {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  enrollInCourse,
  updateEnrollmentStatus,
  getStudentCourses,
  getStudentResults,
  updateProgress
};