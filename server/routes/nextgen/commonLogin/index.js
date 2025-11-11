import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import NG_Users from "../../../models/nextgen/core/NG_Users.js";


// @desc    Common Login for all
// @route   POST /api/nextgen/common/login
// @access  Public
const router = express.Router();


router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body; 
    // 'identifier' can be either email or login_id

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Email or User ID and password are required",
      });
    }

    // Find user by email or login_id
    const user = await NG_Users.findOne({
      $or: [{ email: identifier }, { login_id: identifier }],
    }).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Compare password
    // const isMatch = await bcrypt.compare(password, user.password);
    // if (!isMatch) {
    //   return res.status(401).json({
    //     success: false,
    //     message: "Invalid credentials",
    //   });
    // }

    if (user.password !== password) {
        return res.status(401).json({
            success: false,
            message: "Invalid credentials"
        });
}


    // Create JWT token
    const token = jwt.sign(
      {
        id: user._id,
        user_id: user.user_id,
        role: user.role,
      },
      process.env.JWT_SECRET || "your_jwt_secret_key",
      { expiresIn: "4d" }
    );

    // Successful login response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: {
        user_id: user.user_id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

export default router;
