import Course from "../../models/nextgen/education/Course.js";
import ng_student from "../../models/ng_student.js";
import ng_student_leaderboard from "../../models/nextgen/education/ng_student_leaderboard.js";
import {createLeaderboardImpl} from "../../services/createLeaderBoardImpl.js";

export const getLeaderboard = async (req, res) => {
    const { Id }  = req.params;
    //Students leaderboard for a course
    let leaderboard = await ng_student_leaderboard.findOne({ course: "68fc5efd3d9639feee13d1ac" }).populate('course');
    console.log("Leaderboard fetched from DB:", leaderboard);
    //Leaderboard does not exist, create it
    if (!leaderboard){
        leaderboard = await createLeaderboardImpl("68fc5efd3d9639feee13d1ac");
        console.log(leaderboard.students);
        return res.status(200).json({ players:[{ id: "mockPlayers",leaderboard }] });
    }
    //Leaderboard exists, return it
    const students =leaderboard.students;
    console.log(students);

    const mockPlayers= [
        { id: 1, name: "Sarah Johnson", score: 9850, rank: 1 },
        { id: 2, name: "Alex Chen", score: 9720, rank: 2 },
        { id: 3, name: "Marcus Williams", score: 9540, rank: 3 },
        { id: 4, name: "Emma Davis", score: 9320, rank: 4 },
        { id: 5, name: "James Rodriguez", score: 9180, rank: 5 },
        { id: 6, name: "Olivia Brown", score: 8950, rank: 6 },
        { id: 7, name: "Liam Martinez", score: 8840, rank: 7 },
        { id: 8, name: "Sophia Taylor", score: 8720, rank: 8 },
        { id: 9, name: "Noah Anderson", score: 8600, rank: 9 },
        { id: 10, name: "Ava Wilson", score: 8450, rank: 10 },
    ];
    console.log("Lectures fetched:", mockPlayers);

    return res.status(200).json({ players:[{ id: "mockPlayers",mockPlayers}] });
};
