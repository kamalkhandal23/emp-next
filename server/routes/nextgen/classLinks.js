import express from 'express';
import { body } from 'express-validator';
import {
  getClassLinks,
  updateClassLink,
  deleteClassLink
} from '../../controllers/nextgen/classLinksController.js';
import { auth, authorize } from '../../middleware/auth.js';

const router = express.Router();

// Validation rules for updating class links
const updateClassLinkValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('date').trim().notEmpty().withMessage('Date is required'),
  body('time').trim().notEmpty().withMessage('Time is required'),
  body('videoURL').optional().isURL().withMessage('Video URL must be a valid URL')
];

// All routes require authentication and course manager/admin authorization
router.use(auth);
router.use(authorize(['admin', 'course_manager']));

// @route : /api/nextgen/classLinks
// @desc : Get class links for a specific course
// @method : GET
// @query : courseId (required)
router.get('/', getClassLinks);

// @route : /api/nextgen/classLinks/:id
// @desc : Update a specific class link
// @method : PUT
// @params : id (class link ID)
router.put('/:id', updateClassLinkValidation, updateClassLink);

// @route : /api/nextgen/classLinks/:id
// @desc : Delete a specific class link
// @method : DELETE
// @params : id (class link ID)
router.delete('/:id', deleteClassLink);

export default router;
