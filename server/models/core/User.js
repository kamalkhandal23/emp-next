import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false, // Don't include password in queries by default
    validate: {
      validator: function(password) {
        // Skip validation if password is already hashed (starts with $2)
        if (password && password.startsWith('$2')) {
          return true;
        }
        // Otherwise, check minimum length
        return password && password.length >= 6;
      },
      message: 'Password must be at least 6 characters'
    }
  },
  
  // Employee Information
  employeeId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  dateOfBirth: {
    type: Date
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'India' }
  },
  
  // Professional Information
  role: {
    type: String,
    enum: ['admin', 'hr', 'manager', 'team_lead', 'employee', 'student'],
    default: 'employee'
  },
  department: {
    type: String,
    enum: ['Engineering', 'Design', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Management', 'Education'],
    required: [true, 'Department is required']
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    trim: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Employment Details
  joinDate: {
    type: Date,
    default: Date.now
  },
  salary: {
    type: Number,
    min: [0, 'Salary cannot be negative']
  },
  employmentType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'intern'],
    default: 'full-time'
  },
  workLocation: {
    type: String,
    enum: ['office', 'remote', 'hybrid'],
    default: 'office'
  },
  
  // Status and Permissions
  status: {
    type: String,
    enum: ['active', 'inactive', 'terminated', 'on-leave'],
    default: 'active'
  },
  permissions: [{
    type: String,
    enum: [
      'view_all_employees',
      'manage_employees',
      'view_all_attendance',
      'manage_attendance',
      'view_all_tasks',
      'manage_tasks',
      'view_all_projects',
      'manage_projects',
      'view_all_teams',
      'manage_teams',
      'view_all_leaves',
      'manage_leaves',
      'view_reports',
      'manage_system'
    ]
  }],
  
  // Profile Information
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  skills: [String],
  
  // Leave Balance
  leaveBalance: {
    annual: { type: Number, default: 21 },
    sick: { type: Number, default: 12 },
    personal: { type: Number, default: 5 },
    maternity: { type: Number, default: 0 },
    paternity: { type: Number, default: 0 }
  },
  
  // Security
  lastLogin: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  
  // Preferences
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'Asia/Kolkata' }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`
})

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now())
})

// Indexes
userSchema.index({ role: 1 })
userSchema.index({ department: 1 })
userSchema.index({ status: 1 })
userSchema.index({ team: 1 })
userSchema.index({ manager: 1 })

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next()
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Pre-save middleware to generate employee ID
userSchema.pre('save', async function(next) {
  if (!this.employeeId && this.isNew && this.role !== 'student') {
    try {
      const count = await this.constructor.countDocuments({ role: { $ne: 'student' } })
      this.employeeId = `EMP${String(count + 1).padStart(4, '0')}`
    } catch (error) {
      return next(error)
    }
  }
  next()
})

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false
  return bcrypt.compare(candidatePassword, this.password)
}

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    })
  }
  
  const updates = { $inc: { loginAttempts: 1 } }
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 } // 2 hours
  }
  
  return this.updateOne(updates)
}

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  })
}

// Method to get user permissions based on role
userSchema.methods.getPermissions = function() {
  const rolePermissions = {
    admin: [
      'view_all_employees', 'manage_employees',
      'view_all_attendance', 'manage_attendance',
      'view_all_tasks', 'manage_tasks',
      'view_all_projects', 'manage_projects',
      'view_all_teams', 'manage_teams',
      'view_all_leaves', 'manage_leaves',
      'view_reports', 'manage_system'
    ],
    hr: [
      'view_all_employees', 'manage_employees',
      'view_all_attendance', 'manage_attendance',
      'view_all_leaves', 'manage_leaves',
      'view_reports'
    ],
    manager: [
      'view_all_employees',
      'view_all_attendance',
      'view_all_tasks', 'manage_tasks',
      'view_all_projects', 'manage_projects',
      'view_all_teams', 'manage_teams',
      'view_reports'
    ],
    team_lead: [
      'view_all_tasks', 'manage_tasks',
      'view_all_attendance',
      'view_reports'
    ],
    employee: []
  }
  
  return [...(rolePermissions[this.role] || []), ...this.permissions]
}

// Method to check if user has permission
userSchema.methods.hasPermission = function(permission) {
  return this.getPermissions().includes(permission)
}

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() })
}

// Static method to find active employees
userSchema.statics.findActiveEmployees = function() {
  return this.find({ status: 'active' })
}

const User = mongoose.model('User', userSchema)

export default User