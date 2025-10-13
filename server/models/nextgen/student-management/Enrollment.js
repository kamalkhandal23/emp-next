import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'NG_User', required: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'NG_Course', required: true },
  status: { type: String, enum: ['active', 'completed', 'withdrawn'], default: 'active' },
  progress_pct: { type: Number, default: 0 },
  started_at: Date,
  completed_at: Date,
}, { timestamps: true });

enrollmentSchema.index({ user_id: 1, course_id: 1 }, { unique: true });
enrollmentSchema.index({ status: 1 });

const Enrollment = mongoose.models.NG_Enrollment || mongoose.model('NG_Enrollment', enrollmentSchema);
export default Enrollment;
