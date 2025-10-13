import mongoose from 'mongoose'

const auditSchema = new mongoose.Schema({
  actor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'NG_User', index: true },
  actor_role: String,
  action: String,
  entity: String,
  entity_id: String,
  meta_json: Object,
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

export default mongoose.model('NG_AuditLog', auditSchema)


