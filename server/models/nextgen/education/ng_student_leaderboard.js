// models/ng_student_leaderboard.js
import mongoose from "mongoose";

const studentLeaderboardSchema = new mongoose.Schema({
    course: { type: mongoose.Schema.Types.ObjectId, ref: "NG_Course" },
    updatedAt: { type: Date, default: Date.now },

    registrationRef: { type: mongoose.Schema.Types.ObjectId, ref: "NG_Registration" },

    student_id: {
        type: String,
        unique: true,
        sparse: true // allows null values
    },

    // Array of students in the leaderboard
    students: [
        {
            name: { type: String, required: true },
            rank: { type: Number, default: 1 },
            score: { type: Number, default: 0 },
        }
    ]
});

export default mongoose.models.ng_student_leaderboard || mongoose.model("ng_student_leaderboard", studentLeaderboardSchema);
