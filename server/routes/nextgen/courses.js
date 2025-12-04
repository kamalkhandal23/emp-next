import express from 'express';
import { body } from 'express-validator';
import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseStatistics,
  getMyCourses
} from '../../controllers/nextgenCourseController.js';
import { auth, authorize } from '../../middleware/auth.js';

const router = express.Router();

// Validation rules
const courseValidation = [
  body('slug').trim().notEmpty().withMessage('Slug is required')
    .matches(/^[a-z0-9-]+$/, 'i').withMessage('Slug can only contain letters, numbers, and hyphens'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('duration').trim().notEmpty().withMessage('Duration is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('visibility').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid visibility status')
];

// @route : /api/nextgen/courses/my-courses
// @des : get particular id  course from Ng_Courses
// @method : Get
router.get('/my-courses', auth, authorize(['admin', 'course_manager']), getMyCourses);
// Public routes

// @route : /api/nextgen/courses/
// @des : get all the courses from Ng_Courses
// @method : Get
router.get('/', getAllCourses);

// @route : /api/nextgen/courses/:id
// @des : get particular id  course from Ng_Courses
// @method : Get
router.get('/:id', getCourseById);

// Protected routes (Admin/Course Manager)
router.use(auth);
router.use(authorize(['admin', 'course_manager']));



router.post('/', courseValidation, createCourse);
router.put('/:id', courseValidation, updateCourse);
router.delete('/:id', deleteCourse);



// router.get('/:id/statistics', getCourseStatistics);

export default router;
