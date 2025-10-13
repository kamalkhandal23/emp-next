import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  
  // Task Assignment
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Task must be assigned to someone']
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Task must have an assigner']
  },
  
  // Project and Team Association
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  
  // Task Properties
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'review', 'testing', 'completed', 'cancelled', 'blocked'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['development', 'design', 'testing', 'documentation', 'research', 'meeting', 'review', 'bug-fix', 'feature', 'maintenance'],
    default: 'development'
  },
  
  // Timeline
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  completedDate: Date,
  
  // Time Tracking
  estimatedHours: {
    type: Number,
    min: 0,
    default: 0
  },
  actualHours: {
    type: Number,
    min: 0,
    default: 0
  },
  timeEntries: [{
    date: {
      type: Date,
      default: Date.now
    },
    hours: {
      type: Number,
      required: true,
      min: 0
    },
    description: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],
  
  // Progress Tracking
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // Task Dependencies
  dependencies: [{
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },
    type: {
      type: String,
      enum: ['blocks', 'blocked-by', 'related'],
      default: 'blocks'
    }
  }],
  
  // Subtasks
  subtasks: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Labels and Tags
  labels: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    color: {
      type: String,
      default: '#3b82f6'
    }
  }],
  tags: [String],
  
  // Comments and Updates
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: Date,
    isInternal: {
      type: Boolean,
      default: false
    }
  }],
  
  // Attachments
  attachments: [{
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
      enum: ['image', 'document', 'video', 'audio', 'other'],
      default: 'other'
    },
    size: Number,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Review Information
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'changes-requested'],
    default: 'pending'
  },
  reviewComments: String,
  reviewedAt: Date,
  
  // Recurring Task Information
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrence: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      default: 'weekly'
    },
    interval: {
      type: Number,
      default: 1,
      min: 1
    },
    endDate: Date,
    nextDueDate: Date
  },
  
  // Task Metrics
  metrics: {
    viewCount: {
      type: Number,
      default: 0
    },
    editCount: {
      type: Number,
      default: 0
    },
    lastViewed: Date,
    lastEdited: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Virtual for task overdue status
taskSchema.virtual('isOverdue').get(function() {
  return this.dueDate < new Date() && this.status !== 'completed' && this.status !== 'cancelled'
})

// Virtual for days until due
taskSchema.virtual('daysUntilDue').get(function() {
  if (!this.dueDate) return null
  const today = new Date()
  const diffTime = this.dueDate - today
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// Virtual for completion percentage of subtasks
taskSchema.virtual('subtaskCompletion').get(function() {
  if (this.subtasks.length === 0) return 100
  const completed = this.subtasks.filter(subtask => subtask.completed).length
  return Math.round((completed / this.subtasks.length) * 100)
})

// Virtual for time efficiency
taskSchema.virtual('timeEfficiency').get(function() {
  if (!this.estimatedHours || this.estimatedHours === 0) return null
  if (this.actualHours === 0) return 100
  return Math.round((this.estimatedHours / this.actualHours) * 100)
})

// Indexes
taskSchema.index({ title: 1 })
taskSchema.index({ assignedTo: 1 })
taskSchema.index({ assignedBy: 1 })
taskSchema.index({ project: 1 })
taskSchema.index({ team: 1 })
taskSchema.index({ status: 1 })
taskSchema.index({ priority: 1 })
taskSchema.index({ category: 1 })
taskSchema.index({ dueDate: 1 })
taskSchema.index({ createdAt: -1 })
taskSchema.index({ 'labels.name': 1 })
taskSchema.index({ tags: 1 })

// Pre-save middleware to update completion date
taskSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'completed' && !this.completedDate) {
      this.completedDate = new Date()
      this.progress = 100
    } else if (this.status !== 'completed') {
      this.completedDate = undefined
    }
  }
  
  // Update actual hours from time entries
  if (this.timeEntries && this.timeEntries.length > 0) {
    this.actualHours = this.timeEntries.reduce((total, entry) => total + entry.hours, 0)
  }
  
  next()
})

// Method to add time entry
taskSchema.methods.addTimeEntry = function(hours, description, userId) {
  this.timeEntries.push({
    hours: hours,
    description: description,
    user: userId,
    date: new Date()
  })
  
  // Update actual hours
  this.actualHours = this.timeEntries.reduce((total, entry) => total + entry.hours, 0)
  
  return this
}

// Method to add comment
taskSchema.methods.addComment = function(content, userId, isInternal = false) {
  this.comments.push({
    user: userId,
    content: content,
    isInternal: isInternal,
    createdAt: new Date()
  })
  return this
}

