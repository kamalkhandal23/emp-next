// server/routes/nextgenCodingPractice.js
import express from "express";
import { executeCode } from "../services/codeExecutionService.js";

const router = express.Router();

router.post("/nextgen/coding/practice-run", async (req, res) => {
  try {
    const { language, code, input = "" } = req.body;

    const result = await executeCode(code, language, [input], [""]);
    return res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error("Practice run error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to run code",
    });
  }
});

export default router;
