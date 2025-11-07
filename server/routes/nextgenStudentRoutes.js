import express from "express";

import {
    upload,
    registerWithDocs,
    getAllRegistrations,
    enroll,
    login,
    me,
    approve,
    setPassword,
  } from "../controllers/nextgenStudentController.js";


const router = express.Router();
router.post(
    "/register",
    upload.fields([
      { name: "passport_photo", maxCount: 1 },
      { name: "documents", maxCount: 10 },
    ]),
    registerWithDocs
  );

router.get("/registrations", getAllRegistrations);

export default router;
