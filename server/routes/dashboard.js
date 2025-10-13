import express from 'express'
import User from '../models/core/User.js'
import Team from '../models/hr-management/Team.js'
import Project from '../models/hr-management/Project.js'
import Task from '../models/hr-management/Task.js'
import Attendance from '../models/hr-management/Attendance.js'
import Leave from '../models/hr-management/Leave.js'
import Meeting from '../models/admin-system/Meeting.js'
import { authenticate, authorize } from '../middleware/auth.js'

const router = express.Router()

// @desc    Get general dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
router.get('/stats', authenticate, async (req, res) => {
  try {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    // Basic stats that all users can see
    const stats = {
      totalEmployees: await User.countDocuments({ status: 'active' }),
      presentToday: await Attendance.countDocuments({
        date: { $gte: startOfDay, $lt: endOfDay },
        status: { $in: ['present', 'work-from-home'] }
      }),
      myTasks: await Task.countDocuments({
        assignedTo: req.user._id,
        status: { $nin: ['completed', 'cancelled'] }
      }),
      upcomingMeetings: await Meeting.countDocuments({
        'attendees.user': req.user._id,
        startTime: { $gte: new Date() },
        status: 'scheduled'
      })
    }

    res.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard stats'
    })
  }
})

// @desc    Get admin dashboard data
// @route   GET /api/dashboard/admin
// @access  Private (Admin only)
router.get('/admin', authenticate, authorize('admin'), async (req, res) => {
  try {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    // System overview stats
    const systemStats = {
      totalEmployees: await User.countDocuments(),
      activeEmployees: await User.countDocuments({ status: 'active' }),
      totalTeams: await Team.countDocuments({ status: 'active' }),
      totalProjects: await Project.countDocuments(),
      activeProjects: await Project.countDocuments({ status: 'active' }),
      completedProjects: await Project.countDocuments({ status: 'completed' })
    }

    // Today's attendance
    const attendanceStats = {
      present: await Attendance.countDocuments({
        date: { $gte: startOfDay, $lt: endOfDay },
        status: 'present'
      }),
      workFromHome: await Attendance.countDocuments({
        date: { $gte: startOfDay, $lt: endOfDay },
        status: 'work-from-home'
      }),
      absent: await Attendance.countDocuments({
        date: { $gte: startOfDay, $lt: endOfDay },
        status: 'absent'
      }),
      late: await Attendance.countDocuments({
        date: { $gte: startOfDay, $lt: endOfDay },
        isLate: true
      })
    }

    // Task statistics
    const taskStats = {
      total: await Task.countDocuments(),
      pending: await Task.countDocuments({ status: 'todo' }),
      inProgress: await Task.countDocuments({ status: 'in-progress' }),
      completed: await Task.countDocuments({ status: 'completed' }),
      overdue: await Task.countDocuments({
        dueDate: { $lt: today },
        status: { $nin: ['completed', 'cancelled'] }
      })
    }

    // Leave statistics
    const leaveStats = {
      pendingApproval: await Leave.countDocuments({ status: 'pending' }),
      approvedThisMonth: await Leave.countDocuments({
        status: 'approved',
        startDate: { $gte: startOfMonth }
      })
    }

    // Recent activities (last 10)
    const recentActivities = await Promise.all([
      User.find({ status: 'active' })
        .sort({ createdAt: -1 })
        .limit(3)
        .select('firstName lastName createdAt')
        .lean(),
      Project.find()
        .sort({ updatedAt: -1 })
        .limit(3)
        .select('name status updatedAt')
        .lean(),
      Task.find({ status: 'completed' })
        .sort({ completedDate: -1 })
        .limit(4)
        .populate('assignedTo', 'firstName lastName')
        .select('title completedDate assignedTo')
        .lean()
    ])

    const activities = [
      ...recentActivities[0].map(user => ({
        type: 'user_created',
        message: `New employee ${user.firstName} ${user.lastName} joined`,
        timestamp: user.createdAt
      })),
      ...recentActivities[1].map(project => ({
        type: 'project_updated',
        message: `Project ${project.name} status changed to ${project.status}`,
        timestamp: project.updatedAt
      })),
      ...recentActivities[2].map(task => ({
        type: 'task_completed',
        message: `${task.assignedTo.firstName} ${task.assignedTo.lastName} completed task: ${task.title}`,
        timestamp: task.completedDate
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10)

    res.json({
      success: true,
      data: {
        systemStats,
        attendanceStats,
        taskStats,
        leaveStats,
        recentActivities: activities
      }
    })
  } catch (error) {
    console.error('Admin dashboard error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error fetching admin dashboard'
    })
  }
})

// @desc    Get HR dashboard data
// @route   GET /api/dashboard/hr
// @access  Private (HR only)
router.get('/hr', authenticate, authorize('hr', 'admin'), async (req, res) => {
  try {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    // Employee statistics
    const employeeStats = {
      total: await User.countDocuments(),
      active: await User.countDocuments({ status: 'active' }),
      newHires: await User.countDocuments({
        joinDate: { $gte: startOfMonth }
      }),
      onLeave: await User.countDocuments({ status: 'on-leave' })
    }

    // Attendance overview
    const attendanceOverview = {
      presentToday: await Attendance.countDocuments({
        date: { $gte: startOfDay, $lt: endOfDay },
        status: { $in: ['present', 'work-from-home'] }
      }),
      absentToday: await Attendance.countDocuments({
        date: { $gte: startOfDay, $lt: endOfDay },
        status: 'absent'
      }),
      lateToday: await Attendance.countDocuments({
        date: { $gte: startOfDay, $lt: endOfDay },
        isLate: true
      })
    }

    // Leave management
    const leaveManagement = {
      pendingApproval: await Leave.countDocuments({ status: 'pending' }),
      approvedThisMonth: await Leave.countDocuments({
        status: 'approved',
        startDate: { $gte: startOfMonth }
      }),
      rejectedThisMonth: await Leave.countDocuments({
        status: 'rejected',
        createdAt: { $gte: startOfMonth }
      })
    }

    // Upcoming interviews/meetings
    const upcomingInterviews = await Meeting.find({
      type: 'interview',
      startTime: { $gte: today },
      status: 'scheduled'
    })
    .populate('organizer', 'firstName lastName')
    .sort({ startTime: 1 })
    .limit(5)

    // Recent leave requests
    const recentLeaveRequests = await Leave.find({ status: 'pending' })
      .populate('employee', 'firstName lastName employeeId')
      .sort({ createdAt: -1 })
      .limit(5)

    // Department-wise employee count
    const departmentStats = await User.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])

    res.json({
      success: true,
      data: {
        employeeStats,
        attendanceOverview,
        leaveManagement,
        upcomingInterviews,
        recentLeaveRequests,
        departmentStats
      }
    })
  } catch (error) {
    console.error('HR dashboard error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error fetching HR dashboard'
    })
  }
})

