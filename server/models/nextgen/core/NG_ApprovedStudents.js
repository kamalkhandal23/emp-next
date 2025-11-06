

import mongoose from "mongoose";
import {model} from "mongoose"

const NG_ApprovedStudents = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NG_Registration",
      required: true,
    },
    student_id: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NG_Courses",
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    registrationRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NG_Registration",
    },
  },
  { timestamps: true }
);


const NG_Approved_Students = model("ng_approved_students",NG_ApprovedStudents)
export default NG_Approved_Students