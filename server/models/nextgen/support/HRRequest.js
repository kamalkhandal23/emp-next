import mongoose from 'mongoose';

const hrRequestSchema = new mongoose.Schema({
  // Request Information
  request_id: {
    type: String,
    unique: true
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NG_Student',
    required: true
  },
  
  // Request Details
  type: {
    type: String,
    enum: [
      'transcript_request',
      'certificate_request',
      'enrollment_verification',
      'grade_report',
      'recommendation_letter',
      'course_completion_certificate',
      'internship_letter',
      'character_certificate',
      'fee_receipt',
      'other'
    ],
    required: true,
    index: true
  },
  
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  
  // Priority and Urgency
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },
  urgency_reason: String,
  
  // Request Specifics
  details: {
    // For transcript/certificate requests
    courses: [String],
    semester: String,
    academic_year: String,
    
    // For recommendation letters
    purpose: String,
    recipient_name: String,
    recipient_organization: String,
    deadline: Date,
    
    // For verification requests
    verification_type: String,
    third_party_organization: String,
    
    // Additional requirements
    format: {
      type: String,
      enum: ['digital', 'physical', 'both'],
      default: 'digital'
    },
    delivery_method: {
      type: String,
      enum: ['email', 'pickup', 'mail', 'courier'],
      default: 'email'
    },
    delivery_address: String
  },
  
  // Status Tracking
  status: {
    type: String,
    enum: [
      'submitted',
      'under_review',
      'information_required',
      'in_progress',
      'ready_for_pickup',
      'completed',
      'rejected',
      'cancelled'
    ],
    default: 'submitted',
    index: true
  },
  
  // Processing Information
  assigned_to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NG_User'
  },
  assigned_at: Date,
  
  // Timeline
  submitted_at: {
    type: Date,
    default: Date.now
  },
  expected_completion: Date,
  completed_at: Date,
  
  // Communication
  notes: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NG_User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    is_internal: {
      type: Boolean,
      default: false
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Attachments
  attachments: [{
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['supporting_document', 'generated_document', 'other']
    },
    uploaded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NG_User'
    },
    uploaded_at: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Generated Documents
  generated_documents: [{
    name: String,
    url: String,
    document_type: String,
    generated_at: {
      type: Date,
      default: Date.now
    },
    generated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NG_User'
    }
  }],
  
  // Approval Workflow
  approval_required: {
    type: Boolean,
    default: false
  },
  approvals: [{
    approver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NG_User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    comments: String,
    approved_at: Date
  }],
  
  // Fees and Payment
  fee_required: {
    type: Boolean,
    default: false
  },
  fee_amount: Number,
  fee_currency: {
    type: String,
    default: 'INR'
  },
  payment_status: {
    type: String,
    enum: ['not_required', 'pending', 'paid', 'refunded'],
    default: 'not_required'
  },
  payment_reference: String,
  
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
hrRequestSchema.index({ request_id: 1 });
hrRequestSchema.index({ student_id: 1, status: 1 });
hrRequestSchema.index({ type: 1, status: 1 });
hrRequestSchema.index({ priority: 1, submitted_at: 1 });
hrRequestSchema.index({ assigned_to: 1, status: 1 });
hrRequestSchema.index({ submitted_at: -1 });

// Virtual for processing time
hrRequestSchema.virtual('processing_time').get(function() {
  if (this.completed_at && this.submitted_at) {
    return Math.ceil((this.completed_at - this.submitted_at) / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Virtual for is overdue
hrRequestSchema.virtual('is_overdue').get(function() {
  if (this.expected_completion && this.status !== 'completed') {
    return new Date() > this.expected_completion;
  }
  return false;
});

// Pre-save middleware to generate request ID
hrRequestSchema.pre('save', async function(next) {
  if (!this.request_id && this.isNew) {
    try {
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      const count = await this.constructor.countDocuments({
        created_at: {
          $gte: new Date(year, new Date().getMonth(), 1),
          $lt: new Date(year, new Date().getMonth() + 1, 1)
        }
      });
      this.request_id = `HR${year}${month}${String(count + 1).padStart(4, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Method to add note
hrRequestSchema.methods.addNote = function(authorId, content, isInternal = false) {
  this.notes.push({
    author: authorId,
    content: content,
    is_internal: isInternal,
    created_at: new Date()
  });
  return this.save();
};

// Method to update status
hrRequestSchema.methods.updateStatus = function(newStatus, updatedBy, note = null) {
  this.status = newStatus;
  this.updated_by = updatedBy;
  
  if (newStatus === 'completed') {
    this.completed_at = new Date();
  }
  
  if (note) {
    this.addNote(updatedBy, note, true);
  }
  
  return this.save();
};

// Method to assign request
hrRequestSchema.methods.assignTo = function(userId, assignedBy) {
  this.assigned_to = userId;
  this.assigned_at = new Date();
  this.status = 'in_progress';
  this.updated_by = assignedBy;
  
  return this.save();
};

// Method to add approval
hrRequestSchema.methods.addApproval = function(approverId, status, comments = '') {
  const existingApproval = this.approvals.find(
    approval => approval.approver.toString() === approverId.toString()
  );
  
  if (existingApproval) {
    existingApproval.status = status;
    existingApproval.comments = comments;
    existingApproval.approved_at = new Date();
  } else {
    this.approvals.push({
      approver: approverId,
      status: status,
      comments: comments,
      approved_at: new Date()
    });
  }
  
  // Check if all approvals are complete
  const pendingApprovals = this.approvals.filter(approval => approval.status === 'pending');
  if (pendingApprovals.length === 0) {
    const rejectedApprovals = this.approvals.filter(approval => approval.status === 'rejected');
    if (rejectedApprovals.length > 0) {
      this.status = 'rejected';
    } else {
      this.status = 'in_progress';
    }
  }
  
  return this.save();
};

// Static method to find requests by student
hrRequestSchema.statics.findByStudent = function(studentId) {
  return this.find({ student_id: studentId })
    .populate('student_id', 'student_id full_name email')
    .populate('assigned_to', 'full_name email role')
    .sort({ submitted_at: -1 });
};

// Static method to find requests by status
hrRequestSchema.statics.findByStatus = function(status) {
  return this.find({ status })
    .populate('student_id', 'student_id full_name email')
    .populate('assigned_to', 'full_name email role')
    .sort({ submitted_at: -1 });
};

// Static method to find overdue requests
hrRequestSchema.statics.findOverdue = function() {
  return this.find({
    expected_completion: { $lt: new Date() },
    status: { $nin: ['completed', 'cancelled', 'rejected'] }
  })
    .populate('student_id', 'student_id full_name email')
    .populate('assigned_to', 'full_name email role')
    .sort({ expected_completion: 1 });
};

const HRRequest = mongoose.models.NG_HRRequest || mongoose.model('NG_HRRequest', hrRequestSchema);
export default HRRequest;