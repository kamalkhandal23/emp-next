import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import Registration from '../../../models/nextgen/core/Registration.js';
import User from '../../../models/nextgen/core/User.js';
import Student from '../../../models/nextgen/student-management/Student.js';
import Course from '../../../models/nextgen/education/Course.js';
import { auth, authorize } from '../../../middleware/auth.js';
import { sendEmail } from '../../../config/email.js';

const router = express.Router();

// Middleware to ensure user is admin or course manager
const ensureAdminOrManager = (req, res, next) => {
  if (!['admin', 'course_manager'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin or Course Manager role required.'
    });
  }
  next();
};

// @desc    Get All Registrations
// @route   GET /api/nextgen/admin/registrations
// @access  Private (Admin/Course Manager)
router.get('/', auth, ensureAdminOrManager, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      course_id,
      search,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    if (status) query.status = status;
    if (course_id) query.course_id = course_id;
    
    if (search) {
      query.$or = [
        { full_name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // For course managers, only show registrations for their courses
    if (req.user.role === 'course_manager') {
      // This would need to be implemented based on course manager assignments
      // For now, we'll allow all registrations
    }

    const registrations = await Registration.find(query)
      .populate('course_id', 'title slug duration_weeks')
      .populate('reviewed_by', 'full_name email')
      .populate('user_id', 'login_id status last_login_at')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Registration.countDocuments(query);

    // Get statistics
    const stats = await Registration.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusStats = {};
    stats.forEach(stat => {
      statusStats[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: {
        registrations,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        },
        statistics: {
          total,
          by_status: statusStats
        }
      }
    });
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching registrations'
    });
  }
});

// @desc    Get Registration by ID
// @route   GET /api/nextgen/admin/registrations/:id
// @access  Private (Admin/Course Manager)
router.get('/:id', auth, ensureAdminOrManager, async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate('course_id', 'title slug duration_weeks banner_url')
      .populate('reviewed_by', 'full_name email')
      .populate('user_id', 'login_id status last_login_at');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    res.json({
      success: true,
      data: { registration }
    });
  } catch (error) {
    console.error('Get registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching registration'
    });
  }
});

// @desc    Review Registration (Accept/Reject)
// @route   PUT /api/nextgen/admin/registrations/:id/review
// @access  Private (Admin/Course Manager)
router.put('/:id/review', auth, ensureAdminOrManager, [
  body('status').isIn(['accepted', 'rejected']).withMessage('Status must be either accepted or rejected'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status, notes } = req.body;

    const registration = await Registration.findById(req.params.id)
      .populate('course_id', 'title slug');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    if (registration.status !== 'submitted' && registration.status !== 'under_review') {
      return res.status(400).json({
        success: false,
        message: 'Registration has already been reviewed'
      });
    }

    // Update registration
    registration.status = status;
    registration.reviewed_by = req.user._id;
    registration.reviewed_at = new Date();
    registration.notes = notes;

    await registration.save();

    // Send notification email
    try {
      if (status === 'accepted') {
        // Generate password setup token
        const setupToken = jwt.sign(
          { registrationId: registration._id, email: registration.email },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );

        const setupUrl = `${process.env.CLIENT_URL}/set-password?token=${setupToken}`;

        await sendEmail(
          registration.email,
          'Registration Approved - Set Your Password',
          `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #10b981;">Registration Approved!</h2>
              <p>Dear ${registration.full_name},</p>
              <p>Congratulations! Your registration for <strong>${registration.course_id.title}</strong> has been approved.</p>
              <p>To complete your account setup, please click the link below to set your password:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${setupUrl}" 
                   style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Set Your Password
                </a>
              </div>
              <p>This link will expire in 7 days. If you have any questions, please contact our support team.</p>
              <p>Welcome to Lifebox NextGen!</p>
              <p>Best regards,<br>Lifebox NextGen Team</p>
            </div>
          `
        );
      } else {
        // Registration rejected
        await sendEmail(
          registration.email,
          'Registration Update - Lifebox NextGen',
          `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ef4444;">Registration Update</h2>
              <p>Dear ${registration.full_name},</p>
              <p>Thank you for your interest in <strong>${registration.course_id.title}</strong>.</p>
              <p>After careful review, we are unable to approve your registration at this time.</p>
              ${notes ? `<div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Additional Information:</strong></p>
                <p>${notes}</p>
              </div>` : ''}
              <p>If you have any questions or would like to discuss this decision, please contact our support team.</p>
              <p>Best regards,<br>Lifebox NextGen Team</p>
            </div>
          `
        );
      }
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the review if email fails
    }

    res.json({
      success: true,
      message: `Registration ${status} successfully`,
      data: { registration }
    });
  } catch (error) {
    console.error('Review registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error reviewing registration'
    });
  }
});

