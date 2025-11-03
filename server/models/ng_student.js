import mongoose from "mongoose";

const ngApprovedStudentSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "NG_User",
    unique: true,
    sparse: true, 
    default: null,
  },
  student_id: { type: String, unique: true, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  address: { type: String },
  password: { type: String, required: true },
  registeredAt: { type: Date, default: Date.now },
  registrationRef: { type: mongoose.Schema.Types.ObjectId, ref: "Registration" },
});

const ngApprovedStudent = mongoose.model(
  "ng_approved_students",
  ngApprovedStudentSchema
);
export default ngApprovedStudent;
