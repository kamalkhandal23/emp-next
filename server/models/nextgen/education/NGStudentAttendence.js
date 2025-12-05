import mongoose from "mongoose";

const attendanceEntrySchema = new mongoose.Schema({
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NG_Class",
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ["Present", "Absent", "Late", "Leave"],
        default: "Present",
    },
    remarks: {
        type: String,
        default: "",
    }
});

// Main schema
const studentAttendanceSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NG_Approved_Students",
        required: true,
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NG_Course",
        required: true,
    },
    attendance: [attendanceEntrySchema],
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

// Ensure one attendance document per student per course
studentAttendanceSchema.index({ student: 1, course: 1 }, { unique: true });

// Pre-save hook to ensure classId is unique in the array
studentAttendanceSchema.pre("save", function (next) {
    const classIds = this.attendance.map(a => a.classId.toString());
    const uniqueClassIds = new Set(classIds);

    if (classIds.length !== uniqueClassIds.size) {
        return next(new Error("Duplicate classId found in attendance array"));
    }
    next();
});

export default mongoose.model("NG_Student_Attendance", studentAttendanceSchema);
