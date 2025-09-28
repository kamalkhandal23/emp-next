import express from 'express';
import { body } from 'express-validator';
import {
  // Profile
  getEmployeeProfile,
  updateEmployeeProfile,
  addEmployeeSkill,
  
  // Performance
  getEmployeePerformance,
  createPerformanceReview,
  updatePerformanceReview,
  getPerformanceTrends,
  
  // Timesheet
  getEmployeeTimesheet,
  createTimesheet,
  updateTimesheet,
  checkIn,
  checkOut,
  getTimesheetSummary,
  
  // Benefits
  getEmployeeBenefits,
  updateEmployeeBenefits,
  enrollHealthInsurance,
  useFlexiBenefit,
  
  // Dashboard
  getEmployeeDashboard,
  getTeamDashboard,
  
  // Break Management
  startBreak,
  endBreak,
  
  // Status and Logs
  getCurrentStatus,
  addWorkLog,
  getAttendanceReport
} from '../controllers/employeePortalController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Dashboard Routes
router.get('/dashboard', getEmployeeDashboard);
router.get('/team-dashboard', authorize(['manager', 'team_lead', 'hr', 'admin']), getTeamDashboard);

// Profile Routes
router.get('/profile/:id?', getEmployeeProfile);
router.put('/profile/:id?', [
  body('personalDetails.dateOfBirth').optional().isISO8601().withMessage('Invalid date of birth'),
  body('personalDetails.gender').optional().isIn(['male', 'female', 'other', 'prefer-not-to-say']).withMessage('Invalid gender'),
  body('contactInfo.personalEmail').optional().isEmail().withMessage('Invalid email format'),
  body('contactInfo.alternatePhone').optional().isMobilePhone().withMessage('Invalid phone number')
], updateEmployeeProfile);

router.post('/profile/:id?/skills', [
  body('name').notEmpty().withMessage('Skill name is required'),
  body('level').isIn(['beginner', 'intermediate', 'advanced', 'expert']).withMessage('Invalid skill level')
], addEmployeeSkill);

// Performance Routes
router.get('/performance/:id?', getEmployeePerformance);
router.get('/performance/:id/trends', getPerformanceTrends);

router.post('/performance/review', authorize(['manager', 'team_lead', 'hr', 'admin']), [
  body('employee').isMongoId().withMessage('Valid employee ID required'),
  body('reviewPeriod.startDate').isISO8601().withMessage('Valid start date required'),
  body('reviewPeriod.endDate').isISO8601().withMessage('Valid end date required'),
  body('year').isInt({ min: 2020, max: 2030 }).withMessage('Valid year required'),
  body('overallRating').isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
], createPerformanceReview);

router.put('/performance/review/:reviewId', authorize(['manager', 'team_lead', 'hr', 'admin']), updatePerformanceReview);

// Timesheet Routes
router.get('/timesheet/:id?', getEmployeeTimesheet);
router.get('/timesheet/:id?/summary', getTimesheetSummary);

router.post('/timesheet', [
  body('date').isISO8601().withMessage('Valid date required'),
  body('workType').optional().isIn(['office', 'remote', 'hybrid', 'field-work', 'client-site']).withMessage('Invalid work type')
], createTimesheet);

router.put('/timesheet/:timesheetId', updateTimesheet);

// Check-in/Check-out Routes
router.post('/timesheet/checkin', [
  body('location.type').optional().isIn(['office', 'remote', 'client-site']).withMessage('Invalid location type'),
  body('method').optional().isIn(['manual', 'biometric', 'mobile-app', 'web']).withMessage('Invalid check-in method')
], checkIn);

router.post('/timesheet/checkout', [
  body('location.type').optional().isIn(['office', 'remote', 'client-site']).withMessage('Invalid location type'),
  body('method').optional().isIn(['manual', 'biometric', 'mobile-app', 'web']).withMessage('Invalid check-out method')
], checkOut);

// Break Management Routes
router.post('/timesheet/break/start', [
  body('type').optional().isIn(['lunch', 'tea', 'personal', 'meeting', 'other']).withMessage('Invalid break type'),
  body('reason').optional().isLength({ max: 200 }).withMessage('Reason must be less than 200 characters')
], startBreak);

router.post('/timesheet/break/end', endBreak);

// Status and Work Log Routes
router.get('/status', getCurrentStatus);

router.post('/worklog', [
  body('projectId').isMongoId().withMessage('Valid project ID required'),
  body('taskDescription').notEmpty().withMessage('Task description is required'),
  body('timeSpent').isInt({ min: 1 }).withMessage('Time spent must be a positive integer (minutes)'),
  body('status').optional().isIn(['in-progress', 'completed', 'blocked', 'on-hold']).withMessage('Invalid status')
], addWorkLog);

// Attendance Report Routes
router.get('/attendance/report/:id?', getAttendanceReport);

// Additional attendance management routes
router.get('/attendance/monthly-summary/:id?', async (req, res) => {
  try {
    const employeeId = req.params.id || req.user.id;
    const { month = new Date().getMonth() + 1, year = new Date().getFullYear() } = req.query;
    
    const AttendanceService = (await import('../services/attendanceService.js')).default;
    const summary = await AttendanceService.getMonthlyAttendanceSummary(
      employeeId, 
      parseInt(month), 
      parseInt(year)
    );
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching monthly summary', error: error.message });
  }
});

