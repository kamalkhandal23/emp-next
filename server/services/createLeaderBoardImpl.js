// javascript
// File: server/services/createLeaderBoardImpl.js
import ng_student from "../models/nextgen/core/NG_ApprovedStudents.js";
import ng_student_leaderboard from "../models/nextgen/education/ng_student_leaderboard.js";
import ng_course from "../models/nextgen/education/Course.js";
import mongoose from "mongoose";

export const createLeaderboardImpl = async (studentID,) => {
    try {
        // 1️⃣ Fetch course
        const course = await ng_course.findById(courseIdParam);
        if (!course) {
            console.log("Course not found with the given ID.");
            return null;
        }

        // 2️⃣ Fetch students for that course
        const students = await ng_student.find({ course: course._id });
        console.log(students, "Students fetched for course:", course._id);

        if (!students || students.length === 0) {
            console.log("No students found for the specified course.");
            return null;
        }

        // 3️⃣ Map students to leaderboard entries
        const leaderboardEntries = students.map((student, index) => {
            const studentId = student._id ? student._id.toString() : null;

            const name =
                student.fullName ??
                student.name ??
                (student.firstName || student.lastName
                    ? `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim()
                    : `Student ${index + 1}`);

            return {
                id: studentId ?? `generated-${index + 1}`,
                studentId: studentId,
                name,
                rank: student.leaderboardValue?.rank ?? 1, // initial rank based on fetched order
                score: student.leaderboardValue?.score ?? 0 // fetch score from schema
            };
        });

        // 4️⃣ Create and save leaderboard
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
export const updateLeaderBoard = async () => {
    try {
        // 1️⃣ Fetch course
        const course = await ng_course.findById(courseIdParam);
        if (!course) {
            console.log("Course not found with the given ID.");
            return null;
        }

        // 2️⃣ Fetch students for that course
        const students = await ng_student.find({ course: course._id });
        console.log(students, "Students fetched for course:", course._id);

        if (!students || students.length === 0) {
            console.log("No students found for the specified course.");
            return null;
        }

        // 3️⃣ Map students to leaderboard entries
        const leaderboardEntries = students.map((student, index) => {
            const studentId = student._id ? student._id.toString() : null;

            const name =
                student.fullName ??
                student.name ??
                (student.firstName || student.lastName
                    ? `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim()
                    : `Student ${index + 1}`);

            return {
                id: studentId ?? `generated-${index + 1}`,
                studentId: studentId,
                name,
                rank: student.leaderboardValue?.rank ?? 1, // initial rank based on fetched order
                score: student.leaderboardValue?.score ?? 0 // fetch score from schema
            };
        });

        // 4️⃣ Create and save leaderboard
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