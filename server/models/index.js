// Main Models Index
// This file provides easy access to all models across the application

// Core System Models
export * as Core from './core/index.js';

// HR Management Models
export * as HRManagement from './hr-management/index.js';

// Education System Models
export * as Education from './education/index.js';

// NextGen System Models
export * as NextGenCore from './nextgen/core/index.js';
export * as NextGenEducation from './nextgen/education/index.js';
export * as NextGenStudentManagement from './nextgen/student-management/index.js';
export * as NextGenAdmin from './nextgen/admin/index.js';
export * as NextGenSupport from './nextgen/support/index.js';

// Admin System Models
export * as AdminSystem from './admin-system/index.js';

// Usage Examples:
// import { Core, NextGenCore } from '../models/index.js';
// const user = await Core.User.findById(id);
// const ngUser = await NextGenCore.User.findById(id);

// Or import specific models:
// import { NextGenStudentManagement } from '../models/index.js';
// const student = await NextGenStudentManagement.Student.findById(id);