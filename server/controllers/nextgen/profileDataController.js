import ng_student from "../../models/nextgen/core/NG_ApprovedStudents.js";
import NG_Course from "../../models/nextgen/education/Course.js";
import RecentActivity from "../../models/education/recentActivity.js";
import NGStudentAttencendance from "../../models/nextgen/education/NGStudentAttendence.js";

export const getProfileData = async (req, res) => {
    try {
        const { studentId, courseId } = req.query;

        const student = await ng_student.findOne({ student_id: studentId });
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        // IMPORTANT: no populate now
        const course = await NG_Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }

        const recentActivity = await RecentActivity.findOne({ studentId: student._id });

        const completedAssignments = student.assignments.length;
        console.log(student);
        const classAttenended = await NGStudentAttencendance.findOne({student : student._id});

        return res.status(200).json({
            Data:
                {
                    studentRank: student.leaderboardValue?.rank || 0,
                    studentScore: student.leaderboardValue?.score || 0,
                    completedAssignments: completedAssignments,
                    course: course,
                    recentActivity: recentActivity,
                    noOfClassAttended: classAttenended?.attendance?.length ||0
                    
                    
                }
            
        });

    } catch (error) {
        console.error("Error fetching profile:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
