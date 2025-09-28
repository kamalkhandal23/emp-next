import express from 'express';
import { body } from 'express-validator';
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getDirectReports,
  updateEmployeeStatus,
  addPerformanceReview,
  updateLeaveBalance,
  getEmployeeAttendance,
  getDepartmentEmployees,
  getUpcomingBirthdays,
  getEmployeeStatistics
} from '../controllers/employeeController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const employeeValidation = [
  body('personalInfo.firstName').trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('personalInfo.lastName').trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('personalInfo.email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('personalInfo.phone').isMobilePhone().withMessage('Please provide a valid phone number'),
  body('employment.hireDate').isISO8601().withMessage('Please provide a valid hire date'),
  body('employment.department').trim().isLength({ min: 2 }).withMessage('Department is required'),
  body('employment.position').trim().isLength({ min: 2 }).withMessage('Position is required'),
  body('employment.employmentType').optional().isIn(['full-time', 'part-time', 'contract', 'intern']).withMessage('Invalid employment type'),
  body('employment.workLocation').optional().isIn(['office', 'remote', 'hybrid']).withMessage('Invalid work location')
];

const performanceReviewValidation = [
  body('period').trim().isLength({ min: 1 }).withMessage('Review period is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('goals').optional().isArray().withMessage('Goals must be an array'),
  body('achievements').optional().isArray().withMessage('Achievements must be an array'),
  body('areasForImprovement').optional().isArray().withMessage('Areas for improvement must be an array'),
  body('comments').optional().trim().isLength({ max: 1000 }).withMessage('Comments must be less than 1000 characters')
];

const leaveBalanceValidation = [
  body('leaveType').isIn(['annual', 'sick', 'personal']).withMessage('Invalid leave type'),
  body('days').isInt({ min: 1 }).withMessage('Days must be at least 1'),
  body('operation').optional().isIn(['add', 'deduct']).withMessage('Operation must be add or deduct')
];

// Get all employees
router.get('/', auth, authorize(['admin', 'hr', 'manager']), getAllEmployees);

// Get employee statistics
router.get('/statistics', auth, authorize(['admin', 'hr']), getEmployeeStatistics);

// Get upcoming birthdays
router.get('/birthdays', auth, authorize(['admin', 'hr', 'manager']), getUpcomingBirthdays);

// Get department employees
router.get('/department/:department', auth, authorize(['admin', 'hr', 'manager']), getDepartmentEmployees);

// Get employee by ID
router.get('/:id', auth, getEmployeeById);

// Create new employee
router.post('/', auth, authorize(['admin', 'hr']), employeeValidation, createEmployee);

// Update employee
router.put('/:id', auth, authorize(['admin', 'hr']), updateEmployee);

// Delete employee
router.delete('/:id', auth, authorize(['admin']), deleteEmployee);

// Get employee's direct reports
router.get('/:id/reports', auth, authorize(['admin', 'hr', 'manager']), getDirectReports);

// Update employee status
router.patch('/:id/status', auth, authorize(['admin', 'hr']), [
  body('status').isIn(['active', 'inactive', 'terminated', 'on-leave']).withMessage('Invalid status'),
  body('terminationDate').optional().isISO8601().withMessage('Valid termination date required'),
  body('terminationReason').optional().trim().isLength({ max: 500 }).withMessage('Termination reason must be less than 500 characters')
], updateEmployeeStatus);

// Add performance review
router.post('/:id/review', auth, authorize(['admin', 'hr', 'manager']), performanceReviewValidation, addPerformanceReview);

// Update leave balance
router.patch('/:id/leave-balance', auth, authorize(['admin', 'hr']), leaveBalanceValidation, updateLeaveBalance);

// Get employee attendance
router.get('/:id/attendance', auth, authorize(['admin', 'hr', 'manager']), getEmployeeAttendance);

export default router;