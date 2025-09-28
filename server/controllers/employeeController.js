import Employee from '../models/employeeModel.js';
import User from '../models/User.js';
import { sendEmail, emailTemplates } from '../config/email.js';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';

// Get all employees
export const getAllEmployees = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      department, 
      status, 
      position,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
        { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
        { 'personalInfo.email': { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }
    if (department) query['employment.department'] = department;
    if (status) query['employment.status'] = status;
    if (position) query['employment.position'] = { $regex: position, $options: 'i' };

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const employees = await Employee.find(query)
      .populate('employment.manager', 'personalInfo.firstName personalInfo.lastName employeeId')
      .populate('employment.team', 'name description')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sortOptions);

    const total = await Employee.countDocuments(query);

    res.json({
      employees,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employees', error: error.message });
  }
};

// Get employee by ID
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('employment.manager', 'personalInfo.firstName personalInfo.lastName employeeId')
      .populate('employment.team', 'name description members')
      .populate('systemAccess.userId', 'email role lastLogin');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employee', error: error.message });
  }
};

// Create new employee
export const createEmployee = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Generate employee ID
    const employeeCount = await Employee.countDocuments();
    const employeeId = `EMP${String(employeeCount + 1).padStart(6, '0')}`;

    const employeeData = {
      ...req.body,
      employeeId
    };

    const employee = new Employee(employeeData);
    await employee.save();

    // Create user account if email is provided
    if (employee.personalInfo.email) {
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 12);

      const user = new User({
        firstName: employee.personalInfo.firstName,
        lastName: employee.personalInfo.lastName,
        email: employee.personalInfo.email,
        password: hashedPassword,
        role: 'employee',
        isActive: true,
        employeeId: employee._id
      });

      await user.save();

      // Link user to employee
      employee.systemAccess.userId = user._id;
      await employee.save();

      // Send welcome email
      await sendEmail(
        employee.personalInfo.email,
        emailTemplates.welcome(employee.fullName, tempPassword).subject,
        emailTemplates.welcome(employee.fullName, tempPassword).html
      );
    }

    res.status(201).json({
      message: 'Employee created successfully',
      employee: {
        id: employee._id,
        employeeId: employee.employeeId,
        fullName: employee.fullName,
        email: employee.personalInfo.email,
        department: employee.employment.department
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Error creating employee', error: error.message });
  }
};

// Update employee
export const updateEmployee = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('employment.manager employment.team');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Update linked user account if email changed
    if (employee.systemAccess.userId && req.body.personalInfo?.email) {
      await User.findByIdAndUpdate(employee.systemAccess.userId, {
        email: req.body.personalInfo.email,
        firstName: req.body.personalInfo?.firstName || employee.personalInfo.firstName,
        lastName: req.body.personalInfo?.lastName || employee.personalInfo.lastName
      });
    }

    res.json({
      message: 'Employee updated successfully',
      employee
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating employee', error: error.message });
  }
};

// Delete employee
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if employee is a manager
    const directReports = await Employee.countDocuments({
      'employment.manager': req.params.id,
      'employment.status': 'active'
    });

    if (directReports > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete employee with active direct reports',
        directReports
      });
    }

    // Delete linked user account
    if (employee.systemAccess.userId) {
      await User.findByIdAndDelete(employee.systemAccess.userId);
    }

    await Employee.findByIdAndDelete(req.params.id);

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting employee', error: error.message });
  }
};

// Get employee's direct reports
export const getDirectReports = async (req, res) => {
  try {
    const managerId = req.params.id;
    
    const directReports = await Employee.findByManager(managerId)
      .select('personalInfo employment.position employment.hireDate employment.status');

    res.json(directReports);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching direct reports', error: error.message });
  }
};

