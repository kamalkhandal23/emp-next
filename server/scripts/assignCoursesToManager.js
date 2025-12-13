import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/core/User.js';
import { NGCourse } from '../models/nextgen/index.js';

dotenv.config();

async function assignCourses() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI ||
        'mongodb+srv://kaushikgohain:VHqHx2TQZVqKpG0d@cluster0.f1p7jgs.mongodb.net/lifebox-nextgen?retryWrites=true&w=majority'
    );

    console.log('✅ Connected to MongoDB\n');

    // Find the course manager
    const manager = await User.findOne({
      role: 'course_manager',
      email: 'manager@example.com',
    });

    if (!manager) {
      console.error('❌ Course manager not found!');
      process.exit(1);
    }

    console.log('👤 Found manager:', manager.email, '(ID:', manager._id + ')');
    console.log('📋 Current assignedCourses:', manager.assignedCourses, '\n');

    // Get all courses
    const courses = await NGCourse.find({}).select('_id title slug');

    console.log('📚 Available Courses:');
    courses.forEach((c) => console.log(`  - ${c.title} (ID: ${c._id})`));
    console.log('');

    // Assign ALL courses to the manager
    const courseIds = courses.map((c) => c._id);

    manager.assignedCourses = courseIds;
    await manager.save();

    console.log(
      '✅ Successfully assigned',
      courseIds.length,
      'courses to manager!'
    );
    console.log('📋 Updated assignedCourses:', manager.assignedCourses);

    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

assignCourses();
