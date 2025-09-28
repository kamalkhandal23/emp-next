import cron from 'node-cron';
import AttendanceService from '../services/attendanceService.js';

// Auto check-out job - runs daily at 12:01 AM
const autoCheckOutJob = cron.schedule('1 0 * * *', async () => {
  try {
    console.log('Running auto check-out job...');
    const checkedOutCount = await AttendanceService.autoCheckOut();
    console.log(`Auto check-out completed. ${checkedOutCount} employees processed.`);
  } catch (error) {
    console.error('Auto check-out job failed:', error);
  }
}, {
  scheduled: false,
  timezone: 'Asia/Kolkata'
});

// Daily attendance report job - runs at 9:00 PM
const dailyReportJob = cron.schedule('0 21 * * *', async () => {
  try {
    console.log('Generating daily attendance report...');
    const report = await AttendanceService.generateDailyReport();
    console.log(`Daily report generated. Present: ${report.present}, Absent: ${report.absent}`);
    
    // Here you could send the report via email to HR/Management
    // await sendDailyReportEmail(report);
  } catch (error) {
    console.error('Daily report job failed:', error);
  }
}, {
  scheduled: false,
  timezone: 'Asia/Kolkata'
});

// Start all jobs
export const startAttendanceJobs = () => {
  autoCheckOutJob.start();
  dailyReportJob.start();
  console.log('Attendance jobs started');
};

// Stop all jobs
export const stopAttendanceJobs = () => {
  autoCheckOutJob.stop();
  dailyReportJob.stop();
  console.log('Attendance jobs stopped');
};

export default {
  startAttendanceJobs,
  stopAttendanceJobs,
  autoCheckOutJob,
  dailyReportJob
};