// @desc    Bulk Review Registrations
// @route   PUT /api/nextgen/admin/registrations/bulk-review
// @access  Private (Admin)
router.put('/bulk-review', auth, authorize('admin'), [
  body('registration_ids').isArray().withMessage('Registration IDs must be an array'),
  body('registration_ids.*').isMongoId().withMessage('Invalid registration ID'),
  body('status').isIn(['accepted', 'rejected']).withMessage('Status must be either accepted or rejected'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { registration_ids, status, notes } = req.body;

    // Find all registrations
    const registrations = await Registration.find({
      _id: { $in: registration_ids },
      status: { $in: ['submitted', 'under_review'] }
    }).populate('course_id', 'title slug');

    if (registrations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No eligible registrations found'
      });
    }

    const results = {
      processed: 0,
      failed: 0,
      details: []
    };

    // Process each registration
    for (const registration of registrations) {
      try {
        registration.status = status;
        registration.reviewed_by = req.user._id;
        registration.reviewed_at = new Date();
        registration.notes = notes;

        await registration.save();

        // Send notification email (simplified for bulk operation)
        try {
          if (status === 'accepted') {
            const setupToken = jwt.sign(
              { registrationId: registration._id, email: registration.email },
              process.env.JWT_SECRET,
              { expiresIn: '7d' }
            );

            const setupUrl = `${process.env.CLIENT_URL}/set-password?token=${setupToken}`;

            await sendEmail(
              registration.email,
              'Registration Approved - Set Your Password',
              `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #10b981;">Registration Approved!</h2>
                  <p>Dear ${registration.full_name},</p>
                  <p>Your registration for <strong>${registration.course_id.title}</strong> has been approved.</p>
                  <p>Please set your password using this link: <a href="${setupUrl}">Set Password</a></p>
                  <p>Best regards,<br>Lifebox NextGen Team</p>
                </div>
              `
            );
          }
        } catch (emailError) {
          console.error('Email sending failed for registration:', registration._id, emailError);
        }

        results.processed++;
        results.details.push({
          registration_id: registration._id,
          email: registration.email,
          status: 'success'
        });
      } catch (error) {
        results.failed++;
        results.details.push({
          registration_id: registration._id,
          email: registration.email,
          status: 'failed',
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Bulk review completed. ${results.processed} processed, ${results.failed} failed.`,
      data: results
    });
  } catch (error) {
    console.error('Bulk review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during bulk review'
    });
  }
});

// @desc    Get Registration Statistics
// @route   GET /api/nextgen/admin/registrations/stats
// @access  Private (Admin/Course Manager)
router.get('/stats/overview', auth, ensureAdminOrManager, async (req, res) => {
  try {
    const { course_id, date_range } = req.query;

    const matchStage = {};
    if (course_id) matchStage.course_id = mongoose.Types.ObjectId(course_id);
    
    if (date_range) {
      const [start, end] = date_range.split(',');
      matchStage.created_at = {
        $gte: new Date(start),
        $lte: new Date(end)
      };
    }

    const stats = await Registration.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          submitted: { $sum: { $cond: [{ $eq: ['$status', 'submitted'] }, 1, 0] } },
          under_review: { $sum: { $cond: [{ $eq: ['$status', 'under_review'] }, 1, 0] } },
          accepted: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
          activated: { $sum: { $cond: [{ $eq: ['$status', 'activated'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } }
        }
      }
    ]);

    // Course-wise breakdown
    const courseStats = await Registration.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$course_id',
          count: { $sum: 1 },
          accepted: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
          activated: { $sum: { $cond: [{ $eq: ['$status', 'activated'] }, 1, 0] } }
        }
      },
      {
        $lookup: {
          from: 'ng_courses',
          localField: '_id',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      {
        $project: {
          course_title: '$course.title',
          course_slug: '$course.slug',
          total_registrations: '$count',
          accepted: '$accepted',
          activated: '$activated',
          conversion_rate: {
            $multiply: [
              { $divide: ['$activated', '$count'] },
              100
            ]
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          total: 0,
          submitted: 0,
          under_review: 0,
          accepted: 0,
          activated: 0,
          rejected: 0
        },
        by_course: courseStats
      }
    });
  } catch (error) {
    console.error('Get registration stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching statistics'
    });
  }
});
// lets first get all student registrations 

router.get("/",async(req,res)=>{
  try{
    const studentRegister = await Registration.find()
    console.log(studentRegister)
    res.status(200).send({status:true,data:studentRegister})
  }catch(e){
    console.log("error",e.message)
    res.status(500).send({status:false,message:e.message})
  }
})

export default router;