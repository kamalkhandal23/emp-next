import mongoose from 'mongoose';
import { model } from 'mongoose';

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
      default: '📘',
    },
    visibility: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
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
        created_at: { type: Date, default: Date.now },
      },
    ],
    classLinks: [
      {
        title: { type: String, required: true },
        date: { type: String, required: true },
        time: { type: String, required: true },
        videoURL: { type: String },
        created_at: { type: Date, default: Date.now },
      },
    ],
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    // Course timing fields
    start_date: {
      type: Date,
      required: false,
      default: null,
    },
    end_date: {
      type: Date,
      required: false,
      default: null,
    },
    registration_start: {
      type: Date,
      required: false,
      default: null,
    },
    registration_end: {
      type: Date,
      required: false,
      default: null,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ng_users',
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);
// Virtuals
courseSchema.virtual('enrollmentPercentage').get(function () {
  return this.enrollment && this.enrollment.capacity > 0
    ? Math.round((this.enrollment.enrolled / this.enrollment.capacity) * 100)
    : 0;
});

courseSchema.virtual('totalHours').get(function () {
  return this.duration && this.duration.weeks && this.duration.hoursPerWeek
    ? this.duration.weeks * this.duration.hoursPerWeek
    : 0;
});

// Course status based on dates
courseSchema.virtual('courseStatus').get(function () {
  const now = new Date();

  // If no dates are set, use visibility status
  if (!this.start_date && !this.end_date) {
    return this.visibility === 'published' ? 'open' : 'draft';
  }

  // Check registration period
  if (this.registration_start && this.registration_end) {
    if (now < this.registration_start) {
      return 'registration_not_started';
    }
    if (now > this.registration_end) {
      return 'registration_closed';
    }
  }

  // Check course period
  if (this.start_date && now < this.start_date) {
    return 'coming_soon';
  }

  if (this.end_date && now > this.end_date) {
    return 'closed';
  }

  // Course is currently active
  if (this.start_date && now >= this.start_date) {
    return 'open';
  }

  // Default based on visibility
  return this.visibility === 'published' ? 'open' : 'draft';
});

// Method to check if course is accessible
courseSchema.methods.isAccessible = function () {
  const status = this.courseStatus;
  return ['open', 'registration_closed'].includes(status);
};

const NG_Courses = model('Ng_Courses', courseSchema);
export default NG_Courses;
