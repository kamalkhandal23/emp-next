// NextGen Routes Index
import express from 'express';
import studentRoutes from './student/index.js';
import adminRoutes from './admin/index.js';

const router = express.Router();

// Mount NextGen routes
router.use('/student', studentRoutes);
router.use('/admin', adminRoutes);

export default router;