import mongoose from 'mongoose';
import { model } from "mongoose";

// const courseSchema = new mongoose.Schema({
//   courseCode: {
//     type: String,
//     required: true,
//     unique: true,
//     uppercase: true
//   },
//   slug: {
//     type: String,
//     required: true,
//     unique: true,
//     trim: true
//   },
//   title: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   description: {
//     type: String,
//     required: true
//   },
//   category: {
//     type: String,
//     required: true,
//     enum: ['Technology', 'Business', 'Design', 'Marketing', 'Healthcare', 'Education', 'Other']
//   },
//   level: {
//     type: String,
//     required: true,
//     enum: ['Beginner', 'Intermediate', 'Advanced']
//   },
//   duration: {
//     weeks: { type: Number, required: true },
//     hoursPerWeek: { type: Number, required: true }
//   },
//   credits: {
//     type: Number,
//     required: true,
//     min: 1,
//     max: 6
//   },
//   prerequisites: [{
//     course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
//     required: { type: Boolean, default: true }
//   }],
//   instructor: {
//     name: { type: String, required: true },
//     email: { type: String, required: true },
//     bio: String,
//     qualifications: [String],
//     profileImage: String
//   },
//   syllabus: [{
//     week: Number,
//     topic: String,
//     description: String,
//     materials: [String],
//     assignments: [String]
//   }],
//   resources: [{
//     type: { type: String, enum: ['video', 'document', 'link', 'book', 'article'] },
//     title: String,
//     url: String,
//     description: String
//   }],
//   assessments: [{
//     type: { type: String, enum: ['quiz', 'assignment', 'project', 'exam'] },
//     title: String,
//     description: String,
//     weight: Number,
//     dueDate: Date
//   }],
//   enrollment: {
//     capacity: { type: Number, required: true },
//     enrolled: { type: Number, default: 0 },
//     waitlist: { type: Number, default: 0 }
//   },
//   schedule: {
//     startDate: { type: Date, required: true },
//     endDate: { type: Date, required: true },
//     sessions: [{
//       day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
//       startTime: String,
//       endTime: String,
//       timezone: { type: String, default: 'UTC' }
//     }]
//   },
//   pricing: {
//     amount: { type: Number, required: true },
//     currency: { type: String, default: 'USD' },
//     discounts: [{
//       type: { type: String },
//       percentage: Number,
//       validUntil: Date
//     }]
//   },
//   status: {
//     type: String,
//     enum: ['draft', 'published', 'archived', 'cancelled'],
//     default: 'draft'
//   },
//   tags: [String],
//   rating: {
//     average: { type: Number, default: 0, min: 0, max: 5 },
//     count: { type: Number, default: 0 }
//   },
//   reviews: [{
//     student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
//     rating: { type: Number, min: 1, max: 5 },
//     comment: String,
//     date: { type: Date, default: Date.now }
//   }]
// }, { timestamps: true });
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
