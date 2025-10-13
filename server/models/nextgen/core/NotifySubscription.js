import mongoose from 'mongoose';

const notifySchema = new mongoose.Schema({
  email: String,
  whatsapp: String,
  status: { type: String, enum: ['pending', 'confirmed', 'unsubscribed'], default: 'pending' },
  token_hash: String,
  confirmed_at: Date,
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const NotifySubscription = mongoose.models.NG_NotifySubscription || mongoose.model('NG_NotifySubscription', notifySchema);
export default NotifySubscription;
