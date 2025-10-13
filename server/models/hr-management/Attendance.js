import mongoose from 'mongoose'

const attendanceSchema = new mongoose.Schema({
  // Employee Information
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employee is required']
  },
  
  // Date Information
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: () => {
      const today = new Date()
      return new Date(today.getFullYear(), today.getMonth(), today.getDate())
    }
  },
  
  // Time Tracking
  checkIn: {
    time: Date,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0]
      }
    },
    method: {
      type: String,
      enum: ['manual', 'biometric', 'mobile', 'web'],
      default: 'web'
    },
    ipAddress: String,
    deviceInfo: String
  },
  
  checkOut: {
    time: Date,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0]
      }
    },
    method: {
      type: String,
      enum: ['manual', 'biometric', 'mobile', 'web'],
      default: 'web'
    },
    ipAddress: String,
    deviceInfo: String
  },
  
  // Break Tracking
  breaks: [{
    startTime: {
      type: Date,
      required: true
    },
    endTime: Date,
    type: {
      type: String,
      enum: ['lunch', 'tea', 'personal', 'meeting', 'other'],
      default: 'other'
    },
    duration: Number, // in minutes
    notes: String
  }],
  
  // Work Hours Calculation
  totalHours: {
    type: Number,
    default: 0
  },
  regularHours: {
    type: Number,
    default: 0
  },
  overtimeHours: {
    type: Number,
    default: 0
  },
  breakHours: {
    type: Number,
    default: 0
  },
  
  // Attendance Status
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half-day', 'work-from-home', 'on-leave', 'holiday'],
    default: 'present'
  },
  
  // Late/Early Information
  isLate: {
    type: Boolean,
    default: false
  },
  lateMinutes: {
    type: Number,
    default: 0
  },
  isEarlyLeave: {
    type: Boolean,
    default: false
  },
  earlyLeaveMinutes: {
    type: Number,
    default: 0
  },
  
  // Work Location
  workLocation: {
    type: String,
    enum: ['office', 'home', 'client-site', 'other'],
    default: 'office'
  },
  
  // Approval and Notes
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  notes: {
    employee: String,
    manager: String,
    hr: String
  },
  
  // System Information
  isManualEntry: {
    type: Boolean,
    default: false
  },
  manualEntryReason: String,
  enteredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Productivity Metrics
  productivity: {
    tasksCompleted: {
      type: Number,
      default: 0
    },
    hoursLogged: {
      type: Number,
      default: 0
    },
    meetingsAttended: {
      type: Number,
      default: 0
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  
  // Shift Information
  shift: {
    name: {
      type: String,
      default: 'Regular'
    },
    startTime: {
      type: String,
      default: '09:00'
    },
    endTime: {
      type: String,
      default: '18:00'
    },
    expectedHours: {
      type: Number,
      default: 8
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Compound index for employee and date (unique)
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true })

// Other indexes
attendanceSchema.index({ date: 1 })
attendanceSchema.index({ status: 1 })
attendanceSchema.index({ employee: 1, createdAt: -1 })
attendanceSchema.index({ 'checkIn.time': 1 })
attendanceSchema.index({ 'checkOut.time': 1 })

// GeoSpatial index for location
attendanceSchema.index({ 'checkIn.location': '2dsphere' })
attendanceSchema.index({ 'checkOut.location': '2dsphere' })

// Virtual for formatted work hours
attendanceSchema.virtual('formattedHours').get(function() {
  const hours = Math.floor(this.totalHours)
  const minutes = Math.round((this.totalHours - hours) * 60)
  return `${hours}h ${minutes}m`
})

// Virtual for work duration in milliseconds
attendanceSchema.virtual('workDuration').get(function() {
  if (!this.checkIn.time || !this.checkOut.time) return 0
  return this.checkOut.time - this.checkIn.time
})

// Virtual for break duration in minutes
attendanceSchema.virtual('totalBreakMinutes').get(function() {
  return this.breaks.reduce((total, breakItem) => {
    if (breakItem.endTime) {
      const duration = (breakItem.endTime - breakItem.startTime) / (1000 * 60)
      return total + duration
    }
    return total
  }, 0)
})

// Virtual for effective work hours (excluding breaks)
attendanceSchema.virtual('effectiveHours').get(function() {
  return Math.max(0, this.totalHours - (this.totalBreakMinutes / 60))
})

// Pre-save middleware to calculate work hours and status
attendanceSchema.pre('save', function(next) {
  // Calculate total hours if both check-in and check-out exist
  if (this.checkIn.time && this.checkOut.time) {
    const workDurationMs = this.checkOut.time - this.checkIn.time
    const breakDurationMs = this.totalBreakMinutes * 60 * 1000
    const effectiveWorkMs = Math.max(0, workDurationMs - breakDurationMs)
    
    this.totalHours = effectiveWorkMs / (1000 * 60 * 60) // Convert to hours
    this.breakHours = breakDurationMs / (1000 * 60 * 60)
    
    // Calculate regular and overtime hours
    const expectedHours = this.shift.expectedHours || 8
    if (this.totalHours <= expectedHours) {
      this.regularHours = this.totalHours
      this.overtimeHours = 0
    } else {
      this.regularHours = expectedHours
      this.overtimeHours = this.totalHours - expectedHours
    }
  }
  
  // Determine if employee is late
  if (this.checkIn.time && this.shift.startTime) {
    const [shiftHour, shiftMinute] = this.shift.startTime.split(':').map(Number)
    const shiftStart = new Date(this.date)
    shiftStart.setHours(shiftHour, shiftMinute, 0, 0)
    
    if (this.checkIn.time > shiftStart) {
      this.isLate = true
      this.lateMinutes = Math.round((this.checkIn.time - shiftStart) / (1000 * 60))
      
      // Update status if significantly late
      if (this.lateMinutes > 30) {
        this.status = 'late'
      }
    }
  }
  
  // Determine if employee left early
  if (this.checkOut.time && this.shift.endTime) {
    const [shiftHour, shiftMinute] = this.shift.endTime.split(':').map(Number)
    const shiftEnd = new Date(this.date)
    shiftEnd.setHours(shiftHour, shiftMinute, 0, 0)
    
    if (this.checkOut.time < shiftEnd) {
      this.isEarlyLeave = true
      this.earlyLeaveMinutes = Math.round((shiftEnd - this.checkOut.time) / (1000 * 60))
    }
  }
  
  // Determine half-day status
  if (this.totalHours > 0 && this.totalHours < (this.shift.expectedHours || 8) / 2) {
    this.status = 'half-day'
  }
  
  next()
})

// Method to check in
attendanceSchema.methods.checkInEmployee = function(location, method = 'web', ipAddress, deviceInfo) {
  if (this.checkIn.time) {
    throw new Error('Employee has already checked in today')
  }
  
  this.checkIn = {
    time: new Date(),
    location: location,
    method: method,
    ipAddress: ipAddress,
    deviceInfo: deviceInfo
  }
  
  this.status = 'present'
  return this
}

// Method to check out
attendanceSchema.methods.checkOutEmployee = function(location, method = 'web', ipAddress, deviceInfo) {
  if (!this.checkIn.time) {
    throw new Error('Employee must check in before checking out')
  }
  
  if (this.checkOut.time) {
    throw new Error('Employee has already checked out today')
  }
  
  this.checkOut = {
    time: new Date(),
    location: location,
    method: method,
    ipAddress: ipAddress,
    deviceInfo: deviceInfo
  }
  
  return this
}

// Method to start break
attendanceSchema.methods.startBreak = function(type = 'other', notes = '') {
  // Check if there's an ongoing break
  const ongoingBreak = this.breaks.find(breakItem => !breakItem.endTime)
  if (ongoingBreak) {
    throw new Error('There is already an ongoing break')
  }
  
  this.breaks.push({
    startTime: new Date(),
    type: type,
    notes: notes
  })
  
  return this
}

// Method to end break
attendanceSchema.methods.endBreak = function() {
  // Find the ongoing break
  const ongoingBreak = this.breaks.find(breakItem => !breakItem.endTime)
  if (!ongoingBreak) {
    throw new Error('No ongoing break found')
  }
  
  ongoingBreak.endTime = new Date()
  ongoingBreak.duration = Math.round((ongoingBreak.endTime - ongoingBreak.startTime) / (1000 * 60))
  
  return this
}

// Method to add manual entry
attendanceSchema.methods.addManualEntry = function(checkInTime, checkOutTime, reason, enteredBy) {
  this.checkIn.time = checkInTime
  this.checkOut.time = checkOutTime
  this.isManualEntry = true
  this.manualEntryReason = reason
  this.enteredBy = enteredBy
  this.status = 'present'
  
  return this
}

// Method to approve attendance
attendanceSchema.methods.approve = function(approvedBy, notes = '') {
  this.approvedBy = approvedBy
  this.approvedAt = new Date()
  if (notes) {
    this.notes.manager = notes
  }
  
  return this
}

// Method to calculate productivity score
attendanceSchema.methods.calculateProductivityScore = function() {
  let score = 0
  
  // Base score for attendance
  if (this.status === 'present') {
    score += 40
  } else if (this.status === 'work-from-home') {
    score += 35
  } else if (this.status === 'half-day') {
    score += 20
  }
  
  // Score for punctuality
  if (!this.isLate) {
    score += 20
  } else if (this.lateMinutes <= 15) {
    score += 10
  }
  
  // Score for full day work
  if (!this.isEarlyLeave) {
    score += 20
  } else if (this.earlyLeaveMinutes <= 15) {
    score += 10
  }
  
  // Score for tasks and meetings
  score += Math.min(this.productivity.tasksCompleted * 2, 10)
  score += Math.min(this.productivity.meetingsAttended * 1, 10)
  
  this.productivity.score = Math.min(score, 100)
  return this.productivity.score
}

// Static method to find attendance by employee and date range
attendanceSchema.statics.findByEmployeeAndDateRange = function(employeeId, startDate, endDate) {
  return this.find({
    employee: employeeId,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: -1 })
}

// Static method to find today's attendance
attendanceSchema.statics.findTodaysAttendance = function() {
  const today = new Date()
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
  
  return this.find({
    date: {
      $gte: startOfDay,
      $lt: endOfDay
    }
  }).populate('employee', 'firstName lastName employeeId department')
}

// Static method to find attendance by status
attendanceSchema.statics.findByStatus = function(status, date = new Date()) {
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
  
  return this.find({
    status: status,
    date: {
      $gte: startOfDay,
      $lt: endOfDay
    }
  }).populate('employee', 'firstName lastName employeeId department')
}

// Static method to get attendance summary for a period
attendanceSchema.statics.getAttendanceSummary = async function(employeeId, startDate, endDate) {
  const attendanceRecords = await this.find({
    employee: employeeId,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  })
  
  const summary = {
    totalDays: attendanceRecords.length,
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    halfDays: 0,
    workFromHomeDays: 0,
    totalHours: 0,
    averageHours: 0,
    overtimeHours: 0,
    productivityScore: 0
  }
  
  attendanceRecords.forEach(record => {
    switch (record.status) {
      case 'present':
        summary.presentDays++
        break
      case 'absent':
        summary.absentDays++
        break
      case 'half-day':
        summary.halfDays++
        break
      case 'work-from-home':
        summary.workFromHomeDays++
        break
    }
    
    if (record.isLate) summary.lateDays++
    summary.totalHours += record.totalHours
    summary.overtimeHours += record.overtimeHours
    summary.productivityScore += record.productivity.score
  })
  
  if (summary.totalDays > 0) {
    summary.averageHours = summary.totalHours / summary.totalDays
    summary.productivityScore = summary.productivityScore / summary.totalDays
  }
  
  return summary
}

const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);

export default Attendance;
