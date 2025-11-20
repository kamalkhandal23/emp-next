import mongoose from 'mongoose';

const ngSubmissionAssignmentSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NG_User',
    required: true,
    index: true
  },
  assignment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NG_AssignmentWithQuestions',
    required: true,
    index: true
  },
  submission_data: {
    type: Object,
    required: true
  },
  submitted_at: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['submitted', 'graded', 'pending'],
    default: 'submitted'
  },
  grade: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  feedback: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  collection: 'ng_submission_assignments'
});

// Indexes for efficient queries
ngSubmissionAssignmentSchema.index({ assignment_id: 1, student_id: 1 }, { unique: true });
ngSubmissionAssignmentSchema.index({ status: 1 });
ngSubmissionAssignmentSchema.index({ submitted_at: -1 });

const NGSubmissionAssignment = mongoose.models.NG_SubmissionAssignment ||
  mongoose.model('NG_SubmissionAssignment', ngSubmissionAssignmentSchema);

export default NGSubmissionAssignment;
