import express from 'express';
import { body } from 'express-validator';
import Meeting from '../models/Meeting.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all meetings
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type, date } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.startTime = { $gte: startOfDay, $lte: endOfDay };
    }

    const meetings = await Meeting.find(query)
      .populate('organizer', 'firstName lastName email')
      .populate('attendees', 'firstName lastName email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ startTime: 1 });

    const total = await Meeting.countDocuments(query);

    res.json({
      meetings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching meetings', error: error.message });
  }
});

// Get meeting by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id)
      .populate('organizer', 'firstName lastName email')
      .populate('attendees', 'firstName lastName email');

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    res.json(meeting);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching meeting', error: error.message });
  }
});

// Create new meeting
router.post('/', auth, [
  body('title').trim().isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('startTime').isISO8601().withMessage('Valid start time is required'),
  body('endTime').isISO8601().withMessage('Valid end time is required'),
  body('attendees').isArray({ min: 1 }).withMessage('At least one attendee is required'),
  body('type').isIn(['meeting', 'standup', 'review', 'planning', 'other']).withMessage('Invalid meeting type')
], async (req, res) => {
  try {
    const meetingData = {
      ...req.body,
      organizer: req.user.id
    };

    const meeting = new Meeting(meetingData);
    await meeting.save();

    await meeting.populate('organizer attendees');

    res.status(201).json({
      message: 'Meeting created successfully',
      meeting
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating meeting', error: error.message });
  }
});

// Update meeting
router.put('/:id', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Only organizer or admin can update
    if (meeting.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this meeting' });
    }

    const updatedMeeting = await Meeting.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('organizer attendees');

    res.json({
      message: 'Meeting updated successfully',
      meeting: updatedMeeting
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating meeting', error: error.message });
  }
});

// Update meeting status
router.patch('/:id/status', auth, [
  body('status').isIn(['scheduled', 'in-progress', 'completed', 'cancelled']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const { status } = req.body;

    const meeting = await Meeting.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('organizer attendees');

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    res.json({
      message: 'Meeting status updated successfully',
      meeting
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating meeting status', error: error.message });
  }
});

// Delete meeting
router.delete('/:id', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Only organizer or admin can delete
    if (meeting.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this meeting' });
    }

    await Meeting.findByIdAndDelete(req.params.id);

    res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting meeting', error: error.message });
  }
});

export default router;