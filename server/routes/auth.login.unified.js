import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/core/User.js'; 

const router = express.Router();


const pickPortal = (role) => {
  if (role === 'admin') return 'admin';
  if (role === 'employee') return 'employee';
  return 'student';
};

router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Email or Login ID and password required' });
    }

    // find by email or login_id
    console.log("Login attempt with identifier:", identifier);
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { login_id: identifier }
      ]
    });
    console.log("Found user:", user);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or login ID' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: `Account is ${user.status}. Contact admin.` });
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash || '');
    if (!passwordValid) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          full_name: user.full_name,
          email: user.email,
          role: user.role
        },
        portal: pickPortal(user.role)
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

export default router;
