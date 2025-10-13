import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  // Ticket Information
  ticket_id: {
    type: String,
    unique: true,
    index: true
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NG_Student',
    required: true
  },
  
  // Ticket Details
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  
  // Categorization
  category: {
    type: String,
    enum: [
      'technical_issue',
      'account_access',
      'course_content',
      'payment_billing',
      'certificate_issue',
      'exam_related',
      'general_inquiry',
      'complaint',
      'suggestion',
      'other'
    ],
    required: true,
    index: true
  },
  
  subcategory: String,
  
  // Priority and Severity
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    index: true
  },
  
  severity: {
    type: String,
    enum: ['minor', 'moderate', 'major', 'critical'],
    default: 'moderate'
  },
  
  // Status Tracking
  status: {
    type: String,
    enum: [
      'open',
      'in_progress',
      'waiting_for_response',
      'escalated',
      'resolved',
      'closed',
      'cancelled'
    ],
    default: 'open',
    index: true
  },
  
  // Assignment
  assigned_to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NG_User'
  },
  assigned_at: Date,
  department: {
    type: String,
    enum: ['technical', 'academic', 'administrative', 'billing', 'general'],
    default: 'general'
  },
  
  // Timeline
  first_response_at: Date,
  resolved_at: Date,
  closed_at: Date,
  
  // SLA Tracking
  sla: {
    response_time_hours: {
      type: Number,
      default: 24
    },
    resolution_time_hours: {
      type: Number,
      default: 72
    },
    is_response_overdue: {
      type: Boolean,
      default: false
    },
    is_resolution_overdue: {
      type: Boolean,
      default: false
    }
  },
  
  // Communication Thread
  messages: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NG_User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    message_type: {
      type: String,
      enum: ['message', 'internal_note', 'status_update', 'system_message'],
      default: 'message'
    },
    is_internal: {
      type: Boolean,
      default: false
    },
    attachments: [{
      name: String,
      url: String,
      size: Number,
      type: String
    }],
    created_at: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Resolution Information
  resolution: {
    summary: String,
    solution: String,
    resolved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NG_User'
    },
    resolution_type: {
      type: String,
      enum: ['solved', 'workaround', 'duplicate', 'not_reproducible', 'wont_fix']
    },
    satisfaction_rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String
  },
  
  // Related Information
  related_course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NG_Course'
  },
  related_exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NG_Exam'
  },
  
  // Tags and Labels
  tags: [String],
  
  // System Information
  user_agent: String,
  ip_address: String,
  
  // Metadata
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NG_User'
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NG_User'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
ticketSchema.index({ ticket_id: 1 });
ticketSchema.index({ student_id: 1, status: 1 });
ticketSchema.index({ category: 1, status: 1 });
ticketSchema.index({ priority: 1, created_at: -1 });
ticketSchema.index({ assigned_to: 1, status: 1 });
ticketSchema.index({ status: 1, created_at: -1 });

// Virtual for age in hours
ticketSchema.virtual('age_hours').get(function() {
  return Math.ceil((new Date() - this.created_at) / (1000 * 60 * 60));
});

// Virtual for is overdue
ticketSchema.virtual('is_overdue').get(function() {
  const ageHours = this.age_hours;
  
  if (this.status === 'open' && !this.first_response_at) {
    return ageHours > this.sla.response_time_hours;
  }
  
  if (['open', 'in_progress', 'waiting_for_response'].includes(this.status)) {
    return ageHours > this.sla.resolution_time_hours;
  }
  
  return false;
});

// Pre-save middleware to generate ticket ID
ticketSchema.pre('save', async function(next) {
  if (!this.ticket_id && this.isNew) {
    try {
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      const count = await this.constructor.countDocuments({
        created_at: {
          $gte: new Date(year, new Date().getMonth(), 1),
          $lt: new Date(year, new Date().getMonth() + 1, 1)
        }
      });
      this.ticket_id = `TKT${year}${month}${String(count + 1).padStart(4, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Method to add message
ticketSchema.methods.addMessage = function(authorId, content, messageType = 'message', isInternal = false) {
  const message = {
    author: authorId,
    content: content,
    message_type: messageType,
    is_internal: isInternal,
    created_at: new Date()
  };
  
  this.messages.push(message);
  
  // Update first response time if this is the first response from staff
  if (!this.first_response_at && messageType === 'message' && !isInternal) {
    this.first_response_at = new Date();
  }
  
  return this.save();
};

// Method to update status
ticketSchema.methods.updateStatus = function(newStatus, updatedBy, note = null) {
  const oldStatus = this.status;
  this.status = newStatus;
  this.updated_by = updatedBy;
  
  if (newStatus === 'resolved' && oldStatus !== 'resolved') {
    this.resolved_at = new Date();
  }
  
  if (newStatus === 'closed' && oldStatus !== 'closed') {
    this.closed_at = new Date();
  }
  
  if (note) {
    this.addMessage(updatedBy, note, 'internal_note', true);
  }
  
  return this.save();
};

// Static method to find tickets by student
ticketSchema.statics.findByStudent = function(studentId) {
  return this.find({ student_id: studentId })
    .populate('student_id', 'student_id full_name email')
    .populate('assigned_to', 'full_name email role')
    .sort({ created_at: -1 });
};

const Ticket = mongoose.models.NG_Ticket || mongoose.model('NG_Ticket', ticketSchema);
export default Ticket;