import mongoose from 'mongoose'

const leaveSchema = new mongoose.Schema({
  // Employee Information
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employee is required']
  },
  
  // Leave Details
  type: {
    type: String,
    enum: ['annual', 'sick', 'personal', 'maternity', 'paternity', 'emergency', 'unpaid'],
    required: [true, 'Leave type is required']
  },
  
  // Date Information
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  
  // Leave Duration
  totalDays: {
    type: Number,
    required: true,
    min: [0.5, 'Minimum leave duration is 0.5 days']
  },
  
  // Application Details
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    trim: true,
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  
  // Status and Approval
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  
  // Approval Workflow
  approvals: [{
    approver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    comments: String,
    approvedAt: Date,
    level: {
      type: Number,
      default: 1
    }
  }],
  
  // Final Approval
  finalApprover: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectedAt: Date,
  rejectionReason: String,
  
  // Emergency Contact (for emergency leaves)
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  
  // Medical Certificate (for sick leaves)
  medicalCertificate: {
    uploaded: { type: Boolean, default: false },
    url: String,
    uploadedAt: Date
  },
  
  // Handover Information
  handover: {
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    tasks: [String],
    instructions: String,
    completed: { type: Boolean, default: false }
  },
  
  // Leave Balance Impact
  balanceImpact: {
    deducted: { type: Boolean, default: false },
    deductedAt: Date,
    deductedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes
leaveSchema.index({ employee: 1 })
leaveSchema.index({ status: 1 })
leaveSchema.index({ type: 1 })
leaveSchema.index({ startDate: 1, endDate: 1 })
leaveSchema.index({ createdAt: -1 })

// Virtual for leave duration in working days
leaveSchema.virtual('workingDays').get(function() {
  if (!this.startDate || !this.endDate) return 0
  
  let count = 0
  const current = new Date(this.startDate)
  const end = new Date(this.endDate)
  
  while (current <= end) {
    const dayOfWeek = current.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude weekends
      count++
    }
    current.setDate(current.getDate() + 1)
  }
  
  return count
})

// Pre-save middleware to calculate total days
leaveSchema.pre('save', function(next) {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate)
    this.totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }
  next()
})

const Leave = mongoose.model('Leave', leaveSchema)
export default Leave