import mongoose from 'mongoose';

const employeePerformanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewPeriod: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    quarter: {
      type: String,
      enum: ['Q1', 'Q2', 'Q3', 'Q4']
    },
    year: { type: Number, required: true }
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewType: {
    type: String,
    enum: ['quarterly', 'annual', 'probation', 'promotion', 'special'],
    default: 'quarterly'
  },
  overallRating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  categories: {
    technicalSkills: {
      rating: { type: Number, min: 1, max: 5 },
      comments: String,
      weight: { type: Number, default: 25 }
    },
    communication: {
      rating: { type: Number, min: 1, max: 5 },
      comments: String,
      weight: { type: Number, default: 20 }
    },
    teamwork: {
      rating: { type: Number, min: 1, max: 5 },
      comments: String,
      weight: { type: Number, default: 20 }
    },
    leadership: {
      rating: { type: Number, min: 1, max: 5 },
      comments: String,
      weight: { type: Number, default: 15 }
    },
    problemSolving: {
      rating: { type: Number, min: 1, max: 5 },
      comments: String,
      weight: { type: Number, default: 20 }
    }
  },
  goals: {
    achieved: [{
      title: String,
      description: String,
      targetDate: Date,
      completionDate: Date,
      impact: {
        type: String,
        enum: ['low', 'medium', 'high']
      }
    }],
    pending: [{
      title: String,
      description: String,
      targetDate: Date,
      reason: String,
      newTargetDate: Date
    }],
    upcoming: [{
      title: String,
      description: String,
      targetDate: Date,
      priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      }
    }]
  },
  strengths: [String],
  areasForImprovement: [String],
  trainingRecommendations: [{
    title: String,
    description: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    estimatedDuration: String,
    provider: String
  }],
  careerDevelopment: {
    currentLevel: String,
    nextLevel: String,
    promotionReadiness: {
      type: String,
      enum: ['not-ready', 'developing', 'ready', 'overdue'],
      default: 'developing'
    },
    skillGaps: [String],
    developmentPlan: String
  },
  feedback: {
    employeeSelfAssessment: String,
    managerComments: String,
    hrComments: String,
    employeeResponse: String
  },
  metrics: {
    productivity: { type: Number, min: 0, max: 100 },
    quality: { type: Number, min: 0, max: 100 },
    attendance: { type: Number, min: 0, max: 100 },
    punctuality: { type: Number, min: 0, max: 100 },
    initiative: { type: Number, min: 0, max: 100 }
  },
  status: {
    type: String,
    enum: ['draft', 'pending-employee', 'pending-manager', 'pending-hr', 'completed', 'disputed'],
    default: 'draft'
  },
  signatures: {
    employee: {
      signed: { type: Boolean, default: false },
      signedAt: Date,
      comments: String
    },
    manager: {
      signed: { type: Boolean, default: false },
      signedAt: Date,
      comments: String
    },
    hr: {
      signed: { type: Boolean, default: false },
      signedAt: Date,
      comments: String
    }
  },
  actionItems: [{
    title: String,
    description: String,
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    dueDate: Date,
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'overdue'],
      default: 'pending'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
employeePerformanceSchema.index({ employee: 1, year: 1, quarter: 1 });
employeePerformanceSchema.index({ reviewer: 1 });
employeePerformanceSchema.index({ status: 1 });
employeePerformanceSchema.index({ 'reviewPeriod.startDate': 1, 'reviewPeriod.endDate': 1 });

// Virtual for weighted average rating
employeePerformanceSchema.virtual('weightedRating').get(function() {
  const categories = this.categories;
  let totalWeightedScore = 0;
  let totalWeight = 0;
  
  Object.keys(categories).forEach(key => {
    if (categories[key].rating && categories[key].weight) {
      totalWeightedScore += categories[key].rating * categories[key].weight;
      totalWeight += categories[key].weight;
    }
  });
  
  return totalWeight > 0 ? Math.round((totalWeightedScore / totalWeight) * 10) / 10 : 0;
});

// Virtual for completion percentage
employeePerformanceSchema.virtual('completionPercentage').get(function() {
  const totalGoals = this.goals.achieved.length + this.goals.pending.length;
  if (totalGoals === 0) return 100;
  return Math.round((this.goals.achieved.length / totalGoals) * 100);
});

// Method to calculate overall performance score
employeePerformanceSchema.methods.calculatePerformanceScore = function() {
  const weights = {
    rating: 0.4,
    goalCompletion: 0.3,
    metrics: 0.3
  };
  
  // Rating score (1-5 scale converted to 0-100)
  const ratingScore = ((this.overallRating - 1) / 4) * 100;
  
  // Goal completion score
  const goalScore = this.completionPercentage;
  
  // Metrics average
  const metricsValues = Object.values(this.metrics.toObject()).filter(val => typeof val === 'number');
  const metricsScore = metricsValues.length > 0 
    ? metricsValues.reduce((sum, val) => sum + val, 0) / metricsValues.length 
    : 0;
  
  const totalScore = (ratingScore * weights.rating) + 
                    (goalScore * weights.goalCompletion) + 
                    (metricsScore * weights.metrics);
  
  return Math.round(totalScore);
};

// Method to add goal
employeePerformanceSchema.methods.addGoal = function(goalData, type = 'upcoming') {
  if (!this.goals[type]) {
    throw new Error(`Invalid goal type: ${type}`);
  }
  
  this.goals[type].push(goalData);
  return this.save();
};

// Method to move goal between categories
employeePerformanceSchema.methods.moveGoal = function(goalId, fromType, toType, additionalData = {}) {
  const fromArray = this.goals[fromType];
  const toArray = this.goals[toType];
  
  const goalIndex = fromArray.findIndex(goal => goal._id.toString() === goalId);
  if (goalIndex === -1) {
    throw new Error('Goal not found');
  }
  
  const goal = fromArray[goalIndex];
  Object.assign(goal, additionalData);
  
  toArray.push(goal);
  fromArray.splice(goalIndex, 1);
  
  return this.save();
};

// Static method to get performance trends
employeePerformanceSchema.statics.getPerformanceTrends = function(employeeId, years = 2) {
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - years);
  
  return this.find({
    employee: employeeId,
    'reviewPeriod.startDate': { $gte: startDate },
    status: 'completed'
  }).sort({ 'reviewPeriod.startDate': 1 });
};

// Static method to get team performance summary
employeePerformanceSchema.statics.getTeamPerformanceSummary = function(teamMembers, year) {
  return this.aggregate([
    {
      $match: {
        employee: { $in: teamMembers },
        year: year,
        status: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$overallRating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$overallRating'
        }
      }
    }
  ]);
};

export default mongoose.model('EmployeePerformance', employeePerformanceSchema);