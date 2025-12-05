import mongoose from "mongoose";

const { Schema, model } = mongoose;

const ActivitySchema = new Schema({
  activityType: {
    type: String,
    enum: [
      "Course Enrollment",
      "Assignment submission",
      "Test Taken",
      "Quiz Completed",
      "Certificate Earned",
      "Profile Update",
      "Other",
    ],
    required: true,
  },
  description: {
    type: String,
    required: true, // brief description of the activity
  },
  extraData: Schema.Types.Mixed, // optional info like score, link, etc.
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const RecentActivitySchema = new Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      unique: true,
    },
    activities: [ActivitySchema],
  },
  { timestamps: true }
);

const RecentActivity = model("NG_RecentActivity", RecentActivitySchema);

export default RecentActivity;