// @desc    Get manager dashboard data
// @route   GET /api/dashboard/manager
// @access  Private (Manager only)
router.get('/manager', authenticate, authorize('manager', 'admin'), async (req, res) => {
  try {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    // Get teams managed by this user
    const managedTeams = await Team.find({ manager: req.user._id, status: 'active' })

    // Get projects under management
    const managedProjects = await Project.find({ manager: req.user._id })

    // Project statistics
    const projectStats = {
      total: managedProjects.length,
      active: managedProjects.filter(p => p.status === 'active').length,
      completed: managedProjects.filter(p => p.status === 'completed').length,
      overdue: managedProjects.filter(p => p.status === 'overdue').length
    }

    // Team performance
    const teamPerformance = await Promise.all(
      managedTeams.map(async (team) => {
        const teamTasks = await Task.find({ team: team._id })
        const completedTasks = teamTasks.filter(t => t.status === 'completed')
        
        return {
          teamId: team._id,
          teamName: team.name,
          totalTasks: teamTasks.length,
          completedTasks: completedTasks.length,
          efficiency: teamTasks.length > 0 ? Math.round((completedTasks.length / teamTasks.length) * 100) : 0,
          memberCount: team.members.filter(m => m.status === 'active').length
        }
      })
    )

    // Budget overview
    const budgetOverview = {
      totalBudget: managedProjects.reduce((sum, p) => sum + (p.budget.estimated || 0), 0),
      spentBudget: managedProjects.reduce((sum, p) => sum + (p.budget.actual || 0), 0),
      remainingBudget: managedProjects.reduce((sum, p) => sum + ((p.budget.estimated || 0) - (p.budget.actual || 0)), 0)
    }

    // Recent project updates
    const recentProjectUpdates = await Project.find({ manager: req.user._id })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('name status progress updatedAt')

    // Upcoming deadlines
    const upcomingDeadlines = await Project.find({
      manager: req.user._id,
      endDate: { $gte: today, $lte: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000) },
      status: { $in: ['active', 'planning'] }
    })
    .sort({ endDate: 1 })
    .select('name endDate status progress')

    res.json({
      success: true,
      data: {
        projectStats,
        teamPerformance,
        budgetOverview,
        recentProjectUpdates,
        upcomingDeadlines,
        managedTeams: managedTeams.length,
        totalTeamMembers: managedTeams.reduce((sum, team) => sum + team.currentSize, 0)
      }
    })
  } catch (error) {
    console.error('Manager dashboard error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error fetching manager dashboard'
    })
  }
})

