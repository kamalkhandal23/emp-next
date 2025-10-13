import express from 'express';
import { body } from 'express-validator';
import Leave from '../models/hr-management/Leave.js';
import { auth, authorize } from '../middleware/auth.js';
import { sendEmail, emailTemplates } from '../config/email.js';

const router = express.Router();

// Get all leave requests
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type, employee } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (employee) query.employee = employee;

    const leaves = await Leave.find(query)
      .populate('employee', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Leave.countDocuments(query);

    res.json({
      leaves,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leave requests', error: error.message });
  }
});

// Get leave by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('employee', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email');

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leave request', error: error.message });
  }
});

// Create new leave request
router.post('/', auth, [
  body('type').isIn(['annual', 'sick', 'personal', 'maternity', 'paternity']).withMessage('Invalid leave type'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('reason').trim().isLength({ min: 10 }).withMessage('Reason must be at least 10 characters')
], async (req, res) => {
  try {
    const leaveData = {
      ...req.body,
      employee: req.user.id,
      appliedDate: new Date()
    };

    // Calculate days
    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    
    leaveData.days = daysDiff;

    const leave = new Leave(leaveData);
    await leave.save();

    await leave.populate('employee');

    res.status(201).json({
      message: 'Leave request submitted successfully',
      leave
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating leave request', error: error.message });
  }
});

// Update leave status
router.patch('/:id/status', auth, authorize(['admin', 'hr', 'manager']), [
  body('status').isIn(['approved', 'rejected']).withMessage('Status must be approved or rejected'),
  body('comments').optional().trim().isLength({ max: 500 }).withMessage('Comments must be less than 500 characters')
], async (req, res) => {
  try {
    const { status, comments } = req.body;

    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      {
        status,
        approvedBy: req.user.id,
        approvedDate: new Date(),
        comments
      },
      { new: true, runValidators: true }
    ).populate('employee approvedBy');

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Send email notification
    if (leave.employee.email) {
      await sendEmail(
        leave.employee.email,
        emailTemplates.leaveApproval(
          `${leave.employee.firstName} ${leave.employee.lastName}`,
          leave.type,
          status,
          comments
        ).subject,
        emailTemplates.leaveApproval(
          `${leave.employee.firstName} ${leave.employee.lastName}`,
          leave.type,
          status,
          comments
        ).html
      );
    }

    res.json({
      message: `Leave request ${status} successfully`,
      leave
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating leave status', error: error.message });
  }
});

// Delete leave request
router.delete('/:id', auth, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Only allow deletion by the employee who created it or admin/hr
    if (leave.employee.toString() !== req.user.id && !['admin', 'hr'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to delete this leave request' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot delete approved or rejected leave requests' });
    }

    await Leave.findByIdAndDelete(req.params.id);

    res.json({ message: 'Leave request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting leave request', error: error.message });
  }
});

export default router;