// Admin Routes Index
import express from 'express';
import registrationRoutes from './registrations.js';

const router = express.Router();

// Mount admin routes
router.use('/registrations', registrationRoutes);

export default router;