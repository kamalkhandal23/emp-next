import ng_student from "../../models/nextgen/core/NG_ApprovedStudents.js";
import NG_Course from "../../models/nextgen/education/Course.js";
import addActivity from '../../services/addActivityServiceImpl.js';
import NGStudentAttencendance from "../../models/nextgen/education/NGStudentAttendence.js";
import { updateScoreAndSort } from '../../services/leaderboardService.js';

export const addRecentActivity = async (req, res) => {
    try {
        const resBody = req.body;
        const { studentId, courseId } = req.query;

        const student = await ng_student.findOne({ student_id: studentId });
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        const course = await NG_Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }

        console.log("Recent Activity Request Body:", resBody);

        await addActivity(
            student._id,
            resBody.activityType,
            resBody.description,
            { Date: new Date() }
        );
        if (resBody.activityType === 'Joined Lecture') {
            console.log("Marking attendance for lecture:", resBody.lectureId);
            const today = new Date();

            // Find student attendance document for this course
        const attendanceDoc = await NGStudentAttencendance.findOne({
            student: student._id,
            course: course._id
        });

        if (attendanceDoc) {
        // Check if lecture already marked
        console.log("Existing attendance document found:", attendanceDoc);
            const alreadyMarked = attendanceDoc.attendance.some(
            (a) => a.classId.toString() === resBody.lectureId
        );

        if (!alreadyMarked) {
            attendanceDoc.attendance.push({
                classId: resBody.lectureId,
                date: today,
                status: "Present"
            });
            await attendanceDoc.save();
        }
    } else {
        // Create a new attendance doc if not exists
        const newAttendance = new NGStudentAttencendance({
            student: student._id,
            course: course._id,
            attendance: [{
                classId: resBody.lectureId,
                date: today,
                status: "Present"
            }]
        });
        await newAttendance.save();
    }
}



        // Sample update
        student.leaderboardValue.score += 10;
        await student.save();



        return res.status(200).json({ message: "Activity added successfully" });

    } catch (error) {
        console.error("Error fetching profile:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
