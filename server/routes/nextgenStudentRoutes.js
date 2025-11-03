import express from "express";
import { getAllRegistrations } from "../controllers/nextgenStudentController.js";


const router = express.Router();

router.get("/registrations", getAllRegistrations);

export default router;
