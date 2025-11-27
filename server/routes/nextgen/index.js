// NextGen Routes Index
import express from 'express';
import studentRoutes from './student/index.js';
import adminRoutes from './admin/index.js';
import coursesRoutes from './courses.js';
import examsRoutes from './exams.js';
import assignmentsRoutes from './assignments.js';
import assignmentSubmissionsRoutes from './assignmentSubmissions.js';
import codingExamsRoutes from './codingExams.js';

const router = express.Router();

// Mount NextGen routes
router.use('/student', studentRoutes);
router.use('/admin', adminRoutes);
router.use('/courses', coursesRoutes);
router.use('/exams', examsRoutes);
router.use('/assignments', assignmentsRoutes);
router.use('/assignment-submissions', assignmentSubmissionsRoutes);
router.use('/codingExams', codingExamsRoutes);

export default router;
