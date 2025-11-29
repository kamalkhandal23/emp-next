import NGSubmissionExams from "../models/nextgen/education/NGSubmissionExams.js";
import NG_Approved_Students from "../models/nextgen/core/NG_ApprovedStudents.js";


export const leaderboard = async (studentId) => {
    try {
        const student = await NG_Approved_Students.findById(studentId);
        if ( !student ) {
            throw new Error('Student not found');
        }

        const courseId = student.enrolledCourse;


    } catch (error) {
        throw new Error(`Error generating leaderboard: ${error.message}`);
    }

}