import express from "express";
import { getLeaderboard } from "../../controllers/nextgen/leaderboardController.js";
import {studentAuth} from "../../middleware/studentAuth.js";



const router = express.Router();

// GET /student/:studentId/course/:courseId
console.log("Lecture route accessed");
router.get('/student/:id', getLeaderboard);

export default router;