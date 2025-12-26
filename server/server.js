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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* -------------------- CORS -------------------- */
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
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked: ${origin}`), false);
    },
    credentials: true,
  })
);

app.options('*', cors());

/* -------------------- SECURITY & UTILS -------------------- */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(
  process.env.NODE_ENV === 'development'
    ? morgan('dev')
    : morgan('combined')
);

/* -------------------- RATE LIMIT (PROD) -------------------- */
if (process.env.NODE_ENV === 'production') {
  app.use(
    '/api',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 500,
      message: { error: 'Too many requests, try later.' },
    })
  );
}

/* -------------------- STATIC (⚠️ TEMP ON VERCEL) -------------------- */
app.use(
  '/uploads',
  express.static(path.join(process.cwd(), 'server', 'uploads'))
);

/* -------------------- DB CONNECTION -------------------- */
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
  console.log('MongoDB connected');
}
connectDB();

/* -------------------- ROUTES -------------------- */
import unifiedAuthLogin from './routes/auth.login.unified.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import employeeRoutes from './routes/employees.js';
import attendanceRoutes from './routes/attendance.js';
import studentattendanceRoutes from './routes/nextgen/studentAttendence.js';
import taskRoutes from './routes/tasks.js';
import projectRoutes from './routes/projects.js';
import teamRoutes from './routes/teams.js';
import leaveRoutes from './routes/leaves.js';
import meetingRoutes from './routes/meetings.js';
import dashboardRoutes from './routes/dashboard.js';
import uploadRoutes from './routes/upload.js';
import studentRoutes from './routes/students.js';
import courseRoutes from './routes/courses.js';
import examRoutes from './routes/exams.js';
import resultRoutes from './routes/results.js';
import adminRoutes from './routes/admin.js';
import inquiryRoutes from './routes/inquiry.js';
import employeePortalRoutes from './routes/employeePortal.js';

import nextgenSystemRoutes from './routes/nextgen/index.js';
import nextgenAdminRoutes from './routes/nextgen/admin/index.js';
import leaderboard from './routes/nextgen/leaderboard.js';
import lectureRoutes from './routes/nextgen/lecture.js';
import profileDataRoute from './routes/nextgen/profileDataRoute.js';
import nextgenStudentRoutes from './routes/nextgenStudentRoutes.js';
import codingPracticeRoutes from './routes/nextgenCodingPractice.js';

app.use('/api/auth', unifiedAuthLogin);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/attendance', studentattendanceRoutes);
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
app.use('/api/nextgen', nextgenSystemRoutes);
app.use('/api/nextgen', nextgenStudentRoutes);
app.use('/api/nextgen', codingPracticeRoutes);

/* -------------------- HEALTH -------------------- */
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    env: process.env.NODE_ENV,
    time: new Date().toISOString(),
  });
});

/* -------------------- ROOT -------------------- */
app.get('/', (req, res) => {
  res.json({
    message: 'Lifebox NextGen API 🚀',
    health: '/health',
  });
});

/* -------------------- ERRORS -------------------- */
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

app.use(notFound);
app.use(errorHandler);

/* -------------------- EXPORT (IMPORTANT) -------------------- */
export default app;
