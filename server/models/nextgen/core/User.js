import mongoose from 'mongoose';

const piiField = {
  c: String,
  iv: String,
  tag: String
};

const userSchema = new mongoose.Schema({
  login_id: { type: String, unique: true },
  full_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: piiField,
  role: { type: String, enum: ['student', 'admin', 'employee'], default: 'student' },
  status: { type: String, enum: ['active', 'disabled', 'pending'], default: 'pending' },
  password_hash: { type: String },
  last_login_at: Date,
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

userSchema.index({ role: 1 });

const User = mongoose.models.NG_User || mongoose.model('NG_User', userSchema);
export default User;
