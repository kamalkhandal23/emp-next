import express from 'express';
import {
  createAssignment,
  getAllAssignments,
  getAssignmentById,
  getAssignmentByName,
  updateAssignmentStatus,
  updateAssignment,
  deleteAssignment,
  getAssignmentsWithLockStatus
} from '../../controllers/nextgen/assignmentController.js';

const router = express.Router();

// Get assignments with lock status for a student
router.get('/student/:studentId', getAssignmentsWithLockStatus);

// Create a new assignment
router.post('/create', createAssignment);

// Get all assignments (with optional filters)
router.get('/', getAllAssignments);

// Get assignment by ID
router.get('/id/:id', getAssignmentById);

// Get assignment by name
router.get('/name/:assignmentName', getAssignmentByName);

// Update assignment status
router.patch('/:id/status', updateAssignmentStatus);

// Update entire assignment
router.put('/:id', updateAssignment);

// Delete assignment
router.delete('/:id', deleteAssignment);

export default router;
