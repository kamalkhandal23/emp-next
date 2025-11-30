import express from "express";
import { getLeaderboard } from "../../controllers/nextgen/leaderboardController.js";
import {studentAuth} from "../../middleware/studentAuth.js";



const router = express.Router();

// GET /student/:studentId/course/:courseId

router.get("/student",studentAuth, getLeaderboard);

export default router;