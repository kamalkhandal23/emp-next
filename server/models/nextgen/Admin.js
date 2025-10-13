import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  // Basic Information
  admin_id: {
    type: String,
    unique: true,
    index: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NG_User',
    required: true,
    unique: true
  },
  
  // Personal Information
  full_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  phone: {
    c: String,
    iv: String,
    tag: String
  },
  
  // Administrative Information
  employee_id: String,
  department: {
    type: String,
    enum: ['administration', 'academic', 'technical', 'hr', 'finance', 'operations'],
    required: true
  },
  designation: String,
  reporting_to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NG_Admin'
  },
  
  // Admin Level and Permissions
  admin_level: {
    type: String,
    enum: ['super_admin', 'admin', 'manager', 'supervisor'],
    default: 'admin',
    index: true
  },
  
  // Comprehensive Permissions System
  permissions: {
    // User Management
    user_management: {
      can_create_users: { type: Boolean, default: true },
      can_edit_users: { type: Boolean, default: true },
      can_delete_users: { type: Boolean, default: false },
      can_activate_deactivate: { type: Boolean, default: true },
      can_reset_passwords: { type: Boolean, default: true },
      can_assign_roles: { type: Boolean, default: true }
    },
    
    // Student Management
    student_management: {
      can_approve_registrations: { type: Boolean, default: true },
      can_manage_enrollments: { type: Boolean, default: true },
      can_view_student_data: { type: Boolean, default: true },
      can_edit_student_profiles: { type: Boolean, default: true },
      can_issue_certificates: { type: Boolean, default: true },
      can_manage_student_documents: { type: Boolean, default: true }
    },
    
    // Course Management
    course_management: {
      can_create_courses: { type: Boolean, default: true },
      can_edit_courses: { type: Boolean, default: true },
      can_delete_courses: { type: Boolean, default: false },
      can_publish_courses: { type: Boolean, default: true },
      can_assign_managers: { type: Boolean, default: true },
      can_manage_course_content: { type: Boolean, default: true }
    },
    
    // Exam Management
    exam_management: {
      can_create_exams: { type: Boolean, default: true },
      can_edit_exams: { type: Boolean, default: true },
      can_delete_exams: { type: Boolean, default: false },
      can_grade_exams: { type: Boolean, default: true },
      can_publish_results: { type: Boolean, default: true },
      can_manage_exam_settings: { type: Boolean, default: true }
    },
    
    // System Administration
    system_admin: {
      can_manage_settings: { type: Boolean, default: false },
      can_view_logs: { type: Boolean, default: false },
      can_manage_backups: { type: Boolean, default: false },
      can_manage_integrations: { type: Boolean, default: false },
      can_access_database: { type: Boolean, default: false },
      can_manage_security: { type: Boolean, default: false }
    },
    
    // Analytics and Reports
    analytics: {
      can_view_all_analytics: { type: Boolean, default: true },
      can_export_reports: { type: Boolean, default: true },
      can_create_custom_reports: { type: Boolean, default: false },
      can_view_financial_reports: { type: Boolean, default: false },
      can_access_audit_logs: { type: Boolean, default: false }
    },
    
    // Communication
    communication: {
      can_send_announcements: { type: Boolean, default: true },
      can_manage_notifications: { type: Boolean, default: true },
      can_send_bulk_emails: { type: Boolean, default: true },
      can_manage_templates: { type: Boolean, default: false }
    },
    
    // Support and Tickets
    support: {
      can_view_all_tickets: { type: Boolean, default: true },
      can_assign_tickets: { type: Boolean, default: true },
      can_resolve_tickets: { type: Boolean, default: true },
      can_escalate_tickets: { type: Boolean, default: true },
      can_manage_hr_requests: { type: Boolean, default: true }
    }
  },
  
  // Access Restrictions
  access_restrictions: {
    ip_whitelist: [String],
    allowed_hours: {
      start: { type: String, default: '00:00' },
      end: { type: String, default: '23:59' }
    },
    allowed_days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    session_timeout_minutes: { type: Number, default: 480 }, // 8 hours
    require_2fa: { type: Boolean, default: false }
  },
  
  // Activity and Performance
  activity: {
    last_login: Date,
    login_count: { type: Number, default: 0 },
    last_activity: Date,
    failed_login_attempts: { type: N