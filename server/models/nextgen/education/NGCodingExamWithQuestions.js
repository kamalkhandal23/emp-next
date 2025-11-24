import mongoose from 'mongoose';

// Schema for storing complete coding exam with all questions in one document
const ngCodingExamWithQuestionsSchema = new mongoose.Schema({
  examName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  courseName: {
    type: String,
    required: true,
    trim: true
  },
  totalQuestions: {
    type: Number,
    required: true,
    min: 1
  },
  questions: {
    type: Map,
    of: {
      type: {
        type: String,
        enum: ['Coding'],
        required: true
      },
      question: {
        type: String,
        required: true
      },
      options: {
        type: [String],
        default: []
      },
      answer: {
        type: String,
        default: ''
      },
      testCase: {
        type: String,
        default: ''
      },
      sampleInputs: {
        type: [String],
        default: []
      },
      sampleOutputs: {
        type: [String],
        default: []
      },
      hiddenInputs: {
        type: [String],
        default: []
      },
      hiddenOutputs: {
        type: [String],
        default: []
      }
    },
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  }
}, {
  timestamps: true,
  collection: 'ng_coding_exam' // Explicitly set collection name
});

// Index for faster queries
ngCodingExamWithQuestionsSchema.index({ examName: 1 });
ngCodingExamWithQuestionsSchema.index({ courseName: 1 });
ngCodingExamWithQuestionsSchema.index({ status: 1 });
ngCodingExamWithQuestionsSchema.index({ createdAt: -1 });

// Method to get coding exam with questions as object
ngCodingExamWithQuestionsSchema.methods.getCodingExamData = function() {
  const questionsObj = {};
  this.questions.forEach((value, key) => {
    questionsObj[key] = value;
  });

  return {
    _id: this._id,
    examName: this.examName,
    courseName: this.courseName,
    totalQuestions: this.totalQuestions,
    questions: questionsObj,
    status: this.status,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Static method to create coding exam from frontend data
ngCodingExamWithQuestionsSchema.statics.createFromFrontend = async function(examName, courseName, totalQuestions, questionData) {
  const questionsMap = new Map();

  // Convert questionData object to Map
  Object.keys(questionData).forEach(key => {
    questionsMap.set(key, questionData[key]);
  });

  const exam = new this({
    examName,
    courseName,
    totalQuestions,
    questions: questionsMap
  });

  return await exam.save();
};

const NGCodingExamWithQuestions = mongoose.model('NG_CodingExamWithQuestions', ngCodingExamWithQuestionsSchema);

export default NGCodingExamWithQuestions;
