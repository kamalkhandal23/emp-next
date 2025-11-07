// server/routes/auth.js
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { body, validationResult } from "express-validator";
import User from "../models/core/User.js"; // NG_User model
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

/* ------------------------------------------------------------- */
/* Helper functions                                               */
/* ------------------------------------------------------------- */

const generateToken = (payload) => {
  try {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    });
  } catch (err) {
    console.error("JWT generation failed:", err);
    return null;
  }
};

const sendError = (res, status, message, extra = {}) =>
  res.status(status).json({ success: false, message, ...extra });

const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    sendError(res, 400, "Validation failed", { errors: errors.array() });
    return true;
  }
  return false;
};

/* ------------------------------------------------------------- */
/* LOGIN (email OR login_id)                                     */
/* ------------------------------------------------------------- */
router.post(
  "/login",
  [
    body("identifier").trim().notEmpty().withMessage("Email or Login ID required"),
    body("password").notEmpty().withMessage("Password required"),
  ],
  async (req, res) => {
    if (handleValidationErrors(req, res)) return;

    try {
      const { identifier, password } = req.body;
      console.log("Login attempt with identifier:", identifier);

      const query = {
        $or: [
          { email: identifier.toLowerCase() },
          { login_id: identifier },
        ],
      };

      // Select both password fields
      const user = await User.findOne(query).select("+password +password_hash");

      console.log("Found user:", user ? user.toObject() : null);

      if (!user) {
        return sendError(res, 401, "Invalid email or login ID");
      }

      if (user.status !== "active") {
        return sendError(res, 403, "Account inactive. Contact admin.");
      }

      // Check which password field exists
      console.log("Password fields check:", {
        password: user.password,
        password_hash: user.password_hash
      });
      const hashed = user.password_hash || user.password || "";
      if (!hashed) {
        return sendError(res, 401, "User has no password set");
      }

      
      try {
        
        const isValid = await bcrypt.compare(password.trim(), (hashed || "").trim());
        console.log("bcrypt.compare() =>", isValid);
        if (!isValid) {
          console.warn("Invalid password attempt for:", identifier);
          return sendError(res, 401, "Invalid credentials");
        }
      } catch (e) {
        console.error("bcrypt error:", e);
        return sendError(res, 500, "Error during password check");
      }

      // Update last login
      try {
        user.last_login_at = new Date();
        await user.save();
      } catch (err) {
        console.warn("Could not update last_login_at:", err.message);
      }

      // Create JWT
      const token = generateToken({
        id: user._id.toString(),
        role: user.role,
        login_id: user.login_id,
      });

      if (!token) {
        return sendError(res, 500, "Token generation failed");
      }

      const safeUser = {
        id: user._id,
        login_id: user.login_id,
        full_name: user.full_name || user.fullName || "User",
        email: user.email,
        role: user.role,
        status: user.status,
        last_login_at: user.last_login_at,
      };

      return res.json({
        success: true,
        message: "Login successful",
        data: { user: safeUser, token },
      });
    } catch (error) {
      console.error("Login error:", error);
      return sendError(res, 500, "Server error during login");
    }
  }
);

/* ------------------------------------------------------------- */
/* CURRENT USER (token-based)                                    */
/* ------------------------------------------------------------- */
router.get("/me", authenticate, async (req, res) => {
  try {
    console.log("Authenticated User:", req.user);

    // For hardcoded admin
    if (req.user._id === "admin-id") {
      return res.json({
        success: true,
        user: {
          id: "admin-id",
          login_id: "admin",
          full_name: "Super Admin",
          email: process.env.ADMIN_EMAIL || "admin@example.com",
          role: "admin",
          status: "active",
        },
      });
    }

    const user = await User.findById(req.user._id).select("-password -password_hash");
    if (!user) return sendError(res, 404, "User not found");

    return res.json({ success: true, user });
  } catch (err) {
    console.error("👤 /me error:", err);
    return sendError(res, 500, "Internal server error");
  }
});

/* ------------------------------------------------------------- */
/* LOGOUT + REFRESH                                              */
/* ------------------------------------------------------------- */
router.post("/logout", authenticate, (_req, res) => {
  try {
    res.json({ success: true, message: "Logged out successfully" });
  } catch {
    sendError(res, 500, "Logout failed");
  }
});

router.post("/refresh", authenticate, (req, res) => {
  try {
    const token = generateToken({
      id: req.user._id.toString(),
      role: req.user.role,
      login_id: req.user.login_id,
    });
    if (!token) return sendError(res, 500, "Token generation failed");

    res.json({
      success: true,
      message: "Token refreshed successfully",
      data: { token },
    });
  } catch (err) {
    sendError(res, 500, "Token refresh failed");
  }
});

export default router;
