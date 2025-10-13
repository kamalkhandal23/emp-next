import mongoose from 'mongoose';

const employeeTimesheetSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  workType: { type: String, enum: ['office', 'remote', 'hybrid', 'field-work', 'client-site'], default: 'office' },
  shifts: [{
    checkIn: {
      time: { type: Date, required: true },
      location: {
        type: { type: String, enum: ['office', 'remote', 'client-site'] },
        address: String,
        coordinates: { latitude: Number, longitude: Number }
      },
      method: { type: String, enum: ['manual', 'biometric', 'mobile-app', 'web'], default: 'manual' },
      deviceInfo: String,
      ipAddress: String
    },
    checkOut: {
      time: Date,
      location: {
        type: { type: String, enum: ['office', 'remote', 'client-site'] },
        address: String,
        coordinates: { latitude: Number, longitude: Number }
      },
      method: { type: String, enum: ['manual', 'biometric', 'mobile-app', 'web'], default: 'manual' },
      deviceInfo: String,
      ipAddress: String
    },
    breaks: [{
      startTime: Date,
      endTime: Date,
      type: { type: String, enum: ['lunch', 'tea', 'personal', 'meeting', 'other'], default: 'lunch' },
      duration: Number,
      reason: String
    }],
    hoursWorked: Number,
    overtimeHours: Number,
    status: { type: String, enum: ['present', 'late', 'early-departure', 'incomplete'], default: 'present' }
  }],
  projects: [{
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    tasks: [{
      task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
      description: String,
      timeSpent: Number,
      status: { type: String, enum: ['in-progress', 'completed', 'blocked', 'on-hold'], default: 'in-progress' },
      notes: String
    }],
    totalTimeSpent: Number
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
    factors: [{ type: String, enum: ['workload', 'team-collaboration', 'work-environment', 'personal', 'health', 'other'] }]
  },
  expenses: [{
    category: { type: String, enum: ['travel', 'meals', 'accommodation', 'supplies', 'communication', 'other'], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    description: String,
    receipt: String,
    billable: { type: Boolean, default: false },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }
  }],
  approvals: {
    selfApproved: {
      status: { type: Boolean, default: false },
      timestamp: Date,
      comments: String
    },
    managerApproved: {
      status: { type: Boolean, default: false },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      timestamp: Date,
      comments: String
    },
    hrApproved: {
      status: { type: Boolean, default: false },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      timestamp: Date,
      comments: String
    }
  },
  status: { type: String, enum: ['draft', 'submitted', 'approved', 'rejected', 'needs-revision'], default: 'draft' },
  flags: [{
    type: { type: String, enum: ['late-entry', 'early-exit', 'long-break', 'no-checkout', 'location-mismatch', 'overtime'] },
    description: String,
    severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    resolved: { type: Boolean, default: false },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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

// All the virtuals, statics, methods, pre-save, and index definitions as in your original file

employeeTimesheetSchema.index({ employee: 1, date: 1 }, { unique: true });
employeeTimesheetSchema.index({ date: 1 });
employeeTimesheetSchema.index({ status: 1 });
employeeTimesheetSchema.index({ 'projects.project': 1 });

// Virtuals and pre/method/statics...
// (All as in your file, but with model overwrite guard below)

const EmployeeTimesheet = mongoose.models.EmployeeTimesheet || mongoose.model('EmployeeTimesheet', employeeTimesheetSchema);
export default EmployeeTimesheet;
