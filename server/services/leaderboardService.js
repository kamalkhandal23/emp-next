// services/updateLeaderboard.js

import ng_student from "../models/nextgen/core/NG_ApprovedStudents.js";
import ng_student_leaderboard from "../models/nextgen/education/ng_student_leaderboard.js";
import ng_course from "../models/nextgen/education/Course.js";
import { studentAuth } from "../middleware/studentAuth.js";

export const updateScoreAndSort = async (courseId) => {
    try {
        
        // 1. Find all approved students of this course
        const students = await ng_student.find({ course: courseId });

        if (!students.length) {
            return { success: false, message: "No students found for this course" };
        }

        // 2. Check if leaderboard already exists
        let leaderboard = await ng_student_leaderboard.findOne({ course: courseId });

        const updatedStudentsArray = students.map((s) => ({
            student: s._id,
            name: s.fullName,
            score: s.leaderboardValue.score || 0,   // change field if your score is stored differently
            rank: s.leaderboardValue.rank || 1,
        }));

        // 3. Sort students by score descending
        updatedStudentsArray.sort((a, b) => b.score - a.score);

        // 4. Apply ranks
        updatedStudentsArray.forEach((stud, index) => {
            stud.rank = index + 1;
        });

        // 5. If leaderboard exists → update it
        
            leaderboard.students = updatedStudentsArray;
            leaderboard.updatedAt = Date.now();
            await leaderboard.save();

            return {
                success: true,
                message: "Leaderboard updated with latest student data",
                leaderboard
            };
    } catch (error) {
        console.error("Error updating leaderboard:", error);
        return { success: false, message: "Internal server error" };
    }
};