// @desc    Get team lead dashboard data
// @route   GET /api/dashboard/teamlead
// @access  Private (Team Lead only)
router.get('/teamlead', authenticate, authorize('team_lead', 'admin'), async (req, res) => {
  try {
    const today = new Date()

    // Get team led by this user
    const ledTeam = await Team.findOne({ teamLead: req.user._id, status: 'active' })
      .populate('members.user', 'firstName lastName status')

    if (!ledTeam) {
      return res.json({
        success: true,
        data: {
          message: 'No team assigned as team lead'
        }
      })
    }

    // Team statistics
    const teamStats = {
      totalMembers: ledTeam.currentSize,
      activeMembers: ledTeam.activeMembers.length,
      teamEfficiency: ledTeam.performance.efficiency || 0
    }

    // Task statistics for the team
    const teamTasks = await Task.find({ team: ledTeam._id })
    const taskStats = {
      total: teamTasks.length,
      pending: teamTasks.filter(t => t.status === 'todo').length,
      inProgress: teamTasks.filter(t => t.status === 'in-progress').length,
      completed: teamTasks.filter(t => t.status === 'completed').length,
      overdue: teamTasks.filter(t => t.dueDate < today && !['completed', 'cancelled'].includes(t.status)).length
    }

    // Team member performance
    const memberPerformance = await Promise.all(
      ledTeam.activeMembers.map(async (member) => {
        const memberTasks = await Task.find({ assignedTo: member.user._id })
        const completedTasks = memberTasks.filter(t => t.status === 'completed')
        
        // Get today's attendance
        const todayAttendance = await Attendance.findOne({
          employee: member.user._id,
          date: {
            $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
            $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
          }
        })

        return {
          userId: member.user._id,
          name: `${member.user.firstName} ${member.user.lastName}`,
          role: member.role,
          totalTasks: memberTasks.length,
          completedTasks: completedTasks.length,
          efficiency: memberTasks.length > 0 ? Math.round((completedTasks.length / memberTasks.length) * 100) : 0,
          status: todayAttendance ? todayAttendance.status : 'absent',
          checkIn: todayAttendance?.checkIn?.time || null,
          workHours: todayAttendance?.totalHours || 0
        }
      })
    )

    // Project progress for team projects
    const teamProjects = await Project.find({ team: ledTeam._id })
      .select('name status progress endDate')
      .sort({ updatedAt: -1 })

    // Upcoming tasks due this week
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    const upcomingTasks = await Task.find({
      team: ledTeam._id,
      dueDate: { $gte: today, $lte: weekFromNow },
      status: { $nin: ['completed', 'cancelled'] }
    })
    .populate('assignedTo', 'firstName lastName')
    .sort({ dueDate: 1 })
    .limit(10)

    // Team meetings this week
    const upcomingMeetings = await Meeting.find({
      team: ledTeam._id,
      startTime: { $gte: today, $lte: weekFromNow },
      status: 'scheduled'
    })
    .sort({ startTime: 1 })
    .limit(5)

    res.json({
      success: true,
      data: {
        teamInfo: {
          id: ledTeam._id,
          name: ledTeam.name,
          department: ledTeam.department
        },
        teamStats,
        taskStats,
        memberPerformance,
        teamProjects,
        upcomingTasks,
        upcomingMeetings
      }
    })
  } catch (error) {
    console.error('Team lead dashboard error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error fetching team lead dashboard'
    })
  }
})

