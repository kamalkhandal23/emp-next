import cron from 'node-cron';
import Attendance from '../models/hr-management/Attendance.js';

// Start attendance-related cron jobs
export const startAttendanceJobs = () => {
  console.log('Starting attendance cron jobs...');

  // Daily attendance reminder at 9:00 AM
  cron.schedule('0 9 * * 1-5', async () => {
    console.log('Running daily attendance reminder job...');
    try {
      // Add logic for attendance reminders if needed
      console.log('Daily attendance reminder completed');
    } catch (error) {
      console.error('Error in daily attendance reminder:', error);
    }
  });

  // Weekly attendance report on Fridays at 5:00 PM
  cron.schedule('0 17 * * 5', async () => {
    console.log('Running weekly attendance report job...');
    try {
      // Add logic for weekly reports if needed
      console.log('Weekly attendance report completed');
    } catch (error) {
      console.error('Error in weekly attendance report:', error);
    }
  });

  console.log('Attendance cron jobs started successfully');
};

export default { startAttendanceJobs };