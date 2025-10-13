import express from 'express';
import { body } from 'express-validator';
import Team from '../models/hr-management/Team.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all teams
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, department, status } = req.query;
    
    const query = {};
    if (department) query.department = department;
    if (status) query.status = status;

    const teams = await Team.find(query)
      .populate('lead', 'firstName lastName email')
      .populate('members', 'firstName lastName email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Team.countDocuments(query);

    res.json({
      teams,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teams', error: error.message });
  }
});

// Get team by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('lead', 'firstName lastName email')
      .populate('members', 'firstName lastName email role department');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching team', error: error.message });
  }
});

// Create new team
router.post('/', auth, authorize(['admin', 'hr', 'manager']), [
  body('name').trim().isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('department').trim().isLength({ min: 2 }).withMessage('Department is required'),
  body('lead').isMongoId().withMessage('Valid team lead ID is required')
], async (req, res) => {
  try {
    const team = new Team(req.body);
    await team.save();

    await team.populate('lead members');

    res.status(201).json({
      message: 'Team created successfully',
      team
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating team', error: error.message });
  }
});

// Update team
router.put('/:id', auth, authorize(['admin', 'hr', 'manager']), async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('lead members');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json({
      message: 'Team updated successfully',
      team
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating team', error: error.message });
  }
});

// Delete team
router.delete('/:id', auth, authorize(['admin']), async (req, res) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting team', error: error.message });
  }
});

export default router;