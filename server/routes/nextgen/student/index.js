// Student Routes Index
import express from 'express';
import authRoutes from './auth.js';
import registrationRoutes from './registration.js';
import profileRoutes from './profile.js';

const router = express.Router();

// Mount student routes
router.use('/', authRoutes); // login, set-password, validate-token
router.use('/registration', registrationRoutes);
router.use('/profile', profileRoutes);

export default router;