import mongoose from 'mongoose'

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true,
    unique: true,
    maxlength: [100, 'Team name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  department: {
    type: String,
    enum: ['Engineering', 'Design', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Management'],
    required: [true, 'Department is required']
  },
  
  // Team Leadership
  teamLead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Team lead is required']
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Team Members
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['lead', 'senior', 'junior', 'intern'],
      default: 'junior'
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  }],
  
  // Team Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
  
  // Team Metrics
  maxSize: {
    type: Number,
    default: 10,
    min: [1, 'Team must have at least 1 member'],
    max: [50, 'Team cannot exceed 50 members']
  },
  
  // Projects assigned to this team
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  
  // Team Goals and KPIs
  goals: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    targetDate: Date,
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
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Team Performance Metrics
  performance: {
    efficiency: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    productivity: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    qualityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  // Team Settings
  settings: {
    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' }
    },
    workingDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    },
    meetingFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'bi-weekly', 'monthly'],
      default: 'weekly'
    }
  },
  
  // Communication Channels
  channels: {
    slack: String,
    teams: String,
    email: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Virtual for current team size
teamSchema.virtual('currentSize').get(function() {
  return this.members.filter(member => member.status === 'active').length
})

// Virtual for team utilization
teamSchema.virtual('utilization').get(function() {
  return Math.round((this.currentSize / this.maxSize) * 100)
})

// Virtual for active members
teamSchema.virtual('activeMembers').get(function() {
  return this.members.filter(member => member.status === 'active')
})

// Indexes
teamSchema.index({ name: 1 })
teamSchema.index({ department: 1 })
teamSchema.index({ teamLead: 1 })
teamSchema.index({ manager: 1 })
teamSchema.index({ status: 1 })
teamSchema.index({ 'members.user': 1 })

// Pre-save middleware to set default working days
teamSchema.pre('save', function(next) {
  if (this.isNew && (!this.settings.workingDays || this.settings.workingDays.length === 0)) {
    this.settings.workingDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  }
  next()
})

// Method to add member to team
teamSchema.methods.addMember = function(userId, role = 'junior') {
  // Check if user is already a member
  const existingMember = this.members.find(member => 
    member.user.toString() === userId.toString()
  )
  
  if (existingMember) {
    if (existingMember.status === 'inactive') {
      existingMember.status = 'active'
      existingMember.joinedAt = new Date()
      existingMember.role = role
    }
    return this
  }
  
  // Check team capacity
  if (this.currentSize >= this.maxSize) {
    throw new Error('Team has reached maximum capacity')
  }
  
  this.members.push({
    user: userId,
    role: role,
    status: 'active',
    joinedAt: new Date()
  })
  
  return this
}

// Method to remove member from team
teamSchema.methods.removeMember = function(userId) {
  const memberIndex = this.members.findIndex(member => 
    member.user.toString() === userId.toString()
  )
  
  if (memberIndex === -1) {
    throw new Error('User is not a member of this team')
  }
  
  // Don't remove team lead
  if (this.teamLead.toString() === userId.toString()) {
    throw new Error('Cannot remove team lead. Assign a new team lead first.')
  }
  
  this.members[memberIndex].status = 'inactive'
  return this
}

// Method to update member role
teamSchema.methods.updateMemberRole = function(userId, newRole) {
  const member = this.members.find(member => 
    member.user.toString() === userId.toString() && member.status === 'active'
  )
  
  if (!member) {
    throw new Error('User is not an active member of this team')
  }
  
  member.role = newRole
  return this
}

// Method to change team lead
teamSchema.methods.changeTeamLead = function(newLeadId) {
  // Check if new lead is a team member
  const newLead = this.members.find(member => 
    member.user.toString() === newLeadId.toString() && member.status === 'active'
  )
  
  if (!newLead) {
    throw new Error('New team lead must be an active member of the team')
  }
  
  this.teamLead = newLeadId
  newLead.role = 'lead'
  
  return this
}

// Method to calculate team performance
teamSchema.methods.calculatePerformance = async function() {
  try {
    // This would typically involve complex calculations based on:
    // - Task completion rates
    // - Project delivery times
    // - Quality metrics
    // - Team member performance
    
    // For now, we'll use a simplified calculation
    const activeMembers = this.activeMembers.length
    const completedGoals = this.goals.filter(goal => goal.status === 'completed').length
    const totalGoals = this.goals.length
    
    let efficiency = 0
    if (totalGoals > 0) {
      efficiency = Math.round((completedGoals / totalGoals) * 100)
    }
    
    // Update performance metrics
    this.performance.efficiency = efficiency
    this.performance.productivity = Math.min(efficiency + 10, 100) // Simplified
    this.performance.qualityScore = Math.min(efficiency + 5, 100) // Simplified
    this.performance.lastUpdated = new Date()
    
    return this.performance
  } catch (error) {
    console.error('Error calculating team performance:', error)
    return this.performance
  }
}

// Static method to find teams by department
teamSchema.statics.findByDepartment = function(department) {
  return this.find({ department, status: 'active' })
}

// Static method to find teams by manager
teamSchema.statics.findByManager = function(managerId) {
  return this.find({ manager: managerId, status: 'active' })
}

// Static method to find user's teams
teamSchema.statics.findUserTeams = function(userId) {
  return this.find({
    'members.user': userId,
    'members.status': 'active',
    status: 'active'
  })
}

const Team = mongoose.model('Team', teamSchema)

export default Team