import bcrypt from 'bcryptjs'
import { generateToken } from '../utils/jwt.js'
import Student from '../models/nextgen/student-management/Student.js'
import Attendance from '../models/nextgen/student-management/Attendance.js'
import Registration from '../models/nextgen/core/Registration.js'
import Announcement from '../models/nextgen/admin/Announcement.js'
import Ticket from '../models/nextgen/support/Ticket.js'
import Certificate from '../models/nextgen/education/Certificate.js'
import HRDocRequest from '../models/nextgen/support/HRRequest.js'
import { Result } from 'express-validator'

async function generateNextStudentId() {
  const count = await Student.countDocuments();
  return `STU${String(count + 1).padStart(6, '0')}`;
}

export const getAllRegistrations = async (req, res) => {
  try {
    const data = await Registration.find();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching registrations:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const enroll = async (req, res) => {
  try {
    const { fullName, email, course, password } = req.body;
    if (!fullName || !email || !course) {
      return res.status(400).json({ message: 'fullName, email and course are required' });
    }

    const existing = await Student.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Email already enrolled' });
    }

    const studentId = await generateNextStudentId();
    const rawPassword = password && String(password).trim().length >= 6 ? password : Math.random().toString(36).slice(-10);
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    const student = await Student.create({
      fullName,
      email: email.toLowerCase(),
      course,
      studentId,
      passwordHash,
      onboarding: { status: 'registered' }
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
      // For MVP: return generated password if user did not provide one
      tempPassword: password ? undefined : rawPassword,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Error enrolling student', error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ message: 'identifier and password are required' });
    }

    const query = identifier.includes('@') ? { email: identifier.toLowerCase() } : { studentId: identifier };
    const student = await Student.findOne(query);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const ok = await bcrypt.compare(password, student.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken({ sid: student._id, studentId: student.studentId, email: student.email, role: 'student' });
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
    return res.status(500).json({ message: 'Error fetching profile', error: err.message });
  }
};

// Admin approval and password set
export const approve = async (req, res) => {
  try {
    const { studentId } = req.params
    const student = await Student.findOneAndUpdate(
      { studentId },
      { $set: { 'onboarding.status': 'approved', 'onboarding.approvedAt': new Date() } },
      { new: true }
    )
    if (!student) return res.status(404).json({ message: 'Student not found' })
    return res.json({ message: 'Approved', studentId: student.studentId })
  } catch (err) {
    return res.status(500).json({ message: 'Approval error', error: err.message })
  }
}

export const setPassword = async (req, res) => {
  try {
    const { identifier, password } = req.body
    if (!identifier || !password) return res.status(400).json({ message: 'identifier and password required' })
    const query = identifier.includes('@') ? { email: identifier.toLowerCase() } : { studentId: identifier }
    const student = await Student.findOne(query)
    if (!student) return res.status(404).json({ message: 'Student not found' })
    student.passwordHash = await bcrypt.hash(password, 10)
    student.onboarding = { ...(student.onboarding || {}), status: 'password_set', passwordSetAt: new Date() }
    await student.save()
    return res.json({ message: 'Password set' })
  } catch (err) {
    return res.status(500).json({ message: 'Set password error', error: err.message })
  }
}

// Attendance: public check-in (no auth)
export const publicCheckIn = async (req, res) => {
  try {
    const { email, name, course_id, note } = req.body
    if (!email || !name) return res.status(400).json({ message: 'email and name required' })
    const today = new Date(); today.setHours(0,0,0,0)
    const rec = await Attendance.create({ student: undefined, date: today, method: 'public', note })
    return res.status(201).json({ message: 'Checked in', id: rec._id })
  } catch (err) {
    return res.status(500).json({ message: 'Check-in error', error: err.message })
  }
}

// Attendance: confirm from dashboard (auth)
export const confirmAttendance = async (req, res) => {
  try {
    const { id } = req.body
    const rec = await Attendance.findByIdAndUpdate(id, { confirmed: true, confirmedAt: new Date(), student: req.user.sid, method: 'dashboard' }, { new: true })
    if (!rec) return res.status(404).json({ message: 'Attendance record not found' })
    return res.json({ message: 'Confirmed', id: rec._id })
  } catch (err) {
    return res.status(500).json({ message: 'Confirm error', error: err.message })
  }
}

// Announcements list (optionally by course)
export const listAnnouncements = async (req, res) => {
  try {
    const { course } = req.query
    const q = course ? { $or: [{ audience: 'all' }, { audience: 'course', course }] } : { audience: 'all' }
    const items = await Announcement.find(q).sort({ publishedAt: -1 }).limit(50)
    return res.json(items)
  } catch (err) {
    return res.status(500).json({ message: 'Announcements error', error: err.message })
  }
}

// Tickets
export const createTicket = async (req, res) => {
  try {
    const { subject, message } = req.body
    if (!subject || !message) return res.status(400).json({ message: 'subject and message required' })
    const t = await Ticket.create({ student: req.user.sid, subject, message })
    return res.status(201).json({ id: t._id })
  } catch (err) {
    return res.status(500).json({ message: 'Create ticket error', error: err.message })
  }
}

export const listTickets = async (req, res) => {
  try {
    const items = await Ticket.find({ student: req.user.sid }).sort({ createdAt: -1 })
    return res.json(items)
  } catch (err) {
    return res.status(500).json({ message: 'Tickets error', error: err.message })
  }
}

// Certificates list
export const listCertificates = async (req, res) => {
  try {
    const items = await Certificate.find({ student: req.user.sid }).sort({ createdAt: -1 })
    return res.json(items)
  } catch (err) {
    return res.status(500).json({ message: 'Certificates error', error: err.message })
  }
}

// HR Documents
export const requestHRDoc = async (req, res) => {
  try {
    const { type, details, delivery } = req.body
    if (!type) return res.status(400).json({ message: 'type required' })
    const r = await HRDocRequest.create({ student: req.user.sid, type, details, delivery })
    return res.status(201).json({ id: r._id })
  } catch (err) {
    return res.status(500).json({ message: 'HR doc request error', error: err.message })
  }
}

export const listHRDocs = async (req, res) => {
  try {
    const items = await HRDocRequest.find({ student: req.user.sid }).sort({ createdAt: -1 })
    return res.json(items)
  } catch (err) {
    return res.status(500).json({ message: 'HR docs error', error: err.message })
  }
}