// Update employee status
export const updateEmployeeStatus = async (req, res) => {
  try {
    const { status, terminationDate, terminationReason } = req.body;
    const employeeId = req.params.id;

    const updateData = { 'employment.status': status };
    if (status === 'terminated') {
      updateData['employment.terminationDate'] = terminationDate || new Date();
      if (terminationReason) updateData['employment.terminationReason'] = terminationReason;
    }

    const employee = await Employee.findByIdAndUpdate(
      employeeId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Update user account status
    if (employee.systemAccess.userId) {
      const accountStatus = status === 'active' ? 'active' : 'suspended';
      await User.findByIdAndUpdate(employee.systemAccess.userId, {
        isActive: status === 'active'
      });
      
      employee.systemAccess.accountStatus = accountStatus;
      await employee.save();
    }

    res.json({
      message: 'Employee status updated successfully',
      employee: {
        id: employee._id,
        fullName: employee.fullName,
        status: employee.employment.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating employee status', error: error.message });
  }
};

// Add performance review
export const addPerformanceReview = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const reviewData = {
      ...req.body,
      reviewer: req.user.id,
      date: new Date()
    };

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    await employee.addPerformanceReview(reviewData);

    res.json({
      message: 'Performance review added successfully',
      currentRating: employee.performance.currentRating
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding performance review', error: error.message });
  }
};

// Update leave balance
export const updateLeaveBalance = async (req, res) => {
  try {
    const { leaveType, days, operation = 'deduct' } = req.body;
    const employeeId = req.params.id;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const adjustedDays = operation === 'add' ? -days : days;
    await employee.updateLeaveBalance(leaveType, adjustedDays);

    res.json({
      message: 'Leave balance updated successfully',
      leaveBalance: employee.leaves[leaveType]
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating leave balance', error: error.message });
  }
};

// Get employee attendance
export const getEmployeeAttendance = async (req, res) => {
  try {
    const { month, year } = req.query;
    const employeeId = req.params.id;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // In a real application, you would fetch detailed attendance records
    // For now, return the summary from employee record
    res.json({
      employee: {
        id: employee._id,
        fullName: employee.fullName,
        employeeId: employee.employeeId
      },
      attendance: employee.attendance,
      attendancePercentage: employee.attendancePercentage,
      period: { month, year }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance', error: error.message });
  }
};

// Get department employees
export const getDepartmentEmployees = async (req, res) => {
  try {
    const { department } = req.params;
    const { status = 'active' } = req.query;

    const employees = await Employee.findByDepartment(department)
      .select('personalInfo employment.position employment.hireDate')
      .sort({ 'personalInfo.firstName': 1 });

    res.json({
      department,
      employees,
      count: employees.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching department employees', error: error.message });
  }
};

// Get upcoming birthdays
export const getUpcomingBirthdays = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const employees = await Employee.getUpcomingBirthdays(parseInt(days))
      .select('personalInfo.firstName personalInfo.lastName personalInfo.dateOfBirth employment.department');

    const birthdays = employees.map(emp => ({
      id: emp._id,
      fullName: emp.fullName,
      department: emp.employment.department,
      birthday: emp.personalInfo.dateOfBirth,
      daysUntil: Math.ceil((new Date(emp.personalInfo.dateOfBirth.getFullYear(), emp.personalInfo.dateOfBirth.getMonth(), emp.personalInfo.dateOfBirth.getDate()) - new Date()) / (1000 * 60 * 60 * 24))
    }));

    res.json({
      birthdays: birthdays.sort((a, b) => a.daysUntil - b.daysUntil),
      period: `${days} days`
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching upcoming birthdays', error: error.message });
  }
};

// Get employee statistics
export const getEmployeeStatistics = async (req, res) => {
  try {
    const stats = await Employee.aggregate([
      {
        $group: {
          _id: null,
          totalEmployees: { $sum: 1 },
          activeEmployees: {
            $sum: { $cond: [{ $eq: ['$employment.status', 'active'] }, 1, 0] }
          },
          inactiveEmployees: {
            $sum: { $cond: [{ $eq: ['$employment.status', 'inactive'] }, 1, 0] }
          },
          terminatedEmployees: {
            $sum: { $cond: [{ $eq: ['$employment.status', 'terminated'] }, 1, 0] }
          }
        }
      }
    ]);

    // Department breakdown
    const departmentStats = await Employee.aggregate([
      { $match: { 'employment.status': 'active' } },
      {
        $group: {
          _id: '$employment.department',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Position breakdown
    const positionStats = await Employee.aggregate([
      { $match: { 'employment.status': 'active' } },
      {
        $group: {
          _id: '$employment.position',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      overview: stats[0] || {
        totalEmployees: 0,
        activeEmployees: 0,
        inactiveEmployees: 0,
        terminatedEmployees: 0
      },
      departmentBreakdown: departmentStats.reduce((acc, dept) => {
        acc[dept._id] = dept.count;
        return acc;
      }, {}),
      topPositions: positionStats.reduce((acc, pos) => {
        acc[pos._id] = pos.count;
        return acc;
      }, {})
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employee statistics', error: error.message });
  }
};

export default {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getDirectReports,
  updateEmployeeStatus,
  addPerformanceReview,
  updateLeaveBalance,
  getEmployeeAttendance,
  getDepartmentEmployees,
  getUpcomingBirthdays,
  getEmployeeStatistics
};