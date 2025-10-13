import mongoose from 'mongoose'

const attendanceSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    date: { type: Date, required: true },
    method: { type: String, enum: ['public', 'dashboard'], required: true },
    note: String,
    confirmed: { type: Boolean, default: false },
    confirmedAt: Date,
  },
  { timestamps: true }
)

attendanceSchema.index({ student: 1, date: 1 }, { unique: false })

const NGAttendance = mongoose.models.NG_Attendance || mongoose.model('NG_Attendance', attendanceSchema);
export default NGAttendance;


