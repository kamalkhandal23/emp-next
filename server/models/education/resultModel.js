import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  resultId: {
    type: String,
    required: true,
    unique: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  attempt: {
    type: Number,
    required: true,
    min: 1
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  timeSpent: {
    type: Number, // in minutes
    required: true
  },
  answers: [{
    questionId: {
      type: String,
      required: true
    },
    answer: mongoose.Schema.Types.Mixed, // Can be string, array, or object
    isCorrect: Boolean,
    pointsEarned: {
      type: Number,
      default: 0
    },
    timeSpent: Number, // time spent on this question in seconds
    flagged: {
      type: Boolean,
      default: false
    }
  }],
  score: {
    raw: {
      type: Number,
      required: true
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    grade: {
      type: String,
      required: true
    },
    passed: {
      type: Boolean,
      required: true
    }
  },
  analytics: {
    questionsAttempted: {
      type: Number,
      default: 0
    },
    questionsCorrect: {
      type: Number,
      default: 0
    },
    questionsIncorrect: {
      type: Number,
      default: 0
    },
    questionsSkipped: {
      type: Number,
      default: 0
    },
    averageTimePerQuestion: Number, // in seconds
    difficultyBreakdown: {
      easy: {
        attempted: { type: Number, default: 0 },
        correct: { type: Number, default: 0 }
      },
      medium: {
        attempted: { type: Number, default: 0 },
        correct: { type: Number, default: 0 }
      },
      hard: {
        attempted: { type: Number, default: 0 },
        correct: { type: Number, default: 0 }
      }
    }
  },
  feedback: {
    strengths: [String],
    weaknesses: [String],
    recommendations: [String],
    overallComment: String
  },
  proctoring: {
    violations: [{
      type: {
        type: String,
        enum: ['tab-switch', 'copy-paste', 'right-click', 'fullscreen-exit', 'suspicious-activity']
      },
      timestamp: Date,
      description: String,
      severity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      }
    }],
    screenshots: [String], // URLs to screenshots if enabled
    videoRecording: String, // URL to video recording if enabled
    flagged: {
      type: Boolean,
      default: false
    }
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'submitted', 'graded', 'under-review', 'flagged'],
    default: 'in-progress'
  },
  submissionMethod: {
    type: String,
    enum: ['auto-submit', 'manual-submit', 'time-expired'],
    default: 'manual-submit'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  reviewComments: String,
  certificate: {
    issued: {
      type: Boolean,
      default: false
    },
    certificateId: String,
    issuedAt: Date,
    certificateUrl: String
  }
}, {
  timestamps: true
});

// Indexes
resultSchema.index({ student: 1, exam: 1, attempt: 1 }, { unique: true });
resultSchema.index({ student: 1 });
resultSchema.index({ exam: 1 });
resultSchema.index({ 'score.percentage': 1 });
resultSchema.index({ status: 1 });
resultSchema.index({ createdAt: 1 });

// Virtual for duration in hours
resultSchema.virtual('durationHours').get(function() {
  return Math.round((this.timeSpent / 60) * 100) / 100;
});

// Virtual for accuracy percentage
resultSchema.virtual('accuracy').get(function() {
  if (this.analytics.questionsAttempted === 0) return 0;
  return Math.round((this.analytics.questionsCorrect / this.analytics.questionsAttempted) * 100);
});

// Methods
resultSchema.methods.calculateScore = function(exam) {
  let totalPoints = 0;
  let earnedPoints = 0;
  
  this.answers.forEach(answer => {
    const question = exam.questions.find(q => q.questionId === answer.questionId);
    if (question) {
      totalPoints += question.points;
      if (answer.isCorrect) {
        earnedPoints += question.points;
        answer.pointsEarned = question.points;
      }
    }
  });
  
  this.score.raw = earnedPoints;
  this.score.percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  this.score.grade = exam.calculateGrade(earnedPoints);
  this.score.passed = this.score.percentage >= exam.settings.passingScore;
  
  return this.save();
};

