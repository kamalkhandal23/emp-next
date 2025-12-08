import studentAttendanceSchema from "../models/nextgen/education/NGStudentAttendence.js";
import NG_Approved_Students from "../models/nextgen/core/NG_ApprovedStudents.js";

/**
 * Get attendance for a specific student in a course
 */
export const getAttendanceByStudent = async (req, res) => {
    try {
        const { courseId, studentId } = req.params;

        // FIX: studentId is roll number like "STU0019"
        const studentInfo = await NG_Approved_Students.findOne({ student_id: studentId });

        if (!studentInfo) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        // Use the actual ObjectId to fetch attendance
        const attendanceDoc = await studentAttendanceSchema
            .findOne({ course: courseId, student: studentInfo._id })
            .populate("course", "title classId");

        if (!attendanceDoc) {
            return res.status(404).json({ success: false, message: "Attendance not found" });
        }

        const response = {
            studentId: studentInfo.student_id,
            studentName: studentInfo.fullName,
            email: studentInfo.email,
            course: attendanceDoc.course,
            classId: attendanceDoc.course?.classId,
            attendance: attendanceDoc.attendance
        };

        res.status(200).json({ success: true, data: response });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};


/**
 * Get attendance of all students for a specific date in a course
 */
export const getAttendanceByDate = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ success: false, message: "Date query parameter is required" });
        }

        const targetDate = new Date(date);

        const attendanceDocs = await studentAttendanceSchema
            .find({ course: courseId })
            .populate("course", "title classId");

        const results = [];

        for (const doc of attendanceDocs) {
            const filteredAttendance = doc.attendance.filter(entry => {
                return new Date(entry.date).toDateString() === targetDate.toDateString();
            });

            if (filteredAttendance.length === 0) continue;

            // FIX: student field contains ObjectId
            const studentInfo = await NG_Approved_Students.findById(doc.student);

            results.push({
                studentId: studentInfo?.student_id,
                studentName: studentInfo?.fullName,
                email: studentInfo?.email,
                course: doc.course,
                classId: doc.course?.classId,
                attendance: filteredAttendance
            });
        }

        res.status(200).json({ success: true, data: results });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};


/**
 * Get all attendance for a course
 */
export const getAllAttendance = async (req, res) => {
    try {
        const { courseId } = req.params;

        const attendanceDocs = await studentAttendanceSchema
            .find({ course: courseId })
            .populate("course", "title classId");

        const results = [];

        for (const doc of attendanceDocs) {
            const studentInfo = await NG_Approved_Students.findById(doc.student);

            if (!studentInfo) continue;

            results.push({
                studentId: studentInfo.student_id,
                studentName: studentInfo.fullName,
                email: studentInfo.email,
                course: doc.course,
                classId: doc.course?.classId,
                attendance: doc.attendance.length
            });
        }

        res.status(200).json({ success: true, data: results });
        return res;

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};
