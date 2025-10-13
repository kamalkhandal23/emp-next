import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
  examId: {
    type: String,
    required: true,
    unique: true
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
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  type: {
    type: String,
    enum: ['quiz', 'midterm', 'final', 'assignment', 'project'],
    required: true
  },
  questions: [{
    questionId: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['multiple-choice', 'true-false', 'short-answer', 'essay', 'coding'],
      required: true
    },
    question: {
      type: String,
      required: true
    },
    options: [{
      text: String,
      isCorrect: Boolean
    }],
    correctAnswer: String, // For short-answer and essay questions
    points: {
      type: Number,
      required: true,
      min: 1
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    tags: [String],
    explanation: String // Explanation for the correct answer
  }],
  settings: {
    duration: {
      type: Number, // in minutes
      required: true
    },
    totalPoints: {
      type: Number,
      required: true
    },
    passingScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    attemptsAllowed: {
      type: Number,
      default: 1,
      min: 1
    },
    randomizeQuestions: {
      type: Boolean,
      default: false
    },
    randomizeOptions: {
      type: Boolean,
      default: false
    },
    showResultsImmediately: {
      type: Boolean,
      default: true
    },
    allowReview: {
      type: Boolean,
      default: true
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
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  eligibility: {
    students: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    }],
    prerequisites: [{
      exam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam'
      },
      minimumScore: Number
    }]
  },
  proctoring: {
    enabled: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      enum: ['manual', 'automated', 'hybrid'],
      default: 'manual'
    },
    requirements: [String]
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'active', 'completed', 'cancelled'],
    default: 'draft'
  },
  statistics: {
    totalAttempts: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    passRate: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
examSchema.index({ course: 1 });
examSchema.index({ type: 1 });
examSchema.index({ status: 1 });
examSchema.index({ 'schedule.startDate': 1, 'schedule.endDate': 1 });

// Virtual for exam duration in hours
examSchema.virtual('durationHours').get(function() {
  return Math.round((this.settings.duration / 60) * 100) / 100;
});

// Virtual for total questions count
examSchema.virtual('totalQuestions').get(function() {
  return this.questions.length;
});

// Methods
examSchema.methods.isActive = function() {
  const now = new Date();
  return this.status === 'active' && 
         now >= this.schedule.startDate && 
         now <= this.schedule.endDate;
};

examSchema.methods.canStudentTakeExam = function(studentId) {
  const now = new Date();
  
  // Check if exam is active
  if (!this.isActive()) return false;
  
  // Check if student is eligible
  if (this.eligibility.students.length > 0) {
    return this.eligibility.students.includes(studentId);
  }
  
  return true;
};

examSchema.methods.calculateGrade = function(score) {
  const percentage = (score / this.settings.totalPoints) * 100;
  
  if (percentage >= 90) return 'A+';
  if (percentage >= 85) return 'A';
  if (percentage >= 80) return 'A-';
  if (percentage >= 75) return 'B+';
  if (percentage >= 70) return 'B';
  if (percentage >= 65) return 'B-';
  if (percentage >= 60) return 'C+';
  if (percentage >= 55) return 'C';
  if (percentage >= 50) return 'C-';
  if (percentage >= 45) return 'D+';
  if (percentage >= 40) return 'D';
  return 'F';
};

examSchema.methods.updateStatistics = function() {
  // This would typically be called after each exam attempt
  // Implementation would involve aggregating results from the Result model
  return this.save();
};

// Pre-save middleware to calculate total points
examSchema.pre('save', function(next) {
  if (this.isModified('questions')) {
    this.settings.totalPoints = this.questions.reduce((total, question) => {
      return total + question.points;
    }, 0);
  }
  next();
});

export default mongoose.model('Exam', examSchema);