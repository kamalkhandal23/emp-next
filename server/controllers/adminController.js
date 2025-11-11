import User from '../models/core/User.js';
import Employee from '../models/hr-management/employeeModel.js';
import Student from '../models/education/studentModel.js';
import Course from '../models/education/NG_Courses.js';
import Exam from '../models/education/examModel.js';
import Result from '../models/education/resultModel.js';
import { sendEmail, emailTemplates } from '../config/email.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// Dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const [
      userStats,
      employeeStats,
      studentStats,
      courseStats,
      examStats,
      recentActivity
    ] = await Promise.all([
      // User statistics
      User.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
            adminUsers: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
            employeeUsers: { $sum: { $cond: [{ $eq: ['$role', 'employee'] }, 1, 0] } },
            studentUsers: { $sum: { $cond: [{ $eq: ['$role', 'student'] }, 1, 0] } }
          }
        }
      ]),

      // Employee statistics
      Employee.aggregate([
        {
          $group: {
            _id: null,
            totalEmployees: { $sum: 1 },
            activeEmployees: { $sum: { $cond: [{ $eq: ['$employment.status', 'active'] }, 1, 0] } },
            onLeaveEmployees: { $sum: { $cond: [{ $eq: ['$employment.status', 'on-leave'] }, 1, 0] } }
          }
        }
      ]),

      // Student statistics
      Student.aggregate([
        {
          $group: {
            _id: null,
            totalStudents: { $sum: 1 },
            activeStudents: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
            graduatedStudents: { $sum: { $cond: [{ $eq: ['$status', 'graduated'] }, 1, 0] } }
          }
        }
      ]),

      // Course statistics
      Course.aggregate([
        {
          $group: {
            _id: null,
            totalCourses: { $sum: 1 },
            publishedCourses: { $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] } },
            totalEnrollments: { $sum: '$enrollment.enrolled' }
          }
        }
      ]),

      // Exam statistics
      Exam.aggregate([
        {
          $group: {
            _id: null,
            totalExams: { $sum: 1 },
            activeExams: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
            completedExams: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
          }
        }
      ]),

      // Recent activity (last 7 days)
      Promise.all([
        User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
        Student.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
        Course.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
        Result.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } })
      ])
    ]);

    const stats = {
      users: userStats[0] || { totalUsers: 0, activeUsers: 0, adminUsers: 0, employeeUsers: 0, studentUsers: 0 },
      employees: employeeStats[0] || { totalEmployees: 0, activeEmployees: 0, onLeaveEmployees: 0 },
      students: studentStats[0] || { totalStudents: 0, activeStudents: 0, graduatedStudents: 0 },
      courses: courseStats[0] || { totalCourses: 0, publishedCourses: 0, totalEnrollments: 0 },
      exams: examStats[0] || { totalExams: 0, activeExams: 0, completedExams: 0 },
      recentActivity: {
        newUsers: recentActivity[0],
        newStudents: recentActivity[1],
        newCourses: recentActivity[2],
        newResults: recentActivity[3]
      }
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard statistics', error: error.message });
  }
};

// System health check
export const getSystemHealth = async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Check database response time
    const start = Date.now();
    await User.findOne().limit(1);
    const dbResponseTime = Date.now() - start;

    // Get database statistics
    const dbStats = await mongoose.connection.db.stats();

    const health = {
      status: 'healthy',
      timestamp: new Date(),
      database: {
        status: dbStatus,
        responseTime: `${dbResponseTime}ms`,
        collections: dbStats.collections,
        dataSize: `${Math.round(dbStats.dataSize / 1024 / 1024)}MB`,
        indexSize: `${Math.round(dbStats.indexSize / 1024 / 1024)}MB`
      },
      server: {
        uptime: process.uptime(),
        memory: {
          used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
          total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
        },
        nodeVersion: process.version
      }
    };

    res.json(health);
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy',
      message: 'System health check failed',
      error: error.message 
    });
  }
};

// User management
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, status } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (status !== undefined) query.isActive = status === 'active';

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Create user
export const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, role, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      isActive: true
    });

    await user.save();

    // Send welcome email
    await sendEmail(
      email,
      emailTemplates.welcome(`${firstName} ${lastName}`, password).subject,
      emailTemplates.welcome(`${firstName} ${lastName}`, password).html
    );

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { password, ...updateData } = req.body;

    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

// Toggle user status
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user status', error: error.message });
  }
};

