import mongoose from 'mongoose';
import dotenv from 'dotenv';
import NGAssignmentWithQuestions from '../models/nextgen/education/NGAssignmentWithQuestions.js';

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb+srv://bhanuprakashsyagamreddy:oxfordV2Cluster@cluster0.f1p7jgs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Mock assignment data
const mockAssignments = [
  {
    assignmentName: 'JavaScript Fundamentals - Week 1',
    courseName: 'Full Stack Development',
    order: 1,
    totalQuestions: 5,
    questions: {
      q1: {
        type: 'MCQ',
        question:
          'What is the correct syntax for referring to an external script called "app.js"?',
        options: [
          '<script src="app.js">',
          '<script name="app.js">',
          '<script href="app.js">',
          '<script file="app.js">',
        ],
        answer: '<script src="app.js">',
        testCase: '',
      },
      q2: {
        type: 'Answer-based',
        question:
          'Explain the difference between var, let, and const in JavaScript.',
        options: [],
        answer:
          'var is function-scoped, let and const are block-scoped. const cannot be reassigned.',
        testCase: '',
      },
      q3: {
        type: 'Coding',
        question: 'Write a function that returns the sum of two numbers.',
        options: [],
        answer: 'function sum(a, b) { return a + b; }',
        testCase: 'sum(2, 3) should return 5; sum(10, 20) should return 30',
      },
      q4: {
        type: 'MCQ',
        question: 'Which company developed JavaScript?',
        options: ['Microsoft', 'Netscape', 'Google', 'Mozilla'],
        answer: 'Netscape',
        testCase: '',
      },
      q5: {
        type: 'Answer-based',
        question: 'What are the primitive data types in JavaScript?',
        options: [],
        answer: 'Number, String, Boolean, Undefined, Null, Symbol, BigInt',
        testCase: '',
      },
    },
    status: 'published',
  },
  {
    assignmentName: 'React Components - Week 2',
    courseName: 'Full Stack Development',
    order: 2,
    totalQuestions: 4,
    questions: {
      q1: {
        type: 'MCQ',
        question: 'What is JSX in React?',
        options: [
          'JavaScript XML',
          'Java Syntax Extension',
          'JSON XML',
          'JavaScript Extension',
        ],
        answer: 'JavaScript XML',
        testCase: '',
      },
      q2: {
        type: 'Coding',
        question: 'Create a functional component that displays "Hello World".',
        options: [],
        answer: 'function HelloWorld() { return <h1>Hello World</h1>; }',
        testCase: 'Component should render <h1> tag with text "Hello World"',
      },
      q3: {
        type: 'Answer-based',
        question: 'What is the difference between state and props in React?',
        options: [],
        answer:
          'State is internal and mutable, props are external and immutable.',
        testCase: '',
      },
      q4: {
        type: 'MCQ',
        question: 'Which hook is used for side effects in React?',
        options: ['useState', 'useEffect', 'useContext', 'useReducer'],
        answer: 'useEffect',
        testCase: '',
      },
    },
    status: 'published',
  },
  {
    assignmentName: 'Python Basics - Assignment 1',
    courseName: 'Data Science with Python',
    order: 1,
    totalQuestions: 6,
    questions: {
      q1: {
        type: 'MCQ',
        question: 'What is the output of print(2 ** 3)?',
        options: ['6', '8', '9', '5'],
        answer: '8',
        testCase: '',
      },
      q2: {
        type: 'Coding',
        question: 'Write a function to check if a number is even or odd.',
        options: [],
        answer: 'def is_even(n): return n % 2 == 0',
        testCase:
          'is_even(4) should return True; is_even(7) should return False',
      },
      q3: {
        type: 'Answer-based',
        question: 'What is a list comprehension in Python? Give an example.',
        options: [],
        answer:
          'List comprehension is a concise way to create lists. Example: [x**2 for x in range(10)]',
        testCase: '',
      },
      q4: {
        type: 'MCQ',
        question: 'Which of the following is NOT a valid Python data type?',
        options: ['list', 'tuple', 'array', 'dictionary'],
        answer: 'array',
        testCase: '',
      },
      q5: {
        type: 'Coding',
        question: 'Write a function that returns the factorial of a number.',
        options: [],
        answer: 'def factorial(n): return 1 if n <= 1 else n * factorial(n-1)',
        testCase:
          'factorial(5) should return 120; factorial(0) should return 1',
      },
      q6: {
        type: 'Answer-based',
        question:
          'Explain the difference between a list and a tuple in Python.',
        options: [],
        answer:
          'Lists are mutable and use [], tuples are immutable and use ().',
        testCase: '',
      },
    },
    status: 'published',
  },
  {
    assignmentName: 'NumPy and Pandas - Week 3',
    courseName: 'Data Science with Python',
    order: 2,
    totalQuestions: 4,
    questions: {
      q1: {
        type: 'MCQ',
        question:
          'What library is primarily used for numerical computing in Python?',
        options: ['Pandas', 'NumPy', 'SciPy', 'Matplotlib'],
        answer: 'NumPy',
        testCase: '',
      },
      q2: {
        type: 'Coding',
        question: 'Create a NumPy array with values from 0 to 9.',
        options: [],
        answer: 'import numpy as np; arr = np.arange(10)',
        testCase: 'Should create array [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]',
      },
      q3: {
        type: 'Answer-based',
        question: 'What is a DataFrame in Pandas?',
        options: [],
        answer:
          'A DataFrame is a 2-dimensional labeled data structure with columns of potentially different types.',
        testCase: '',
      },
      q4: {
        type: 'Coding',
        question: 'Write code to read a CSV file using Pandas.',
        options: [],
        answer: 'import pandas as pd; df = pd.read_csv("file.csv")',
        testCase: 'Should use pd.read_csv() method',
      },
    },
    status: 'published',
  },
  {
    assignmentName: 'Database Design - Assignment 1',
    courseName: 'Database Management Systems',
    order: 1,
    totalQuestions: 5,
    questions: {
      q1: {
        type: 'MCQ',
        question: 'What does SQL stand for?',
        options: [
          'Structured Query Language',
          'Simple Query Language',
          'Standard Query Language',
          'Sequential Query Language',
        ],
        answer: 'Structured Query Language',
        testCase: '',
      },
      q2: {
        type: 'Answer-based',
        question: 'What is normalization in databases?',
        options: [],
        answer:
          'Normalization is the process of organizing data to minimize redundancy and dependency.',
        testCase: '',
      },
      q3: {
        type: 'Coding',
        question:
          'Write a SQL query to select all records from a table named "students".',
        options: [],
        answer: 'SELECT * FROM students;',
        testCase: 'Should use SELECT * FROM syntax',
      },
      q4: {
        type: 'MCQ',
        question: 'Which of the following is a primary key constraint?',
        options: ['UNIQUE', 'NOT NULL', 'PRIMARY KEY', 'FOREIGN KEY'],
        answer: 'PRIMARY KEY',
        testCase: '',
      },
      q5: {
        type: 'Answer-based',
        question: 'Explain the difference between INNER JOIN and LEFT JOIN.',
        options: [],
        answer:
          'INNER JOIN returns only matching rows, LEFT JOIN returns all rows from left table and matching rows from right.',
        testCase: '',
      },
    },
    status: 'published',
  },
  {
    assignmentName: 'HTML & CSS Fundamentals',
    courseName: 'Web Development Basics',
    order: 1,
    totalQuestions: 5,
    questions: {
      q1: {
        type: 'MCQ',
        question: 'What does HTML stand for?',
        options: [
          'Hyper Text Markup Language',
          'High Tech Modern Language',
          'Home Tool Markup Language',
          'Hyperlinks and Text Markup Language',
        ],
        answer: 'Hyper Text Markup Language',
        testCase: '',
      },
      q2: {
        type: 'Coding',
        question: 'Write HTML code to create a link to "https://example.com".',
        options: [],
        answer: '<a href="https://example.com">Link Text</a>',
        testCase: 'Should use <a> tag with href attribute',
      },
      q3: {
        type: 'Answer-based',
        question: 'What is the CSS box model?',
        options: [],
        answer:
          'The box model consists of content, padding, border, and margin.',
        testCase: '',
      },
      q4: {
        type: 'MCQ',
        question: 'Which CSS property is used to change text color?',
        options: ['text-color', 'color', 'font-color', 'text-style'],
        answer: 'color',
        testCase: '',
      },
      q5: {
        type: 'Coding',
        question: 'Write CSS to make text bold and red.',
        options: [],
        answer: 'font-weight: bold; color: red;',
        testCase: 'Should include font-weight and color properties',
      },
    },
    status: 'draft',
  },
];

