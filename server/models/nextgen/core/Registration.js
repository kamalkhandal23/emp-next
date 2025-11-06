import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'NG_User' },
  full_name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { c: String, iv: String, tag: String },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'NG_Course', required: true },

  // added "approved" to enum values
  status: {
    type: String,
    enum: ['submitted', 'under_review', 'accepted', 'activated', 'rejected', 'approved'],
    default: 'submitted'
  },

  reviewed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'NG_User', default: null },
  reviewed_at: { type: Date, default: null },
  notes: String,
  date_of_birth: Date,
  education: String,
  experience: String,
  motivation: String,
  passport_photo: String,
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

registrationSchema.index({ email: 1, course_id: 1 });
registrationSchema.index({ status: 1 });

const Registration = mongoose.models.NG_Registration ||
  mongoose.model('NG_Registration', registrationSchema, 'ng_registration');

export default Registration;
