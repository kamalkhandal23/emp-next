import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  personalInfo: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say']
    },
    maritalStatus: {
      type: String,
      enum: ['single', 'married', 'divorced', 'widowed']
    },
    nationality: String,
    profileImage: String
  },
  address: {
    current: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    permanent: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String,
    address: String
  },
  employment: {
    hireDate: {
      type: Date,
      required: true
    },
    department: {
      type: String,
      required: true
    },
    position: {
      type: String,
      required: true
    },
    level: {
      type: String,
      enum: ['intern', 'junior', 'mid', 'senior', 'lead', 'manager', 'director', 'vp', 'c-level']
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
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'terminated', 'on-leave'],
      default: 'active'
    },
    terminationDate: Date,
    terminationReason: String
  },
  compensation: {
    salary: {
      amount: Number,
      currency: {
        type: String,
        default: 'USD'
      },
      frequency: {
        type: String,
        enum: ['hourly', 'monthly', 'annually'],
        default: 'annually'
      }
    },
    benefits: [{
      type: String,
      description: String,
      value: Number
    }],
    bonuses: [{
      type: String,
      amount: Number,
      date: Date,
      reason: String
    }]
  },
  skills: [{
    name: String,
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert']
    },
    certifications: [String],
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],
  education: [{
    institution: String,
    degree: String,
    field: String,
    startDate: Date,
    endDate: Date,
    gpa: Number,
    honors: String
  }],
  workExperience: [{
    company: String,
    position: String,
    startDate: Date,
    endDate: Date,
    description: String,
    achievements: [String]
  }],
  performance: {
    currentRating: {
      type: Number,
      min: 1,
      max: 5
    },
    reviews: [{
      period: String,
      rating: Number,
      reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
      },
      goals: [String],
      achievements: [String],
      areasForImprovement: [String],
      comments: String,
      date: Date
    }],
    goals: [{
      title: String,
      description: String,
      targetDate: Date,
      status: {
        type: String,
        enum: ['not-started', 'in-progress', 'completed', 'cancelled'],
        default: 'not-started'
      },
      progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      }
    }]
  },
  attendance: {
    totalWorkingDays: {
      type: Number,
      default: 0
    },
    daysPresent: {
      type: Number,
      default: 0
    },
    daysAbsent: {
      type: Number,
      default: 0
    },
    lateArrivals: {
      type: Number,
      default: 0
    },
    earlyDepartures: {
      type: Number,
      default: 0
    }
  },
  leaves: {
    annual: {
      allocated: {
        type: Number,
        default: 21
      },
      used: {
        type: Number,
        default: 0
      },
      remaining: {
        type: Number,
        default: 21
      }
    },
    sick: {
      allocated: {
        type: Number,
        default: 10
      },
      used: {
        type: Number,
        default: 0
      },
      remaining: {
        type: Number,
        default: 10
      }
    },
    personal: {
      allocated: {
        type: Number,
        default: 5
      },
      used: {
        type: Number,
        default: 0
      },
      remaining: {
        type: Number,
        default: 5
      }
    }
  },
  documents: [{
    type: {
      type: String,
      enum: ['resume', 'contract', 'id-proof', 'address-proof', 'education-certificate', 'other']
    },
    name: String,
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now
    },
    expiryDate: Date
  }],
  systemAccess: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permissions: [String],
    lastLogin: Date,
    accountStatus: {
      type: String,
      enum: ['active', 'suspended', 'locked'],
      default: 'active'
    }
  }
}, {
  timestamps: true
});

// Indexes
employeeSchema.index({ employeeId: 1 });
employeeSchema.index({ 'personalInfo.email': 1 });
employeeSchema.index({ 'employment.department': 1 });
employeeSchema.index({ 'employment.status': 1 });
employeeSchema.index({ 'employment.manager': 1 });

// Virtual for full name
employeeSchema.virtual('fullName').get(function() {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

// Virtual for years of service
employeeSchema.virtual('yearsOfService').get(function() {
  const now = new Date();
  const hireDate = this.employment.hireDate;
  return Math.floor((now - hireDate) / (365.25 * 24 * 60 * 60 * 1000));
});

// Virtual for attendance percentage
employeeSchema.virtual('attendancePercentage').get(function() {
  if (this.attendance.totalWorkingDays === 0) return 100;
  return Math.round((this.attendance.daysPresent / this.attendance.totalWorkingDays) * 100);
});

// Methods
employeeSchema.methods.updateLeaveBalance = function(leaveType, days) {
  if (this.leaves[leaveType]) {
    this.leaves[leaveType].used += days;
    this.leaves[leaveType].remaining = Math.max(0, this.leaves[leaveType].allocated - this.leaves[leaveType].used);
  }
  return this.save();
};

employeeSchema.methods.addPerformanceReview = function(reviewData) {
  this.performance.reviews.push(reviewData);
  this.performance.currentRating = reviewData.rating;
  return this.save();
};

employeeSchema.methods.updateAttendance = function(attendanceData) {
  Object.assign(this.attendance, attendanceData);
  return this.save();
};

employeeSchema.methods.getDirectReports = function() {
  return mongoose.model('Employee').find({ 'employment.manager': this._id });
};

employeeSchema.methods.isEligibleForLeave = function(leaveType, days) {
  return this.leaves[leaveType] && this.leaves[leaveType].remaining >= days;
};

// Static methods
employeeSchema.statics.findByDepartment = function(department) {
  return this.find({ 'employment.department': department, 'employment.status': 'active' });
};

employeeSchema.statics.findByManager = function(managerId) {
  return this.find({ 'employment.manager': managerId, 'employment.status': 'active' });
};

employeeSchema.statics.getUpcomingBirthdays = function(days = 30) {
  const today = new Date();
  const futureDate = new Date(today.getTime() + (days * 24 * 60 * 60 * 1000));
  
  return this.find({
    'employment.status': 'active',
    $expr: {
      $and: [
        { $gte: [{ $dayOfYear: '$personalInfo.dateOfBirth' }, { $dayOfYear: today }] },
        { $lte: [{ $dayOfYear: '$personalInfo.dateOfBirth' }, { $dayOfYear: futureDate }] }
      ]
    }
  });
};

export default mongoose.model('Employee', employeeSchema);