import express from "express";
import { getProfileData } from "../../controllers/nextgen/profileDataController.js";
import { studentAuth } from "../../middleware/studentAuth.js";
import {addRecentActivity}  from "../../controllers/nextgen/addRecentActivityController.js";

const router = express.Router();

// GET /api/nextgen/studentData/student
console.log("Profile Data Route Loaded");
router.post("/add-activity", studentAuth, addRecentActivity);
router.get("/student", studentAuth, getProfileData);

export default router;
