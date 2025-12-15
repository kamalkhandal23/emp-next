import mongoose from 'mongoose';

// Schema for Coding Exam with all questions inside one document
const ngCodingExamWithQuestionsSchema = new mongoose.Schema(
  {
    examName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    // NEW — Correct relation with courses
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ng_Courses",
      required: true,
      index: true,
    },

    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
    },
    startTime:{
      type: Date,
      required: true 
    },
    endTime:{
      type: Date,
      required: true 
    },


    // Questions stored as Map
    questions: {
      type: Map,
      of: {
        type: new mongoose.Schema(
          {
            type: {
              type: String,
              enum: ["Coding"],
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
              default: "",
            },
            testCase: {
              type: String,
              default: "",
            },
            sampleInputs: {
              type: [String],
              default: [],
            },
            sampleOutputs: {
              type: [String],
              default: [],
            },
            hiddenInputs: {
              type: [String],
              default: [],
            },
            hiddenOutputs: {
              type: [String],
              default: [],
            },
          },
          { _id: false }
        ),
      },
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "ng_coding_exam",
  }
);

/** -------------------------------
 * INDEXES FOR PERFORMANCE
 --------------------------------*/
ngCodingExamWithQuestionsSchema.index({ examName: 1 });
ngCodingExamWithQuestionsSchema.index({ courseId: 1 });
ngCodingExamWithQuestionsSchema.index({ status: 1 });
ngCodingExamWithQuestionsSchema.index({ createdAt: -1 });

/** -------------------------------
 * INSTANCE METHOD — Return clean exam object
 --------------------------------*/
ngCodingExamWithQuestionsSchema.methods.getCodingExamData = function () {
  const questionsObj = {};
  this.questions.forEach((value, key) => {
    questionsObj[key] = value;
  });

  return {
    _id: this._id,
    examName: this.examName,
    courseId: this.courseId,
    totalQuestions: this.totalQuestions,
    questions: questionsObj,
    status: this.status,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

/** -------------------------------
 * STATIC METHOD — Create from frontend
 --------------------------------*/
ngCodingExamWithQuestionsSchema.statics.createFromFrontend = async function (
  examName,
  courseName,
  courseId,
  totalQuestions,
  questionData,
  startTime,
  endTime
) {
  const questionsMap = new Map();

  Object.keys(questionData).forEach((key) => {
    questionsMap.set(key, questionData[key]);
  });

  const exam = new this({
    examName,
    courseId,
    totalQuestions,
    questions: questionsMap,
    startTime,
    endTime
  });

  return await exam.save();
};

const NGCodingExamWithQuestions = mongoose.model(
  "NG_CodingExamWithQuestions",
  ngCodingExamWithQuestionsSchema
);

export default NGCodingExamWithQuestions;


