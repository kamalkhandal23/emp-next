import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'NG_User', index: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'NG_Course', index: true },
  template_id: String,
  issued_at: Date,
  serial_no: { type: String, unique: true, sparse: true },
  status: { type: String, enum: ['pending', 'issued', 'revoked'], default: 'pending', index: true },
  file_url: String,
}, { timestamps: true });

const Certificate = mongoose.models.NG_Certificate || mongoose.model('NG_Certificate', certificateSchema);
export default Certificate;
