import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Import models
import User from '../models/User.js';
import Team from '../models/Team.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import Meeting from '../models/Meeting.js';
import Employee from '../models/employeeModel.js';
import Student from '../models/studentModel.js';
import Course from '../models/courseModel.js';
import Exam from '../models/examModel.js';
import Result from '../models/resultModel.js';
import EmployeeProfile from '../models/EmployeeProfile.js';
import EmployeeBenefits from '../models/EmployeeBenefits.js';
import EmployeeTimesheet from '../models/EmployeeTimesheet.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Team.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await Attendance.deleteMany({});
    await Leave.deleteMany({});
    await Meeting.deleteMany({});
    await Employee.deleteMany({});
    await Student.deleteMany({});
    await Course.deleteMany({});
    await Exam.deleteMany({});
    await Result.deleteMany({});
    await EmployeeProfile.deleteMany({});
    await EmployeeBenefits.deleteMany({});
    await EmployeeTimesheet.deleteMany({});

    console.log('Cleared existing data');

    // Create users one by one to avoid employeeId conflicts
    const admin = new User({
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@lifeboxnextgen.com',
      password: 'admin123456', // Let the pre-save middleware handle hashing
      role: 'admin',
      department: 'Management',
      position: 'System Administrator',
      status: 'active'
    });
    await admin.save();

    const hr = new User({
      firstName: 'HR',
      lastName: 'Manager',
      email: 'hr@lifeboxnextgen.com',
      password: 'hr123456', // Let the pre-save middleware handle hashing
      role: 'hr',
      department: 'HR',
      position: 'HR Manager',
      status: 'active'
    });
    await hr.save();

    const teamLead = new User({
      firstName: 'Team',
      lastName: 'Lead',
      email: 'teamlead@lifeboxnextgen.com',
      password: 'lead123456', // Let the pre-save middleware handle hashing
      role: 'team_lead',
      department: 'Engineering',
      position: 'Team Lead',
      status: 'active'
    });
    await teamLead.save();

    const manager = new User({
      firstName: 'Project',
      lastName: 'Manager',
      email: 'manager@lifeboxnextgen.com',
      password: 'manager123456', // Let the pre-save middleware handle hashing
      role: 'manager',
      department: 'Engineering',
      position: 'Project Manager',
      status: 'active'
    });
    await manager.save();

    // Create employees
    const employee1 = new User({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@lifeboxnextgen.com',
      password: 'employee123456', // Let the pre-save middleware handle hashing
      role: 'employee',
      department: 'Engineering',
      position: 'Senior Developer',
      status: 'active'
    });
    await employee1.save();

    const employee2 = new User({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@lifeboxnextgen.com',
      password: 'employee123456', // Let the pre-save middleware handle hashing
      role: 'employee',
      department: 'Engineering',
      position: 'Frontend Developer',
      status: 'active'
    });
    await employee2.save();

    const employee3 = new User({
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.johnson@lifeboxnextgen.com',
      password: 'employee123456', // Let the pre-save middleware handle hashing
      role: 'employee',
      department: 'Marketing',
      position: 'Marketing Specialist',
      status: 'active'
    });
    await employee3.save();

    const employees = [employee1, employee2, employee3];

    // Create student users
    const student1 = new User({
      firstName: 'Alice',
      lastName: 'Wilson',
      email: 'alice.wilson@student.com',
      password: 'student123456', // Let the pre-save middleware handle hashing
      role: 'student',
      department: 'Education',
      position: 'Student',
      status: 'active'
    });
    await student1.save();

    const student2 = new User({
      firstName: 'Bob',
      lastName: 'Brown',
      email: 'bob.brown@student.com',
      password: 'student123456', // Let the pre-save middleware handle hashing
      role: 'student',
      department: 'Education',
      position: 'Student',
      status: 'active'
    });
    await student2.save();

    const studentUsers = [student1, student2];

    console.log('Created users');

    // Create employee records
    const employeeRecords = await Employee.create([
      {
        employeeId: 'EMP000001',
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@lifeboxnextgen.com',
          phone: '+1234567890',
          dateOfBirth: new Date('1990-05-15'),
          gender: 'male'
        },
        employment: {
          hireDate: new Date('2023-01-15'),
          department: 'Engineering',
          position: 'Senior Developer',
          level: 'senior',
          status: 'active'
        },
        systemAccess: {
          userId: employees[0]._id
        }
      },
      {
        employeeId: 'EMP000002',
        personalInfo: {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@lifeboxnextgen.com',
          phone: '+1234567891',
          dateOfBirth: new Date('1988-08-22'),
          gender: 'female'
        },
        employment: {
          hireDate: new Date('2022-06-01'),
          department: 'Engineering',
          position: 'Frontend Developer',
          level: 'mid',
          status: 'active'
        },
        systemAccess: {
          userId: employees[1]._id
        }
      }
    ]);

    // Create student records
    const studentRecords = await Student.create([
      {
        studentId: 'STU000001',
        firstName: 'Alice',
        lastName: 'Wilson',
        email: 'alice.wilson@student.com',
        phone: '+1234567892',
        dateOfBirth: new Date('2000-03-10'),
        status: 'active'
      },
      {
        studentId: 'STU000002',
        firstName: 'Bob',
        lastName: 'Brown',
        email: 'bob.brown@student.com',
        phone: '+1234567893',
        dateOfBirth: new Date('1999-11-25'),
        status: 'active'
      }
    ]);

    console.log('Created employee and student records');

    // Create courses
    const courses = await Course.create([
      {
        courseCode: 'CS101',
        title: 'Introduction to Computer Science',
        description: 'Fundamental concepts of computer science and programming',
        category: 'Technology',
        level: 'Beginner',
        duration: { weeks: 12, hoursPerWeek: 4 },
        credits: 3,
        instructor: {
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@lifeboxnextgen.com',
          bio: 'PhD in Computer Science with 10 years of teaching experience'
        },
        enrollment: { capacity: 30, enrolled: 2 },
        schedule: {
          startDate: new Date('2024-03-01'),
          endDate: new Date('2024-05-24')
        },
        pricing: { amount: 299 },
        status: 'published'
      },
      {
        courseCode: 'WEB201',
        title: 'Web Development Fundamentals',
        description: 'Learn HTML, CSS, and JavaScript to build modern websites',
        category: 'Technology',
        level: 'Intermediate',
        duration: { weeks: 16, hoursPerWeek: 6 },
        credits: 4,
        instructor: {
          name: 'Prof. Michael Chen',
          email: 'michael.chen@lifeboxnextgen.com',
          bio: 'Full-stack developer and educator with industry experience'
        },
        enrollment: { capacity: 25, enrolled: 1 },
        schedule: {
          startDate: new Date('2024-04-01'),
          endDate: new Date('2024-07-26')
        },
        pricing: { amount: 499 },
        status: 'published'
      }
    ]);

    // Enroll students in courses
    studentRecords[0].enrolledCourses.push({
      course: courses[0]._id,
      enrollmentDate: new Date(),
      status: 'active',
      progress: 25
    });

    studentRecords[0].enrolledCourses.push({
      course: courses[1]._id,
      enrollmentDate: new Date(),
      status: 'active',
      progress: 15
    });

    studentRecords[1].enrolledCourses.push({
      course: courses[0]._id,
      enrollmentDate: new Date(),
      status: 'active',
      progress: 40
    });

    await studentRecords[0].save();
    await studentRecords[1].save();

    console.log('Created courses and enrollments');

    // Create exams
    const exams = await Exam.create([
      {
        examId: 'EXM000001',
        title: 'CS101 Midterm Exam',
        description: 'Midterm examination for Introduction to Computer Science',
        course: courses[0]._id,
        type: 'midterm',
        questions: [
          {
            questionId: 'Q001',
            type: 'multiple-choice',
            question: 'What is the primary function of a CPU?',
            options: [
              { text: 'Store data permanently', isCorrect: false },
              { text: 'Execute instructions', isCorrect: true },
              { text: 'Display graphics', isCorrect: false },
              { text: 'Connect to internet', isCorrect: false }
            ],
            points: 5,
            difficulty: 'easy'
          },
          {
            questionId: 'Q002',
            type: 'short-answer',
            question: 'Define what an algorithm is.',
            correctAnswer: 'A step-by-step procedure for solving a problem',
            points: 10,
            difficulty: 'medium'
          }
        ],
        settings: {
          duration: 60,
          totalPoints: 15,
          passingScore: 60,
          attemptsAllowed: 2,
          showResultsImmediately: true
        },
        schedule: {
          startDate: new Date('2024-04-15T09:00:00Z'),
          endDate: new Date('2024-04-15T18:00:00Z')
        },
        status: 'published',
        createdBy: admin._id
      }
    ]);

    console.log('Created exams');

    // Create teams
    const teams = await Team.create([
      {
        name: 'Development Team',
        description: 'Software development and engineering',
        teamLead: teamLead._id,
        manager: manager._id,
        members: [
          { user: teamLead._id, role: 'lead', status: 'active' },
          { user: employees[0]._id, role: 'senior', status: 'active' },
          { user: employees[1]._id, role: 'junior', status: 'active' }
        ],
        department: 'Engineering',
        status: 'active'
      },
      {
        name: 'Marketing Team',
        description: 'Marketing and business development',
        teamLead: manager._id,
        members: [
          { user: manager._id, role: 'lead', status: 'active' },
          { user: employees[2]._id, role: 'junior', status: 'active' }
        ],
        department: 'Marketing',
        status: 'active'
      }
    ]);

    console.log('Created teams');

    // Create projects one by one
    const project1 = new Project({
      name: 'Employee Portal System',
      description: 'Complete employee management portal with role-based access',
      client: {
        name: 'Lifebox NextGen Pvt. Ltd.',
        email: 'client@lifeboxnextgen.com',
        company: 'Lifebox NextGen Pvt. Ltd.'
      },
      manager: manager._id,
      team: teams[0]._id,
      assignedMembers: [
        { user: teamLead._id, role: 'lead' },
        { user: employees[0]._id, role: 'developer' },
        { user: employees[1]._id, role: 'developer' }
      ],
      status: 'active',
      priority: 'high',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-06-30'),
      budget: {
        estimated: 50000,
        actual: 37500,
        currency: 'INR'
      },
      progress: 75
    });
    await project1.save();

    const project2 = new Project({
      name: 'NextGen Education Platform',
      description: 'Online education platform with courses and exams',
      client: {
        name: 'Education Solutions Inc.',
        email: 'contact@edusolutions.com',
        company: 'Education Solutions Inc.'
      },
      manager: manager._id,
      team: teams[0]._id,
      assignedMembers: [
        { user: manager._id, role: 'lead' },
        { user: employees[0]._id, role: 'developer' }
      ],
      status: 'active',
      priority: 'medium',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-08-31'),
      budget: {
        estimated: 75000,
        actual: 33750,
        currency: 'INR'
      },
      progress: 45
    });
    await project2.save();

    const projects = [project1, project2];

    console.log('Created projects');

    // Create employee profiles
    const employeeProfiles = await EmployeeProfile.create([
      {
        employee: employees[0]._id,
        personalDetails: {
          dateOfBirth: new Date('1990-05-15'),
          gender: 'male',
          maritalStatus: 'married',
          nationality: 'Indian',
          bloodGroup: 'O+',
          languages: ['English', 'Hindi', 'Telugu']
        },
        contactInfo: {
          personalEmail: 'john.personal@gmail.com',
          alternatePhone: '+91-9876543210',
          emergencyContact: {
            name: 'Jane Doe',
            relationship: 'Spouse',
            phone: '+91-9876543211',
            email: 'jane.doe@gmail.com'
          }
        },
        skills: [
          { name: 'JavaScript', level: 'expert', yearsOfExperience: 5 },
          { name: 'React', level: 'advanced', yearsOfExperience: 4 },
          { name: 'Node.js', level: 'advanced', yearsOfExperience: 4 },
          { name: 'MongoDB', level: 'intermediate', yearsOfExperience: 3 }
        ],
        education: [{
          degree: 'Bachelor of Technology',
          institution: 'Indian Institute of Technology',
          fieldOfStudy: 'Computer Science',
          startYear: 2008,
          endYear: 2012,
          grade: '8.5 CGPA'
        }],
        experience: [{
          company: 'Tech Solutions Pvt Ltd',
          position: 'Software Developer',
          startDate: new Date('2012-07-01'),
          endDate: new Date('2015-06-30'),
          description: 'Developed web applications using MEAN stack',
          skills: ['JavaScript', 'Angular', 'Node.js', 'MongoDB']
        }]
      },
      {
        employee: employees[1]._id,
        personalDetails: {
          dateOfBirth: new Date('1992-08-22'),
          gender: 'female',
          maritalStatus: 'single',
          nationality: 'Indian',
          bloodGroup: 'A+',
          languages: ['English', 'Hindi', 'Tamil']
        },
        skills: [
          { name: 'React', level: 'expert', yearsOfExperience: 4 },
          { name: 'CSS', level: 'advanced', yearsOfExperience: 5 },
          { name: 'JavaScript', level: 'advanced', yearsOfExperience: 4 },
          { name: 'UI/UX Design', level: 'intermediate', yearsOfExperience: 3 }
        ],
        education: [{
          degree: 'Bachelor of Computer Applications',
          institution: 'Anna University',
          fieldOfStudy: 'Computer Applications',
          startYear: 2010,
          endYear: 2013,
          grade: '8.2 CGPA'
        }]
      }
    ]);

    // Create employee benefits
    const employeeBenefits = await EmployeeBenefits.create([
      {
        employee: employees[0]._id,
        healthInsurance: {
          enrolled: true,
          plan: 'premium',
          provider: 'Star Health Insurance',
          policyNumber: 'SH123456789',
          coverage: {
            employee: 500000,
            spouse: 500000,
            children: 300000
          },
          premium: {
            monthly: 2500,
            employeeContribution: 1000,
            companyContribution: 1500
          },
          status: 'active'
        },
        providentFund: {
          enrolled: true,
          pfNumber: 'PF123456789',
          uanNumber: 'UAN123456789012',
          contributionRate: {
            employee: 12,
            employer: 12
          },
          monthlyContribution: {
            employee: 8400,
            employer: 8400,
            total: 16800
          },
          currentBalance: 250000,
          status: 'active'
        },
        flexiBenefits: {
          totalAllocation: 50000,
          used: 15000,
          remaining: 35000,
          categories: {
            food: { allocated: 15000, used: 8000, remaining: 7000 },
            transport: { allocated: 20000, used: 5000, remaining: 15000 },
            communication: { allocated: 5000, used: 2000, remaining: 3000 },
            learning: { allocated: 10000, used: 0, remaining: 10000 }
          }
        }
      },
      {
        employee: employees[1]._id,
        healthInsurance: {
          enrolled: true,
          plan: 'standard',
          provider: 'HDFC ERGO',
          policyNumber: 'HE987654321',
          coverage: {
            employee: 300000
          },
          premium: {
            monthly: 1500,
            employeeContribution: 600,
            companyContribution: 900
          },
          status: 'active'
        },
        providentFund: {
          enrolled: true,
          pfNumber: 'PF987654321',
          uanNumber: 'UAN987654321098',
          contributionRate: {
            employee: 12,
            employer: 12
          },
          monthlyContribution: {
            employee: 6000,
            employer: 6000,
            total: 12000
          },
          currentBalance: 180000,
          status: 'active'
        }
      }
    ]);

    // Create sample timesheets for current month
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const timesheets = [];
    
    // Create timesheets for the last 10 working days
    for (let i = 10; i >= 1; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      // Create timesheet for first employee
      timesheets.push({
        employee: employees[0]._id,
        date: new Date(date),
        workType: 'office',
        shifts: [{
          checkIn: {
            time: new Date(date.getTime() + 9 * 60 * 60 * 1000), // 9 AM
            location: { type: 'office' },
            method: 'biometric'
          },
          checkOut: {
            time: new Date(date.getTime() + 18 * 60 * 60 * 1000), // 6 PM
            location: { type: 'office' },
            method: 'biometric'
          },
          breaks: [{
            startTime: new Date(date.getTime() + 13 * 60 * 60 * 1000), // 1 PM
            endTime: new Date(date.getTime() + 14 * 60 * 60 * 1000), // 2 PM
            type: 'lunch',
            duration: 60
          }],
          hoursWorked: 8,
          status: 'present'
        }],
        projects: [{
          project: projects[0]._id,
          tasks: [{
            description: 'Frontend development',
            timeSpent: 300, // 5 hours in minutes
            status: 'in-progress'
          }],
          totalTimeSpent: 300
        }],
        totalHours: {
          regular: 8,
          overtime: 0,
          break: 1
        },
        productivity: {
          tasksCompleted: 2,
          tasksInProgress: 1,
          productivityScore: 85
        },
        status: 'approved'
      });
    }
    
    await EmployeeTimesheet.create(timesheets);

    console.log('Created employee portal data');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Admin: admin@lifeboxnextgen.com / admin123456');
    console.log('HR: hr@lifeboxnextgen.com / hr123456');
    console.log('Team Lead: teamlead@lifeboxnextgen.com / lead123456');
    console.log('Manager: manager@lifeboxnextgen.com / manager123456');
    console.log('Employee: john.doe@lifeboxnextgen.com / employee123456');
    console.log('Employee: jane.smith@lifeboxnextgen.com / employee123456');
    console.log('Employee: mike.johnson@lifeboxnextgen.com / employee123456');
    console.log('Student: alice.wilson@student.com / student123456');
    console.log('Student: bob.brown@student.com / student123456');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seed function
seedDatabase();