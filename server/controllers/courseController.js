import Course from '../models/education/courseModel.js';
import Student from '../models/education/studentModel.js';
import mongoose from 'mongoose';
import { validationResult } from 'express-validator';

// Get all courses
export const getAllCourses = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      category, 
      level, 
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { courseCode: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'instructor.name': { $regex: search, $options: 'i' } }
      ];
    }
    if (category) query.category = category;
    if (level) query.level = level;
    if (status) query.status = status;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const courses = await Course.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sortOptions);

    const total = await Course.countDocuments(query);

    res.json({
      courses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courses', error: error.message });
  }
};

// Get course by ID
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('prerequisites.course', 'title courseCode');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching course', error: error.message });
  }
};

// Create new course
export const createCourse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const course = new Course(req.body);
    await course.save();

    res.status(201).json({
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Course code already exists' });
    }
    res.status(500).json({ message: 'Error creating course', error: error.message });
  }
};

// Update course
export const updateCourse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({
      message: 'Course updated successfully',
      course
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating course', error: error.message });
  }
};

// Delete course
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if students are enrolled
    const enrolledStudents = await Student.countDocuments({
      'enrolledCourses.course': req.params.id,
      'enrolledCourses.status': 'active'
    });

    if (enrolledStudents > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete course with active enrollments',
        enrolledStudents
      });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting course', error: error.message });
  }
};

// Get course statistics
export const getCourseStatistics = async (req, res) => {
  try {
    const courseId = req.params.id;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Get enrollment statistics
    const enrollmentStats = await Student.aggregate([
      { $unwind: '$enrolledCourses' },
      { $match: { 'enrolledCourses.course': mongoose.Types.ObjectId(courseId) } },
      {
        $group: {
          _id: '$enrolledCourses.status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get completion rate
    const completionStats = await Student.aggregate([
      { $unwind: '$enrolledCourses' },
      { $match: { 'enrolledCourses.course': mongoose.Types.ObjectId(courseId) } },
      {
        $group: {
          _id: null,
          totalEnrolled: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$enrolledCourses.status', 'completed'] }, 1, 0] }
          },
          averageProgress: { $avg: '$enrolledCourses.progress' }
        }
      }
    ]);

    const stats = {
      course: {
        id: course._id,
        title: course.title,
        courseCode: course.courseCode
      },
      enrollment: {
        capacity: course.enrollment.capacity,
        enrolled: course.enrollment.enrolled,
        available: course.enrollment.capacity - course.enrollment.enrolled,
        waitlist: course.enrollment.waitlist
      },
      completion: completionStats[0] || {
        totalEnrolled: 0,
        completed: 0,
        averageProgress: 0
      },
      statusBreakdown: enrollmentStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      rating: course.rating
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching course statistics', error: error.message });
  }
};

// Get enrolled students
export const getEnrolledStudents = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const courseId = req.params.id;

    const matchQuery = {
      'enrolledCourses.course': mongoose.Types.ObjectId(courseId)
    };

    if (status) {
      matchQuery['enrolledCourses.status'] = status;
    }

    const students = await Student.aggregate([
      { $unwind: '$enrolledCourses' },
      { $match: matchQuery },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          email: 1,
          studentId: 1,
          enrollmentDate: '$enrolledCourses.enrollmentDate',
          status: '$enrolledCourses.status',
          progress: '$enrolledCourses.progress'
        }
      },
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) },
      { $sort: { enrollmentDate: -1 } }
    ]);

    const total = await Student.aggregate([
      { $unwind: '$enrolledCourses' },
      { $match: matchQuery },
      { $count: 'total' }
    ]);

    res.json({
      students,
      totalPages: Math.ceil((total[0]?.total || 0) / limit),
      currentPage: page,
      total: total[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching enrolled students', error: error.message });
  }
};

// Add course review
export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const courseId = req.params.id;
    const studentId = req.user.id; // Assuming student is authenticated

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if student is enrolled and completed the course
    const student = await Student.findById(studentId);
    const enrollment = student.enrolledCourses.find(
      e => e.course.toString() === courseId && e.status === 'completed'
    );

    if (!enrollment) {
      return res.status(400).json({ 
        message: 'You must complete the course before leaving a review' 
      });
    }

    // Check if student already reviewed
    const existingReview = course.reviews.find(
      r => r.student.toString() === studentId
    );

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this course' });
    }

    await course.addReview(studentId, rating, comment);

    res.json({
      message: 'Review added successfully',
      rating: course.rating
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding review', error: error.message });
  }
};

// Update course status
export const updateCourseStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const courseId = req.params.id;

    const course = await Course.findByIdAndUpdate(
      courseId,
      { status },
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({
      message: 'Course status updated successfully',
      course: {
        id: course._id,
        title: course.title,
        status: course.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating course status', error: error.message });
  }
};

// Get course categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Course.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

// Get popular courses
export const getPopularCourses = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const popularCourses = await Course.find({ status: 'published' })
      .sort({ 'enrollment.enrolled': -1, 'rating.average': -1 })
      .limit(parseInt(limit))
      .select('title courseCode category level enrollment rating pricing');

    res.json(popularCourses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching popular courses', error: error.message });
  }
};

export default {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseStatistics,
  getEnrolledStudents,
  addReview,
  updateCourseStatus,
  getCategories,
  getPopularCourses
};