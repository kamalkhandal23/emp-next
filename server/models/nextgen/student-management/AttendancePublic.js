import mongoose from 'mongoose';

const attendancePublicSchema = new mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String, required: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'NG_Course' },
  date: { type: Date, required: true },
  ua: String,
  ip: String,
  geo: Object,
  token_hash: String,
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

attendancePublicSchema.index({ email: 1, date: 1 });

const AttendancePublic = mongoose.models.NG_AttendancePublic || mongoose.model('NG_AttendancePublic', attendancePublicSchema);
export default AttendancePublic;