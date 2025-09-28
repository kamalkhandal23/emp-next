import EmployeeTimesheet from '../models/EmployeeTimesheet.js';
import User from '../models/User.js';
import { sendEmail } from '../config/email.js';

class AttendanceService {
  // Auto check-out employees who forgot to check out
  static async autoCheckOut() {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      
      const timesheets = await EmployeeTimesheet.find({
        date: yesterday,
        'shifts.checkOut.time': { $exists: false }
      }).populate('employee', 'firstName lastName email');
      
      for (const timesheet of timesheets) {
        const lastShift = timesheet.shifts[timesheet.shifts.length - 1];
        if (lastShift && lastShift.checkIn && !lastShift.checkOut) {
          // Auto check-out at 6 PM
          const autoCheckOutTime = new Date(yesterday);
          autoCheckOutTime.setHours(18, 0, 0, 0);
          
          lastShift.checkOut = {
            time: autoCheckOutTime,
            method: 'auto-checkout',
            location: { type: 'office' }
          };
          
          // Calculate hours worked (assuming 1 hour lunch break)
          const hoursWorked = 8; // Standard 9 AM to 6 PM with 1 hour break
          lastShift.hoursWorked = hoursWorked;
          
          // Add flag for missing checkout
          timesheet.flags.push({
            type: 'no-checkout',
            description: 'Auto checked-out due to missing checkout',
            severity: 'high'
          });
          
          await timesheet.save();
          
          // Send notification email
          if (timesheet.employee.email) {
            await sendEmail(
              timesheet.employee.email,
              'Auto Check-out Notification',
              `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #f59e0b;">Auto Check-out Notification</h2>
                  <p>Dear ${timesheet.employee.firstName},</p>
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
      
      console.log(`Auto checked-out ${timesheets.length} employees`);
      return timesheets.length;
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
      const attendanceData = await EmployeeTimesheet.find({
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
          flags: []
        };
        
        if (attendance && attendance.shifts.length > 0) {
          const shift = attendance.shifts[0];
          employeeRecord.status = 'present';
          employeeRecord.checkIn = shift.checkIn?.time;
          employeeRecord.checkOut = shift.checkOut?.time;
          employeeRecord.hoursWorked = shift.hoursWorked || 0;
          employeeRecord.flags = attendance.flags || [];
          
          report.present++;
          
          // Check for flags
          if (attendance.flags.some(flag => flag.type === 'late-entry')) {
            report.late++;
          }
          if (attendance.flags.some(flag => flag.type === 'early-exit')) {
            report.earlyExit++;
          }
          if (attendance.flags.some(flag => flag.type === 'overtime')) {
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
      
      const timesheets = await EmployeeTimesheet.find({
        employee: employeeId,
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: 1 });
      
      const summary = {
        month,
        year,
        totalWorkingDays: 0,
        presentDays: timesheets.length,
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
      
      timesheets.forEach(timesheet => {
        summary.totalHours += timesheet.totalHours.regular || 0;
        summary.totalOvertimeHours += timesheet.totalHours.overtime || 0;
        
        if (timesheet.flags.some(flag => flag.type === 'late-entry')) {
          summary.lateArrivals++;
        }
        if (timesheet.flags.some(flag => flag.type === 'early-exit')) {
          summary.earlyDepartures++;
        }
        
        summary.dailyRecords.push({
          date: timesheet.date,
          status: timesheet.attendanceStatus,
          hoursWorked: timesheet.totalWorkedHours,
          checkIn: timesheet.shifts[0]?.checkIn?.time,
          checkOut: timesheet.shifts[0]?.checkOut?.time,
          flags: timesheet.flags
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
      
      const timesheets = await EmployeeTimesheet.find({
        employee: employeeId,
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: -1 });
      
      const anomalies = [];
      
      // Check for patterns
      let consecutiveLateArrivals = 0;
      let consecutiveEarlyExits = 0;
      let unusualWorkingHours = [];
      
      timesheets.forEach((timesheet, index) => {
        const isLate = timesheet.flags.some(flag => flag.type === 'late-entry');
        const isEarlyExit = timesheet.flags.some(flag => flag.type === 'early-exit');
        const hoursWorked = timesheet.totalWorkedHours;
        
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
            date: timesheet.date,
            hours: hoursWorked,
            type: 'too-few-hours'
          });
        } else if (hoursWorked > 12) {
          unusualWorkingHours.push({
            date: timesheet.date,
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
      const attendanceData = await EmployeeTimesheet.find({
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
        
        if (attendance && attendance.shifts.length > 0) {
          const shift = attendance.shifts[0];
          memberData.status = 'present';
          memberData.checkIn = shift.checkIn?.time;
          memberData.hoursWorked = shift.hoursWorked || 0;
          memberData.isLate = attendance.flags.some(flag => flag.type === 'late-entry');
          
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