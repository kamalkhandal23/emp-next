import mongoose from 'mongoose'

const responseSchema = new mongoose.Schema({
  attempt_id: { type: mongoose.Schema.Types.ObjectId, ref: 'NG_Attempt', required: true, index: true },
  question_id: { type: mongoose.Schema.Types.ObjectId, ref: 'NG_Question', required: true, index: true },
  response_json: Object,
  is_correct: Boolean,
  marks_awarded: Number,
}, { timestamps: true })

responseSchema.index({ attempt_id: 1, question_id: 1 }, { unique: true })

export default mongoose.model('NG_Response', responseSchema)


