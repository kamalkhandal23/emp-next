import EmployeeProfile from '../models/hr-management/EmployeeProfile.js';
import EmployeePerformance from '../models/hr-management/EmployeePerformance.js';
import EmployeeBenefits from '../models/hr-management/EmployeeBenefits.js';
import User from '../models/core/User.js';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Employee Profile Controllers
export const getEmployeeProfile = async (req, res) => {
  try {
    const employeeId = req.params.id || req.user.id;
    
    const profile = await EmployeeProfile.findOne({ employee: employeeId })
      .populate('employee', 'firstName lastName email employeeId department position');
    
    if (!profile) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }
    
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employee profile', error: error.message });
  }
};

export const updateEmployeeProfile = async (req, res) => {
  try {
    const employeeId = req.params.id || req.user.id;
    
    let profile = await EmployeeProfile.findOne({ employee: employeeId });
    
    if (!profile) {
      profile = new EmployeeProfile({ employee: employeeId, ...req.body });
    } else {
      Object.assign(profile, req.body);
    }
    
    await profile.save();
    await profile.populate('employee', 'firstName lastName email employeeId');
    
    res.json({
      message: 'Profile updated successfully',
      profile
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

export const addEmployeeSkill = async (req, res) => {
  try {
    const employeeId = req.params.id || req.user.id;
    const skillData = req.body;
    
    let profile = await EmployeeProfile.findOne({ employee: employeeId });
    if (!profile) {
      profile = new EmployeeProfile({ employee: employeeId });
    }
    
    await profile.addSkill(skillData);
    
    res.json({
      message: 'Skill added successfully',
      skills: profile.skills
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding skill', error: error.message });
  }
};

// Employee Performance Controllers
export const getEmployeePerformance = async (req, res) => {
  try {
    const employeeId = req.params.id || req.user.id;
    const { year, quarter } = req.query;
    
    const query = { employee: employeeId };
    if (year) query.year = parseInt(year);
    if (quarter) query.quarter = quarter;
    
    const performance = await EmployeePerformance.find(query)
      .populate('employee', 'firstName lastName email employeeId')
      .populate('reviewer', 'firstName lastName email')
      .sort({ 'reviewPeriod.startDate': -1 });
    
    res.json(performance);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching performance data', error: error.message });
  }
};

export const createPerformanceReview = async (req, res) => {
  try {
    const reviewData = {
      ...req.body,
      reviewer: req.user.id
    };
    
    const performance = new EmployeePerformance(reviewData);
    await performance.save();
    
    await performance.populate('employee reviewer');
    
    res.status(201).json({
      message: 'Performance review created successfully',
      performance
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating performance review', error: error.message });
  }
};

export const updatePerformanceReview = async (req, res) => {
  try {
    const performance = await EmployeePerformance.findByIdAndUpdate(
      req.params.reviewId,
      req.body,
      { new: true, runValidators: true }
    ).populate('employee reviewer');
    
    if (!performance) {
      return res.status(404).json({ message: 'Performance review not found' });
    }
    
    res.json({
      message: 'Performance review updated successfully',
      performance
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating performance review', error: error.message });
  }
};

export const getPerformanceTrends = async (req, res) => {
  try {
    const employeeId = req.params.id || req.user.id;
    const years = parseInt(req.query.years) || 2;
    
    const trends = await EmployeePerformance.getPerformanceTrends(employeeId, years);
    
    res.json(trends);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching performance trends', error: error.message });
  }
};

// Employee Timesheet Controllers
export const getEmployeeTimesheet = async (req, res) => {
  try {
    const employeeId = req.params.id || req.user.id;
    const { startDate, endDate, month, year } = req.query;
    
    let query = { employee: employeeId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      query.date = { $gte: start, $lte: end };
    }
    
    const timesheets = await EmployeeTimesheet.find(query)
      .populate('employee', 'firstName lastName email employeeId')
      .populate('projects.project', 'name code')
      .sort({ date: -1 });
    
    res.json(timesheets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching timesheet', error: error.message });
  }
};

export const createTimesheet = async (req, res) => {
  try {
    const timesheetData = {
      ...req.body,
      employee: req.user.id
    };
    
    // Check if timesheet already exists for the date
    const existingTimesheet = await EmployeeTimesheet.findOne({
      employee: req.user.id,
      date: new Date(req.body.date)
    });
    
    if (existingTimesheet) {
      return res.status(400).json({ message: 'Timesheet already exists for this date' });
    }
    
    const timesheet = new EmployeeTimesheet(timesheetData);
    await timesheet.save();
    
    res.status(201).json({
      message: 'Timesheet created successfully',
      timesheet
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating timesheet', error: error.message });
  }
};

export const updateTimesheet = async (req, res) => {
  try {
    const timesheet = await EmployeeTimesheet.findByIdAndUpdate(
      req.params.timesheetId,
      req.body,
      { new: true, runValidators: true }
    ).populate('projects.project', 'name code');
    
    if (!timesheet) {
      return res.status(404).json({ message: 'Timesheet not found' });
    }
    
    res.json({
      message: 'Timesheet updated successfully',
      timesheet
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating timesheet', error: error.message });
  }
};

export const checkIn = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if employee already has an active shift (not checked out)
    let timesheet = await EmployeeTimesheet.findOne({
      employee: req.user.id,
      date: today
    });
    
    if (timesheet && timesheet.shifts.length > 0) {
      const lastShift = timesheet.shifts[timesheet.shifts.length - 1];
      if (!lastShift.checkOut || !lastShift.checkOut.time) {
        return res.status(400).json({ 
          message: 'You are already checked in. Please check out first.',
          currentShift: lastShift
        });
      }
    }
    
    if (!timesheet) {
      timesheet = new EmployeeTimesheet({
        employee: req.user.id,
        date: today,
        workType: req.body.workType || 'office',
        shifts: []
      });
    }
    
    // Prepare check-in data with location and device info
    const checkInData = {
      location: {
        type: req.body.location?.type || 'office',
        address: req.body.location?.address || '',
        coordinates: req.body.location?.coordinates || {}
      },
      method: req.body.method || 'web',
      deviceInfo: req.body.deviceInfo || req.get('User-Agent'),
      ipAddress: req.ip || req.connection.remoteAddress
    };
    
    await timesheet.checkIn(checkInData);
    
    // Populate employee info for response
    await timesheet.populate('employee', 'firstName lastName employeeId');
    
    // Check if check-in is late (after 9:30 AM)
    const checkInTime = new Date();
    const lateThreshold = new Date(today);
    lateThreshold.setHours(9, 30, 0, 0);
    
    if (checkInTime > lateThreshold) {
      timesheet.flags.push({
        type: 'late-entry',
        description: `Checked in at ${checkInTime.toLocaleTimeString()}`,
        severity: 'medium'
      });
      await timesheet.save();
    }
    
    res.json({
      message: 'Checked in successfully',
      timesheet,
      checkInTime: checkInTime,
      isLate: checkInTime > lateThreshold
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: 'Error checking in', error: error.message });
  }
};

export const checkOut = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const timesheet = await EmployeeTimesheet.findOne({
      employee: req.user.id,
      date: today
    });
    
    if (!timesheet || timesheet.shifts.length === 0) {
      return res.status(404).json({ message: 'No active timesheet found. Please check in first.' });
    }
    
    const lastShift = timesheet.shifts[timesheet.shifts.length - 1];
    if (lastShift.checkOut && lastShift.checkOut.time) {
      return res.status(400).json({ 
        message: 'You are already checked out.',
        lastCheckOut: lastShift.checkOut.time
      });
    }
    
    // Prepare check-out data
    const checkOutData = {
      location: {
        type: req.body.location?.type || 'office',
        address: req.body.location?.address || '',
        coordinates: req.body.location?.coordinates || {}
      },
      method: req.body.method || 'web',
      deviceInfo: req.body.deviceInfo || req.get('User-Agent'),
      ipAddress: req.ip || req.connection.remoteAddress
    };
    
    await timesheet.checkOut(checkOutData);
    
    // Populate employee info for response
    await timesheet.populate('employee', 'firstName lastName employeeId');
    
    // Check if check-out is early (before 5:30 PM)
    const checkOutTime = new Date();
    const earlyThreshold = new Date(today);
    earlyThreshold.setHours(17, 30, 0, 0);
    
    if (checkOutTime < earlyThreshold) {
      timesheet.flags.push({
        type: 'early-exit',
        description: `Checked out at ${checkOutTime.toLocaleTimeString()}`,
        severity: 'medium'
      });
    }
    
    // Check for overtime (after 6:00 PM)
    const overtimeThreshold = new Date(today);
    overtimeThreshold.setHours(18, 0, 0, 0);
    
    if (checkOutTime > overtimeThreshold) {
      timesheet.flags.push({
        type: 'overtime',
        description: `Worked overtime until ${checkOutTime.toLocaleTimeString()}`,
        severity: 'low'
      });
    }
    
    await timesheet.save();
    
    // Calculate total hours worked
    const totalHours = lastShift.hoursWorked || 0;
    const overtimeHours = Math.max(0, totalHours - 8);
    
    res.json({
      message: 'Checked out successfully',
      timesheet,
      checkOutTime: checkOutTime,
      totalHoursWorked: totalHours,
      overtimeHours: overtimeHours,
      isEarlyExit: checkOutTime < earlyThreshold,
      isOvertime: checkOutTime > overtimeThreshold
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ message: 'Error checking out', error: error.message });
  }
};

export const getTimesheetSummary = async (req, res) => {
  try {
    const employeeId = req.params.id || req.user.id;
    const { startDate, endDate } = req.query;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const summary = await EmployeeTimesheet.getEmployeeSummary(employeeId, start, end);
    
    res.json(summary[0] || {
      totalDays: 0,
      totalRegularHours: 0,
      totalOvertimeHours: 0,
      averageProductivity: 0,
      totalExpenses: 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching timesheet summary', error: error.message });
  }
};

// Employee Benefits Controllers
export const getEmployeeBenefits = async (req, res) => {
  try {
    const employeeId = req.params.id || req.user.id;
    
    let benefits = await EmployeeBenefits.findOne({ employee: employeeId })
      .populate('employee', 'firstName lastName email employeeId');
    
    if (!benefits) {
      // Create default benefits record
      benefits = new EmployeeBenefits({ employee: employeeId });
      await benefits.save();
      await benefits.populate('employee', 'firstName lastName email employeeId');
    }
    
    res.json(benefits);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching benefits', error: error.message });
  }
};

export const updateEmployeeBenefits = async (req, res) => {
  try {
    const employeeId = req.params.id || req.user.id;
    
    const benefits = await EmployeeBenefits.findOneAndUpdate(
      { employee: employeeId },
      req.body,
      { new: true, upsert: true, runValidators: true }
    ).populate('employee', 'firstName lastName email employeeId');
    
    res.json({
      message: 'Benefits updated successfully',
      benefits
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating benefits', error: error.message });
  }
};

export const enrollHealthInsurance = async (req, res) => {
  try {
    const employeeId = req.params.id || req.user.id;
    
    let benefits = await EmployeeBenefits.findOne({ employee: employeeId });
    if (!benefits) {
      benefits = new EmployeeBenefits({ employee: employeeId });
    }
    
    await benefits.enrollHealthInsurance(req.body);
    
    res.json({
      message: 'Health insurance enrollment successful',
      healthInsurance: benefits.healthInsurance
    });
  } catch (error) {
    res.status(500).json({ message: 'Error enrolling in health insurance', error: error.message });
  }
};

export const useFlexiBenefit = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { category, amount, description, receipt } = req.body;
    
    const benefits = await EmployeeBenefits.findOne({ employee: employeeId });
    if (!benefits) {
      return res.status(404).json({ message: 'Benefits record not found' });
    }
    
    await benefits.useFlexiBenefit(category, amount, description, receipt);
    
    res.json({
      message: 'Flexi benefit used successfully',
      flexiBenefits: benefits.flexiBenefits
    });
  } catch (error) {
    res.status(500).json({ message: 'Error using flexi benefit', error: error.message });
  }
};

// Dashboard Controllers
export const getEmployeeDashboard = async (req, res) => {
  try {
    const employeeId = req.user.id;
    
    // Get basic employee info
    const employee = await User.findById(employeeId)
      .select('firstName lastName email employeeId department position');
    
    // Get recent performance
    const recentPerformance = await EmployeePerformance.findOne({ employee: employeeId })
      .sort({ 'reviewPeriod.startDate': -1 })
      .populate('reviewer', 'firstName lastName');
    
    // Get current month timesheet summary
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    const timesheetSummary = await EmployeeTimesheet.getEmployeeSummary(
      employeeId, startOfMonth, endOfMonth
    );
    
    // Get benefits summary
    const benefits = await EmployeeBenefits.findOne({ employee: employeeId });
    
    // Get today's timesheet
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimesheet = await EmployeeTimesheet.findOne({
      employee: employeeId,
      date: today
    });
    
    const dashboard = {
      employee,
      recentPerformance,
      timesheetSummary: timesheetSummary[0] || {
        totalDays: 0,
        totalRegularHours: 0,
        totalOvertimeHours: 0,
        averageProductivity: 0
      },
      benefits: benefits ? {
        totalMonthlyDeductions: benefits.totalMonthlyDeductions,
        flexiBenefitsUtilization: benefits.flexiBenefitsUtilization,
        leaveBalance: benefits.leavePolicy
      } : null,
      todayTimesheet,
      quickStats: {
        isCheckedIn: todayTimesheet && todayTimesheet.shifts.length > 0 && 
                    !todayTimesheet.shifts[todayTimesheet.shifts.length - 1].checkOut,
        totalLeaveBalance: benefits ? 
          Object.values(benefits.leavePolicy).reduce((sum, leave) => sum + (leave.remaining || 0), 0) : 0
      }
    };
    
    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard', error: error.message });
  }
};

export const getTeamDashboard = async (req, res) => {
  try {
    const managerId = req.user.id;
    
    // Get team members
    const teamMembers = await User.find({ manager: managerId })
      .select('_id firstName lastName email employeeId');
    
    const memberIds = teamMembers.map(member => member._id);
    
    // Get team performance summary
    const currentYear = new Date().getFullYear();
    const teamPerformance = await EmployeePerformance.getTeamPerformanceSummary(memberIds, currentYear);
    
    // Get team productivity report
    const startOfMonth = new Date(currentYear, new Date().getMonth(), 1);
    const endOfMonth = new Date(currentYear, new Date().getMonth() + 1, 0);
    
    const productivityReport = await EmployeeTimesheet.getTeamProductivityReport(
      memberIds, startOfMonth, endOfMonth
    );
    
    res.json({
      teamMembers,
      teamPerformance: teamPerformance[0] || {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: []
      },
      productivityReport
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching team dashboard', error: error.message });
  }
};

// Break Management Controllers
export const startBreak = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const timesheet = await EmployeeTimesheet.findOne({
      employee: req.user.id,
      date: today
    });
    
    if (!timesheet || timesheet.shifts.length === 0) {
      return res.status(404).json({ message: 'No active timesheet found. Please check in first.' });
    }
    
    const currentShift = timesheet.shifts[timesheet.shifts.length - 1];
    if (currentShift.checkOut && currentShift.checkOut.time) {
      return res.status(400).json({ message: 'Cannot start break after checking out.' });
    }
    
    // Check if there's already an active break
    const activeBreak = currentShift.breaks.find(breakItem => 
      breakItem.startTime && !breakItem.endTime
    );
    
    if (activeBreak) {
      return res.status(400).json({ 
        message: 'You already have an active break. Please end it first.',
        activeBreak
      });
    }
    
    const breakData = {
      startTime: new Date(),
      type: req.body.type || 'personal',
      reason: req.body.reason || ''
    };
    
    currentShift.breaks.push(breakData);
    await timesheet.save();
    
    res.json({
      message: 'Break started successfully',
      break: currentShift.breaks[currentShift.breaks.length - 1],
      timesheet
    });
  } catch (error) {
    console.error('Start break error:', error);
    res.status(500).json({ message: 'Error starting break', error: error.message });
  }
};

export const endBreak = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const timesheet = await EmployeeTimesheet.findOne({
      employee: req.user.id,
      date: today
    });
    
    if (!timesheet || timesheet.shifts.length === 0) {
      return res.status(404).json({ message: 'No active timesheet found.' });
    }
    
    const currentShift = timesheet.shifts[timesheet.shifts.length - 1];
    const activeBreak = currentShift.breaks.find(breakItem => 
      breakItem.startTime && !breakItem.endTime
    );
    
    if (!activeBreak) {
      return res.status(400).json({ message: 'No active break found.' });
    }
    
    const endTime = new Date();
    activeBreak.endTime = endTime;
    
    // Calculate break duration in minutes
    const duration = Math.round((endTime - activeBreak.startTime) / (1000 * 60));
    activeBreak.duration = duration;
    
    // Flag long breaks (more than 90 minutes)
    if (duration > 90) {
      timesheet.flags.push({
        type: 'long-break',
        description: `Break lasted ${duration} minutes`,
        severity: 'medium'
      });
    }
    
    await timesheet.save();
    
    res.json({
      message: 'Break ended successfully',
      break: activeBreak,
      duration: `${Math.floor(duration / 60)}h ${duration % 60}m`,
      timesheet
    });
  } catch (error) {
    console.error('End break error:', error);
    res.status(500).json({ message: 'Error ending break', error: error.message });
  }
};

// Attendance Status Controllers
export const getCurrentStatus = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const timesheet = await EmployeeTimesheet.findOne({
      employee: req.user.id,
      date: today
    }).populate('employee', 'firstName lastName employeeId');
    
    if (!timesheet) {
      return res.json({
        status: 'not-checked-in',
        message: 'Not checked in today',
        employee: req.user
      });
    }
    
    const lastShift = timesheet.shifts[timesheet.shifts.length - 1];
    let status = 'not-checked-in';
    let currentBreak = null;
    
    if (lastShift) {
      if (lastShift.checkOut && lastShift.checkOut.time) {
        status = 'checked-out';
      } else if (lastShift.checkIn && lastShift.checkIn.time) {
        // Check if on break
        currentBreak = lastShift.breaks.find(breakItem => 
          breakItem.startTime && !breakItem.endTime
        );
        
        status = currentBreak ? 'on-break' : 'checked-in';
      }
    }
    
    // Calculate hours worked so far
    let hoursWorkedToday = 0;
    if (lastShift && lastShift.checkIn) {
      const endTime = lastShift.checkOut?.time || new Date();
      const startTime = lastShift.checkIn.time;
      hoursWorkedToday = (endTime - startTime) / (1000 * 60 * 60);
      
      // Subtract break time
      const totalBreakTime = lastShift.breaks.reduce((total, breakItem) => {
        if (breakItem.duration) {
          return total + breakItem.duration;
        }
        return total;
      }, 0);
      
      hoursWorkedToday -= totalBreakTime / 60;
      hoursWorkedToday = Math.max(0, Math.round(hoursWorkedToday * 100) / 100);
    }
    
    res.json({
      status,
      timesheet,
      currentBreak,
      hoursWorkedToday,
      flags: timesheet?.flags || [],
      lastCheckIn: lastShift?.checkIn?.time,
      lastCheckOut: lastShift?.checkOut?.time
    });
  } catch (error) {
    console.error('Get current status error:', error);
    res.status(500).json({ message: 'Error fetching current status', error: error.message });
  }
};

// Work Log Controllers
export const addWorkLog = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let timesheet = await EmployeeTimesheet.findOne({
      employee: req.user.id,
      date: today
    });
    
    if (!timesheet) {
      timesheet = new EmployeeTimesheet({
        employee: req.user.id,
        date: today,
        workType: 'office',
        shifts: [],
        projects: []
      });
    }
    
    const { projectId, taskDescription, timeSpent, status, notes } = req.body;
    
    await timesheet.addWorkEntry(projectId, {
      description: taskDescription,
      timeSpent: parseInt(timeSpent), // in minutes
      status: status || 'in-progress',
      notes: notes || ''
    });
    
    res.json({
      message: 'Work log added successfully',
      timesheet
    });
  } catch (error) {
    console.error('Add work log error:', error);
    res.status(500).json({ message: 'Error adding work log', error: error.message });
  }
};

// Attendance Reports
export const getAttendanceReport = async (req, res) => {
  try {
    const employeeId = req.params.id || req.user.id;
    const { startDate, endDate, month, year } = req.query;
    
    let dateQuery = {};
    
    if (startDate && endDate) {
      dateQuery = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      dateQuery = { $gte: start, $lte: end };
    } else {
      // Default to current month
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      dateQuery = { $gte: start, $lte: end };
    }
    
    const attendanceData = await EmployeeTimesheet.find({
      employee: employeeId,
      date: dateQuery
    }).populate('employee', 'firstName lastName employeeId')
      .populate('projects.project', 'name code')
      .sort({ date: 1 });
    
    // Calculate summary statistics
    const summary = {
      totalDays: attendanceData.length,
      presentDays: attendanceData.filter(record => record.shifts.length > 0).length,
      totalHours: attendanceData.reduce((sum, record) => sum + (record.totalHours.regular || 0), 0),
      totalOvertimeHours: attendanceData.reduce((sum, record) => sum + (record.totalHours.overtime || 0), 0),
      averageHoursPerDay: 0,
      lateArrivals: attendanceData.filter(record => 
        record.flags.some(flag => flag.type === 'late-entry')
      ).length,
      earlyDepartures: attendanceData.filter(record => 
        record.flags.some(flag => flag.type === 'early-exit')
      ).length,
      overtimeDays: attendanceData.filter(record => 
        record.flags.some(flag => flag.type === 'overtime')
      ).length
    };
    
    if (summary.presentDays > 0) {
      summary.averageHoursPerDay = Math.round((summary.totalHours / summary.presentDays) * 100) / 100;
    }
    
    res.json({
      attendanceData,
      summary,
      period: { startDate: dateQuery.$gte, endDate: dateQuery.$lte }
    });
  } catch (error) {
    console.error('Get attendance report error:', error);
    res.status(500).json({ message: 'Error fetching attendance report', error: error.message });
  }
};

export default {
  // Profile
  getEmployeeProfile,
  updateEmployeeProfile,
  addEmployeeSkill,
  
  // Performance
  getEmployeePerformance,
  createPerformanceReview,
  updatePerformanceReview,
  getPerformanceTrends,
  
  // Timesheet
  getEmployeeTimesheet,
  createTimesheet,
  updateTimesheet,
  checkIn,
  checkOut,
  getTimesheetSummary,
  
  // Benefits
  getEmployeeBenefits,
  updateEmployeeBenefits,
  enrollHealthInsurance,
  useFlexiBenefit,
  
  // Dashboard
  getEmployeeDashboard,
  getTeamDashboard,
  
  // Break Management
  startBreak,
  endBreak,
  
  // Status and Logs
  getCurrentStatus,
  addWorkLog,
  getAttendanceReport
};