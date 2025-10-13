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
    unique: true
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
    enum: ['system_admin', 'academic_admin', 'hr_admin', 'finance_admin', 'super_admin'],
    required: true
  },
  designation: String,
  reporting_to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NG_Admin'
  },
  
  // Permissions and Access Control
  permissions: {
    // System Management
    can_manage_users: { type: Boolean, default: false },
    can_manage_roles: { type: Boolean, default: false },
    can_manage_permissions: { type: Boolean, default: false },
    can_access_system_settings: { type: Boolean, default: false },
    can_view_system_logs: { type: Boolean, default: false },
    
    // Academic Management
    can_manage_courses: { type: Boolean, default: false },
    can_manage_course_managers: { type: Boolean, default: false },
    can_approve_course_content: { type: Boolean, default: false },
    can_manage_exams: { type: Boolean, default: false },
    can_view_academic_reports: { type: Boolean, default: false },
    
    // Student Management
    can_manage_students: { type: Boolean, default: false },
    can_approve_registrations: { type: Boolean, default: false },
    can_manage_enrollments: { type: Boolean, default: false },
    can_issue_certificates: { type: Boolean, default: false },
    can_handle_student_issues: { type: Boolean, default: false },
    
    // Financial Management
    can_manage_payments: { type: Boolean, default: false },
    can_view_financial_reports: { type: Boolean, default: false },
    can_manage_refunds: { type: Boolean, default: false },
    can_set_course_pricing: { type: Boolean, default: false },
    
    // Support Management
    can_manage_tickets: { type: Boolean, default: false },
    can_manage_hr_requests: { type: Boolean, default: false },
    can_send_announcements: { type: Boolean, default: false },
    can_manage_notifications: { type: Boolean, default: false },
    
    // Analytics and Reporting
    can_view_analytics: { type: Boolean, default: false },
    can_export_data: { type: Boolean, default: false },
    can_generate_reports: { type: Boolean, default: false }
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
    max_concurrent_sessions: { type: Number, default: 3 }
  },
  
  // Activity Tracking
  activity: {
    last_login: Date,
    last_activity: Date,
    login_count: { type: Number, default: 0 },
    failed_login_attempts: { type: Number, default: 0 },
    last_failed_login: Date,
    password_last_changed: Date,
    account_locked_until: Date
  },
  
  // Managed Entities
  managed_entities: {
    courses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NG_Course'
    }],
    course_managers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NG_CourseManager'
    }],
    students: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NG_Student'
    }],
    departments: [String]
  },
  
  // Performance Metrics
  performance: {
    tickets_resolved: { type: Number, default: 0 },
    registrations_processed: { type: Number, default: 0 },
    courses_approved: { type: Number, default: 0 },
    certificates_issued: { type: Number, default: 0 },
    average_response_time_hours: { type: Number, default: 0 },
    satisfaction_rating: { type: Number, default: 0 },
    last_performance_review: Date
  },
  
  // Status and Availability
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'on_leave', 'terminated'],
    default: 'active',
    index: true
  },
  availability: {
    is_available: { type: Boolean, default: true },
    away_message: String,
    available_from: Date,
    available_until: Date
  },
  
  // Profile Information
  profile: {
    avatar_url: String,
    bio: String,
    linkedin_url: String,
    skills: [String],
    certifications: [{
      name: String,
      issuer: String,
      issue_date: Date,
      expiry_date: Date,
      credential_id: String
    }],
    languages: [String]
  },
  
  // Notification Preferences
  notification_preferences: {
    email_notifications: { type: Boolean, default: true },
    sms_notifications: { type: Boolean, default: false },
    push_notifications: { type: Boolean, default: true },
    digest_frequency: {
      type: String,
      enum: ['immediate', 'hourly', 'daily', 'weekly'],
      default: 'daily'
    },
    notification_types: {
      new_registrations: { type: Boolean, default: true },
      urgent_tickets: { type: Boolean, default: true },
      system_alerts: { type: Boolean, default: true },
      performance_reports: { type: Boolean, default: true }
    }
  },
  
  // Security Settings
  security: {
    two_factor_enabled: { type: Boolean, default: false },
    backup_codes: [String],
    security_questions: [{
      question: String,
      answer_hash: String
    }],
    last_security_audit: Date,
    security_clearance_level: {
      type: String,
      enum: ['basic', 'elevated', 'high', 'critical'],
      default: 'basic'
    }
  },
  
  // System Information
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NG_User'
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NG_User'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
adminSchema.index({ admin_id: 1 });
adminSchema.index({ status: 1 });
adminSchema.index({ department: 1 });
adminSchema.index({ 'activity.last_login': -1 });

