import mongoose from 'mongoose';
import { model } from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    duration: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    prerequisites: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      trim: true,
      default: "📘",
    },
    visibility: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    banner_url: {
      type: String,
      trim: true,
    },
    courseCode: {
      type: String,
      trim: true,
      unique: true,
    },
    lectures: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        videoURL: { type: String },
        pdfURL: { type: String },
        created_at: { type: Date, default: Date.now }
      }
    ],
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'ng_users', required: true },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);
// Virtuals
courseSchema.virtual('enrollmentPercentage').get(function () {
  return this.enrollment.capacity > 0
    ? Math.round((this.enrollment.enrolled / this.enrollment.capacity) * 100)
    : 0;
});

courseSchema.virtual('totalHours').get(function () {
  return this.duration.weeks * this.duration.hoursPerWeek;
});

const NG_Courses = model("Ng_Courses", courseSchema);
export default NG_Courses;
