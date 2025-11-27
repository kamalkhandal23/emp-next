import mongoose from 'mongoose';
import NG_Courses from '../models/education/NG_Courses.js';
import Registration from '../models/nextgen/core/Registration.js';
import { validationResult } from 'express-validator';

// Get all NextGen courses
export const getAllCourses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      visibility,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = req.query;

    // Build query object
    const query = {};

    // Only filter by visibility if explicitly provided in query params
    // This allows admins to see all courses, but public API can filter with ?visibility=published
    if (visibility) {
      query.visibility = visibility;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subtitle: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const courses = await NG_Courses.find(query)
      // .populate('created_by', 'full_name')  // field missing of created by which need to be added in the future
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sortOptions);

    const total = await NG_Courses.countDocuments(query);

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching courses',
    });
  }
};

// Get course by ID
export const getCourseById = async (req, res) => {
  try {
    const course = await NG_Courses.findById(req.params.id);
    // .populate('created_by', 'full_name');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    res.json({
      success: true,
      data: { course },
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching course',
    });
  }
};

// Create new course
export const createCourse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const courseData = {
      ...req.body,
      created_by: req.user._id, // Only if schema includes this field
    };

    const course = await NG_Courses.create(courseData);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: { course },
    });
  } catch (error) {
    console.error('Create course error:', error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `Duplicate value for field: ${field}`,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error creating course',
    });
  }
};

// Update course
export const updateCourse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID',
      });
    }

    const { created_by, _id, ...updateData } = req.body;

    const course = await NG_Courses.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('created_by', 'full_name');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: { course },
    });
  } catch (error) {
    console.error('Update course error:', error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `Duplicate value for field: ${field}`,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error updating course',
    });
  }
};

// Delete course
export const deleteCourse = async (req, res) => {
  try {
    const course = await NG_Courses.findById(req.params.id);
    console.log(course);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if there are active registrations
    const activeRegistrations = await Registration.countDocuments({
      course_id: req.params.id,
      status: { $in: ['submitted', 'under_review', 'accepted', 'activated'] },
    });

    if (activeRegistrations > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete course with active registrations',
        activeRegistrations,
      });
    }

    await NG_Courses.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting course',
    });
  }
};

// Get course statistics
export const getCourseStatistics = async (req, res) => {
  try {
    const courseId = req.params.id;

    const course = await NG_Courses.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Get registration statistics
    const registrationStats = await Registration.aggregate([
      { $match: { course_id: mongoose.Types.ObjectId(courseId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const stats = {
      course: {
        id: course._id,
        title: course.title,
        slug: course.slug,
      },
      registrations: registrationStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      totalRegistrations: registrationStats.reduce(
        (sum, stat) => sum + stat.count,
        0
      ),
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get course statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching statistics',
    });
  }
};

export default {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseStatistics,
};
