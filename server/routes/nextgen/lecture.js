import express from "express";
import { getLectureVideo } from "../../controllers/nextgen/lectureController.js";
import {studentAuth} from "../../middleware/studentAuth.js";



const router = express.Router();

// GET /student/:studentId/course/:courseId
console.log("Lecture route accessed");
router.get("/student",studentAuth, getLectureVideo);

export default router;
