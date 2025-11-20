import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import models
import NG_ApprovedStudents from '../models/nextgen/core/NG_ApprovedStudents.js';
import NG_AssignmentWithQuestions from '../models/nextgen/education/NGAssignmentWithQuestions.js';
import NGSubmissionAssignment from '../models/nextgen/education/NGSubmissionAssignment.js';

dotenv.config();

const seedNGSubmissions = async () => {
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

    // Find existing assignments
    const assignments = await NG_AssignmentWithQuestions.find({ status: 'published' }).limit(2);
    if (assignments.length === 0) {
      console.log('No published assignments found');
      return;
    }

    console.log('Assignments ready:', assignments.length);

    // Create sample submissions
    const submissions = [];
    for (let i = 0; i < userIds.length; i++) {
      const userId = userIds[i];
      const assignment = assignments[i % assignments.length]; // Cycle through assignments

      submissions.push({
        student_id: userId,
        assignment_id: assignment._id,
        submission_data: {
          q1: 'Sample answer for question 1',
          q2: 'Sample answer for question 2'
        },
        status: i % 2 === 0 ? 'submitted' : 'graded',
        grade: i % 2 === 1 ? Math.floor(Math.random() * 40) + 60 : null, // Random grade 60-100 if graded
        feedback: i % 2 === 1 ? 'Good work!' : ''
      });
    }

    await NGSubmissionAssignment.insertMany(submissions);
    console.log(`Sample submissions added to ng_submission_assignments: ${submissions.length}`);

  } catch (error) {
    console.error('Error seeding submissions:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seed function
seedNGSubmissions();
