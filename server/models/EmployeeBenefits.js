import mongoose from 'mongoose';

const employeeBenefitsSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  healthInsurance: {
    enrolled: { type: Boolean, default: false },
    plan: {
      type: String,
      enum: ['basic', 'standard', 'premium', 'family']
    },
    provider: String,
    policyNumber: String,
    coverage: {
      employee: { type: Number, default: 0 },
      spouse: { type: Number, default: 0 },
      children: { type: Number, default: 0 },
      parents: { type: Number, default: 0 }
    },
    premium: {
      monthly: Number,
      employeeContribution: Number,
      companyContribution: Number
    },
    dependents: [{
      name: String,
      relationship: {
        type: String,
        enum: ['spouse', 'child', 'parent', 'sibling']
      },
      dateOfBirth: Date,
      gender: String,
      policyNumber: String
    }],
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending', 'cancelled'],
      default: 'pending'
    }
  },
  lifeInsurance: {
    enrolled: { type: Boolean, default: false },
    coverage: Number,
    premium: {
      monthly: Number,
      employeeContribution: Number,
      companyContribution: Number
    },
    beneficiaries: [{
      name: String,
      relationship: String,
      percentage: Number,
      contactInfo: {
        phone: String,
        email: String,
        address: String
      }
    }],
    policyNumber: String,
    provider: String,
    startDate: Date,
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending', 'cancelled'],
      default: 'pending'
    }
  },
  providentFund: {
    enrolled: { type: Boolean, default: true },
    pfNumber: String,
    uanNumber: String,
    contributionRate: {
      employee: { type: Number, default: 12 }, // percentage
      employer: { type: Number, default: 12 }
    },
    monthlyContribution: {
      employee: Number,
      employer: Number,
      total: Number
    },
    currentBalance: Number,
    nominee: {
      name: String,
      relationship: String,
      percentage: Number,
      dateOfBirth: Date
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'active'
    }
  },
  gratuity: {
    eligible: { type: Boolean, default: false },
    yearsOfService: Number,
    currentAmount: Number,
    lastCalculatedDate: Date,
    nominee: {
      name: String,
      relationship: String,
      percentage: Number
    }
  },
  leavePolicy: {
    annual: {
      allocated: { type: Number, default: 21 },
      used: { type: Number, default: 0 },
      remaining: { type: Number, default: 21 },
      carryForward: { type: Number, default: 0 },
      maxCarryForward: { type: Number, default: 5 }
    },
    sick: {
      allocated: { type: Number, default: 12 },
      used: { type: Number, default: 0 },
      remaining: { type: Number, default: 12 }
    },
    casual: {
      allocated: { type: Number, default: 12 },
      used: { type: Number, default: 0 },
      remaining: { type: Number, default: 12 }
    },
    maternity: {
      allocated: { type: Number, default: 180 },
      used: { type: Number, default: 0 },
      remaining: { type: Number, default: 180 }
    },
    paternity: {
      allocated: { type: Number, default: 15 },
      used: { type: Number, default: 0 },
      remaining: { type: Number, default: 15 }
    },
    compensatory: {
      earned: { type: Number, default: 0 },
      used: { type: Number, default: 0 },
      remaining: { type: Number, default: 0 }
    }
  },
  flexiBenefits: {
    totalAllocation: Number,
    used: { type: Number, default: 0 },
    remaining: Number,
    categories: {
      food: {
        allocated: Number,
        used: { type: Number, default: 0 },
        remaining: Number
      },
      transport: {
        allocated: Number,
        used: { type: Number, default: 0 },
        remaining: Number
      },
      communication: {
        allocated: Number,
        used: { type: Number, default: 0 },
        remaining: Number
      },
      learning: {
        allocated: Number,
        used: { type: Number, default: 0 },
        remaining: Number
      },
      wellness: {
        allocated: Number,
        used: { type: Number, default: 0 },
        remaining: Number
      }
    },
    transactions: [{
      category: String,
      amount: Number,
      description: String,
      date: { type: Date, default: Date.now },
      receipt: String,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      }
    }]
  },
  stockOptions: {
    eligible: { type: Boolean, default: false },
    grants: [{
      grantDate: Date,
      shares: Number,
      strikePrice: Number,
      vestingSchedule: [{
        date: Date,
        percentage: Number,
        shares: Number,
        vested: { type: Boolean, default: false }
      }],
      exercised: { type: Number, default: 0 },
      status: {
        type: String,
        enum: ['active', 'expired', 'exercised'],
        default: 'active'
      }
    }],
    totalVested: { type: Number, default: 0 },
    totalExercised: { type: Number, default: 0 }
  },
  wellness: {
    gymMembership: {
      enrolled: { type: Boolean, default: false },
      provider: String,
      monthlyReimbursement: Number,
      maxAnnualLimit: Number,
      usedAmount: { type: Number, default: 0 }
    },
    healthCheckup: {
      frequency: {
        type: String,
        enum: ['annual', 'bi-annual'],
        default: 'annual'
      },
      lastCheckupDate: Date,
      nextDueDate: Date,
      reimbursementLimit: Number,
      usedAmount: { type: Number, default: 0 }
    },
    mentalHealth: {
      counselingSessions: {
        allocated: { type: Number, default: 6 },
        used: { type: Number, default: 0 },
        remaining: { type: Number, default: 6 }
      },
      provider: String
    }
  },
  retirement: {
    nps: {
      enrolled: { type: Boolean, default: false },
      pranNumber: String,
      contributionRate: {
        employee: { type: Number, default: 10 },
        employer: { type: Number, default: 10 }
      },
      monthlyContribution: {
        employee: Number,
        employer: Number
      },
      currentBalance: Number,
      nominee: {
        name: String,
        relationship: String,
        percentage: Number
      }
    }
  },
  taxSavings: {
    section80C: {
      limit: { type: Number, default: 150000 },
      investments: [{
        type: {
          type: String,
          enum: ['pf', 'elss', 'ppf', 'nsc', 'tax-saver-fd', 'life-insurance', 'other']
        },
        amount: Number,
        description: String,
        proofDocument: String
      }],
      totalInvested: { type: Number, default: 0 }
    },
    section80D: {
      limit: { type: Number, default: 25000 },
      premiumsPaid: Number,
      proofDocuments: [String]
    },
    hra: {
      exemptionClaimed: Number,
      rentPaid: Number,
      rentReceipts: [String]
    }
  },
  benefitHistory: [{
    benefit: String,
    action: {
      type: String,
      enum: ['enrolled', 'modified', 'cancelled', 'renewed']
    },
    date: { type: Date, default: Date.now },
    details: String,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  documents: [{
    type: {
      type: String,
      enum: ['insurance-card', 'policy-document', 'nomination-form', 'medical-certificate', 'other']
    },
    name: String,
    url: String,
    uploadDate: { type: Date, default: Date.now },
    expiryDate: Date
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
employeeBenefitsSchema.index({ employee: 1 });
employeeBenefitsSchema.index({ 'healthInsurance.status': 1 });
employeeBenefitsSchema.index({ 'lifeInsurance.status': 1 });

// Virtual for total insurance coverage
employeeBenefitsSchema.virtual('totalInsuranceCoverage').get(function() {
  let total = 0;
  if (this.healthInsurance.enrolled) {
    total += Object.values(this.healthInsurance.coverage).reduce((sum, val) => sum + val, 0);
  }
  if (this.lifeInsurance.enrolled) {
    total += this.lifeInsurance.coverage || 0;
  }
  return total;
});

// Virtual for total monthly deductions
employeeBenefitsSchema.virtual('totalMonthlyDeductions').get(function() {
  let total = 0;
  
  if (this.healthInsurance.enrolled && this.healthInsurance.premium) {
    total += this.healthInsurance.premium.employeeContribution || 0;
  }
  
  if (this.lifeInsurance.enrolled && this.lifeInsurance.premium) {
    total += this.lifeInsurance.premium.employeeContribution || 0;
  }
  
  if (this.providentFund.enrolled && this.providentFund.monthlyContribution) {
    total += this.providentFund.monthlyContribution.employee || 0;
  }
  
  if (this.retirement.nps.enrolled && this.retirement.nps.monthlyContribution) {
    total += this.retirement.nps.monthlyContribution.employee || 0;
  }
  
  return total;
});

// Virtual for flexi benefits utilization percentage
employeeBenefitsSchema.virtual('flexiBenefitsUtilization').get(function() {
  if (!this.flexiBenefits.totalAllocation || this.flexiBenefits.totalAllocation === 0) {
    return 0;
  }
  return Math.round((this.flexiBenefits.used / this.flexiBenefits.totalAllocation) * 100);
});

// Pre-save middleware to calculate remaining amounts
employeeBenefitsSchema.pre('save', function(next) {
  // Calculate flexi benefits remaining
  if (this.flexiBenefits.totalAllocation) {
    this.flexiBenefits.remaining = this.flexiBenefits.totalAllocation - this.flexiBenefits.used;
    
    // Calculate category-wise remaining
    Object.keys(this.flexiBenefits.categories).forEach(category => {
      const cat = this.flexiBenefits.categories[category];
      if (cat.allocated) {
        cat.remaining = cat.allocated - cat.used;
      }
    });
  }
  
  // Calculate leave remaining
  Object.keys(this.leavePolicy).forEach(leaveType => {
    const leave = this.leavePolicy[leaveType];
    if (leave.allocated !== undefined && leave.used !== undefined) {
      leave.remaining = leave.allocated - leave.used;
      if (leave.carryForward) {
        leave.remaining += leave.carryForward;
      }
    }
  });
  
  // Calculate tax savings total
  if (this.taxSavings.section80C.investments) {
    this.taxSavings.section80C.totalInvested = this.taxSavings.section80C.investments
      .reduce((sum, inv) => sum + (inv.amount || 0), 0);
  }
  
  next();
});

// Method to enroll in health insurance
employeeBenefitsSchema.methods.enrollHealthInsurance = function(planData) {
  this.healthInsurance = {
    ...this.healthInsurance.toObject(),
    ...planData,
    enrolled: true,
    status: 'pending'
  };
  
  this.benefitHistory.push({
    benefit: 'Health Insurance',
    action: 'enrolled',
    details: `Enrolled in ${planData.plan} plan`
  });
  
  return this.save();
};

// Method to use flexi benefits
employeeBenefitsSchema.methods.useFlexiBenefit = function(category, amount, description, receipt) {
  const categoryData = this.flexiBenefits.categories[category];
  
  if (!categoryData || categoryData.remaining < amount) {
    throw new Error('Insufficient flexi benefit balance in this category');
  }
  
  categoryData.used += amount;
  this.flexiBenefits.used += amount;
  
  this.flexiBenefits.transactions.push({
    category,
    amount,
    description,
    receipt,
    status: 'pending'
  });
  
  return this.save();
};

// Method to update leave balance
employeeBenefitsSchema.methods.updateLeaveBalance = function(leaveType, days, operation = 'deduct') {
  const leave = this.leavePolicy[leaveType];
  if (!leave) {
    throw new Error(`Invalid leave type: ${leaveType}`);
  }
  
  if (operation === 'deduct') {
    if (leave.remaining < days) {
      throw new Error('Insufficient leave balance');
    }
    leave.used += days;
  } else if (operation === 'add') {
    leave.used = Math.max(0, leave.used - days);
  }
  
  return this.save();
};

// Method to add stock option grant
employeeBenefitsSchema.methods.addStockGrant = function(grantData) {
  if (!this.stockOptions.eligible) {
    throw new Error('Employee is not eligible for stock options');
  }
  
  this.stockOptions.grants.push(grantData);
  
  this.benefitHistory.push({
    benefit: 'Stock Options',
    action: 'enrolled',
    details: `Granted ${grantData.shares} shares at ${grantData.strikePrice}`
  });
  
  return this.save();
};

// Static method to get benefits summary for payroll
employeeBenefitsSchema.statics.getPayrollSummary = function(employeeIds) {
  return this.aggregate([
    { $match: { employee: { $in: employeeIds } } },
    {
      $project: {
        employee: 1,
        healthInsurancePremium: '$healthInsurance.premium.employeeContribution',
        lifeInsurancePremium: '$lifeInsurance.premium.employeeContribution',
        pfContribution: '$providentFund.monthlyContribution.employee',
        npsContribution: '$retirement.nps.monthlyContribution.employee',
        totalDeductions: '$totalMonthlyDeductions'
      }
    }
  ]);
};

// Static method to get benefits utilization report
employeeBenefitsSchema.statics.getBenefitsUtilizationReport = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalEmployees: { $sum: 1 },
        healthInsuranceEnrolled: {
          $sum: { $cond: ['$healthInsurance.enrolled', 1, 0] }
        },
        lifeInsuranceEnrolled: {
          $sum: { $cond: ['$lifeInsurance.enrolled', 1, 0] }
        },
        pfEnrolled: {
          $sum: { $cond: ['$providentFund.enrolled', 1, 0] }
        },
        averageFlexiUtilization: { $avg: '$flexiBenefitsUtilization' }
      }
    }
  ]);
};

export default mongoose.model('EmployeeBenefits', employeeBenefitsSchema);