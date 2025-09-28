import express from 'express'
import { body, validationResult } from 'express-validator'
import User from '../models/User.js'
import { authenticate, authorize, checkPermission } from '../middleware/auth.js'

const router = express.Router()

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin, HR, Manager)
router.get('/', authenticate, checkPermission('view_all_employees'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      department,
      role,
      status = 'active',
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query

    // Build query
    const query = {}
    
    if (department) query.department = department
    if (role) query.role = role
    if (status) query.status = status
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ]
    }

    // Execute query with pagination
    const users = await User.find(query)
      .populate('team', 'name department')
      .populate('manager', 'firstName lastName')
      .select('-password')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await User.countDocuments(query)

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error fetching users'
    })
  }
})

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('team', 'name department teamLead')
      .populate('manager', 'firstName lastName email')
      .select('-password')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Check if user can access this profile
    if (req.user._id.toString() !== user._id.toString() && 
        !req.user.hasPermission('view_all_employees')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    res.json({
      success: true,
      data: { user }
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error fetching user'
    })
  }
})

// @desc    Create new user
// @route   POST /api/users
// @access  Private (Admin, HR)
router.post('/', authenticate, checkPermission('manage_employees'), [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('department').notEmpty().withMessage('Department is required'),
  body('position').trim().notEmpty().withMessage('Position is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: req.body.email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      })
    }

    // Create user
    const user = await User.create(req.body)

    // Remove password from response
    const userResponse = user.toObject()
    delete userResponse.password

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user: userResponse }
    })
  } catch (error) {
    console.error('Create user error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error creating user'
    })
  }
})

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin, HR, or own profile)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Check permissions
    const canEdit = req.user._id.toString() === user._id.toString() || 
                   req.user.hasPermission('manage_employees')
    
    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    // Define allowed fields based on user role
    let allowedFields = ['firstName', 'lastName', 'phone', 'bio', 'skills', 'address', 'preferences']
    
    if (req.user.hasPermission('manage_employees')) {
      allowedFields = [
        ...allowedFields,
        'department', 'position', 'role', 'team', 'manager', 'salary',
        'employmentType', 'workLocation', 'status', 'permissions', 'leaveBalance'
      ]
    }

    // Filter request body to only include allowed fields
    const updates = {}
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key]
      }
    })

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password')

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: updatedUser }
    })
  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error updating user'
    })
  }
})

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Soft delete by changing status
    user.status = 'terminated'
    await user.save()

    res.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error deleting user'
    })
  }
})

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private (Admin, HR)
router.get('/stats/overview', authenticate, checkPermission('view_reports'), async (req, res) => {
  try {
    const stats = {
      total: await User.countDocuments(),
      active: await User.countDocuments({ status: 'active' }),
      inactive: await User.countDocuments({ status: 'inactive' }),
      terminated: await User.countDocuments({ status: 'terminated' }),
      onLeave: await User.countDocuments({ status: 'on-leave' })
    }

    // Department-wise breakdown
    const departmentStats = await User.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])

    // Role-wise breakdown
    const roleStats = await User.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])

    // Recent hires (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const recentHires = await User.countDocuments({
      joinDate: { $gte: thirtyDaysAgo },
      status: 'active'
    })

    res.json({
      success: true,
      data: {
        overview: stats,
        departmentBreakdown: departmentStats,
        roleBreakdown: roleStats,
        recentHires
      }
    })
  } catch (error) {
    console.error('User stats error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error fetching user statistics'
    })
  }
})

export default router