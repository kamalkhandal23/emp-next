import express from "express";
import { createNotification, getAllNotifications } from "../../controllers/nextgen/notificationController.js";

const router = express.Router();

// Public route for creating notifications
router.post("/", createNotification);

// Admin route for getting all notifications
router.get("/", getAllNotifications);

export default router;
