import ng_student from "../models/ng_student.js";
import ng_student_leaderboard from "../models/nextgen/education/ng_student_leaderboard.js";

export const createLeaderboardImpl = async (courseId) => {
    try {
        // Fetch all students enrolled in the specified course
        const students = await ng_student.find({ course: courseId });

        if (students.length === 0) {
            console.log("No students found for the specified course.");
            return null;
        }

        // Prepare leaderboard entries
        const leaderboardEntries = students.map((student, index) => ({
            name: student.fullName,
            rank: 1, // Initial rank based on order
            score: 0 // Initial score set to 0
        }));
        // Create a new leaderboard document
        const newLeaderboard = new ng_student_leaderboard({
            course: courseId,
            students: leaderboardEntries
        });

        // Save the leaderboard to the database
        const savedLeaderboard = await newLeaderboard.save();
        console.log("Leaderboard created successfully:", savedLeaderboard);
        return savedLeaderboard;
    } catch (error) {
        console.error("Error creating leaderboard:", error);
        throw error;
    }
};