router.get('/attendance/anomalies/:id?', authorize(['manager', 'team_lead', 'hr', 'admin']), async (req, res) => {
  try {
    const employeeId = req.params.id || req.user.id;
    const { days = 30 } = req.query;
    
    const AttendanceService = (await import('../services/attendanceService.js')).default;
    const anomalies = await AttendanceService.detectAnomalies(employeeId, parseInt(days));
    
    res.json(anomalies);
  } catch (error) {
    res.status(500).json({ message: 'Error detecting anomalies', error: error.message });
  }
});

router.get('/attendance/team-overview', authorize(['manager', 'team_lead', 'hr', 'admin']), async (req, res) => {
  try {
    const managerId = req.user.id;
    const { date = new Date().toISOString().split('T')[0] } = req.query;
    
    const AttendanceService = (await import('../services/attendanceService.js')).default;
    const overview = await AttendanceService.getTeamAttendanceOverview(managerId, new Date(date));
    
    res.json(overview);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching team overview', error: error.message });
  }
});

// Manual attendance correction (for HR/Admin)
router.post('/attendance/correct/:timesheetId', authorize(['hr', 'admin']), [
  body('checkIn').optional().isISO8601().withMessage('Valid check-in time required'),
  body('checkOut').optional().isISO8601().withMessage('Valid check-out time required'),
  body('reason').notEmpty().withMessage('Reason for correction is required')
], async (req, res) => {
  try {
    const { timesheetId } = req.params;
    const { checkIn, checkOut, reason } = req.body;
    
    const timesheet = await EmployeeTimesheet.findById(timesheetId);
    if (!timesheet) {
      return res.status(404).json({ message: 'Timesheet not found' });
    }
    
    if (timesheet.shifts.length === 0) {
      return res.status(400).json({ message: 'No shifts found in timesheet' });
    }
    
    const shift = timesheet.shifts[0];
    
    if (checkIn) {
      shift.checkIn.time = new Date(checkIn);
    }
    
    if (checkOut) {
      shift.checkOut = shift.checkOut || {};
      shift.checkOut.time = new Date(checkOut);
    }
    
    // Recalculate hours worked
    if (shift.checkIn && shift.checkOut) {
      const hoursWorked = (shift.checkOut.time - shift.checkIn.time) / (1000 * 60 * 60);
      const totalBreakTime = shift.breaks.reduce((total, breakItem) => {
        return total + (breakItem.duration || 0);
      }, 0);
      
      shift.hoursWorked = Math.max(0, Math.round((hoursWorked - totalBreakTime / 60) * 100) / 100);
    }
    
    // Add correction flag
    timesheet.flags.push({
      type: 'manual-correction',
      description: `Attendance corrected by ${req.user.firstName} ${req.user.lastName}: ${reason}`,
      severity: 'low'
    });
    
    await timesheet.save();
    
    res.json({
      message: 'Attendance corrected successfully',
      timesheet
    });
  } catch (error) {
    res.status(500).json({ message: 'Error correcting attendance', error: error.message });
  }
});

// Benefits Routes
router.get('/benefits/:id?', getEmployeeBenefits);
router.put('/benefits/:id?', updateEmployeeBenefits);

router.post('/benefits/health-insurance', [
  body('plan').isIn(['basic', 'standard', 'premium', 'family']).withMessage('Invalid insurance plan'),
  body('coverage.employee').isNumeric().withMessage('Employee coverage must be numeric')
], enrollHealthInsurance);

router.post('/benefits/flexi-benefit', [
  body('category').isIn(['food', 'transport', 'communication', 'learning', 'wellness']).withMessage('Invalid category'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be positive'),
  body('description').notEmpty().withMessage('Description is required')
], useFlexiBenefit);

// Additional utility routes
router.get('/profile/:id/documents', auth, async (req, res) => {
  try {
    const EmployeeProfile = (await import('../models/EmployeeProfile.js')).default;
    const profile = await EmployeeProfile.findOne({ employee: req.params.id })
      .select('documents');
    
    res.json(profile?.documents || []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching documents', error: error.message });
  }
});

router.post('/profile/:id/documents', auth, [
  body('type').isIn(['resume', 'id-proof', 'address-proof', 'education-certificate', 'experience-letter', 'other']).withMessage('Invalid document type'),
  body('name').notEmpty().withMessage('Document name is required'),
  body('url').isURL().withMessage('Valid document URL is required')
], async (req, res) => {
  try {
    const EmployeeProfile = (await import('../models/EmployeeProfile.js')).default;
    const profile = await EmployeeProfile.findOne({ employee: req.params.id });
    
    if (!profile) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }
    
    profile.documents.push(req.body);
    await profile.save();
    
    res.json({
      message: 'Document added successfully',
      documents: profile.documents
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding document', error: error.message });
  }
});

// Leave balance route
router.get('/benefits/:id?/leave-balance', async (req, res) => {
  try {
    const employeeId = req.params.id || req.user.id;
    const EmployeeBenefits = (await import('../models/EmployeeBenefits.js')).default;
    
    const benefits = await EmployeeBenefits.findOne({ employee: employeeId })
      .select('leavePolicy');
    
    res.json(benefits?.leavePolicy || {});
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leave balance', error: error.message });
  }
});

// Performance goals route
router.get('/performance/:id?/goals', async (req, res) => {
  try {
    const employeeId = req.params.id || req.user.id;
    const EmployeePerformance = (await import('../models/EmployeePerformance.js')).default;
    
    const performance = await EmployeePerformance.findOne({ employee: employeeId })
      .sort({ 'reviewPeriod.startDate': -1 })
      .select('goals');
    
    res.json(performance?.goals || { achieved: [], pending: [], upcoming: [] });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching goals', error: error.message });
  }
});

export default router;