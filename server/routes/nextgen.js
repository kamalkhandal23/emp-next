import express from 'express';
import { body } from 'express-validator';
import Student from '../models/studentModel.js';
import Course from '../models/courseModel.js';
import Exam from '../models/examModel.js';
import Result from '../models/resultModel.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes for NextGen Education Platform

// Get featured courses
router.get('/courses/featured', async (req, res) => {
  try {
    const featuredCourses = await Course.find({ 
      status: 'published',
      'rating.average': { $gte: 4.0 }
    })
    .sort({ 'rating.average': -1, 'enrollment.enrolled': -1 })
    .limit(6)
    .select('title description category level duration pricing rating enrollment');

    res.json(featuredCourses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching featured courses', error: error.message });
  }
});

// Get course categories with counts
router.get('/categories', async (req, res) => {
  try {
    const categories = await Course.aggregate([
      { $match: { status: 'published' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating.average' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
});

// Student enrollment (public)
router.post('/enroll', [
  body('firstName').trim().isLength({ min: 2 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 2 }).withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').isMobilePhone().withMessage('Valid phone number is required'),
  body('courseId').isMongoId().withMessage('Valid course ID is required')
], async (req, res) => {
  try {
    const { firstName, lastName, email, phone, courseId } = req.body;

    // Check if course exists and is available
    const course = await Course.findById(courseId);
    if (!course || course.status !== 'published') {
      return res.status(404).json({ message: 'Course not found or not available' });
    }

    if (!course.canEnroll()) {
      return res.status(400).json({ message: 'Course is full or enrollment is closed' });
    }

    // Check if student already exists
    let student = await Student.findOne({ email });
    
    if (!student) {
      // Create new student
      const studentCount = await Student.countDocuments();
      const studentId = `STU${String(studentCount + 1).padStart(6, '0')}`;

      student = new Student({
        studentId,
        firstName,
        lastName,
        email,
        phone,
        status: 'active'
      });
      await student.save();
    }

    // Check if already enrolled
    const existingEnrollment = student.enrolledCourses.find(
      enrollment => enrollment.course.toString() === courseId
    );

    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Enroll student
    student.enrolledCourses.push({
      course: courseId,
      enrollmentDate: new Date(),
      status: 'active'
    });

    await student.save();
    await course.updateEnrollment(1);

    res.status(201).json({
      message: 'Enrollment successful',
      studentId: student.studentId,
      courseTitle: course.title
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing enrollment', error: error.message });
  }
});

// Protected routes (require authentication)
router.use(auth);

// Student dashboard
router.get('/dashboard', authorize(['student']), async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.user.email })
      .populate('enrolledCourses.course', 'title description instructor schedule')
      .populate('examResults.exam', 'title type');

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // Get upcoming exams
    const upcomingExams = await Exam.find({
      'eligibility.students': student._id,
      'schedule.startDate': { $gte: new Date() },
      status: 'active'
    })
    .populate('course', 'title')
    .sort({ 'schedule.startDate': 1 })
    .limit(5);

    // Get recent results
    const recentResults = await Result.find({ student: student._id })
      .populate('exam', 'title type')
      .sort({ createdAt: -1 })
      .limit(5);

    const dashboard = {
      student: {
        id: student._id,
        studentId: student.studentId,
        fullName: student.fullName,
        email: student.email
      },
      enrolledCourses: student.enrolledCourses,
      upcomingExams,
      recentResults,
      statistics: {
        totalCourses: student.enrolledCourses.length,
        completedCourses: student.enrolledCourses.filter(c => c.status === 'completed').length,
        averageProgress: student.enrolledCourses.reduce((sum, c) => sum + c.progress, 0) / student.enrolledCourses.length || 0,
        totalExams: student.examResults.length,
        averageGrade: student.calculateGPA()
      }
    };

    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard', error: error.message });
  }
});

// Get student's courses
router.get('/my-courses', authorize(['student']), async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.user.email })
      .populate('enrolledCourses.course');

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    res.json(student.enrolledCourses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courses', error: error.message });
  }
});

// Get available exams for student
router.get('/exams/available', authorize(['student']), async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.user.email });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const availableExams = await Exam.find({
      $or: [
        { 'eligibility.students': student._id },
        { 'eligibility.students': { $size: 0 } } // Open to all
      ],
      'schedule.startDate': { $lte: new Date() },
      'schedule.endDate': { $gte: new Date() },
      status: 'active'
    })
    .populate('course', 'title courseCode')
    .sort({ 'schedule.startDate': 1 });

    // Filter out exams where student has reached attempt limit
    const examsWithAttempts = await Promise.all(
      availableExams.map(async (exam) => {
        const attemptCount = await Result.countDocuments({
          student: student._id,
          exam: exam._id
        });

        return {
          ...exam.toObject(),
          attemptsUsed: attemptCount,
          canTake: attemptCount < exam.settings.attemptsAllowed
        };
      })
    );

    res.json(examsWithAttempts.filter(exam => exam.canTake));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching available exams', error: error.message });
  }
});

// Get student's exam results
router.get('/results', authorize(['student']), async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.user.email });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const results = await Result.find({ student: student._id })
      .populate('exam', 'title type course')
      .populate('exam.course', 'title courseCode')
      .sort({ createdAt: -1 });

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching results', error: error.message });
  }
});

// Update student profile
router.put('/profile', authorize(['student']), [
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
  body('address').optional().isObject().withMessage('Address must be an object')
], async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      { email: req.user.email },
      req.body,
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      student
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

export default router;