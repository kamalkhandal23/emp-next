import ng_student from "../../models/nextgen/core/NG_ApprovedStudents.js";
import NG_Course from "../../models/nextgen/education/Course.js";
import addActivity from '../../services/addActivityServiceImpl.js';
import NGStudentAttencendance from "../../models/nextgen/education/NGStudentAttendence.js";
import { updateScoreAndSort } from '../../services/leaderboardService.js';

export const addRecentActivity = async (req, res) => {
    try {
        const resBody = req.body;
        const { studentId, courseId } = req.query;
        const lectureId = resBody.lectureId;

        const student = await ng_student.findOne({ student_id: studentId });
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        const course = await NG_Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }
        //JOINED LECTURE
        if (resBody.activityType === 'Joined Lecture') {
            const today = new Date();

            let attendanceDoc = await NGStudentAttencendance.findOne({
                student: student._id,
                course: course._id
            });

            if (!attendanceDoc) {
                attendanceDoc = new NGStudentAttencendance({
                    student: student._id,
                    course: course._id,
                    attendance: []
                });
            }

            const alreadyMarked = attendanceDoc.attendance.some(
                a => a.classId.toString() === resBody.lectureId
            );

            if (!alreadyMarked) {
                attendanceDoc.attendance.push({classId: resBody.lectureId, date: today, status: "Present"});
                await attendanceDoc.save();
                student.leaderboardValue.score += 20;
                await addActivity(student._id, resBody.activityType, resBody.description, { date: new Date() });
            }
            else{
                await addActivity(student._id, resBody.activityType, `Rejoined - ${resBody.description}`, { date: new Date() });
            }

        }

        /*WATCHED VIDEO LECTURE */
        if (resBody.activityType === 'Watched Lecture Video') {

            // Defensive init (for old records)
            if (!Array.isArray(student.videoLectureWatched)) {
                student.videoLectureWatched = [];
            }

            const alreadyWatched = student.videoLectureWatched.some(
                v =>
                    v?.video_id &&
                    v.video_id.toString() === resBody.lectureId
            );

            if (!alreadyWatched) {
                student.videoLectureWatched.push({
                    video_id: resBody.lectureId,
                    watchedAt: new Date()
                });

                student.leaderboardValue.score += 5;


                await addActivity(
                    student._id,
                    "Watched Lecture Video",
                    resBody.description,
                    { date: new Date() }
                );
            } else {
                await addActivity(
                    student._id,
                    "Rewatched Lecture Video",
                    `Rewatched - ${resBody.description}`,
                    { date: new Date() }
                );
            }
        }


        await student.save();

        // Optional leaderboard resort
        await updateScoreAndSort(course._id);

        return res.status(200).json({ message: "Activity added successfully" });

    } catch (error) {
        console.error("Error adding activity:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
