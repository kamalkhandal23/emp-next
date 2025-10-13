import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  subtitle: String,
  duration_weeks: Number,
  visibility: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true },
  banner_url: String,
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'NG_User' },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const Course = mongoose.models.NG_Course || mongoose.model('NG_Course', courseSchema);
export default Course;
