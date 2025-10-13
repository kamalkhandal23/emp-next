import mongoose from 'mongoose';

const employeeProfileSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  personalDetails: {
    profileImage: String,
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say']
    },
    maritalStatus: {
      type: String,
      enum: ['single', 'married', 'divorced', 'widowed']
    },
    nationality: String,
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    languages: [String]
  },
  contactInfo: {
    personalEmail: String,
    alternatePhone: String,
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
      email: String
    }
  },
  address: {
    current: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'India' }
    },
    permanent: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'India' }
    }
  },
  bankDetails: {
    accountNumber: String,
    bankName: String,
    branchName: String,
    ifscCode: String,
    panNumber: String,
    aadharNumber: String
  },
  education: [{
    degree: String,
    institution: String,
    fieldOfStudy: String,
    startYear: Number,
    endYear: Number,
    grade: String,
    documents: [String] // URLs to certificates
  }],
  experience: [{
    company: String,
    position: String,
    startDate: Date,
    endDate: Date,
    currentlyWorking: { type: Boolean, default: false },
    description: String,
    skills: [String],
    achievements: [String]
  }],
  skills: [{
    name: String,
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert']
    },
    certifications: [String],
    yearsOfExperience: Number
  }],
  certifications: [{
    name: String,
    issuingOrganization: String,
    issueDate: Date,
    expiryDate: Date,
    credentialId: String,
    credentialUrl: String,
    documentUrl: String
  }],
  documents: [{
    type: {
      type: String,
      enum: ['resume', 'id-proof', 'address-proof', 'education-certificate', 'experience-letter', 'other']
    },
    name: String,
    url: String,
    uploadDate: { type: Date, default: Date.now },
    expiryDate: Date,
    verified: { type: Boolean, default: false }
  }],
  preferences: {
    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' }
    },
    workLocation: {
      type: String,
      enum: ['office', 'remote', 'hybrid'],
      default: 'office'
    },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'team', 'private'],
        default: 'team'
      },
      showContactInfo: { type: Boolean, default: false },
      showSalaryInfo: { type: Boolean, default: false }
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
employeeProfileSchema.index({ 'personalDetails.dateOfBirth': 1 });
employeeProfileSchema.index({ 'skills.name': 1 });

// Virtual for age
employeeProfileSchema.virtual('age').get(function() {
  if (!this.personalDetails.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.personalDetails.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Virtual for total experience
employeeProfileSchema.virtual('totalExperience').get(function() {
  if (!this.experience || this.experience.length === 0) return 0;
  
  let totalMonths = 0;
  this.experience.forEach(exp => {
    const startDate = new Date(exp.startDate);
    const endDate = exp.currentlyWorking ? new Date() : new Date(exp.endDate);
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                   (endDate.getMonth() - startDate.getMonth());
    totalMonths += months;
  });
  
  return Math.round(totalMonths / 12 * 10) / 10; // Years with 1 decimal place
});

// Method to add skill
employeeProfileSchema.methods.addSkill = function(skillData) {
  const existingSkill = this.skills.find(skill => 
    skill.name.toLowerCase() === skillData.name.toLowerCase()
  );
  
  if (existingSkill) {
    Object.assign(existingSkill, skillData);
  } else {
    this.skills.push(skillData);
  }
  
  return this.save();
};

// Method to add certification
employeeProfileSchema.methods.addCertification = function(certData) {
  this.certifications.push(certData);
  return this.save();
};

// Method to update preferences
employeeProfileSchema.methods.updatePreferences = function(preferences) {
  Object.assign(this.preferences, preferences);
  return this.save();
};

export default mongoose.model('EmployeeProfile', employeeProfileSchema);