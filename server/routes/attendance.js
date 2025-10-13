import express from 'express';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import Attendance from '../models/hr-management/Attendance.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all attendance records
router.get('/', auth, authorize(['admin', 'hr', 'manager']), async (req, res) => {
  try {
    const { page = 1, limit = 10, employee, date, status } = req.query;
    
    const query = {};
    if (employee) query.employee = employee;
    if (status) query.status = status;
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const attendance = await Attendance.find(query)
      .populate('employee', 'firstName lastName email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: -1 });

    const total = await Attendance.countDocuments(query);

    res.json({
      attendance,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance records', error: error.message });
  }
});

// Get attendance by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate('employee', 'firstName lastName email');

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance record', error: error.message });
  }
});

// Check in
router.post('/checkin', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existingRecord = await Attendance.findOne({
      employee: req.user._id,
      date: today
    });

    if (existingRecord) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    const { location, method = 'web', ipAddress, deviceInfo } = req.body;

    const attendance = new Attendance({
      employee: req.user._id,
      date: today,
      status: 'present'
    });

    // Use the model's checkIn method
    attendance.checkInEmployee(
      location || { type: 'Point', coordinates: [0, 0] },
      method,
      ipAddress || req.ip,
      deviceInfo || req.get('User-Agent')
    );

    await attendance.save();
    await attendance.populate('employee', 'firstName lastName');

    res.status(201).json({
      message: 'Checked in successfully',
      attendance
    });
  } catch (error) {
    res.status(500).json({ message: 'Error checking in', error: error.message });
  }
});

// Check out
router.patch('/checkout', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employee: req.user._id,
      date: today
    });

    if (!attendance) {
      return res.status(404).json({ message: 'No check-in record found for today' });
    }

    if (attendance.checkOut.time) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    const { location, method = 'web', ipAddress, deviceInfo } = req.body;

    // Use the model's checkOut method
    attendance.checkOutEmployee(
      location || { type: 'Point', coordinates: [0, 0] },
      method,
      ipAddress || req.ip,
      deviceInfo || req.get('User-Agent')
    );

    await attendance.save();
    await attendance.populate('employee', 'firstName lastName');

    res.json({
      message: 'Checked out successfully',
      attendance
    });
  } catch (error) {
    res.status(500).json({ message: 'Error checking out', error: error.message });
  }
});

// Create attendance record (admin/hr only)
router.post('/', auth, authorize(['admin', 'hr']), [
  body('employee').isMongoId().withMessage('Valid employee ID is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('status').isIn(['present', 'absent', 'late', 'half-day']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const attendance = new Attendance(req.body);
    await attendance.save();

    await attendance.populate('employee', 'firstName lastName email');

    res.status(201).json({
      message: 'Attendance record created successfully',
      attendance
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating attendance record', error: error.message });
  }
});

// Update attendance record
router.put('/:id', auth, authorize(['admin', 'hr']), async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('employee', 'firstName lastName email');

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.json({
      message: 'Attendance record updated successfully',
      attendance
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating attendance record', error: error.message });
  }
});

// Delete attendance record
router.delete('/:id', auth, authorize(['admin']), async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting attendance record', error: error.message });
  }
});

// Get attendance summary for employee
router.get('/summary/:employeeId', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const employeeId = req.params.employeeId;

    // Build date filter
    let dateFilter = {};
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      dateFilter = {
        date: {
          $gte: startDate,
          $lte: endDate
        }
      };
    }

    const summary = await Attendance.aggregate([
      {
        $match: {
          employee: new mongoose.Types.ObjectId(employeeId),
          ...dateFilter
        }
      },
      {
        $group: {
          _id: null,
          totalDays: { $sum: 1 },
          presentDays: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absentDays: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          lateDays: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
          halfDays: { $sum: { $cond: [{ $eq: ['$status', 'half-day'] }, 1, 0] } },
          totalHours: { $sum: '$totalHours' }
        }
      }
    ]);

    const result = summary[0] || {
      totalDays: 0,
      presentDays: 0,
      absentDays: 0,
      lateDays: 0,
      halfDays: 0,
      totalHours: 0
    };

    result.attendancePercentage = result.totalDays > 0 
      ? Math.round((result.presentDays / result.totalDays) * 100) 
      : 0;

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance summary', error: error.message });
  }
});

export default router;