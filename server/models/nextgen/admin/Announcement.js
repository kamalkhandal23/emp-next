import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  scope: { type: String, enum: ['global', 'course'], default: 'global', index: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'NG_Course' },
  title: { type: String, required: true },
  body_md: { type: String, required: true },
  published_at: { type: Date, default: Date.now, index: true },
}, { timestamps: true });

const Announcement = mongoose.models.NG_Announcement || mongoose.model('NG_Announcement', announcementSchema);
export default Announcement;
