import express from "express";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import User from "../models/core/User.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

/* ------------------------------------------------------------- */
/*  Helper Functions */
/* ------------------------------------------------------------- */

//  Generate JWT
const generateToken = (id) => {
  try {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    });
  } catch (err) {
    console.error("JWT generation failed:", err);
    return null;
  }
};

//  Unified error response
const sendError = (res, statusCode, message, extra = {}) =>
  res.status(statusCode).json({ success: false, message, ...extra });

//  Validation error formatter
const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    sendError(res, 400, "Validation failed", { errors: errors.array() });
    return true;
  }
  return false;
};

/* ------------------------------------------------------------- */
/*  REGISTER USER */
/* ------------------------------------------------------------- */
router.post(
  "/register",
  [
    body("firstName").trim().notEmpty().withMessage("First name is required"),
    body("lastName").trim().notEmpty().withMessage("Last name is required"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("department").notEmpty().withMessage("Department is required"),
    body("position").notEmpty().withMessage("Position is required"),
  ],
  async (req, res) => {
    if (handleValidationErrors(req, res)) return;

    try {
      const {
        firstName,
        lastName,
        email,
        password,
        phone,
        department,
        position,
        role = "employee",
      } = req.body;

      //  Check existing user
      const existingUser = await User.findOne({ email });
      if (existingUser)
        return sendError(res, 400, "User already exists with this email");

      //  Create & save user (password hashed via model)
      const user = new User({
        firstName,
        lastName,
        email,
        password,
        phone,
        department,
        position,
        role,
      });

      await user.save();

      //  JWT
      const token = generateToken(user._id);
      if (!token) return sendError(res, 500, "Token generation failed");

      const userResponse = user.toObject();
      delete userResponse.password;

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: { user: userResponse, token },
      });
    } catch (error) {
      console.error("🚨 Registration error:", error);
      if (error.code === 11000) {
        return sendError(res, 400, "Duplicate field value", {
          field: error.keyValue,
        });
      }
      return sendError(
        res,
        500,
        error.message || "Server error during registration"
      );
    }
  }
);

/* ------------------------------------------------------------- */
/*  LOGIN USER */
/* ------------------------------------------------------------- */
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required"),
  ],
  async (req, res) => {
    if (handleValidationErrors(req, res)) return;

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email }).select("+password");

      if (!user) return sendError(res, 401, "Invalid credentials");

      if (user.status && user.status !== "active") {
        return sendError(res, 403, "Account inactive. Contact admin.");
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        await user.incLoginAttempts?.();
        return sendError(res, 401, "Invalid credentials");
      }

      await user.resetLoginAttempts?.();

      user.lastLogin = new Date();
      await user.save();

      const token = generateToken(user._id);
      if (!token) return sendError(res, 500, "Token generation failed");

      const userResponse = user.toObject();
      delete userResponse.password;

      return res.json({
        success: true,
        message: "Login successful",
        data: { user: userResponse, token },
      });
    } catch (error) {
      console.error(" Login error:", error);
      return sendError(res, 500, "Server error during login");
    }
  }
);

/* ------------------------------------------------------------- */
/*  CURRENT USER */
/* ------------------------------------------------------------- */
router.get("/me", authenticate, async (req, res) => {
  try {
    //  Handle hardcoded admin user (non-DB)
    if (req.user._id === "admin-id") {
      return res.status(200).json({
        success: true,
        user: {
          _id: "admin-id",
          firstName: "Super Admin",
          email: "admin@lifebox.com",
          role: "admin",
        },
      });
    }

    // Otherwise, fetch from MongoDB
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(" Get current user error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/* ------------------------------------------------------------- */
/*  UPDATE PROFILE */
/* ------------------------------------------------------------- */
router.put(
  "/me",
  authenticate,
  [
    body("firstName").optional().trim(),
    body("lastName").optional().trim(),
    body("phone").optional().isMobilePhone().withMessage("Invalid phone"),
  ],
  async (req, res) => {
    if (handleValidationErrors(req, res)) return;

    try {
      const allowed = [
        "firstName",
        "lastName",
        "phone",
        "bio",
        "skills",
        "address",
        "preferences",
      ];
      const updates = {};
      Object.keys(req.body).forEach((key) => {
        if (allowed.includes(key)) updates[key] = req.body[key];
      });

      const user = await User.findByIdAndUpdate(req.user._id, updates, {
        new: true,
        runValidators: true,
      }).select("-password");

      if (!user) return sendError(res, 404, "User not found");

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: { user },
      });
    } catch (error) {
      console.error(" Profile update error:", error);
      sendError(res, 500, "Server error during profile update");
    }
  }
);

/* ------------------------------------------------------------- */
/*  CHANGE PASSWORD */
/* ------------------------------------------------------------- */
router.put(
  "/change-password",
  authenticate,
  [
    body("currentPassword").notEmpty().withMessage("Current password required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters"),
  ],
  async (req, res) => {
    if (handleValidationErrors(req, res)) return;

    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user._id).select("+password");

      if (!user) return sendError(res, 404, "User not found");

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) return sendError(res, 400, "Current password incorrect");

      user.password = newPassword;
      await user.save();

      res.json({ success: true, message: "Password changed successfully" });
    } catch (error) {
      console.error("🚨 Password change error:", error);
      sendError(res, 500, "Server error during password change");
    }
  }
);

/* ------------------------------------------------------------- */
/*  LOGOUT + REFRESH */
/* ------------------------------------------------------------- */
router.post("/logout", authenticate, (req, res) => {
  try {
    // In JWT system, logout is handled client-side (by deleting token)
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    sendError(res, 500, "Logout failed");
  }
});

router.post("/refresh", authenticate, (req, res) => {
  try {
    const token = generateToken(req.user._id);
    if (!token) return sendError(res, 500, "Token generation failed");

    res.json({
      success: true,
      message: "Token refreshed successfully",
      data: { token },
    });
  } catch (error) {
    sendError(res, 500, "Token refresh failed");
  }
});

export default router;
