import mongoose from 'mongoose'

const meetingSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Meeting title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // Organizer
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Organizer is required']
  },
  
  // Attendees
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['invited', 'accepted', 'declined', 'tentative', 'attended', 'absent'],
      default: 'invited'
    },
    responseAt: Date,
    isRequired: {
      type: Boolean,
      default: false
    }
  }],
  
  // Schedule
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required']
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata'
  },
  
  // Meeting Details
  type: {
    type: String,
    enum: ['standup', 'review', 'planning', 'retrospective', 'one-on-one', 'all-hands', 'client', 'interview', 'training', 'other'],
    default: 'other'
  },
  
  // Location/Platform
  location: {
    type: {
      type: String,
      enum: ['physical', 'virtual', 'hybrid'],
      default: 'virtual'
    },
    details: String, // Room name or meeting link
    address: String
  },
  
  // Meeting Status
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled', 'postponed'],
    default: 'scheduled'
  },
  
  // Recurrence
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrence: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    },
    interval: {
      type: Number,
      default: 1,
      min: 1
    },
    endDate: Date
  },
  
  // Agenda and Notes
  agenda: [String],
  notes: String,
  actionItems: [{
    task: String,
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    dueDate: Date,
    completed: {
      type: Boolean,
      default: false
    }
  }],
  
  // Project Association
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes
meetingSchema.index({ organizer: 1 })
meetingSchema.index({ startTime: 1 })
meetingSchema.index({ status: 1 })
meetingSchema.index({ 'attendees.user': 1 })
meetingSchema.index({ project: 1 })
meetingSchema.index({ team: 1 })

// Virtual for meeting duration
meetingSchema.virtual('duration').get(function() {
  if (!this.startTime || !this.endTime) return 0
  return Math.round((this.endTime - this.startTime) / (1000 * 60)) // in minutes
})

const Meeting = mongoose.model('Meeting', meetingSchema)
export default Meeting