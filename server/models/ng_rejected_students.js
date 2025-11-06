import mongoose from "mongoose";

const ngRejectedStudentSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  address: { type: String },
  registrationRef: { type: mongoose.Schema.Types.ObjectId, ref: "Registration" },
  rejectedAt: { type: Date, default: Date.now },
  rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reason: { type: String },
});

const ngRejectedStudent = mongoose.model(
  "ng_rejected_students",
  ngRejectedStudentSchema
);

export default ngRejectedStudent;
