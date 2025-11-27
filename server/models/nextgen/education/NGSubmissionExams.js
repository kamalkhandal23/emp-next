import mongoose from 'mongoose';

const ngSubmissionExamsSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NG_User',
    required: true,
    index: true
  },
  exam_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NG_ExamWithQuestions',
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
  collection: 'ng_submission_exams'
});

// Indexes for efficient queries
ngSubmissionExamsSchema.index({ exam_id: 1, student_id: 1 }, { unique: true });
ngSubmissionExamsSchema.index({ status: 1 });
ngSubmissionExamsSchema.index({ submitted_at: -1 });

const NGSubmissionExams = mongoose.models.NG_SubmissionExams ||
  mongoose.model('NG_SubmissionExams', ngSubmissionExamsSchema);

export default NGSubmissionExams;
