import express from 'express';
import { createInquiry } from '../controllers/inquiryController.js';

const router = express.Router();

// @desc    Create a new inquiry
// @route   POST /api/inquiry
// @access  Public
router.post('/', createInquiry);

export default router;