resultSchema.methods.generateAnalytics = function(exam) {
  const analytics = {
    questionsAttempted: 0,
    questionsCorrect: 0,
    questionsIncorrect: 0,
    questionsSkipped: 0,
    averageTimePerQuestion: 0,
    difficultyBreakdown: {
      easy: { attempted: 0, correct: 0 },
      medium: { attempted: 0, correct: 0 },
      hard: { attempted: 0, correct: 0 }
    }
  };
  
  let totalTime = 0;
  
  this.answers.forEach(answer => {
    const question = exam.questions.find(q => q.questionId === answer.questionId);
    if (question) {
      if (answer.answer !== null && answer.answer !== undefined && answer.answer !== '') {
        analytics.questionsAttempted++;
        totalTime += answer.timeSpent || 0;
        
        if (answer.isCorrect) {
          analytics.questionsCorrect++;
          analytics.difficultyBreakdown[question.difficulty].correct++;
        } else {
          analytics.questionsIncorrect++;
        }
        
        analytics.difficultyBreakdown[question.difficulty].attempted++;
      } else {
        analytics.questionsSkipped++;
      }
    }
  });
  
  analytics.averageTimePerQuestion = analytics.questionsAttempted > 0 
    ? Math.round(totalTime / analytics.questionsAttempted) 
    : 0;
  
  this.analytics = analytics;
  return this.save();
};

resultSchema.methods.generateFeedback = function(exam) {
  const feedback = {
    strengths: [],
    weaknesses: [],
    recommendations: [],
    overallComment: ''
  };
  
  const { difficultyBreakdown } = this.analytics;
  const percentage = this.score.percentage;
  
  // Analyze performance by difficulty
  Object.keys(difficultyBreakdown).forEach(difficulty => {
    const { attempted, correct } = difficultyBreakdown[difficulty];
    if (attempted > 0) {
      const accuracy = (correct / attempted) * 100;
      if (accuracy >= 80) {
        feedback.strengths.push(`Strong performance in ${difficulty} questions (${accuracy.toFixed(1)}% accuracy)`);
      } else if (accuracy < 50) {
        feedback.weaknesses.push(`Needs improvement in ${difficulty} questions (${accuracy.toFixed(1)}% accuracy)`);
        feedback.recommendations.push(`Focus more on ${difficulty} level concepts and practice`);
      }
    }
  });
  
  // Overall performance feedback
  if (percentage >= 90) {
    feedback.overallComment = 'Excellent performance! You have demonstrated mastery of the subject matter.';
  } else if (percentage >= 80) {
    feedback.overallComment = 'Good performance! You have a solid understanding with room for minor improvements.';
  } else if (percentage >= 70) {
    feedback.overallComment = 'Satisfactory performance. Consider reviewing key concepts for better understanding.';
  } else if (percentage >= 60) {
    feedback.overallComment = 'Below average performance. Additional study and practice are recommended.';
  } else {
    feedback.overallComment = 'Poor performance. Significant additional study and support are needed.';
    feedback.recommendations.push('Consider retaking the course or seeking additional tutoring');
  }
  
  // Time management feedback
  if (this.analytics.averageTimePerQuestion > 0) {
    const expectedTimePerQuestion = (exam.settings.duration * 60) / exam.questions.length;
    if (this.analytics.averageTimePerQuestion > expectedTimePerQuestion * 1.5) {
      feedback.weaknesses.push('Time management - spent too much time per question');
      feedback.recommendations.push('Practice time management strategies for exams');
    } else if (this.analytics.averageTimePerQuestion < expectedTimePerQuestion * 0.5) {
      feedback.recommendations.push('Consider spending more time reviewing answers before submission');
    }
  }
  
  this.feedback = feedback;
  return this.save();
};

// Static methods
resultSchema.statics.getStudentResults = function(studentId, options = {}) {
  const query = { student: studentId };
  
  if (options.examId) query.exam = options.examId;
  if (options.status) query.status = options.status;
  
  return this.find(query)
    .populate('exam', 'title type course')
    .populate('exam.course', 'title courseCode')
    .sort({ createdAt: -1 });
};

resultSchema.statics.getExamStatistics = function(examId) {
  return this.aggregate([
    { $match: { exam: mongoose.Types.ObjectId(examId), status: 'completed' } },
    {
      $group: {
        _id: '$exam',
        totalAttempts: { $sum: 1 },
        averageScore: { $avg: '$score.percentage' },
        highestScore: { $max: '$score.percentage' },
        lowestScore: { $min: '$score.percentage' },
        passCount: { $sum: { $cond: ['$score.passed', 1, 0] } }
      }
    },
    {
      $addFields: {
        passRate: { $multiply: [{ $divide: ['$passCount', '$totalAttempts'] }, 100] }
      }
    }
  ]);
};

export default mongoose.model('Result', resultSchema);