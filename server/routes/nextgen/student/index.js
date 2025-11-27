// Student Routes Index
import express from 'express';
import authRoutes from './auth.js';
import registrationRoutes from './registration.js';
import loginRoutes from './login.js';
import profileRoutes from './profile.js';
import paymentRoutes from './payment.js';

const router = express.Router();

// Mount student routes
router.use('/login', loginRoutes); // Primary login route
router.use('/', authRoutes); // set-password, validate-token (but NOT login to avoid conflict)
router.use('/registration', registrationRoutes);
router.use('/payment', paymentRoutes);
router.use('/profile', profileRoutes);

export default router;
