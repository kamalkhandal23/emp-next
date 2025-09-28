import mongoose from 'mongoose';

const employeeTimesheetSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  workType: {
    type: String,
    enum: ['office', 'remote', 'hybrid', 'field-work', 'client-site'],
    default: 'office'
  },
  shifts: [{
    checkIn: {
      time: { type: Date, required: true },
      location: {
        type: { type: String, enum: ['office', 'remote', 'client-site'] },
        address: String,
        coordinates: {
          latitude: Number,
          longitude: Number
        }
      },
      method: {
        type: String,
        enum: ['manual', 'biometric', 'mobile-app', 'web'],
        default: 'manual'
      },
      deviceInfo: String,
      ipAddress: String
    },
    checkOut: {
      time: Date,
      location: {
        type: { type: String, enum: ['office', 'remote', 'client-site'] },
        address: String,
        coordinates: {
          latitude: Number,
          longitude: Number
        }
      },
      method: {
        type: String,
        enum: ['manual', 'biometric', 'mobile-app', 'web'],
        default: 'manual'
      },
      deviceInfo: String,
      ipAddress: String
    },
    breaks: [{
      startTime: Date,
      endTime: Date,
      type: {
        type: String,
        enum: ['lunch', 'tea', 'personal', 'meeting', 'other'],
        default: 'lunch'
      },
      duration: Number, // in minutes
      reason: String
    }],
    hoursWorked: Number,
    overtimeHours: Number,
    status: {
      type: String,
      enum: ['present', 'late', 'early-departure', 'incomplete'],
      default: 'present'
    }
  }],
  projects: [{
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    tasks: [{
      task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
      },
      description: String,
      timeSpent: Number, // in minutes
      status: {
        type: String,
        enum: ['in-progress', 'completed', 'blocked', 'on-hold'],
        default: 'in-progress'
      },
      notes: String
    }],
    totalTimeSpent: Number // in minutes
  }],
  totalHours: {
    regular: { type: Number, default: 0 },
    overtime: { type: Number, default: 0 },
    break: { type: Number, default: 0 }
  },
  productivity: {
    tasksCompleted: { type: Number, default: 0 },
    tasksInProgress: { type: Number, default: 0 },
    productivityScore: { type: Number, min: 0, max: 100, default: 0 }
  },
  mood: {
    rating: { type: Number, min: 1, max: 5 },
    notes: String,
    factors: [{
      type: String,
      enum: ['workload', 'team-collaboration', 'work-environment', 'personal', 'health', 'other']
    }]
  },
  expenses: [{
    category: {
      type: String,
      enum: ['travel', 'meals', 'accommodation', 'supplies', 'communication', 'other'],
      required: true
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    description: String,
    receipt: String, // URL to receipt image
    billable: { type: Boolean, default: false },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    }
  }],
  approvals: {
    selfApproved: {
      status: { type: Boolean, default: false },
      timestamp: Date,
      comments: String
    },
    managerApproved: {
      status: { type: Boolean, default: false },
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      timestamp: Date,
      comments: String
    },
    hrApproved: {
      status: { type: Boolean, default: false },
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      timestamp: Date,
      comments: String
    }
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'approved', 'rejected', 'needs-revision'],
    default: 'draft'
  },
  flags: [{
    type: {
      type: String,
      enum: ['late-entry', 'early-exit', 'long-break', 'no-checkout', 'location-mismatch', 'overtime']
    },
    description: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    resolved: { type: Boolean, default: false },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date,
    resolution: String
  }],
  notes: String,
  attachments: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
employeeTimesheetSchema.index({ employee: 1, date: 1 }, { unique: true });
employeeTimesheetSchema.index({ date: 1 });
employeeTimesheetSchema.index({ status: 1 });
employeeTimesheetSchema.index({ 'projects.project': 1 });

// Virtual for total worked hours
employeeTimesheetSchema.virtual('totalWorkedHours').get(function() {
  return this.totalHours.regular + this.totalHours.overtime;
});

// Virtual for total break time
employeeTimesheetSchema.virtual('totalBreakTime').get(function() {
  let totalBreakMinutes = 0;
  this.shifts.forEach(shift => {
    if (shift.breaks) {
      shift.breaks.forEach(breakItem => {
        if (breakItem.duration) {
          totalBreakMinutes += breakItem.duration;
        }
      });
    }
  });
  return Math.round(totalBreakMinutes / 60 * 100) / 100; // Convert to hours
});

// Virtual for attendance status
employeeTimesheetSchema.virtual('attendanceStatus').get(function() {
  if (this.shifts.length === 0) return 'absent';
  
  const hasLateFlag = this.flags.some(flag => flag.type === 'late-entry');
  const hasEarlyExitFlag = this.flags.some(flag => flag.type === 'early-exit');
  
  if (hasLateFlag && hasEarlyExitFlag) return 'late-early-exit';
  if (hasLateFlag) return 'late';
  if (hasEarlyExitFlag) return 'early-exit';
  
  return 'present';
});

