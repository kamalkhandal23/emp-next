import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import employeeRoutes from './routes/employees.js';
import attendanceRoutes from './routes/attendance.js';
import taskRoutes from './routes/tasks.js';
import projectRoutes from './routes/projects.js';
import teamRoutes from './routes/teams.js';
import leaveRoutes from './routes/leaves.js';
import meetingRoutes from './routes/meetings.js';
import dashboardRoutes from './routes/dashboard.js';
import nextgenSystemRoutes from './routes/nextgen/index.js';
import lectureRoutes from './routes/nextgen/lecture.js';
import leaderboard from './routes/nextgen/leaderboard.js';
import profileDataRoute from './routes/nextgen/profileDataRoute.js';

import uploadRoutes from './routes/upload.js';
import studentRoutes from './routes/students.js';
import courseRoutes from './routes/courses.js';
import examRoutes from './routes/exams.js';
import resultRoutes from './routes/results.js';
import adminRoutes from './routes/admin.js';
import nextgenAdminRoutes from './routes/nextgen/admin/index.js';
import inquiryRoutes from './routes/inquiry.js';
import codingPracticeRoutes from './routes/nextgenCodingPractice.js';
import employeePortalRoutes from './routes/employeePortal.js';
import nextgenStudentRoutes from './routes/nextgenStudentRoutes.js';
import unifiedAuthLogin from './routes/auth.login.unified.js';
import studentattendanceRoutes from "./routes/nextgen/studentAttendence.js";

// Middleware
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

// Jobs
import { startAttendanceJobs } from './jobs/attendanceJobs.js';

// Services
import { initializeBucket } from './services/uploadService.js';

dotenv.config();

const app = express();
//  CORS CONFIGURATION
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5001',
  'http://localhost:5002',
  'https://nextgenfreeedu.netlify.app',
  'https://lifeboxnextgen.com',
  'https://www.lifeboxnextgen.com',
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow Postman / curl / mobile apps
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked: ${origin}`), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Handle all OPTIONS requests BEFORE routes
app.options('*', cors());

app.get(['/favicon.ico', '/favicon.png', '/favicon.svg'], (req, res) => {
  return res.status(204).end();
});
const PORT = process.env.PORT || 5000;
app.use(
  '/uploads',
  express.static(path.join(process.cwd(), 'server', 'uploads'))
);


// Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Rate limiter
if (process.env.NODE_ENV === "production") {
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: { error: 'Too many requests, please try again later.' },
  });

  app.use('/api/', limiter);
}

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression & Logging
app.use(compression());
app.use(
  process.env.NODE_ENV === 'development' ? morgan('dev') : morgan('combined')
);
app.use('/api/auth', unifiedAuthLogin);

// Mongo Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI ||
        'mongodb+srv://bhanuprakashsyagamreddy:oxfordV2Cluster@cluster0.f1p7jgs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Initialize local upload directory
    await initializeBucket();
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};
connectDB();

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
  });
});

//  Mount Routes (ORDER MATTERS)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/inquiry', inquiryRoutes);
app.use('/api/employee-portal', employeePortalRoutes);
app.use('/api/nextgen/admin', nextgenAdminRoutes);
app.use('/api/nextgen/leaderboard', leaderboard);
app.use('/api/nextgen/lectureVideo', lectureRoutes);
app.use('/api/nextgen/studentData', profileDataRoute);
//  NextGen routes (last, to avoid overlap)
app.use('/api/nextgen', nextgenSystemRoutes);
app.use('/api/nextgen', nextgenStudentRoutes);
app.use('/api/nextgen', codingPracticeRoutes);
app.use("/api/attendance", studentattendanceRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Lifebox NextGen API 🚀',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/health',
  });
});

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down...');
  await mongoose.connection.close();
  process.exit(0);
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`
 Server running on port ${PORT}
 API Base: http://localhost:${PORT}/api
 Mode: ${process.env.NODE_ENV || 'development'}
`);
  if (process.env.NODE_ENV === 'production') {
    startAttendanceJobs();
  }
});

server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

export default app;
