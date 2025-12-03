// services/createLeaderBoardImpl.js
import ng_student from "../models/nextgen/core/NG_ApprovedStudents.js";
import ng_student_leaderboard from "../models/nextgen/education/ng_student_leaderboard.js";
import ng_course from "../models/nextgen/education/Course.js";

export const createLeaderboardImpl = async (courseIdParam) => {
    try {
        // Fetch course
        const course = await ng_course.findById(courseIdParam);
        if (!course) {
            console.log("Course not found with the given ID.");
            return null;
        }

        // Fetch students belonging to this course
        const students = await ng_student.find({ course: course._id });

        if (students.length === 0) {
            console.log("No students found for the specified course.");
            return null;
        }

        // IMPORTANT: include `student: student._id`
        const leaderboardEntries = students.map((student, index) => {
            const name =
                student.fullName ||
                student.name ||
                `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim() ||
                `Student ${index + 1}`;

            return {
                student: student._id,         // <-- this field was missing earlier
                name,
                rank: student.leaderboardValue?.rank ?? 1,
                score: student.leaderboardValue?.score ?? 0,
            };
        });

        // Save leaderboard
        const newLeaderboard = new ng_student_leaderboard({
            course: course._id,
            students: leaderboardEntries
        });

        const savedLeaderboard = await newLeaderboard.save();
        console.log("Leaderboard created successfully:", savedLeaderboard);

        return savedLeaderboard;

    } catch (error) {
        console.error("Error creating leaderboard:", error);
        throw error;
    }
};
