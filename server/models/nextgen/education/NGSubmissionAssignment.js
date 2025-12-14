import mongoose from 'mongoose';

const ngSubmissionAssignmentSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ng_approved_students',
    required: true,
    index: true
  },
  assignment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NG_AssignmentWithQuestions',
    required: true,
    index: true
  },
      courseName: {
        type: String,
        trim: true,
      },
      answers: {
        type: Map,
        of: mongoose.Schema.Types.Mixed, // Store answers for each question
        default: {},
      },
      textSubmission: {
        type: String,
        default: '',
      },
      fileSubmissions: [
        {
          filename: String,
          originalName: String,
          path: String,
          url: String, // Supabase Storage URL
          mimetype: String,
          size: Number,
          uploadedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      started_at: {
        type: Date,
        default: Date.now,
      },
      submitted_at: {
        type: Date,
      },
      score: {
        type: Number,
        min: 0,
        max: 100,
      },
      status: {
        type: String,
        enum: ['in-progress', 'submitted', 'graded'],
        default: 'in-progress',
      },
      feedback: {
        type: String,
        default: '',
      },
      graded_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      graded_at: {
        type: Date,
      },
    },{
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