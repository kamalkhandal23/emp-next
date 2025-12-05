import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true }, // upcoming event date
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("Event", EventSchema);
