import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Technology', 'Business', 'Design', 'Marketing', 'Healthcare', 'Education', 'Other']
  },
  level: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  duration: {
    weeks: {
      type: Number,
      required: true
    },
    hoursPerWeek: {
      type: Number,
      required: true
    }
  },
  credits: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  prerequisites: [{
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    required: {
      type: Boolean,
      default: true
    }
  }],
  instructor: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    bio: String,
    qualifications: [String],
    profileImage: String
  },
  syllabus: [{
    week: Number,
    topic: String,
    description: String,
    materials: [String],
    assignments: [String]
  }],
  resources: [{
    type: {
      type: String,
      enum: ['video', 'document', 'link', 'book', 'article']
    },
    title: String,
    url: String,
    description: String
  }],
  assessments: [{
    type: {
      type: String,
      enum: ['quiz', 'assignment', 'project', 'exam']
    },
    title: String,
    description: String,
    weight: Number, // percentage of final grade
    dueDate: Date
  }],
  enrollment: {
    capacity: {
      type: Number,
      required: true
    },
    enrolled: {
      type: Number,
      default: 0
    },
    waitlist: {
      type: Number,
      default: 0
    }
  },
  schedule: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    sessions: [{
      day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      },
      startTime: String,
      endTime: String,
      timezone: {
        type: String,
        default: 'UTC'
      }
    }]
  },
  pricing: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    discounts: [{
      type: String,
      percentage: Number,
      validUntil: Date
    }]
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'cancelled'],
    default: 'draft'
  },
  tags: [String],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes
courseSchema.index({ courseCode: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ 'schedule.startDate': 1 });

// Virtual for enrollment percentage
courseSchema.virtual('enrollmentPercentage').get(function() {
  return this.enrollment.capacity > 0 
    ? Math.round((this.enrollment.enrolled / this.enrollment.capacity) * 100)
    : 0;
});

// Virtual for total duration in hours
courseSchema.virtual('totalHours').get(function() {
  return this.duration.weeks * this.duration.hoursPerWeek;
});

// Methods
courseSchema.methods.canEnroll = function() {
  return this.enrollment.enrolled < this.enrollment.capacity && 
         this.status === 'published' &&
         new Date() < this.schedule.startDate;
};

courseSchema.methods.addReview = function(studentId, rating, comment) {
  this.reviews.push({
    student: studentId,
    rating,
    comment
  });
  
  // Recalculate average rating
  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.rating.average = totalRating / this.reviews.length;
  this.rating.count = this.reviews.length;
  
  return this.save();
};

courseSchema.methods.updateEnrollment = function(change) {
  this.enrollment.enrolled += change;
  return this.save();
};

export default mongoose.model('Course', courseSchema);