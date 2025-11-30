import mongoose from 'mongoose';

// Schema for storing complete exam with all questions in one document
const ngExamWithQuestionsSchema = new mongoose.Schema(
  {
    examName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
    },
    startTime: {
      type: Date,
      required: false,
    },
    endTime: {
      type: Date,
      required: false,
    },
    questions: {
      type: Map,
      of: {
        type: {
          type: String,
          enum: ['MCQ', 'Coding', 'Answer-based'],
          required: true,
        },
        question: {
          type: String,
          required: true,
        },
        options: {
          type: [String],
          default: [],
        },
        answer: {
          type: String,
          default: '',
        },
        testCase: {
          type: String,
          default: '',
        },
      },
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
    collection: 'ng_exams', // Explicitly set collection name
  }
);

// Index for faster queries
ngExamWithQuestionsSchema.index({ examName: 1 });
ngExamWithQuestionsSchema.index({ status: 1 });
ngExamWithQuestionsSchema.index({ createdAt: -1 });

// Method to get exam with questions as object
ngExamWithQuestionsSchema.methods.getExamData = function () {
  const questionsObj = {};
  this.questions.forEach((value, key) => {
    questionsObj[key] = value;
  });

  return {
    _id: this._id,
    examName: this.examName,
    totalQuestions: this.totalQuestions,
    questions: questionsObj,
    status: this.status,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Static method to create exam from frontend data
ngExamWithQuestionsSchema.statics.createFromFrontend = async function (
  examName,
  totalQuestions,
  questionData
) {
  const questionsMap = new Map();

  // Convert questionData object to Map
  Object.keys(questionData).forEach((key) => {
    questionsMap.set(key, questionData[key]);
  });

  const exam = new this({
    examName,
    totalQuestions,
    questions: questionsMap,
  });

  return await exam.save();
};

const NGExamWithQuestions = mongoose.model(
  'NG_ExamWithQuestions',
  ngExamWithQuestionsSchema
);

export default NGExamWithQuestions;
