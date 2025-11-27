import express from "express";
import { getLectureVideo } from "../../controllers/nextgen/lectureController.js";



const router = express.Router();

// GET /student/:studentId/course/:courseId
console.log("Lecture route accessed");
router.get('/student/:id', getLectureVideo);

export default router;
