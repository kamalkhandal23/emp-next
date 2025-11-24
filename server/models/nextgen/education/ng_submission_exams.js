// models/ngExamSubmission.model.js
import mongoose from "mongoose";

const examSubmissionSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ng_exams",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NG_ApprovedStudents", // yaha tumhara actual student model ka naam
      required: true,
    },
    // student ne kya answers diye
    answers: {
      type: Object, // ya [Object] if array chahiye
      required: true,
    },
    // calculated score (client ya server se)
    score: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["submitted", "evaluated"],
      default: "submitted",
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "ng_submission_exams",
  }
);

const NgExamSubmission = mongoose.model(
  "NgExamSubmission",
  examSubmissionSchema
);

export default NgExamSubmission;
