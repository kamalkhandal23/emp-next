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
import nextgenSystemRoutes from './routes/nextgen/index.js'

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
    const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb+srv://bhanuprakashsyagamreddy:oxfordV2Cluster@cluster0.f1p7jgs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    console.log(`MongoDB Connected: ${conn.connection.host}`)

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err)
    })

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected')
    })
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
app.use('/api/nextgen', nextgenSystemRoutes)
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
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...')
  await mongoose.connection.close()
  console.log('MongoDB connection closed.')
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...')
  await mongoose.connection.close()
  console.log('MongoDB connection closed.')
  process.exit(0)
})

// Start server and attach error handler to avoid unhandled 'error' events
const server = app.listen(PORT, () => {
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

// Listen for server errors (EADDRINUSE etc) and fail gracefully with helpful logs
server.on('error', (err) => {
  if (err && err.code) {
    switch (err.code) {
      case 'EACCES':
        console.error(`Port ${PORT} requires elevated privileges.`)
        process.exit(1)
        break
      case 'EADDRINUSE':
        console.error(`Port ${PORT} is already in use.`)
        console.error('Possible fixes: stop the process using that port, or set PORT in your .env to a different number.')
        process.exit(1)
        break
      default:
        console.error('Server error:', err)
        process.exit(1)
    }
  } else {
    console.error('Server error:', err)
    process.exit(1)
  }
})

export default app