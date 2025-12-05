import express from 'express';
import mongoose from 'mongoose';
import Registration from '../../../models/nextgen/core/Registration.js';
import { auth } from '../../../middleware/auth.js';
import { sendEmail } from '../../../config/email.js';
import ngStudent from '../../../models/ng_student.js';
import NG_Approved_Students from '../../../models/nextgen/core/NG_ApprovedStudents.js';
import ngRejectedStudent from '../../../models/ng_rejected_students.js';
const router = express.Router();
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail } from '../../../utils/mailer.js';
import { sendRejectionEmail } from '../../../utils/mailer.js';

/* -------------------- Helper Middleware -------------------- */
const ensureAdminOrManager = (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ success: false, message: 'Unauthorized. Please login.' });
  }
  if (!['admin', 'super_admin', 'course_manager'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only Admin or Course Manager allowed.',
    });
  }
  next();
};

/* -------------------- APPROVE REGISTRATION -------------------- */
router.put('/:id/approve', auth, ensureAdminOrManager, async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res
        .status(404)
        .json({ success: false, message: 'Registration not found' });
    }

    // Reviewer check
    const reviewerId = mongoose.Types.ObjectId.isValid(req.user?._id)
      ? req.user._id
      : new mongoose.Types.ObjectId('670b9a7b5f2c2b4d9ef4f9a1');

    //  Check if already exists // here it should find in   ng_approved students
    const existingStudent = await NG_Approved_Students.findOne({
      email: registration.email,
    });
    if (existingStudent) {
      return res.json({
        success: true,
        message: 'Registration already approved — student already exists.',
        data: {
          registrationId: registration._id,
          studentId: existingStudent.student_id,
        },
      });
    }

    //  Update registration
    registration.status = 'approved';
    registration.reviewed_by = reviewerId;
    registration.reviewed_at = new Date();
    await registration.save();

    // Generate unique student_id
    let studentCode;
    let isUnique = false;
    for (let i = 0; i < 5 && !isUnique; i++) {
      const count = await NG_Approved_Students.countDocuments();
      studentCode = `STU${(count + 1 + i).toString().padStart(4, '0')}`;
      const exists = await NG_Approved_Students.findOne({
        student_id: studentCode,
      });
      if (!exists) isUnique = true;
    }

    if (!isUnique) {
      return res.status(500).json({
        success: false,
        message:
          'Failed to generate unique student_id after multiple attempts.',
      });
    }

    // Generate random password
    const plainPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    //  Create new student entry
    const newStudent = new NG_Approved_Students({
      user_id: registration.user_id || new mongoose.Types.ObjectId(),
      student_id: studentCode,
      fullName: registration.full_name || registration.fullName,
      email: registration.email,
      phone: registration.phone?.c || registration.phone,
      course: registration.course_id,
      address: registration.address,
      password: hashedPassword, // this is for checking purpose only, it has to replace with this hashedPassword
      registeredAt: new Date(),
      registrationRef: registration._id,
    });

    await newStudent.save();

    //  Send welcome email with credentials
    try {
      await sendWelcomeEmail(
        registration.email,
        registration.full_name || 'Student',
        plainPassword,
        studentCode
      );
    } catch (emailErr) {
      console.warn('Email send failed (ignored):', emailErr.message);
    }

    res.json({
      success: true,
      message:
        'Registration approved successfully, student added to ng_approved, and credentials emailed.',
      data: { registrationId: registration._id, studentId: studentCode },
    });
  } catch (error) {
    console.error('Error approving registration:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving registration.',
      error: error.message,
    });
  }
});

/* -------------------- REJECT REGISTRATION -------------------- */
router.put('/:id/reject', auth, ensureAdminOrManager, async (req, res) => {
  try {
    const { reason } = req.body;
    const registrationId = req.params.id;

    // 🔹 1. Find registration
    const registration = await Registration.findById(registrationId);
    if (!registration) {
      return res
        .status(404)
        .json({ success: false, message: 'Registration not found' });
    }

    // 🔹 2. Identify reviewer
    const reviewerId = mongoose.Types.ObjectId.isValid(req.user?._id)
      ? req.user._id
      : new mongoose.Types.ObjectId('670b9a7b5f2c2b4d9ef4f9a1');

    // 🔹 3. Update registration status
    registration.status = 'rejected';
    registration.rejectionReason = reason || 'No reason provided';
    registration.reviewed_by = reviewerId;
    registration.reviewed_at = new Date();
    await registration.save();

    // 🔹 4. Insert entry in ng_rejected_students
    try {
      await ngRejectedStudent.create({
        registrationRef: registration._id,
        fullName: registration.full_name || registration.fullName,
        email: registration.email,
        phone: registration.phone?.c || registration.phone,
        course: registration.course_id,
        reason: registration.rejectionReason,
        reviewed_by: reviewerId,
        reviewed_at: registration.reviewed_at,
      });

      console.log(' Rejected student saved to ng_rejected_students');
    } catch (dbErr) {
      console.error(' Failed to insert rejected student:', dbErr.message);
    }

    // 🔹 5. Send rejection email
    try {
      await sendRejectionEmail(
        registration.email,
        registration.full_name || 'Student',
        registration.rejectionReason
      );
      console.log(' Rejection email sent successfully!');
    } catch (err) {
      console.warn(' Email send failed:', err.message);
    }

    // 🔹 6. Send API response
    res.json({
      success: true,
      message:
        'Registration rejected successfully and record added to ng_rejected_students.',
    });
  } catch (error) {
    console.error('Error rejecting registration:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting registration.',
      error: error.message,
    });
  }
});

/* -------------------- GET ALL REGISTRATIONS -------------------- */
router.get('/', auth, ensureAdminOrManager, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { full_name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const registrations = await Registration.find(query)
      .populate('course_id', 'title slug')
      .populate('reviewed_by', 'full_name email role')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(Number(limit))
      .skip((page - 1) * limit);

    const total = await Registration.countDocuments(query);

    res.json({
      success: true,
      data: {
        registrations,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get registrations error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Server error fetching registrations' });
  }
});

/* -------------------- DELETE REGISTRATION -------------------- */
router.delete('/:id', auth, ensureAdminOrManager, async (req, res) => {
  try {
    const { id } = req.params;
    const registration = await Registration.findById(id);
    if (!registration) {
      return res
        .status(404)
        .json({ success: false, message: 'Registration not found' });
    }

    await Registration.findByIdAndDelete(id);

    // Optionally remove any uploaded files or related records here

    res.json({ success: true, message: 'Registration deleted successfully' });
  } catch (error) {
    console.error('Error deleting registration:', error);
    res
      .status(500)
      .json({
        success: false,
        message: 'Server error while deleting registration',
        error: error.message,
      });
  }
});

export default router;
