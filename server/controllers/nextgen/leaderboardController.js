
import ng_student from "../../models/nextgen/core/NG_ApprovedStudents.js";
import ng_student_leaderboard from "../../models/nextgen/education/ng_student_leaderboard.js";
import {createLeaderboardImpl} from "../../services/createLeaderBoardImpl.js";
import {updateScoreAndSort} from "../../services/leaderboardService.js";

export const getLeaderboard = async (req, res) => {

    try{//checking for student and course id in query params
        const {studentId, courseId} = req.query;
        console.log(`Fetching leaderboard for studentId: ${studentId}, courseId: ${courseId}`);
        const student = await ng_student.findOne({student_id: studentId});
        if (!student) {
            console.log("Student not found");
            return res.status(404).json({error: "Student not found"});
        }
        //Students leaderboard for a course

        let leaderboard = await ng_student_leaderboard.findOne({course: courseId});
        console.log("Leaderboard fetched from DB:", leaderboard);

        //Leaderboard does not exist, create it
        if (!leaderboard) {
            leaderboard = await createLeaderboardImpl(courseId);
            return res.status(200).json({players: [{id: "mockPlayers", leaderboard}]});
        }
        //Leaderboard exists, return it
        const students = leaderboard.students;
        console.log(students);
        return res.status(200).json({players: [{id: "mockPlayers", students}]});

    }
    catch (Error){
        console.error("Error fetching leaderboard:", Error);
        return res.status(500).json({error: "Internal server error"});

    }

};
