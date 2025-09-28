import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

// Import routes
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import employeeRoutes from './routes/employees.js'
import attendanceRoutes from './routes/attendance.js'
import taskRoutes from './routes/tasks.js'
import projectRoutes from './routes/projects.js'
import teamRoutes from './routes/teams.js'
import leaveRoutes from './routes/leaves.js'
import meetingRoutes from './routes/meetings.js'
import dashboardRoutes from './routes/dashboard.js'
import nextgenRoutes from './routes/nextgen.js'
import uploadRoutes from './routes/upload.js'
import studentRoutes from './routes/students.js'
import courseRoutes from './routes/courses.js'
import examRoutes from './routes/exams.js'
import resultRoutes from './routes/results.js'
import adminRoutes from './routes/admin.js'
import employeePortalRoutes from './routes/employeePortal.js'

// Import middleware
import { errorHandler } from './middleware/errorHandler.js'
import { notFound } from './middleware/notFound.js'

// Import jobs
import { startAttendanceJobs } from './jobs/attendanceJobs.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
})
app.use('/api/', limiter)

// CORS configuration
const corsOptions = {
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:3000',
    'https://lifeboxnextgen.com',
    'https://www.lifeboxnextgen.com'
  ],
  credentials: true,
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Compression middleware
app.use(compression())

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined'))
}

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error('Database connection error:', error)
    process.exit(1)
  }
}

// Connect to database
connectDB()

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/employees', employeeRoutes)
app.use('/api/attendance', attendanceRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/teams', teamRoutes)
app.use('/api/leaves', leaveRoutes)
app.use('/api/meetings', meetingRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/nextgen', nextgenRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/students', studentRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/exams', examRoutes)
app.use('/api/results', resultRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/employee-portal', employeePortalRoutes)

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Lifebox NextGen API',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/health'
  })
})

// Error handling middleware
app.use(notFound)
app.use(errorHandler)

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...')
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed.')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...')
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed.')
    process.exit(0)
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}
📊 Health check: http://localhost:${PORT}/health
📚 API Base URL: http://localhost:${PORT}/api
🌐 Client URL: ${process.env.CLIENT_URL}
📧 Email: ${process.env.EMAIL_USER ? 'Configured' : 'Not configured'}
  `)
  
  // Start attendance jobs in production
  if (process.env.NODE_ENV === 'production') {
    startAttendanceJobs()
  }
})

export default app