import mongoose from 'mongoose';

const attemptSchema = new mongoose.Schema({
  exam_id: { type: mongoose.Schema.Types.ObjectId, ref: 'NG_Exam', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'NG_User', required: true },
  started_at: Date,
  submitted_at: Date,
  score: Number,
  meta_json: Object,
}, { timestamps: true });

attemptSchema.index({ exam_id: 1, user_id: 1 });

const Attempt = mongoose.models.NG_Attempt || mongoose.model('NG_Attempt', attemptSchema);
export default Attempt;
