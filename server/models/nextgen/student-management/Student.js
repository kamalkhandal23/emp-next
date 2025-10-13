import mongoose from 'mongoose';
import { encrypt, decrypt } from '../../../utils/crypto.js';

const piiField = {
  c: String,
  iv: String,
  tag: String
};

const studentSchema = new mongoose.Schema({
  // Basic Information
  student_id: {
    type: String,
    unique: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NG_User',
    required: true,
    unique: true
  },
  
  // Personal Information (Encrypted)
  full_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: piiField,
  date_of_birth: piiField,
  address: {
    street: piiField,
    city: piiField,
    state: piiField,
    postal_code: piiField,
    country: piiField
  },
  
  // Emergency Contact (Encrypted)
  emergency_contact: {
    name: piiField,
    relationship: piiField,
    phone: piiField,
    email: piiField
  },
  
  // Academic Information
  academic_info: {
    highest_qualification: {
      type: String,
      enum: ['high_school', 'diploma', 'bachelor', 'master', 'phd', 'other']
    },
    institution: String,
    field_of_study: String,
    graduation_year: Number,
    gpa: Number
  },
  
  // Profile Information
  profile: {
    avatar_url: String,
    bio: String,
    interests: [String],
    skills: [String],
    goals: String,
    preferred_learning_style: {
      type: String,
      enum: ['visual', 'auditory', 'kinesthetic', 'reading_writing']
    }
  },
  
  // Status and Progress
  status: {
    type: String,
    enum: ['pending_approval', 'active', 'suspended', 'graduated', 'dropped_out'],
    default: 'pending_approval'
  },
  enrollment_date: Date,
  graduation_date: Date,
  
  // Academic Performance
  performance: {
    overall_gpa: {
      type: Number,
      default: 0,
      min: 0,
      max: 4
    },
    total_credits: {
      type: Number,
      default: 0
    },
    completed_courses: {
      type: Number,
      default: 0
    },
    current_semester: String,
    academic_standing: {
      type: String,
      enum: ['excellent', 'good', 'satisfactory', 'probation', 'warning'],
      default: 'satisfactory'
    }
  },
  
  // Preferences and Settings
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    privacy: {
      show_profile: { type: Boolean, default: true },
      show_progress: { type: Boolean, default: false },
      show_achievements: { type: Boolean, default: true }
    },
    learning: {
      study_reminders: { type: Boolean, default: true },
      deadline_alerts: { type: Boolean, default: true },
      progress_reports: { type: Boolean, default: true }
    }
  },
  
  // Documents and Verification
  documents: [{
    type: {
      type: String,
      enum: ['id_proof', 'address_proof', 'academic_transcript', 'photo', 'other'],
      required: true
    },
    name: String,
    url: String,
    verified: { type: Boolean, default: false },
    verified_by: { type: mongoose.Schema.Types.ObjectId, ref: 'NG_User' },
    verified_at: Date,
    uploaded_at: { type: Date, default: Date.now }
  }],
  
  // System Information
  last_activity: Date,
  login_count: { type: Number, default: 0 },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'NG_User' },
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'NG_User' }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
studentSchema.index({ status: 1 });
studentSchema.index({ enrollment_date: 1 });
studentSchema.index({ 'performance.overall_gpa': 1 });

// Virtual for full academic standing
studentSchema.virtual('academic_status').get(function() {
  return {
    standing: this.performance.academic_standing,
    gpa: this.performance.overall_gpa,
    credits: this.performance.total_credits,
    courses: this.performance.completed_courses
  };
});

// Virtual for contact information (decrypted)
studentSchema.virtual('contact_info').get(function() {
  return {
    phone: this.phone ? decrypt(this.phone) : null,
    emergency_contact: this.emergency_contact.phone ? {
      name: decrypt(this.emergency_contact.name),
      relationship: decrypt(this.emergency_contact.relationship),
      phone: decrypt(this.emergency_contact.phone),
      email: decrypt(this.emergency_contact.email)
    } : null
  };
});

// Pre-save middleware to generate student ID
studentSchema.pre('save', async function(next) {
  if (!this.student_id && this.isNew) {
    try {
      const year = new Date().getFullYear();
      const count = await this.constructor.countDocuments({
        created_at: {
          $gte: new Date(year, 0, 1),
          $lt: new Date(year + 1, 0, 1)
        }
      });
      this.student_id = `STU${year}${String(count + 1).padStart(4, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Pre-save middleware to encrypt PII fields
studentSchema.pre('save', function(next) {
  // Encrypt phone if it's modified and not already encrypted
  if (this.isModified('phone') && this.phone && typeof this.phone === 'string') {
    this.phone = encrypt(this.phone);
  }
  
  // Encrypt date of birth
  if (this.isModified('date_of_birth') && this.date_of_birth && typeof this.date_of_birth === 'string') {
    this.date_of_birth = encrypt(this.date_of_birth);
  }
  
  // Encrypt address fields
  if (this.address) {
    Object.keys(this.address).forEach(key => {
      if (this.isModified(`address.${key}`) && this.address[key] && typeof this.address[key] === 'string') {
        this.address[key] = encrypt(this.address[key]);
      }
    });
  }
  
  // Encrypt emergency contact
  if (this.emergency_contact) {
    Object.keys(this.emergency_contact).forEach(key => {
      if (this.isModified(`emergency_contact.${key}`) && this.emergency_contact[key] && typeof this.emergency_contact[key] === 'string') {
        this.emergency_contact[key] = encrypt(this.emergency_contact[key]);
      }
    });
  }
  
  next();
});

// Method to update academic performance
studentSchema.methods.updatePerformance = function(courseGrade, credits) {
  const totalPoints = (this.performance.overall_gpa * this.performance.total_credits) + (courseGrade * credits);
  this.performance.total_credits += credits;
  this.performance.overall_gpa = totalPoints / this.performance.total_credits;
  this.performance.completed_courses += 1;
  
  // Update academic standing based on GPA
  if (this.performance.overall_gpa >= 3.5) {
    this.performance.academic_standing = 'excellent';
  } else if (this.performance.overall_gpa >= 3.0) {
    this.performance.academic_standing = 'good';
  } else if (this.performance.overall_gpa >= 2.0) {
    this.performance.academic_standing = 'satisfactory';
  } else if (this.performance.overall_gpa >= 1.5) {
    this.performance.academic_standing = 'probation';
  } else {
    this.performance.academic_standing = 'warning';
  }
  
  return this.save();
};

// Method to add document
studentSchema.methods.addDocument = function(documentData) {
  this.documents.push({
    ...documentData,
    uploaded_at: new Date()
  });
  return this.save();
};

// Method to verify document
studentSchema.methods.verifyDocument = function(documentId, verifiedBy) {
  const document = this.documents.id(documentId);
  if (document) {
    document.verified = true;
    document.verified_by = verifiedBy;
    document.verified_at = new Date();
  }
  return this.save();
};

// Static method to find students by status
studentSchema.statics.findByStatus = function(status) {
  return this.find({ status }).populate('user_id', 'login_id email role');
};

// Static method to find students by academic standing
studentSchema.statics.findByAcademicStanding = function(standing) {
  return this.find({ 'performance.academic_standing': standing });
};

const Student = mongoose.models.NG_Student || mongoose.model('NG_Student', studentSchema);
export default Student;