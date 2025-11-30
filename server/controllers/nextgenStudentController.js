import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt.js';
import Student from '../models/nextgen/student-management/Student.js';
import Attendance from '../models/nextgen/student-management/Attendance.js';
import Registration from '../models/nextgen/core/Registration.js';
import Announcement from '../models/nextgen/admin/Announcement.js';
import Ticket from '../models/nextgen/support/Ticket.js';
import Certificate from '../models/nextgen/education/Certificate.js';
import HRDocRequest from '../models/nextgen/support/HRRequest.js';
import NG_Courses from '../models/education/NG_Courses.js';
import { Result } from 'express-validator';

import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { fileURLToPath } from 'url';

/* ------------------------ Upload Setup ------------------------ */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

export const upload = multer({ storage });

/* ------------------------ Utility ------------------------ */
async function generateNextStudentId() {
  const count = await Student.countDocuments();
  return `STU${String(count + 1).padStart(6, '0')}`;
}

/* ------------------------ Registration with Docs ------------------------ */
export const registerWithDocs = async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone,
      course_id,
      date_of_birth,
      education,
      experience,
      motivation,
    } = req.body;

    if (!full_name || !email || !course_id) {
      return res
        .status(400)
        .json({ message: 'full_name, email, and course_id are required' });
    }

    // Base registration
    const registration = new Registration({
      full_name,
      email: email.toLowerCase(),
      phone,
      course_id,
      date_of_birth,
      education,
      experience,
      motivation,
      status: 'submitted',
    });

    // ✅ Handle uploads
    if (req.files && Object.keys(req.files).length > 0) {
      registration.documents = [];

      // Passport photo
      if (req.files.passport_photo && req.files.passport_photo[0]) {
        const file = req.files.passport_photo[0];
        registration.passport_photo = `/uploads/${file.filename}`;
        registration.documents.push({
          name: 'Passport Size Photo',
          url: `/uploads/${file.filename}`,
          type: file.mimetype,
        });
      }

      // Additional documents
      if (req.files.documents && req.files.documents.length > 0) {
        req.files.documents.forEach((file) => {
          registration.documents.push({
            name: file.originalname,
            url: `/uploads/${file.filename}`,
            type: file.mimetype,
          });
        });
      }
    }

    await registration.save();

    return res.status(201).json({
      success: true,
      message: 'Registration created successfully',
      registration: {
        id: registration._id,
        full_name: registration.full_name,
        email: registration.email,
        course_id: registration.course_id,
        status: registration.status,
        documentCount: registration.documents?.length || 0,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res
      .status(500)
      .json({ message: 'Error creating registration', error: err.message });
  }
};

/* ------------------------ Existing Controllers ------------------------ */

export const getAllRegistrations = async (req, res) => {
  try {
    const data = await Registration.find();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const enroll = async (req, res) => {
  try {
    const { fullName, email, course, password } = req.body;
    if (!fullName || !email || !course) {
      return res
        .status(400)
        .json({ message: 'fullName, email and course are required' });
    }

    // Check if course exists and validate timing
    const courseDoc = await NG_Courses.findOne({
      $or: [{ slug: course }, { _id: course }],
    });

    if (!courseDoc) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check course visibility
    if (courseDoc.visibility !== 'published') {
      return res.status(400).json({
        message: 'This course is not available for enrollment',
        reason: 'Course is not published',
      });
    }

    // Check registration timing
    const now = new Date();

    if (
      courseDoc.registration_start &&
      now < new Date(courseDoc.registration_start)
    ) {
      return res.status(400).json({
        message: 'Registration has not started yet',
        registrationStarts: courseDoc.registration_start,
      });
    }

    if (
      courseDoc.registration_end &&
      now > new Date(courseDoc.registration_end)
    ) {
      return res.status(400).json({
        message: 'Registration period has ended',
        registrationEnded: courseDoc.registration_end,
      });
    }

    // Check if course has ended
    if (courseDoc.end_date && now > new Date(courseDoc.end_date)) {
      return res.status(400).json({
        message: 'This course has already ended',
        courseEnded: courseDoc.end_date,
      });
    }

    const existing = await Student.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Email already enrolled' });
    }

    const studentId = await generateNextStudentId();
    const rawPassword =
      password && String(password).trim().length >= 6
        ? password
        : Math.random().toString(36).slice(-10);
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    const student = await Student.create({
      fullName,
      email: email.toLowerCase(),
      course,
      studentId,
      passwordHash,
      onboarding: { status: 'registered' },
    });

    return res.status(201).json({
      message: 'Enrollment successful',
      student: {
        id: student._id,
        studentId: student.studentId,
        fullName: student.fullName,
        email: student.email,
        course: student.course,
      },
      tempPassword: password ? undefined : rawPassword,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: 'Error enrolling student', error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res
        .status(400)
        .json({ message: 'identifier and password are required' });
    }

    const query = identifier.includes('@')
      ? { email: identifier.toLowerCase() }
      : { studentId: identifier };
    const student = await Student.findOne(query);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const ok = await bcrypt.compare(password, student.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken({
      sid: student._id,
      studentId: student.studentId,
      email: student.email,
      role: 'student',
    });

    return res.status(200).json({
      token,
      student: {
        id: student._id,
        studentId: student.studentId,
        fullName: student.fullName,
        email: student.email,
        course: student.course,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: 'Login error', error: err.message });
  }
};

export const me = async (req, res) => {
  try {
    const student = await Student.findById(req.user.sid);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    return res.status(200).json({
      student: {
        id: student._id,
        studentId: student.studentId,
        fullName: student.fullName,
        email: student.email,
        course: student.course,
        exams: student.exams || [],
        onboarding: student.onboarding,
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: 'Error fetching profile', error: err.message });
  }
};

export const approve = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findOneAndUpdate(
      { studentId },
      {
        $set: {
          'onboarding.status': 'approved',
          'onboarding.approvedAt': new Date(),
        },
      },
      { new: true }
    );
    if (!student) return res.status(404).json({ message: 'Student not found' });
    return res.json({ message: 'Approved', studentId: student.studentId });
  } catch (err) {
    return res
      .status(500)
      .json({ message: 'Approval error', error: err.message });
  }
};

export const setPassword = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password)
      return res
        .status(400)
        .json({ message: 'identifier and password required' });
    const query = identifier.includes('@')
      ? { email: identifier.toLowerCase() }
      : { studentId: identifier };
    const student = await Student.findOne(query);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    student.passwordHash = await bcrypt.hash(password, 10);
    student.onboarding = {
      ...(student.onboarding || {}),
      status: 'password_set',
      passwordSetAt: new Date(),
    };
    await student.save();
    return res.json({ message: 'Password set' });
  } catch (err) {
    return res
      .status(500)
      .json({ message: 'Set password error', error: err.message });
  }
};
