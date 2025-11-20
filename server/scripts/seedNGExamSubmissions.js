import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Set the MongoDB URI for the test database before importing models
process.env.MONGODB_URI = 'mongodb+srv://bhanuprakashsyagamreddy:oxfordV2Cluster@cluster0.f1p7jgs.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';

// Import models after setting env
import NG_ApprovedStudents from '../models/nextgen/core/NG_ApprovedStudents.js';
import NG_Registration from '../models/nextgen/core/Registration.js';
import NGExamWithQuestions from '../models/nextgen/education/NGExamWithQuestions.js';
import NGSubmissionExams from '../models/nextgen/education/NGSubmissionExams.js';

const seedNGExamSubmissions = async () => {
  try {
    // Connect to database - using the provided MongoDB Atlas URI for test database
    const mongoUri = 'mongodb+srv://bhanuprakashsyagamreddy:oxfordV2Cluster@cluster0.f1p7jgs.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find approved students with specific student_ids
    const approvedStudents = await NG_ApprovedStudents.find({
      student_id: { $in: ['STU0016', 'STU0025', 'STU0017'] }
    });

    if (approvedStudents.length === 0) {
      console.log('No approved students found with the specified student_ids');
      return;
    }

    // Get user_ids from approved students (assuming user_id is the NG_User ID)
    const userIds = approvedStudents.map(student => student.user_id);

    if (userIds.length === 0) {
      console.log('No corresponding users found');
      return;
    }

    console.log('Users ready:', userIds.length);

    // Find existing exams
    const exams = await NGExamWithQuestions.find({ status: 'published' }).limit(2);
    if (exams.length === 0) {
      console.log('No published exams found');
      return;
    }

    console.log('Exams ready:', exams.length);

    // Create sample submissions
    const submissions = [];
    for (let i = 0; i < userIds.length; i++) {
      const userId = userIds[i];
      const exam = exams[i % exams.length]; // Cycle through exams

      submissions.push({
        student_id: userId,
        exam_id: exam._id,
        submission_data: {
          q1: 'Sample answer for question 1',
          q2: 'Sample answer for question 2'
        },
        status: i % 2 === 0 ? 'submitted' : 'graded',
        grade: i % 2 === 1 ? Math.floor(Math.random() * 40) + 60 : null, // Random grade 60-100 if graded
        feedback: i % 2 === 1 ? 'Good work!' : ''
      });
    }

    await NGSubmissionExams.insertMany(submissions);
    console.log(`Sample submissions added to ng_submission_exams: ${submissions.length}`);

    // Query and log existing submissions to verify
    const submissionsInDB = await NGSubmissionExams.find({});
    console.log(`Total submissions in ng_submission_exams collection: ${submissionsInDB.length}`);
    if (submissionsInDB.length > 0) {
      console.log('Sample submission data:');
      submissionsInDB.forEach((sub, index) => {
        console.log(`${index + 1}. Student ID: ${sub.student_id}, Exam ID: ${sub.exam_id}, Status: ${sub.status}, Grade: ${sub.grade}`);
      });
    }

  } catch (error) {
    console.error('Error seeding submissions:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seed function
seedNGExamSubmissions();