// Method to add subtask
taskSchema.methods.addSubtask = function(title, description, assignedTo) {
  this.subtasks.push({
    title: title,
    description: description,
    assignedTo: assignedTo,
    completed: false
  })
  return this
}

// Method to complete subtask
taskSchema.methods.completeSubtask = function(subtaskId) {
  const subtask = this.subtasks.id(subtaskId)
  if (subtask) {
    subtask.completed = true
    subtask.completedAt = new Date()
    
    // Update task progress based on subtask completion
    const completedSubtasks = this.subtasks.filter(st => st.completed).length
    const totalSubtasks = this.subtasks.length
    if (totalSubtasks > 0) {
      this.progress = Math.round((completedSubtasks / totalSubtasks) * 100)
    }
  }
  return this
}

// Method to add dependency
taskSchema.methods.addDependency = function(taskId, type = 'blocks') {
  // Check if dependency already exists
  const existingDep = this.dependencies.find(dep => 
    dep.task.toString() === taskId.toString()
  )
  
  if (!existingDep) {
    this.dependencies.push({
      task: taskId,
      type: type
    })
  }
  
  return this
}

// Method to remove dependency
taskSchema.methods.removeDependency = function(taskId) {
  this.dependencies = this.dependencies.filter(dep => 
    dep.task.toString() !== taskId.toString()
  )
  return this
}

// Method to add label
taskSchema.methods.addLabel = function(name, color = '#3b82f6') {
  // Check if label already exists
  const existingLabel = this.labels.find(label => label.name === name)
  
  if (!existingLabel) {
    this.labels.push({ name, color })
  }
  
  return this
}

// Method to remove label
taskSchema.methods.removeLabel = function(name) {
  this.labels = this.labels.filter(label => label.name !== name)
  return this
}

// Method to update progress
taskSchema.methods.updateProgress = function(progress) {
  this.progress = Math.max(0, Math.min(100, progress))
  
  // Auto-update status based on progress
  if (this.progress === 0 && this.status === 'in-progress') {
    this.status = 'todo'
  } else if (this.progress > 0 && this.progress < 100 && this.status === 'todo') {
    this.status = 'in-progress'
  } else if (this.progress === 100 && this.status !== 'completed') {
    this.status = 'completed'
    this.completedDate = new Date()
  }
  
  return this
}

// Method to create recurring task
taskSchema.methods.createRecurringTask = function() {
  if (!this.isRecurring || !this.recurrence.nextDueDate) {
    return null
  }
  
  const newTask = new this.constructor({
    title: this.title,
    description: this.description,
    assignedTo: this.assignedTo,
    assignedBy: this.assignedBy,
    project: this.project,
    team: this.team,
    priority: this.priority,
    category: this.category,
    estimatedHours: this.estimatedHours,
    dueDate: this.recurrence.nextDueDate,
    isRecurring: true,
    recurrence: this.recurrence,
    labels: this.labels,
    tags: this.tags
  })
  
  // Calculate next due date
  const nextDue = new Date(this.recurrence.nextDueDate)
  switch (this.recurrence.frequency) {
    case 'daily':
      nextDue.setDate(nextDue.getDate() + this.recurrence.interval)
      break
    case 'weekly':
      nextDue.setDate(nextDue.getDate() + (7 * this.recurrence.interval))
      break
    case 'monthly':
      nextDue.setMonth(nextDue.getMonth() + this.recurrence.interval)
      break
    case 'yearly':
      nextDue.setFullYear(nextDue.getFullYear() + this.recurrence.interval)
      break
  }
  
  newTask.recurrence.nextDueDate = nextDue
  
  return newTask
}

// Static method to find tasks by assignee
taskSchema.statics.findByAssignee = function(userId) {
  return this.find({ assignedTo: userId })
}

// Static method to find tasks by project
taskSchema.statics.findByProject = function(projectId) {
  return this.find({ project: projectId })
}

// Static method to find tasks by team
taskSchema.statics.findByTeam = function(teamId) {
  return this.find({ team: teamId })
}

// Static method to find overdue tasks
taskSchema.statics.findOverdue = function() {
  return this.find({
    dueDate: { $lt: new Date() },
    status: { $nin: ['completed', 'cancelled'] }
  })
}

// Static method to find tasks by status
taskSchema.statics.findByStatus = function(status) {
  return this.find({ status })
}

// Static method to find tasks due today
taskSchema.statics.findDueToday = function() {
  const today = new Date()
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
  
  return this.find({
    dueDate: { $gte: startOfDay, $lt: endOfDay },
    status: { $nin: ['completed', 'cancelled'] }
  })
}

const Task = mongoose.model('Task', taskSchema)

export default Task