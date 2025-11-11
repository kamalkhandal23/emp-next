import mongoose from "mongoose";
import {model} from "mongoose"

const ngUserSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    login_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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
    role: {
      type: String,
      required: true,
      enum: ["admin", "course_manager", "employee", "student", "hr"],
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    password: {
      type: String,
      required: true,
      select: false, // hide by default when fetching
    },
  },
  { timestamps: true } // adds createdAt & updatedAt
);

const NG_Users = model("ng_users", ngUserSchema);
export default NG_Users