// Pre-save middleware to calculate totals
employeeTimesheetSchema.pre('save', function(next) {
  // Calculate total hours
  let regularHours = 0;
  let overtimeHours = 0;
  let breakMinutes = 0;
  
  this.shifts.forEach(shift => {
    if (shift.hoursWorked) {
      regularHours += Math.min(shift.hoursWorked, 8); // Assuming 8 hours is regular
      if (shift.hoursWorked > 8) {
        overtimeHours += shift.hoursWorked - 8;
      }
    }
    
    if (shift.breaks) {
      shift.breaks.forEach(breakItem => {
        if (breakItem.duration) {
          breakMinutes += breakItem.duration;
        }
      });
    }
  });
  
  this.totalHours.regular = Math.round(regularHours * 100) / 100;
  this.totalHours.overtime = Math.round(overtimeHours * 100) / 100;
  this.totalHours.break = Math.round(breakMinutes / 60 * 100) / 100;
  
  // Calculate project totals
  this.projects.forEach(project => {
    let totalMinutes = 0;
    project.tasks.forEach(task => {
      if (task.timeSpent) {
        totalMinutes += task.timeSpent;
      }
    });
    project.totalTimeSpent = totalMinutes;
  });
  
  // Calculate productivity score
  const totalTasks = this.productivity.tasksCompleted + this.productivity.tasksInProgress;
  if (totalTasks > 0) {
    this.productivity.productivityScore = Math.round(
      (this.productivity.tasksCompleted / totalTasks) * 100
    );
  }
  
  next();
});

// Method to add work entry
employeeTimesheetSchema.methods.addWorkEntry = function(projectId, taskData) {
  let project = this.projects.find(p => p.project.toString() === projectId.toString());
  
  if (!project) {
    project = { project: projectId, tasks: [], totalTimeSpent: 0 };
    this.projects.push(project);
    project = this.projects[this.projects.length - 1];
  }
  
  project.tasks.push(taskData);
  return this.save();
};

// Method to check in
employeeTimesheetSchema.methods.checkIn = function(checkInData) {
  const shift = {
    checkIn: {
      time: new Date(),
      ...checkInData
    },
    breaks: [],
    status: 'present'
  };
  
  this.shifts.push(shift);
  return this.save();
};

// Method to check out
employeeTimesheetSchema.methods.checkOut = function(checkOutData) {
  const currentShift = this.shifts[this.shifts.length - 1];
  if (!currentShift) {
    throw new Error('No active shift found');
  }
  
  currentShift.checkOut = {
    time: new Date(),
    ...checkOutData
  };
  
  // Calculate hours worked
  const checkInTime = new Date(currentShift.checkIn.time);
  const checkOutTime = new Date(currentShift.checkOut.time);
  const hoursWorked = (checkOutTime - checkInTime) / (1000 * 60 * 60);
  
  // Subtract break time
  let breakHours = 0;
  currentShift.breaks.forEach(breakItem => {
    if (breakItem.duration) {
      breakHours += breakItem.duration / 60;
    }
  });
  
  currentShift.hoursWorked = Math.round((hoursWorked - breakHours) * 100) / 100;
  
  return this.save();
};

// Method to add break
employeeTimesheetSchema.methods.addBreak = function(breakData) {
  const currentShift = this.shifts[this.shifts.length - 1];
  if (!currentShift) {
    throw new Error('No active shift found');
  }
  
  // Calculate duration if not provided
  if (breakData.startTime && breakData.endTime && !breakData.duration) {
    const duration = (new Date(breakData.endTime) - new Date(breakData.startTime)) / (1000 * 60);
    breakData.duration = Math.round(duration);
  }
  
  currentShift.breaks.push(breakData);
  return this.save();
};

// Method to submit timesheet
employeeTimesheetSchema.methods.submitTimesheet = function(comments = '') {
  this.status = 'submitted';
  this.approvals.selfApproved = {
    status: true,
    timestamp: new Date(),
    comments
  };
  return this.save();
};

// Static method to get employee timesheet summary
employeeTimesheetSchema.statics.getEmployeeSummary = function(employeeId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        employee: mongoose.Types.ObjectId(employeeId),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalDays: { $sum: 1 },
        totalRegularHours: { $sum: '$totalHours.regular' },
        totalOvertimeHours: { $sum: '$totalHours.overtime' },
        averageProductivity: { $avg: '$productivity.productivityScore' },
        totalExpenses: { $sum: { $sum: '$expenses.amount' } }
      }
    }
  ]);
};

// Static method to get team productivity report
employeeTimesheetSchema.statics.getTeamProductivityReport = function(teamMembers, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        employee: { $in: teamMembers },
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$employee',
        totalHours: { $sum: '$totalHours.regular' },
        totalOvertimeHours: { $sum: '$totalHours.overtime' },
        averageProductivity: { $avg: '$productivity.productivityScore' },
        totalTasksCompleted: { $sum: '$productivity.tasksCompleted' }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'employee'
      }
    }
  ]);
};

export default mongoose.model('EmployeeTimesheet', employeeTimesheetSchema);