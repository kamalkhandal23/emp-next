import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'NG_Course', required: true, index: true },
  title: { type: String, required: true },
  order_index: { type: Number, default: 0, index: true },
  visibility: { type: String, enum: ['draft', 'published'], default: 'draft' },
}, { timestamps: true });

const Module = mongoose.models.NG_Module || mongoose.model('NG_Module', moduleSchema);
export default Module;
