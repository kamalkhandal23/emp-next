import Attendance from '../models/hr-management/Attendance.js';
import User from '../models/core/User.js';
import { sendEmail } from '../config/email.js';

class AttendanceService {
  // Auto check-out employees who forgot to check out
  static async autoCheckOut() {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      
      const attendanceRecords = await Attendance.find({
        date: yesterday,
        'checkIn.time': { $exists: true },
        'checkOut.time': { $exists: false }
      }).populate('employee', 'firstName lastName email');
      
      for (const attendance of attendanceRecords) {
        if (attendance.checkIn.time && !attendance.checkOut.time) {
          // Auto check-out at 6 PM
          const autoCheckOutTime = new Date(yesterday);
          autoCheckOutTime.setHours(18, 0, 0, 0);
          
          attendance.checkOut = {
            time: autoCheckOutTime,
            method: 'auto-checkout',
            location: { type: 'Point', coordinates: [0, 0] }
          };
          
          attendance.isManualEntry = true;
          attendance.manualEntryReason = 'Auto checked-out due to missing checkout';
          
          await attendance.save();
          
          // Send notification email
          if (attendance.employee.email) {
            await sendEmail(
              attendance.employee.email,
              'Auto Check-out Notification',
              `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #f59e0b;">Auto Check-out Notification</h2>
                  <p>Dear ${attendance.employee.firstName},</p>
                  <p>You were automatically checked out yesterday at 6:00 PM as you forgot to check out manually.</p>
                  <p><strong>Date:</strong> ${yesterday.toDateString()}</p>
                  <p><strong>Auto Check-out Time:</strong> 6:00 PM</p>
                  <p>Please remember to check out manually to ensure accurate time tracking.</p>
                  <p>Best regards,<br>HR Team</p>
                </div>
              `
            );
          }
        }
      }
      
      console.log(`Auto checked-out ${attendanceRecords.length} employees`);
      return attendanceRecords.length;
    } catch (error) {
      console.error('Auto check-out error:', error);
      throw error;
    }
  }
  
  // Generate daily attendance report
  static async generateDailyReport(date = new Date()) {
    try {
      const reportDate = new Date(date);
      reportDate.setHours(0, 0, 0, 0);
      
      // Get all employees
      const allEmployees = await User.find({ 
        role: { $in: ['employee', 'team_lead', 'manager'] },
        status: 'active'
      }).select('firstName lastName email employeeId department');
      
      // Get attendance data for the date
      const attendanceData = await Attendance.find({
        date: reportDate
      }).populate('employee', 'firstName lastName employeeId department');
      
      const attendanceMap = new Map();
      attendanceData.forEach(record => {
        attendanceMap.set(record.employee._id.toString(), record);
      });
      
      const report = {
        date: reportDate,
        totalEmployees: allEmployees.length,
        present: 0,
        absent: 0,
        late: 0,
        earlyExit: 0,
        overtime: 0,
        employees: []
      };
      
      allEmployees.forEach(employee => {
        const attendance = attendanceMap.get(employee._id.toString());
        const employeeRecord = {
          employee: {
            id: employee._id,
            name: `${employee.firstName} ${employee.lastName}`,
            employeeId: employee.employeeId,
            department: employee.department
          },
          status: 'absent',
          checkIn: null,
          checkOut: null,
          hoursWorked: 0,
          isLate: false,
          isEarlyLeave: false
        };
        
        if (attendance) {
          employeeRecord.status = attendance.status;
          employeeRecord.checkIn = attendance.checkIn?.time;
          employeeRecord.checkOut = attendance.checkOut?.time;
          employeeRecord.hoursWorked = attendance.totalHours || 0;
          employeeRecord.isLate = attendance.isLate;
          employeeRecord.isEarlyLeave = attendance.isEarlyLeave;
          
          report.present++;
          
          if (attendance.isLate) {
            report.late++;
          }
          if (attendance.isEarlyLeave) {
            report.earlyExit++;
          }
          if (attendance.overtimeHours > 0) {
            report.overtime++;
          }
        } else {
          report.absent++;
        }
        
        report.employees.push(employeeRecord);
      });
      
      return report;
    } catch (error) {
      console.error('Generate daily report error:', error);
      throw error;
    }
  }
  
  // Calculate monthly attendance summary
  static async getMonthlyAttendanceSummary(employeeId, month, year) {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      const attendanceRecords = await Attendance.find({
        employee: employeeId,
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: 1 });
      
      const summary = {
        month,
        year,
        totalWorkingDays: 0,
        presentDays: attendanceRecords.length,
        absentDays: 0,
        totalHours: 0,
        totalOvertimeHours: 0,
        lateArrivals: 0,
        earlyDepartures: 0,
        averageHoursPerDay: 0,
        attendancePercentage: 0,
        dailyRecords: []
      };
      
      // Calculate working days (excluding weekends)
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        if (d.getDay() !== 0 && d.getDay() !== 6) { // Not Sunday or Saturday
          summary.totalWorkingDays++;
        }
      }
      
      attendanceRecords.forEach(attendance => {
        summary.totalHours += attendance.regularHours || 0;
        summary.totalOvertimeHours += attendance.overtimeHours || 0;
        
        if (attendance.isLate) {
          summary.lateArrivals++;
        }
        if (attendance.isEarlyLeave) {
          summary.earlyDepartures++;
        }
        
        summary.dailyRecords.push({
          date: attendance.date,
          status: attendance.status,
          hoursWorked: attendance.totalHours,
          checkIn: attendance.checkIn?.time,
          checkOut: attendance.checkOut?.time,
          isLate: attendance.isLate,
          isEarlyLeave: attendance.isEarlyLeave
        });
      });
      
      summary.absentDays = summary.totalWorkingDays - summary.presentDays;
      summary.attendancePercentage = summary.totalWorkingDays > 0 
        ? Math.round((summary.presentDays / summary.totalWorkingDays) * 100) 
        : 0;
      summary.averageHoursPerDay = summary.presentDays > 0 
        ? Math.round((summary.totalHours / summary.presentDays) * 100) / 100 
        : 0;
      
      return summary;
    } catch (error) {
      console.error('Get monthly attendance summary error:', error);
      throw error;
    }
  }
  
  // Detect attendance anomalies
  static async detectAnomalies(employeeId, days = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const attendanceRecords = await Attendance.find({
        employee: employeeId,
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: -1 });
      
      const anomalies = [];
      
      // Check for patterns
      let consecutiveLateArrivals = 0;
      let consecutiveEarlyExits = 0;
      let unusualWorkingHours = [];
      
      attendanceRecords.forEach((attendance, index) => {
        const isLate = attendance.isLate;
        const isEarlyExit = attendance.isEarlyLeave;
        const hoursWorked = attendance.totalHours;
        
        // Track consecutive late arrivals
        if (isLate) {
          consecutiveLateArrivals++;
        } else {
          if (consecutiveLateArrivals >= 3) {
            anomalies.push({
              type: 'consecutive-late-arrivals',
              count: consecutiveLateArrivals,
              severity: 'medium',
              description: `${consecutiveLateArrivals} consecutive late arrivals`
            });
          }
          consecutiveLateArrivals = 0;
        }
        
        // Track consecutive early exits
        if (isEarlyExit) {
          consecutiveEarlyExits++;
        } else {
          if (consecutiveEarlyExits >= 3) {
            anomalies.push({
              type: 'consecutive-early-exits',
              count: consecutiveEarlyExits,
              severity: 'medium',
              description: `${consecutiveEarlyExits} consecutive early exits`
            });
          }
          consecutiveEarlyExits = 0;
        }
        
        // Check for unusual working hours (less than 4 or more than 12)
        if (hoursWorked < 4 && hoursWorked > 0) {
          unusualWorkingHours.push({
            date: attendance.date,
            hours: hoursWorked,
            type: 'too-few-hours'
          });
        } else if (hoursWorked > 12) {
          unusualWorkingHours.push({
            date: attendance.date,
            hours: hoursWorked,
            type: 'too-many-hours'
          });
        }
      });
      
      // Add unusual working hours anomalies
      if (unusualWorkingHours.length > 0) {
        anomalies.push({
          type: 'unusual-working-hours',
          count: unusualWorkingHours.length,
          severity: 'low',
          description: `${unusualWorkingHours.length} days with unusual working hours`,
          details: unusualWorkingHours
        });
      }
      
      return anomalies;
    } catch (error) {
      console.error('Detect anomalies error:', error);
      throw error;
    }
  }
  
  // Get team attendance overview
  static async getTeamAttendanceOverview(managerId, date = new Date()) {
    try {
      const reportDate = new Date(date);
      reportDate.setHours(0, 0, 0, 0);
      
      // Get team members
      const teamMembers = await User.find({ 
        manager: managerId,
        status: 'active'
      }).select('firstName lastName employeeId department');
      
      if (teamMembers.length === 0) {
        return {
          date: reportDate,
          teamSize: 0,
          present: 0,
          absent: 0,
          late: 0,
          members: []
        };
      }
      
      const memberIds = teamMembers.map(member => member._id);
      
      // Get attendance data
      const attendanceData = await Attendance.find({
        employee: { $in: memberIds },
        date: reportDate
      }).populate('employee', 'firstName lastName employeeId');
      
      const attendanceMap = new Map();
      attendanceData.forEach(record => {
        attendanceMap.set(record.employee._id.toString(), record);
      });
      
      const overview = {
        date: reportDate,
        teamSize: teamMembers.length,
        present: 0,
        absent: 0,
        late: 0,
        members: []
      };
      
      teamMembers.forEach(member => {
        const attendance = attendanceMap.get(member._id.toString());
        const memberData = {
          employee: {
            id: member._id,
            name: `${member.firstName} ${member.lastName}`,
            employeeId: member.employeeId
          },
          status: 'absent',
          checkIn: null,
          hoursWorked: 0,
          isLate: false
        };
        
        if (attendance) {
          memberData.status = attendance.status;
          memberData.checkIn = attendance.checkIn?.time;
          memberData.hoursWorked = attendance.totalHours || 0;
          memberData.isLate = attendance.isLate;
          
          overview.present++;
          if (memberData.isLate) {
            overview.late++;
          }
        } else {
          overview.absent++;
        }
        
        overview.members.push(memberData);
      });
      
      return overview;
    } catch (error) {
      console.error('Get team attendance overview error:', error);
      throw error;
    }
  }
}

export default AttendanceService;