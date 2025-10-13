import mongoose from 'mongoose'

const lessonSchema = new mongoose.Schema({
  module_id: { type: mongoose.Schema.Types.ObjectId, ref: 'NG_Module', required: true, index: true },
  title: { type: String, required: true },
  content_md: String,
  video_url: String,
  resources_json: Object,
  order_index: { type: Number, default: 0, index: true },
  visibility: { type: String, enum: ['draft','published'], default: 'draft' },
}, { timestamps: true })

export default mongoose.model('NG_Lesson', lessonSchema)


