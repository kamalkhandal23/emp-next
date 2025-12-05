import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  subtitle: String,
  duration: { type: String, required: true }, // e.g., "6 months", "4 months"
  description: { type: String, required: true },
  prerequisites: { type: String, default: '' },
  icon: { type: String, default: '🎓' },
  visibility: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true },
  banner_url: String,
  courseCode: { type: String, required: true, unique: true, uppercase: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'NG_User' },
  assignments: {
      type: [
        {
          assignment_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'NG_Assignment',
          },
          assignmentName: { type: String, required: true },
        },
      ],
      default: [],
    },

}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const Course = mongoose.models.NG_Course || mongoose.model('NG_Course', courseSchema);

export default Course;