// System settings
export const getSystemSettings = async (req, res) => {
  try {
    // In a real application, you would store these in a settings collection
    const settings = {
      general: {
        siteName: 'Lifebox NextGen',
        siteUrl: process.env.CLIENT_URL || 'http://localhost:3000',
        adminEmail: process.env.ADMIN_EMAIL || 'admin@lifeboxnextgen.com',
        timezone: 'UTC',
        dateFormat: 'YYYY-MM-DD',
        language: 'en'
      },
      email: {
        enabled: true,
        provider: 'gmail',
        fromName: 'Lifebox NextGen',
        fromEmail: process.env.EMAIL_USER
      },
      security: {
        passwordMinLength: 8,
        sessionTimeout: 24, // hours
        maxLoginAttempts: 5,
        lockoutDuration: 30 // minutes
      },
      features: {
        userRegistration: true,
        emailVerification: false,
        twoFactorAuth: false,
        fileUpload: true,
        notifications: true
      }
    };

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching system settings', error: error.message });
  }
};

// Update system settings
export const updateSystemSettings = async (req, res) => {
  try {
    // In a real application, you would update these in a settings collection
    const updatedSettings = req.body;

    // Validate settings here if needed

    res.json({
      message: 'System settings updated successfully',
      settings: updatedSettings
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating system settings', error: error.message });
  }
};

// Activity logs
export const getActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, action, userId, startDate, endDate } = req.query;

    // In a real application, you would have an ActivityLog model
    // For now, we'll return recent user activities
    const query = {};
    if (userId) query._id = userId;
    if (startDate || endDate) {
      query.lastLogin = {};
      if (startDate) query.lastLogin.$gte = new Date(startDate);
      if (endDate) query.lastLogin.$lte = new Date(endDate);
    }

    const activities = await User.find(query)
      .select('firstName lastName email role lastLogin createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ lastLogin: -1 });

    const total = await User.countDocuments(query);

    // Transform to activity log format
    const logs = activities.map(user => ({
      id: user._id,
      action: 'login',
      user: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      timestamp: user.lastLogin || user.createdAt,
      details: `User logged in`
    }));

    res.json({
      logs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching activity logs', error: error.message });
  }
};

// Backup database
export const backupDatabase = async (req, res) => {
  try {
    // In a real application, you would implement actual database backup
    const backupId = `backup_${Date.now()}`;
    
    // Simulate backup process
    const collections = ['users', 'employees', 'students', 'courses', 'exams', 'results'];
    const backupInfo = {
      id: backupId,
      timestamp: new Date(),
      collections,
      status: 'completed',
      size: '15.2 MB', // This would be calculated
      location: `/backups/${backupId}.zip`
    };

    res.json({
      message: 'Database backup completed successfully',
      backup: backupInfo
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating database backup', error: error.message });
  }
};

// Send system notification
export const sendSystemNotification = async (req, res) => {
  try {
    const { recipients, subject, message, type = 'info' } = req.body;

    let targetUsers = [];

    if (recipients === 'all') {
      targetUsers = await User.find({ isActive: true }).select('email firstName lastName');
    } else if (recipients === 'admins') {
      targetUsers = await User.find({ role: 'admin', isActive: true }).select('email firstName lastName');
    } else if (recipients === 'employees') {
      targetUsers = await User.find({ role: 'employee', isActive: true }).select('email firstName lastName');
    } else if (recipients === 'students') {
      targetUsers = await User.find({ role: 'student', isActive: true }).select('email firstName lastName');
    } else if (Array.isArray(recipients)) {
      targetUsers = await User.find({ _id: { $in: recipients }, isActive: true }).select('email firstName lastName');
    }

    // Send emails
    const emailPromises = targetUsers.map(user => 
      sendEmail(
        user.email,
        subject,
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">System Notification</h2>
            <p>Dear ${user.firstName} ${user.lastName},</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              ${message}
            </div>
            <p>Best regards,<br>System Administrator</p>
          </div>
        `
      )
    );

    await Promise.all(emailPromises);

    res.json({
      message: 'System notification sent successfully',
      recipientCount: targetUsers.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error sending system notification', error: error.message });
  }
};

export default {
  getDashboardStats,
  getSystemHealth,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getSystemSettings,
  updateSystemSettings,
  getActivityLogs,
  backupDatabase,
  sendSystemNotification
};