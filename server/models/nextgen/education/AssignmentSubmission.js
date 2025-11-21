import mongoose from 'mongoose';

// Schema for tracking assignment submissions and completion
const assignmentSubmissionSchema = new mongoose.Schema({
  assignment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NG_AssignmentWithQuestions',
    required: true,
    index: true
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NG_Student',
    required: true,
    index: true
  },
  courseName: {
    type: String,
    required: true,
    trim: true
  },
  answers: {
    type: Map,
    of: mongoose.Schema.Types.Mixed, // Store answers for each question
    default: {}
  },
  started_at: {
    type: Date,
    default: Date.now
  },
  submitted_at: {
    type: Date
  },
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['in-progress', 'submitted', 'graded'],
    default: 'in-progress'
  },
  feedback: {
    type: String,
    default: ''
  },
  graded_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  graded_at: {
    type: Date
  }
}, {
  timestamps: true,
  collection: 'ng_assignment_submissions'
});

// Indexes for faster queries
assignmentSubmissionSchema.index({ assignment_id: 1, student_id: 1 });
assignmentSubmissionSchema.index({ student_id: 1, courseName: 1 });
assignmentSubmissionSchema.index({ status: 1 });

// Static method to check if student has completed assignment
assignmentSubmissionSchema.statics.hasCompleted = async function(studentId, assignmentId) {
  const submission = await this.findOne({
    student_id: studentId,
    assignment_id: assignmentId,
    status: { $in: ['submitted', 'graded'] }
  });
  return !!submission;
};

// Static method to get student's submission for an assignment
assignmentSubmissionSchema.statics.getSubmission = async function(studentId, assignmentId) {
  return await this.findOne({
    student_id: studentId,
    assignment_id: assignmentId
  });
};

const AssignmentSubmission = mongoose.models.NG_AssignmentSubmission ||
  mongoose.model('NG_AssignmentSubmission', assignmentSubmissionSchema);

export default AssignmentSubmission;
