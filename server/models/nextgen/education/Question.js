import mongoose from 'mongoose'

const questionSchema = new mongoose.Schema({
  exam_id: { type: mongoose.Schema.Types.ObjectId, ref: 'NG_Exam', required: true, index: true },
  type: { type: String, enum: ['mcq_single','mcq_multi','subjective'], required: true },
  text: { type: String, required: true },
  options_json: Object,
  answer_key_json: Object,
  points: { type: Number, default: 1 },
}, { timestamps: true })

export default mongoose.model('NG_Question', questionSchema)


