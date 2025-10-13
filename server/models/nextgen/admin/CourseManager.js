import mongoose from 'mongoose';

const courseManagerSchema = new mongoose.Schema({
  // Basic Information
  manager_id: {
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
  
  // Professional Information
  employee_id: String,
  department: {
    type: String,
    enum: ['academic', 'technical', 'design', 'content', 'quality_assurance'],
    required: true
  },
  designation: String,
  experience_years: Number,
  
  // Specializations and Expertise
  specializations: [{
    subject: String,
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert']
    },
    years_experience: Number,
    certifications: [String]
  }],
  
  // Course Management Permissions
  permissions: {
    can_create_courses: { type: Boolean, default: true },
    can_edit_courses: { type: Boolean, default: true },
    can_delete_courses: { type: Boolean, default: false },
    can_approve_students: { type: Boolean, default: true },
    can_create_exams: { type: Boolean, default: true },
    can_grade_exams: { type: Boolean, default: true },
    can_issue_certificates: { type: Boolean, default: true },
    can_manage_announcements: { type: Boolean, default: true },
    can_view_analytics: { type: Boolean, default: true },
    max_courses_allowed: { type: Number, default: 10 }
  },
  
  // Assigned Courses
  assigned_courses: [{
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NG_Course',
      required: true
    },
    role: {
      type: String,
      enum: ['primary_manager', 'co_manager', 'content_creator', 'instructor'],
      default: 'primary_manager'
    },
    assigned_at: {
      type: Date,
      default: Date.now
    },
    assigned_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NG_User'
    },
    is_active: {
      type: Boolean,
      default: true
    }
  }],
  
  // Performance Metrics
  performance: {
    courses_managed: { type: Number, default: 0 },
    students_enrolled: { type: Number, default: 0 },
    completion_rate: { type: Number, default: 0 },
    average_rating: { type: Number, default: 0 },
    certificates_issued: { type: Number, default: 0 },
    last_updated: { type: Date, default: Date.now }
  },
  
  // Workload and Capacity
  workload: {
    current_students: { type: Number, default: 0 },
    max_students_capacity: { type: Number, default: 100 },
    active_courses: { type: Number, default: 0 },
    pending_approvals: { type: Number, default: 0 },
    pending_gradings: { type: Number, default: 0 }
  },
  
  // Status and Activity
  status: {
    type: String,
    enum: ['active', 'inactive', 'on_leave', 'suspended'],
    default: 'active',
    index: true
  },
  last_activity: Date,
  last_login: Date,
  
  // Profile Information
  profile: {
    avatar_url: String,
    bio: String,
    linkedin_url: String,
    portfolio_url: String,
    achievements: [String]
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
courseManagerSchema.index({ manager_id: 1 });
courseManagerSchema.index({ status: 1 });
courseManagerSchema.index({ department: 1 });
courseManagerSchema.index({ 'assigned_courses.course_id': 1 });

// Virtual for active courses count
courseManagerSchema.virtual('active_courses_count').get(function() {
  return this.assigned_courses.filter(course => course.is_active).length;
});

// Virtual for workload percentage
courseManagerSchema.virtual('workload_percentage').get(function() {
  if (this.workload.max_students_capacity === 0) return 0;
  return Math.round((this.workload.current_students / this.workload.max_students_capacity) * 100);
});

// Pre-save middleware to generate manager ID
courseManagerSchema.pre('save', async function(next) {
  if (!this.manager_id && this.isNew) {
    try {
      const year = new Date().getFullYear();
      const count = await this.constructor.countDocuments({
        created_at: {
          $gte: new Date(year, 0, 1),
          $lt: new Date(year + 1, 0, 1)
        }
      });
      this.manager_id = `CM${year}${String(count + 1).padStart(4, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Method to assign course
courseManagerSchema.methods.assignCourse = function(courseId, role = 'primary_manager', assignedBy) {
  const existingAssignment = this.assigned_courses.find(
    course => course.course_id.toString() === courseId.toString()
  );
  
  if (existingAssignment) {
    existingAssignment.role = role;
    existingAssignment.is_active = true;
    existingAssignment.assigned_by = assignedBy;
    existingAssignment.assigned_at = new Date();
  } else {
    if (this.active_courses_count >= this.permissions.max_courses_allowed) {
      throw new Error('Maximum course limit reached');
    }
    
    this.assigned_courses.push({
      course_id: courseId,
      role: role,
      assigned_by: assignedBy,
      assigned_at: new Date(),
      is_active: true
    });
  }
  
  this.workload.active_courses = this.active_courses_count + 1;
  return this.save();
};

// Method to update performance metrics
courseManagerSchema.methods.updatePerformance = function(metrics) {
  Object.assign(this.performance, metrics);
  this.performance.last_updated = new Date();
  return this.save();
};

// Static method to find managers by department
courseManagerSchema.statics.findByDepartment = function(department) {
  return this.find({ department, status: 'active' })
    .populate('user_id', 'login_id email role')
    .populate('assigned_courses.course_id', 'title slug visibility');
};

// Static method to find managers by course
courseManagerSchema.statics.findByCourse = function(courseId) {
  return this.find({
    'assigned_courses.course_id': courseId,
    'assigned_courses.is_active': true,
    status: 'active'
  })
    .populate('user_id', 'login_id email role')
    .populate('assigned_courses.course_id', 'title slug visibility');
};

const CourseManager = mongoose.models.NG_CourseManager || mongoose.model('NG_CourseManager', courseManagerSchema);
export default CourseManager;