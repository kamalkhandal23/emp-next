import studentAttendanceSchema from "../models/nextgen/education/NGStudentAttendence.js";
import NG_Approved_Students from "../models/nextgen/core/NG_ApprovedStudents.js";
import Course from "../models/nextgen/education/Course.js";
import User from "../models/core/User.js"
import { response } from "express";


/**
 * Helper: Get class name from course.classLinks
 */
const getClassName = (course) => {
    
    if (!course?.classLinks || course.classLinks.length === 0) {
        console.log("Course in getClassName true:", course) ;
        return "-";
    }
    return course.classLinks[0]?.title || "-";
};

//Get the assigned course
export const getCourseDetails = async (req, res) => {
    try {
        const managerId = req.params.managerId; 

        if (!managerId) {
            return res.status(400).json({ success: false, message: "Manager ID missing" });
        }

        const user = await User.findById(managerId);
        if (!user) {
            return res.status(404).json({ success: false, message: "Manager not found" });
        }

        const courseIds = user.assignedCourses || [];
        const results = [];

        for (const courseId of courseIds) {
            const course = await Course.findById(courseId);
            if (!course) continue;

            results.push({
                courseId,
                name: course.title
            });
        }
        console.log(results);   
        return res.status(200).json({ success: true, data: results });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};




/**
 * 1. Get attendance of a specific student
 */
export const getAttendanceByStudent = async (req, res) => {
    try {
        const { courseId, studentId } = req.params;

        const studentInfo = await NG_Approved_Students.findOne({ student_id: studentId });

        if (!studentInfo) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        const attendanceDoc = await studentAttendanceSchema
            .findOne({ course: courseId, student: studentInfo._id })
            .populate("course");

        if (!attendanceDoc) {
            return res.status(404).json({ success: false, message: "Attendance not found" });
        }

        const className = getClassName(attendanceDoc.course);

        const response = {
            studentId: studentInfo.student_id,
            studentName: studentInfo.fullName,
            email: studentInfo.email,
            course: attendanceDoc.course,
            className,   // ✔️ class name from classLinks
            attendance: attendanceDoc.attendance
        };

        res.status(200).json({ success: true, data: response });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};



/**
 *2. Get attendance by date
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
            .populate("course");

        const results = [];

        for (const doc of attendanceDocs) {
            const filtered = doc.attendance.filter(a =>
                new Date(a.date).toDateString() === targetDate.toDateString()
            );

            if (filtered.length === 0) continue;

            const studentInfo = await NG_Approved_Students.findById(doc.student);
            if (!studentInfo) continue;

            const className = getClassName(doc.course);

            results.push({
                studentId: studentInfo.student_id,
                studentName: studentInfo.fullName,
                email: studentInfo.email,
                course: doc.course,
                className,  // ✔️ from classLinks
                attendance: filtered
            });
        }
        console.log(results);

        res.status(200).json({ success: true, data: results });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};



/**
 * 3. Get ALL attendance for a course
 */
export const getAllAttendance = async (req, res) => {
    try {
        const { courseId } = req.params;

        const attendanceDocs = await studentAttendanceSchema
            .find({ course: courseId })
            .populate("course");

        const results = [];

        for (const doc of attendanceDocs) {
            const studentInfo = await NG_Approved_Students.findById(doc.student);
            if (!studentInfo) continue;

            const className = "-";

            results.push({
                studentId: studentInfo.student_id,
                studentName: studentInfo.fullName,
                email: studentInfo.email,
                course: doc.course,
                className,  // ✔️ from classLinks
                attendanceCount: doc.attendance.length
            });
            console.log(results);
        }
        

        res.status(200).json({ success: true, data: results });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};
