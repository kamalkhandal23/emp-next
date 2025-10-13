import mongoose from 'mongoose'

const docRequestSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'NG_User', required: true, index: true },
  type: { type: String, required: true },
  speed: { type: String, enum: ['normal','express'], default: 'normal' },
  delivery: { type: String, enum: ['email','download','courier'], default: 'email' },
  payment_ref: String,
  status: { type: String, enum: ['requested','processing','ready','delivered'], default: 'requested', index: true },
  assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'NG_User' },
  file_url: String,
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

export default mongoose.model('NG_DocRequest', docRequestSchema)