async function seedAssignments() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing assignments
    console.log('\n🗑️  Clearing existing assignments...');
    await NGAssignmentWithQuestions.deleteMany({});
    console.log('✅ Cleared existing data');

    // Insert mock data
    console.log('\n📝 Inserting mock assignments...');
    const insertedAssignments = [];

    for (const assignmentData of mockAssignments) {
      const assignment = await NGAssignmentWithQuestions.createFromFrontend(
        assignmentData.assignmentName,
        assignmentData.courseName,
        assignmentData.totalQuestions,
        assignmentData.questions
      );

      // Update order and status
      assignment.order = assignmentData.order;
      assignment.status = assignmentData.status;
      await assignment.save();

      insertedAssignments.push(assignment);
      console.log(
        `✅ Created: ${assignment.assignmentName} (${assignment.courseName})`
      );
    }

    console.log(
      `\n🎉 Successfully seeded ${insertedAssignments.length} assignments!`
    );
    console.log('\n📊 Summary by Course:');

    // Group by course
    const courseGroups = insertedAssignments.reduce((acc, assignment) => {
      if (!acc[assignment.courseName]) {
        acc[assignment.courseName] = [];
      }
      acc[assignment.courseName].push(assignment);
      return acc;
    }, {});

    Object.entries(courseGroups).forEach(([courseName, assignments]) => {
      console.log(`\n  📚 ${courseName}:`);
      assignments
        .sort((a, b) => a.order - b.order)
        .forEach((assignment) => {
          console.log(
            `    ${assignment.order}. ${assignment.assignmentName} - ${assignment.totalQuestions} questions (${assignment.status})`
          );
        });
    });

    console.log('\n✨ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding assignments:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the seed function
seedAssignments()
  .then(() => {
    console.log('\n✅ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  });
