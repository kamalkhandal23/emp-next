// models/ng_student.js
import mongoose from "mongoose";

const ngStudentSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    phone: Object,
    course: { type: mongoose.Schema.Types.ObjectId, ref: "NG_Course" },
    address: String,
    registeredAt: Date,
    registrationRef: { type: mongoose.Schema.Types.ObjectId, ref: "NG_Registration" },

    // 👇 ye field optional aur auto ho jaye
    student_id: {
        type: String,
        unique: true,
        sparse: true // ✅ important: null values allowed, unique enforcement only on non-null
    },
});

export default mongoose.models.ng_students || mongoose.model("ng_students", ngStudentSchema);