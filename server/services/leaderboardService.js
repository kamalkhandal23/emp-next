// services/updateLeaderboard.js

import ng_student from "../models/nextgen/core/NG_ApprovedStudents.js";
import ng_student_leaderboard from "../models/nextgen/education/ng_student_leaderboard.js";
import ng_course from "../models/nextgen/education/Course.js";

export const updateScoreAndSort = async (courseId, studentId, grade) => {
    try {
        const course = await ng_course.findById(courseId);
                if (!course) {
                    console.log("Course not found with the given ID.");
                    return null;
                }
        const student = await ng_student.findOne({student_id: studentId});
        if (!student) {
            console.log("Student not found");
            
        }
        student.leaderboardValue = {
            score: (student.leaderboardValue?.score || 0) + grade,
        };
        await student.save();
        // Fetch course
        const students = await ng_student.find({ course: course._id });

        if (students.length === 0) {
            console.log("No students found for the specified course.");
            return null;
        }

        // 3. Sort all students by score DESC
        const sorted = [...students].sort(
            (a, b) =>
                (b.leaderboardValue?.score || 0) -
                (a.leaderboardValue?.score || 0)
        );

        // 4. Assign ranks
        sorted.forEach((s, index) => {
            s.leaderboardValue.rank = index + 1;
            s.save();
        });

        // 5. Prepare leaderboard entries
        const leaderboardEntries = sorted.map(s => ({
            student: s._id,               // ✔ Correct key for schema
            name:
                s.fullName ||
                s.name ||
                `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim(),
            score: s.leaderboardValue.score || 0,
            rank: s.leaderboardValue.rank || 1
        }));

        // 6. Update leaderboard collection
        const updatedLeaderboard = await ng_student_leaderboard.findOneAndUpdate(
            { course: courseId },
            { students: leaderboardEntries, updatedAt: Date.now() },
            { new: true }
        );

        return updatedLeaderboard;

    } catch (error) {
        throw new Error(`Error updating leaderboard: ${error.message}`);
    }
};