// Virtual for full permissions list
adminSchema.virtual('active_permissions').get(function() {
  const activePerms = [];
  Object.keys(this.permissions).forEach(key => {
    if (this.permissions[key] === true) {
      activePerms.push(key);
    }
  });
  return activePerms;
});

// Virtual for account locked status
adminSchema.virtual('is_account_locked').get(function() {
  return this.activity.account_locked_until && this.activity.account_locked_until > new Date();
});

// Virtual for session expired status
adminSchema.virtual('is_session_expired').get(function() {
  if (!this.activity.last_activity) return true;
  const sessionTimeout = this.access_restrictions.session_timeout_minutes * 60 * 1000;
  return (new Date() - this.activity.last_activity) > sessionTimeout;
});

// Pre-save middleware to generate admin ID
adminSchema.pre('save', async function(next) {
  if (!this.admin_id && this.isNew) {
    try {
      const year = new Date().getFullYear();
      const count = await this.constructor.countDocuments({
        created_at: {
          $gte: new Date(year, 0, 1),
          $lt: new Date(year + 1, 0, 1)
        }
      });
      this.admin_id = `ADM${year}${String(count + 1).padStart(4, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Pre-save middleware to set default access restrictions
adminSchema.pre('save', function(next) {
  if (this.isNew && (!this.access_restrictions.allowed_days || this.access_restrictions.allowed_days.length === 0)) {
    this.access_restrictions.allowed_days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  }
  next();
});

// Method to check permission
adminSchema.methods.hasPermission = function(permission) {
  return this.permissions[permission] === true;
};

// Method to grant permission
adminSchema.methods.grantPermission = function(permission, grantedBy) {
  if (this.permissions.hasOwnProperty(permission)) {
    this.permissions[permission] = true;
    this.updated_by = grantedBy;
    return this.save();
  }
  throw new Error(`Invalid permission: ${permission}`);
};

// Method to revoke permission
adminSchema.methods.revokePermission = function(permission, revokedBy) {
  if (this.permissions.hasOwnProperty(permission)) {
    this.permissions[permission] = false;
    this.updated_by = revokedBy;
    return this.save();
  }
  throw new Error(`Invalid permission: ${permission}`);
};

// Method to update activity
adminSchema.methods.updateActivity = function(activityType = 'general') {
  this.activity.last_activity = new Date();
  
  if (activityType === 'login') {
    this.activity.last_login = new Date();
    this.activity.login_count += 1;
    this.activity.failed_login_attempts = 0; // Reset on successful login
  }
  
  return this.save();
};

// Method to lock account
adminSchema.methods.lockAccount = function(durationMinutes = 30, reason = 'Security violation') {
  this.activity.account_locked_until = new Date(Date.now() + (durationMinutes * 60 * 1000));
  this.status = 'suspended';
  return this.save();
};

// Method to unlock account
adminSchema.methods.unlockAccount = function(unlockedBy) {
  this.activity.account_locked_until = undefined;
  this.activity.failed_login_attempts = 0;
  this.status = 'active';
  this.updated_by = unlockedBy;
  return this.save();
};

// Method to update performance metrics
adminSchema.methods.updatePerformance = function(metrics) {
  Object.assign(this.performance, metrics);
  this.performance.last_performance_review = new Date();
  return this.save();
};

// Static method to find admins by department
adminSchema.statics.findByDepartment = function(department) {
  return this.find({ department, status: 'active' })
    .populate('user_id', 'login_id email role')
    .populate('reporting_to', 'admin_id full_name');
};

// Static method to find admins with specific permission
adminSchema.statics.findWithPermission = function(permission) {
  const query = {};
  query[`permissions.${permission}`] = true;
  return this.find({ ...query, status: 'active' })
    .populate('user_id', 'login_id email role');
};

// Static method to find available admins
adminSchema.statics.findAvailable = function() {
  return this.find({
    status: 'active',
    'availability.is_available': true,
    $or: [
      { 'availability.available_until': { $exists: false } },
      { 'availability.available_until': { $gte: new Date() } }
    ]
  })
    .populate('user_id', 'login_id email role');
};

const Admin = mongoose.models.NG_Admin || mongoose.model('NG_Admin', adminSchema);
export default Admin;