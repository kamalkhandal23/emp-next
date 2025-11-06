import mongoose from "mongoose";
import { model } from "mongoose";

const NG_CoursesSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    duration: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    prerequisites: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
    },
    visibility: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
    banner_url: {
      type: String,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// 👇 Model name must match the `ref` you use in your student schema
const NG_Courses = model("NG_Courses", NG_CoursesSchema);


export default NG_Courses