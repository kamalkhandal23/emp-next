import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [200, 'Project name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  code: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    uppercase: true
  },
  
  // Client Information
  client: {
    name: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: String,
    company: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  
  // Project Management
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Project manager is required']
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: [true, 'Project team is required']
  },
  assignedMembers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['lead', 'developer', 'designer', 'tester', 'analyst', 'consultant'],
      default: 'developer'
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    hourlyRate: {
      type: Number,
      min: 0
    }
  }],
  
  // Timeline
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  actualStartDate: Date,
  actualEndDate: Date,
  
  // Status and Priority
  status: {
    type: String,
    enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled', 'overdue'],
    default: 'planning'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  // Progress Tracking
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  milestones: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    dueDate: {
      type: Date,
      required: true
    },
    completedDate: Date,
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'overdue'],
      default: 'pending'
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Financial Information
  budget: {
    estimated: {
      type: Number,
      min: 0,
      required: [true, 'Estimated budget is required']
    },
    actual: {
      type: Number,
      min: 0,
      default: 0
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  
  // Technology Stack
  technologies: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    version: String,
    category: {
      type: String,
      enum: ['frontend', 'backend', 'database', 'devops', 'testing', 'design', 'other'],
      default: 'other'
    }
  }],
  
  // Project Phases
  phases: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'cancelled'],
      default: 'pending'
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    deliverables: [String]
  }],
  
  // Risk Management
  risks: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    probability: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    impact: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    mitigation: String,
    status: {
      type: String,
      enum: ['identified', 'mitigated', 'occurred', 'closed'],
      default: 'identified'
    },
    identifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    identifiedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Communication
  meetings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting'
  }],
  
  // Documents and Files
  documents: [{
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['requirement', 'design', 'technical', 'contract', 'other'],
      default: 'other'
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Quality Metrics
  quality: {
    codeQuality: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    testCoverage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    bugCount: {
      type: Number,
      min: 0,
      default: 0
    },
    clientSatisfaction: {
      type: Number,
      min: 0,
      max: 10,
      default: 0
    }
  },
  
  // Project Settings
  settings: {
    isPublic: {
      type: Boolean,
      default: false
    },
    allowTimeTracking: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    notifications: {
      email: { type: Boolean, default: true },
      slack: { type: Boolean, default: false }
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Virtual for project duration in days
projectSchema.virtual('duration').get(function() {
  if (!this.startDate || !this.endDate) return 0
  const diffTime = Math.abs(this.endDate - this.startDate)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// Virtual for days remaining
projectSchema.virtual('daysRemaining').get(function() {
  if (!this.endDate) return 0
  const today = new Date()
  const diffTime = this.endDate - today
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// Virtual for budget utilization
projectSchema.virtual('budgetUtilization').get(function() {
  if (!this.budget.estimated || this.budget.estimated === 0) return 0
  return Math.round((this.budget.actual / this.budget.estimated) * 100)
})

// Virtual for completed milestones count
projectSchema.virtual('completedMilestones').get(function() {
  return this.milestones.filter(milestone => milestone.status === 'completed').length
})

// Virtual for overdue milestones count
projectSchema.virtual('overdueMilestones').get(function() {
  const today = new Date()
  return this.milestones.filter(milestone => 
    milestone.status !== 'completed' && milestone.dueDate < today
  ).length
})

// Indexes
projectSchema.index({ name: 1 })
projectSchema.index({ code: 1 })
projectSchema.index({ status: 1 })
projectSchema.index({ priority: 1 })
projectSchema.index({ manager: 1 })
projectSchema.index({ team: 1 })
projectSchema.index({ startDate: 1, endDate: 1 })
projectSchema.index({ 'client.name': 1 })
projectSchema.index({ 'assignedMembers.user': 1 })

// Pre-save middleware to generate project code
projectSchema.pre('save', async function(next) {
  if (!this.code && this.isNew) {
    try {
      const year = new Date().getFullYear()
      const count = await this.constructor.countDocuments({
        createdAt: {
          $gte: new Date(year, 0, 1),
          $lt: new Date(year + 1, 0, 1)
        }
      })
      this.code = `PRJ${year}${String(count + 1).padStart(3, '0')}`
    } catch (error) {
      return next(error)
    }
  }
  next()
})

// Pre-save middleware to update status based on dates
projectSchema.pre('save', function(next) {
  const today = new Date()
  
  if (this.status === 'active') {
    if (this.endDate < today && this.progress < 100) {
      this.status = 'overdue'
    } else if (this.progress === 100) {
      this.status = 'completed'
      if (!this.actualEndDate) {
        this.actualEndDate = new Date()
      }
    }
  }
  
  next()
})

// Method to add team member to project
projectSchema.methods.addMember = function(userId, role = 'developer', hourlyRate = 0) {
  // Check if user is already assigned
  const existingMember = this.assignedMembers.find(member => 
    member.user.toString() === userId.toString()
  )
  
  if (existingMember) {
    existingMember.role = role
    existingMember.hourlyRate = hourlyRate
    return this
  }
  
  this.assignedMembers.push({
    user: userId,
    role: role,
    hourlyRate: hourlyRate,
    assignedAt: new Date()
  })
  
  return this
}

// Method to remove team member from project
projectSchema.methods.removeMember = function(userId) {
  this.assignedMembers = this.assignedMembers.filter(member => 
    member.user.toString() !== userId.toString()
  )
  return this
}

// Method to add milestone
projectSchema.methods.addMilestone = function(milestoneData) {
  this.milestones.push({
    ...milestoneData,
    status: 'pending'
  })
  return this
}

// Method to complete milestone
projectSchema.methods.completeMilestone = function(milestoneId) {
  const milestone = this.milestones.id(milestoneId)
  if (milestone) {
    milestone.status = 'completed'
    milestone.completedDate = new Date()
    
    // Update project progress based on completed milestones
    const completedCount = this.milestones.filter(m => m.status === 'completed').length
    const totalCount = this.milestones.length
    if (totalCount > 0) {
      this.progress = Math.round((completedCount / totalCount) * 100)
    }
  }
  return this
}

// Method to add risk
projectSchema.methods.addRisk = function(riskData, identifiedBy) {
  this.risks.push({
    ...riskData,
    identifiedBy: identifiedBy,
    identifiedAt: new Date(),
    status: 'identified'
  })
  return this
}

// Method to calculate project health score
projectSchema.methods.calculateHealthScore = function() {
  let score = 100
  
  // Deduct points for being overdue
  if (this.status === 'overdue') {
    score -= 30
  }
  
  // Deduct points for budget overrun
  if (this.budgetUtilization > 100) {
    score -= 20
  }
  
  // Deduct points for overdue milestones
  score -= this.overdueMilestones * 10
  
  // Deduct points for high-impact risks
  const highRisks = this.risks.filter(risk => 
    risk.impact === 'high' && risk.status !== 'mitigated'
  ).length
  score -= highRisks * 15
  
  return Math.max(0, score)
}

// Static method to find projects by status
projectSchema.statics.findByStatus = function(status) {
  return this.find({ status })
}

// Static method to find projects by manager
projectSchema.statics.findByManager = function(managerId) {
  return this.find({ manager: managerId })
}

// Static method to find projects by team
projectSchema.statics.findByTeam = function(teamId) {
  return this.find({ team: teamId })
}

// Static method to find user's projects
projectSchema.statics.findUserProjects = function(userId) {
  return this.find({
    $or: [
      { manager: userId },
      { 'assignedMembers.user': userId }
    ]
  })
}

const Project = mongoose.model('Project', projectSchema)

export default Project