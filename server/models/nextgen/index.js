// NextGen System Models Index
// Centralized access to all NextGen models

// Core Models
export * as Core from './core/index.js';

// Education Models
export * as Education from './education/index.js';

// Student Management Models
export * as StudentManagement from './student-management/index.js';

// Admin Models
export * as Admin from './admin/index.js';

// Support Models
export * as Support from './support/index.js';

// Direct exports for convenience
export { default as NGUser } from './core/User.js';
export { default as NGRegistration } from './core/Registration.js';
export { default as NGCourse } from './education/Course.js';
export { default as NGStudent } from './student-management/Student.js';
export { default as NGAdmin } from './admin/Admin.js';
export { default as NGCourseManager } from './admin/CourseManager.js';
export { default as NGTicket } from './support/Ticket.js';
export { default as NGHRRequest } from './support/HRRequest.js';