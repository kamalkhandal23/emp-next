import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'NG_Course', required: true, index: true },
  title: { type: String, required: true },
  instructions: String,
  start_at: Date,
  end_at: Date,
  duration_min: Number,
  anti_cheat_policy_json: Object,
  visibility: { type: String, enum: ['draft', 'scheduled', 'active', 'closed'], default: 'draft', index: true },
}, { timestamps: true });

const Exam = mongoose.models.NG_Exam || mongoose.model('NG_Exam', examSchema);
export default Exam;
