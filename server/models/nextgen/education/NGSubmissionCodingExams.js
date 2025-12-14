import mongoose from "mongoose";

const ngSubmissionCodingExamsSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NG_User",
      required: true,
      index: true,
    },
    exam_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NG_CodingExamWithQuestions",
      required: true,
      index: true,
    },
    question_id: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      enum: ["c", "cpp", "java", "python", "javascript"],
      required: true,
    },
    verdict: {
      type: String,
      enum: [
        "Accepted",
        "Wrong Answer",
        "Time Limit Exceeded",
        "Runtime Error",
        "Compilation Error",
        "Memory Limit Exceeded",
      ],
      required: true,
    },
    marks: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    executionTime: {
      type: String,
      default: "",
    },
    memory: {
      type: String,
      default: "",
    },
    output: {
      type: String,
      default: "",
    },
    error: {
      type: String,
      default: "",
    },
    submitted_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "ng_submission_codingexams",
  }
);

// Indexes
ngSubmissionCodingExamsSchema.index({ exam_id: 1, student_id: 1 });
ngSubmissionCodingExamsSchema.index({ question_id: 1 });
ngSubmissionCodingExamsSchema.index({ verdict: 1 });
ngSubmissionCodingExamsSchema.index({ submitted_at: -1 });

const NGSubmissionCodingExams =
  mongoose.models.NG_SubmissionCodingExams ||
  mongoose.model(
    "NG_SubmissionCodingExams",
    ngSubmissionCodingExamsSchema
  );

export default NGSubmissionCodingExams;
