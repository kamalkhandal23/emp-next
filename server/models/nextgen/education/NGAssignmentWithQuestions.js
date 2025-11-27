import mongoose from 'mongoose';

// Schema for storing complete assignment with all questions in one document
const ngAssignmentWithQuestionsSchema = new mongoose.Schema(
  {
    assignmentName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    courseName: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
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
    collection: 'ng_assignments', // Explicitly set collection name
  }
);

// Index for faster queries
ngAssignmentWithQuestionsSchema.index({ assignmentName: 1 });
ngAssignmentWithQuestionsSchema.index({ courseName: 1 });
ngAssignmentWithQuestionsSchema.index({ courseName: 1, order: 1 });
ngAssignmentWithQuestionsSchema.index({ status: 1 });
ngAssignmentWithQuestionsSchema.index({ createdAt: -1 });

// Method to get assignment with questions as object
ngAssignmentWithQuestionsSchema.methods.getAssignmentData = function () {
  const questionsObj = {};
  this.questions.forEach((value, key) => {
    questionsObj[key] = value;
  });

  return {
    assignmentName: this.assignmentName,
    courseName: this.courseName,
    totalQuestions: this.totalQuestions,
    questions: questionsObj,
    status: this.status,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Static method to create assignment from frontend data
ngAssignmentWithQuestionsSchema.statics.createFromFrontend = async function (
  assignmentName,
  courseName,
  totalQuestions,
  questionData
) {
  const questionsMap = new Map();

  // Convert questionData object to Map
  Object.keys(questionData).forEach((key) => {
    questionsMap.set(key, questionData[key]);
  });

  const assignment = new this({
    assignmentName,
    courseName,
    totalQuestions,
    questions: questionsMap,
  });

  return await assignment.save();
};

const NGAssignmentWithQuestions =
  mongoose.models.NG_AssignmentWithQuestions ||
  mongoose.model('NG_AssignmentWithQuestions', ngAssignmentWithQuestionsSchema);

export default NGAssignmentWithQuestions;
