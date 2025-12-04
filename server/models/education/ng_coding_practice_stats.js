// server/models/nextgen/education/ng_coding_practice_stats.js
import mongoose from "mongoose";

const codingPracticeStatsSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NG_ApprovedStudents",
      required: true,
      index: true,
      unique: true,
    },

    total_solved: {
      type: Number,
      default: 0,
    },

    streak: {
      type: Number,
      default: 0,
    },

    last_solved_at: {
      type: Date,
      default: null,
    },

    // 🆕 New field — controls daily streak increment rule
    last_streak_increment: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "ng_coding_practice_stats",
  }
);

const CodingPracticeStats =
  mongoose.models.NG_CodingPracticeStats ||
  mongoose.model("NG_CodingPracticeStats", codingPracticeStatsSchema);

export default CodingPracticeStats;
