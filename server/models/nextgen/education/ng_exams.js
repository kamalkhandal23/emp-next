
import mongoose from 'mongoose';

const examSchema = new mongoose.Schema(
  {
    examName: {
      type: String,
      required: true,
      trim: true,
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },

     
     courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ng_Courses",     // reference to course collection
      required: true
    },
    // questions ka type tumhare data ke hisaab se array / object ho sakta hai
    // abhi loose rakhte hain:
    questions: {
      type: Object,
      default: {},
    },
    startTime:{
      type: Date,
      required: true
    },
    endTime:{
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
    collection: 'ng_exams', // 👈 important: existing collection ka naam
  }
);

const ng_exams = mongoose.model('ng_exams', examSchema);
export default ng_exams;