// @desc    Get employee dashboard data
// @route   GET /api/dashboard/employee
// @access  Private (Employee)
router.get('/employee', authenticate, async (req, res) => {
  try {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    // Personal task statistics
    const myTasks = await Task.find({ assignedTo: req.user._id })
    const taskStats = {
      total: myTasks.length,
      pending: myTasks.filter(t => t.status === 'todo').length,
      inProgress: myTasks.filter(t => t.status === 'in-progress').length,
      completed: myTasks.filter(t => t.status === 'completed').length,
      overdue: myTasks.filter(t => t.dueDate < today && !['completed', 'cancelled'].includes(t.status)).length
    }

    // Today's attendance
    const todayAttendance = await Attendance.findOne({
      employee: req.user._id,
      date: { $gte: startOfDay, $lt: endOfDay }
    })

    // This month's attendance summary
    const monthlyAttendance = await Attendance.getAttendanceSummary(
      req.user._id,
      startOfMonth,
      today
    )

    // Leave balance
    const leaveBalance = req.user.leaveBalance

    // Upcoming tasks (next 7 days)
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    const upcomingTasks = await Task.find({
      assignedTo: req.user._id,
      dueDate: { $gte: today, $lte: weekFromNow },
      status: { $nin: ['completed', 'cancelled'] }
    })
    .sort({ dueDate: 1 })
    .limit(5)

    // Upcoming meetings
    const upcomingMeetings = await Meeting.find({
      'attendees.user': req.user._id,
      startTime: { $gte: today, $lte: weekFromNow },
      status: 'scheduled'
    })
    .sort({ startTime: 1 })
    .limit(5)
    .select('title startTime endTime type location')

    // Recent task completions
    const recentCompletions = await Task.find({
      assignedTo: req.user._id,
      status: 'completed',
      completedDate: { $gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000) }
    })
    .sort({ completedDate: -1 })
    .limit(5)
    .select('title completedDate')

    // Team information
    const teamInfo = await Team.findById(req.user.team)
      .populate('teamLead', 'firstName lastName')
      .select('name department teamLead')

    res.json({
      success: true,
      data: {
        personalStats: {
          tasksCompleted: taskStats.completed,
          tasksInProgress: taskStats.inProgress,
          tasksPending: taskStats.pending,
          tasksOverdue: taskStats.overdue
        },
        todayAttendance: {
          status: todayAttendance?.status || 'absent',
          checkIn: todayAttendance?.checkIn?.time || null,
          checkOut: todayAttendance?.checkOut?.time || null,
          totalHours: todayAttendance?.totalHours || 0,
          isLate: todayAttendance?.isLate || false
        },
        monthlyAttendance,
        leaveBalance,
        upcomingTasks,
        upcomingMeetings,
        recentCompletions,
        teamInfo
      }
    })
  } catch (error) {
    console.error('Employee dashboard error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error fetching employee dashboard'
    })
  }
})

export default router