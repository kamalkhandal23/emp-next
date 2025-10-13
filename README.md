# LifeBox NextGen - Employee Management & Education Platform

A comprehensive full-stack application combining employee management system with an integrated education platform.

## 🚀 Features

### Employee Management System
- **Employee Portal**: Complete employee dashboard with attendance, leave management, and performance tracking
- **HR Management**: Employee profiles, benefits management, performance reviews
- **Project Management**: Project tracking, team assignments, and progress monitoring
- **Attendance System**: Real-time attendance tracking with location-based check-in/out
- **Leave Management**: Leave requests, approvals, and balance tracking
- **Meeting Management**: Schedule and manage meetings with attendees

### Education Platform (NextGen)
- **Student Management**: Student enrollment, profiles, and academic tracking
- **Course Management**: Course creation, content management, and progress tracking
- **Examination System**: Online exams, question banks, and result management
- **Certificate Management**: Digital certificate generation and verification
- **Support System**: Ticketing system for student queries and HR document requests

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Cloudinary** for file uploads
- **Node-cron** for scheduled tasks
- **Nodemailer** for email notifications

### Frontend
- **React 18** with Vite
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Context API** for state management

## 📁 Project Structure

```
lifebox-nextgen/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context providers
│   │   ├── layouts/       # Layout components
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
├── server/                # Node.js backend
│   ├── controllers/       # Route controllers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── services/         # Business logic services
│   ├── utils/            # Utility functions
│   └── jobs/             # Cron jobs
└── README.md
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lifebox-nextgen
   ```

2. **Setup Backend**
   ```bash
   cd server
   npm install
   ```

3. **Setup Frontend**
   ```bash
   cd client
   npm install
   ```

### Environment Configuration

1. **Server Environment** (`server/.env`)
   ```env
   # Server Configuration
   PORT=5002
   NODE_ENV=development

   # Database
   MONGODB_URI=your_mongodb_connection_string

   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=7d

   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password

   # Client URL (for CORS)
   CLIENT_URL=http://localhost:3000

   # Admin Configuration
   ADMIN_EMAIL=admin@lifeboxnextgen.com
   ADMIN_PASSWORD=admin123

   # Company Configuration
   COMPANY_NAME=Lifebox NextGen Pvt. Ltd.
   COMPANY_EMAIL=info@lifeboxnextgen.com
   COMPANY_PHONE=+91-XXXXXXXXXX
   COMPANY_ADDRESS=Your Company Address
   ```

2. **Client Environment** (`client/.env`)
   ```env
   # API Configuration
   VITE_API_URL=http://localhost:5002/api
   VITE_API_TIMEOUT=30000

   # Application Configuration
   VITE_APP_NAME=LifeBox NextGen
   VITE_APP_VERSION=1.0.0

   # Company Information
   VITE_COMPANY_NAME=LifeBox NextGen Pvt. Ltd.
   VITE_COMPANY_EMAIL=info@lifeboxnextgen.com
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd server
   npm start
   # or for development with auto-reload
   npm run dev
   ```

2. **Start the Frontend Development Server**
   ```bash
   cd client
   npm run dev
   ```

3. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5002/api
   - Health Check: http://localhost:5002/health

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Employee Management
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create new employee
- `GET /api/employees/:id` - Get employee by ID
- `PUT /api/employees/:id` - Update employee

### Attendance
- `POST /api/attendance/checkin` - Check in
- `POST /api/attendance/checkout` - Check out
- `GET /api/attendance/summary` - Get attendance summary

### Education Platform
- `GET /api/nextgen/courses` - Get courses
- `POST /api/nextgen/enroll` - Enroll in course
- `GET /api/nextgen/dashboard` - Student dashboard

## 🧪 Testing

```bash
# Run backend tests
cd server
npm test

# Run frontend tests
cd client
npm test
```

## 📝 Database Seeding

To populate the database with initial data:

```bash
cd server
npm run seed
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Input validation
- Helmet.js security headers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 👥 Team

- **Development Team**: LifeBox NextGen Pvt. Ltd.
- **Contact**: info@lifeboxnextgen.com

## 🆘 Support

For support, email info@lifeboxnextgen.com or create an issue in the repository.

---

