import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },
  enrolledCourses: [{
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    enrollmentDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'dropped', 'suspended'],
      default: 'active'
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  }],
  academicRecord: {
    gpa: {
      type: Number,
      default: 0,
      min: 0,
      max: 4
    },
    totalCredits: {
      type: Number,
      default: 0
    },
    completedCredits: {
      type: Number,
      default: 0
    }
  },
  examResults: [{
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam'
    },
    score: Number,
    grade: String,
    dateTaken: Date,
    attempts: {
      type: Number,
      default: 1
    }
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'graduated', 'suspended'],
    default: 'active'
  },
  profileImage: String,
  documents: [{
    type: String,
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes
studentSchema.index({ 'enrolledCourses.course': 1 });

// Virtual for full name
studentSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Methods
studentSchema.methods.calculateGPA = function() {
  if (this.examResults.length === 0) return 0;
  
  const totalPoints = this.examResults.reduce((sum, result) => {
    const gradePoints = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'F': 0.0
    };
    return sum + (gradePoints[result.grade] || 0);
  }, 0);
  
  return (totalPoints / this.examResults.length).toFixed(2);
};

studentSchema.methods.getEnrollmentStatus = function(courseId) {
  const enrollment = this.enrolledCourses.find(
    course => course.course.toString() === courseId.toString()
  );
  return enrollment ? enrollment.status : null;
};

export default mongoose.model('Student', studentSchema);