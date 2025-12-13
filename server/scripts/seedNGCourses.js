import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import the NG_Course model
import Course from '../models/education/NG_Courses.js';

dotenv.config();

const seedNGCourses = async () => {
  try {
    // Connect to database using the main MongoDB URI
    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing NG_Courses if needed (optional, comment out if you want to keep existing)
    await Course.deleteMany({});
    console.log('Cleared existing NG_Courses');

    // Sample test courses
    const testCourses = [
      {
        slug: 'introduction-to-web-development',
        title: 'Introduction to Web Development',
        subtitle: 'Learn the basics of HTML, CSS, and JavaScript',
        duration: '3 months',
        description: 'This course covers the fundamentals of web development, including HTML for structure, CSS for styling, and JavaScript for interactivity. Perfect for beginners looking to start their journey in web development.',
        prerequisites: 'Basic computer skills',
        icon: '🌐',
        visibility: 'published',
        banner_url: 'https://example.com/banner1.jpg',
        courseCode: 'WEB101',
        // created_by: null for now, or set to an existing user ID if available
      },
      {
        slug: 'advanced-javascript-concepts',
        title: 'Advanced JavaScript Concepts',
        subtitle: 'Deep dive into ES6+, asynchronous programming, and more',
        duration: '4 months',
        description: 'Explore advanced JavaScript features including ES6+ syntax, promises, async/await, closures, prototypes, and modern frameworks. Ideal for developers wanting to level up their JS skills.',
        prerequisites: 'Basic JavaScript knowledge',
        icon: '⚡',
        visibility: 'published',
        banner_url: 'https://example.com/banner2.jpg',
        courseCode: 'JS201',
      },
      {
        slug: 'react-fundamentals',
        title: 'React Fundamentals',
        subtitle: 'Build dynamic user interfaces with React',
        duration: '2 months',
        description: 'Learn to create interactive web applications using React. Covers components, state management, props, lifecycle methods, and hooks.',
        prerequisites: 'HTML, CSS, JavaScript basics',
        icon: '⚛️',
        visibility: 'published',
        banner_url: 'https://example.com/banner3.jpg',
        courseCode: 'REACT101',
      },
      {
        slug: 'node-js-backend-development',
        title: 'Node.js Backend Development',
        subtitle: 'Create server-side applications with Node.js',
        duration: '3 months',
        description: 'Master backend development with Node.js, Express, MongoDB, and RESTful APIs. Learn to build scalable server-side applications.',
        prerequisites: 'JavaScript fundamentals',
        icon: '🟢',
        visibility: 'published',
        banner_url: 'https://example.com/banner4.jpg',
        courseCode: 'NODE201',
      },
      {
        slug: 'data-structures-and-algorithms',
        title: 'Data Structures and Algorithms',
        subtitle: 'Essential concepts for efficient programming',
        duration: '5 months',
        description: 'Comprehensive coverage of data structures (arrays, linked lists, trees, graphs) and algorithms (sorting, searching, dynamic programming). Crucial for technical interviews and efficient coding.',
        prerequisites: 'Programming basics in any language',
        icon: '📊',
        visibility: 'published',
        banner_url: 'https://example.com/banner5.jpg',
        courseCode: 'DSA301',
      }
    ];

    // Insert the courses
    const insertedCourses = await Course.insertMany(testCourses);
    console.log(`✅ Successfully inserted ${insertedCourses.length} test courses into ng_courses collection`);

    // Log the inserted courses
    insertedCourses.forEach(course => {
      console.log(`- ${course.title} (slug: ${course.slug})`);
    });

  } catch (error) {
    console.error('Error seeding NG_Courses:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seed function
seedNGCourses();

