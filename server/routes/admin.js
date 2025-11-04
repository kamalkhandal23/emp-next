import express from 'express';
import { body } from 'express-validator';
import jwt from "jsonwebtoken";
import {
  getDashboardStats,
  getSystemHealth,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getSystemSettings,
  updateSystemSettings,
  getActivityLogs,
  backupDatabase,
  sendSystemNotification
} from '../controllers/adminController.js';

import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

/* ---------------------- ADMIN LOGIN ROUTE ---------------------- */
// This should be placed BEFORE router.use(auth)
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'admin' && password === 'admin123') {
    const token = jwt.sign(
      { id: 'admin-id', role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({
      token,
      admin: {
        name: 'Super Admin',
        role: 'admin',
        email: 'admin@example.com'
      }
    });
  } else {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
});
/* ------------------------------------------------------------------ */

//  All routes below this require authentication
router.use(auth);
router.use(authorize(['admin']));

// Validation rules
const userValidation = [
  body('firstName').trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('role').isIn(['admin', 'hr', 'manager', 'team-lead', 'employee', 'student']).withMessage('Invalid role'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
];

const notificationValidation = [
  body('recipients').notEmpty().withMessage('Recipients are required'),
  body('subject').trim().isLength({ min: 5 }).withMessage('Subject must be at least 5 characters'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
  body('type').optional().isIn(['info', 'warning', 'success', 'error']).withMessage('Invalid notification type')
];

// Dashboard and system info
router.get('/dashboard', getDashboardStats);
router.get('/health', getSystemHealth);

// User management
router.get('/users', getAllUsers);
router.post('/users', userValidation, createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/toggle-status', toggleUserStatus);

// System settings
router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);

// Activity logs
router.get('/logs', getActivityLogs);

// System operations
router.post('/backup', backupDatabase);
router.post('/notification', notificationValidation, sendSystemNotification);




export default router;
