
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

     
     courseName: {
        type: String,
        required: false, 
        trim: true,
      },
    // questions ka type tumhare data ke hisaab se array / object ho sakta hai
    // abhi loose rakhte hain:
    questions: {
      type: Object,
      default: {},
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
