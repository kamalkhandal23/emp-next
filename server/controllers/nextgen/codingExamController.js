import NGCodingExamWithQuestions from '../../models/nextgen/education/NGCodingExamWithQuestions.js';
import NGSubmissionCodingExams from '../../models/nextgen/education/NGSubmissionCodingExams.js';
import { executeCodeMultipleTests } from '../../services/codeExecutionService.js';
import User from '../../models/core/User.js';

// Create a new coding exam with all questions
export const createCodingExam = async (req, res) => {
  try {
    const { examName, courseName, totalQuestions, questionData } = req.body;

    // Validate required fields
    if (!examName || !courseName || !totalQuestions || !questionData) {
      return res.status(400).json({
        success: false,
        message:
          'Missing required fields: examName, courseName, totalQuestions, and questionData are required',
      });
    }

    // Validate that examName is not empty
    if (examName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Exam name cannot be empty',
      });
    }

    // Validate that courseName is not empty
    if (courseName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Course name cannot be empty',
      });
    }

    // Check if exam with same name already exists
    const existingExam = await NGCodingExamWithQuestions.findOne({
      examName: examName.trim(),
    });

    if (existingExam) {
      return res.status(409).json({
        success: false,
        message:
          'An exam with this name already exists. Please choose a different name.',
      });
    }

    // Validate that questionData matches totalQuestions
    const questionCount = Object.keys(questionData).length;
    if (questionCount !== parseInt(totalQuestions)) {
      return res.status(400).json({
        success: false,
        message: `Question count mismatch. Expected ${totalQuestions} questions but received ${questionCount}`,
      });
    }

    // Validate each question has required fields and is coding type
    for (const [qNum, qData] of Object.entries(questionData)) {
      if (!qData.type || qData.type !== 'Coding') {
        return res.status(400).json({
          success: false,
          message: `Question ${qNum} must be of type 'Coding'`,
        });
      }

      if (!qData.question || qData.question.trim() === '') {
        return res.status(400).json({
          success: false,
          message: `Question ${qNum} is missing the question text`,
        });
      }

      // Validate sample inputs and outputs
      if (
        !qData.sampleInputs ||
        !Array.isArray(qData.sampleInputs) ||
        qData.sampleInputs.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: `Question ${qNum} must have at least one sample input`,
        });
      }

      if (
        !qData.sampleOutputs ||
        !Array.isArray(qData.sampleOutputs) ||
        qData.sampleOutputs.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: `Question ${qNum} must have at least one sample output`,
        });
      }

      if (qData.sampleInputs.length !== qData.sampleOutputs.length) {
        return res.status(400).json({
          success: false,
          message: `Question ${qNum} must have matching number of sample inputs and outputs`,
        });
      }

      // Check that at least one sample input/output pair is not empty
      const hasValidSample =
        qData.sampleInputs.some((input) => input && input.trim() !== '') &&
        qData.sampleOutputs.some((output) => output && output.trim() !== '');
      if (!hasValidSample) {
        return res.status(400).json({
          success: false,
          message: `Question ${qNum} must have at least one valid sample input/output pair`,
        });
      }
    }

    // Create the exam using the static method
    const exam = await NGCodingExamWithQuestions.createFromFrontend(
      examName.trim(),
      courseName.trim(),
      parseInt(totalQuestions),
      questionData
    );

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Coding exam created successfully',
      data: {
        id: exam._id,
        examName: exam.examName,
        courseName: exam.courseName,
        totalQuestions: exam.totalQuestions,
        status: exam.status,
        createdAt: exam.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating coding exam:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An exam with this name already exists',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create coding exam',
      error: error.message,
    });
  }
};

// Get all coding exams
export const getAllCodingExams = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, courseName } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.examName = { $regex: search, $options: 'i' };
    }

    if (courseName) {
      query.courseName = { $regex: courseName, $options: 'i' };
    }

    const exams = await NGCodingExamWithQuestions.find(query)
      .select('examName courseName totalQuestions status createdAt updatedAt')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await NGCodingExamWithQuestions.countDocuments(query);

    res.json({
      success: true,
      data: {
        exams,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching coding exams:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coding exams',
      error: error.message,
    });
  }
};

// Get coding exam by ID
export const getCodingExamById = async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await NGCodingExamWithQuestions.findById(id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Coding exam not found',
      });
    }

    res.json({
      success: true,
      data: exam.getCodingExamData(),
    });
  } catch (error) {
    console.error('Error fetching coding exam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coding exam',
      error: error.message,
    });
  }
};

// Get coding exam by name
export const getCodingExamByName = async (req, res) => {
  try {
    const { examName } = req.params;

    const exam = await NGCodingExamWithQuestions.findOne({
      examName: examName.trim(),
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Coding exam not found',
      });
    }

    res.json({
      success: true,
      data: exam.getCodingExamData(),
    });
  } catch (error) {
    console.error('Error fetching coding exam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coding exam',
      error: error.message,
    });
  }
};

// Update coding exam status
export const updateCodingExamStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['draft', 'published', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: draft, published, archived',
      });
    }

    const exam = await NGCodingExamWithQuestions.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Coding exam not found',
      });
    }

    res.json({
      success: true,
      message: 'Coding exam status updated successfully',
      data: {
        id: exam._id,
        examName: exam.examName,
        status: exam.status,
      },
    });
  } catch (error) {
    console.error('Error updating coding exam status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update coding exam status',
      error: error.message,
    });
  }
};

// Update entire coding exam
export const updateCodingExam = async (req, res) => {
  try {
    const { id } = req.params;
    const { examName, courseName, totalQuestions, questionData, status } =
      req.body;

    // Validate required fields
    if (!examName || !courseName || !totalQuestions || !questionData) {
      return res.status(400).json({
        success: false,
        message:
          'Missing required fields: examName, courseName, totalQuestions, and questionData are required',
      });
    }

    // Validate examName
    if (examName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Exam name cannot be empty',
      });
    }

    // Validate courseName
    if (courseName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Course name cannot be empty',
      });
    }

    // Check if another exam with same name exists (excluding current)
    const existingExam = await NGCodingExamWithQuestions.findOne({
      examName: examName.trim(),
      _id: { $ne: id },
    });

    if (existingExam) {
      return res.status(409).json({
        success: false,
        message:
          'An exam with this name already exists. Please choose a different name.',
      });
    }

    // Validate questionData matches totalQuestions
    const questionCount = Object.keys(questionData).length;
    if (questionCount !== parseInt(totalQuestions)) {
      return res.status(400).json({
        success: false,
        message: `Question count mismatch. Expected ${totalQuestions} questions but received ${questionCount}`,
      });
    }

    // Validate each question
    for (const [qNum, qData] of Object.entries(questionData)) {
      if (!qData.type || qData.type !== 'Coding') {
        return res.status(400).json({
          success: false,
          message: `Question ${qNum} must be of type 'Coding'`,
        });
      }

      if (!qData.question || qData.question.trim() === '') {
        return res.status(400).json({
          success: false,
          message: `Question ${qNum} is missing the question text`,
        });
      }

      // Validate sample inputs and outputs
      if (
        !qData.sampleInputs ||
        !Array.isArray(qData.sampleInputs) ||
        qData.sampleInputs.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: `Question ${qNum} must have at least one sample input`,
        });
      }

      if (
        !qData.sampleOutputs ||
        !Array.isArray(qData.sampleOutputs) ||
        qData.sampleOutputs.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: `Question ${qNum} must have at least one sample output`,
        });
      }

      if (qData.sampleInputs.length !== qData.sampleOutputs.length) {
        return res.status(400).json({
          success: false,
          message: `Question ${qNum} must have matching number of sample inputs and outputs`,
        });
      }

      // Check that at least one sample input/output pair is not empty
      const hasValidSample =
        qData.sampleInputs.some((input) => input && input.trim() !== '') &&
        qData.sampleOutputs.some((output) => output && output.trim() !== '');
      if (!hasValidSample) {
        return res.status(400).json({
          success: false,
          message: `Question ${qNum} must have at least one valid sample input/output pair`,
        });
      }
    }

    // Validate status if provided
    if (status && !['draft', 'published', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: draft, published, archived',
      });
    }

    // Find the exam first
    const exam = await NGCodingExamWithQuestions.findById(id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Coding exam not found',
      });
    }

    // Convert questionData to Map
    const questionsMap = new Map();
    Object.keys(questionData).forEach((key) => {
      questionsMap.set(key, questionData[key]);
    });

    // Update the exam fields
    exam.examName = examName.trim();
    exam.courseName = courseName.trim();
    exam.totalQuestions = parseInt(totalQuestions);
    exam.questions = questionsMap;

    if (status) {
      exam.status = status;
    }

    // Mark questions as modified since it's a Map
    exam.markModified('questions');

    // Save the updated exam
    await exam.save();

    res.json({
      success: true,
      message: 'Coding exam updated successfully',
      data: {
        id: exam._id,
        examName: exam.examName,
        courseName: exam.courseName,
        totalQuestions: exam.totalQuestions,
        status: exam.status,
        updatedAt: exam.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error updating coding exam:', error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An exam with this name already exists',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update coding exam',
      error: error.message,
    });
  }
};

// Delete coding exam
export const deleteCodingExam = async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await NGCodingExamWithQuestions.findByIdAndDelete(id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Coding exam not found',
      });
    }

    res.json({
      success: true,
      message: 'Coding exam deleted successfully',
      data: {
        examName: exam.examName,
      },
    });
  } catch (error) {
    console.error('Error deleting coding exam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete coding exam',
      error: error.message,
    });
  }
};

// Run code on sample inputs
export const runCode = async (req, res) => {
  try {
    const { examId, questionId, code, language } = req.body;

    // Validate required fields
    if (!examId || !questionId || !code || !language) {
      return res.status(400).json({
        success: false,
        message:
          'Missing required fields: examId, questionId, code, and language are required',
      });
    }

    // Validate language
    const validLanguages = ['c', 'cpp', 'java', 'python', 'javascript'];
    if (!validLanguages.includes(language)) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid language. Must be one of: c, cpp, java, python, javascript',
      });
    }

    // Get exam
    const exam = await NGCodingExamWithQuestions.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Coding exam not found',
      });
    }

    // Get question
    const question = exam.questions.get(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    // Execute code on sample inputs (run on each test case separately)
    const result = await executeCodeMultipleTests(
      code,
      language,
      question.sampleInputs,
      question.sampleOutputs,
      false // not hidden
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error running code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run code',
      error: error.message,
    });
  }
};

// Submit coding exam
export const submitCodingExam = async (req, res) => {
  try {
    const { examId, submissions } = req.body;
    const studentId = req.user?.id; // Assuming auth middleware sets req.user

    // Validate required fields
    if (!examId || !submissions || !Array.isArray(submissions)) {
      return res.status(400).json({
        success: false,
        message:
          'Missing required fields: examId and submissions array are required',
      });
    }

    // Get exam
    const exam = await NGCodingExamWithQuestions.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Coding exam not found',
      });
    }

    const results = [];
    let totalMarks = 0;
    const maxMarksPerQuestion = 100 / exam.totalQuestions;

    // Process each submission
    for (const submission of submissions) {
      const { questionId, code, language } = submission;

      // Validate submission
      if (!questionId || !code || !language) {
        return res.status(400).json({
          success: false,
          message: `Invalid submission for question ${questionId}: missing questionId, code, or language`,
        });
      }

      // Get question
      const question = exam.questions.get(questionId);
      if (!question) {
        return res.status(404).json({
          success: false,
          message: `Question ${questionId} not found`,
        });
      }

      // Execute code on hidden test cases
      const result = await executeCodeMultipleTests(
        code,
        language,
        question.hiddenInputs,
        question.hiddenOutputs,
        true // hidden
      );

      // Calculate marks for this question based on passed test cases
      const marks =
        (result.passedCount / result.totalTests) * maxMarksPerQuestion;
      totalMarks += marks;

      // Save submission
      const submissionRecord = new NGSubmissionCodingExams({
        student_id: studentId,
        exam_id: examId,
        question_id: questionId,
        code,
        language,
        verdict: result.overallVerdict,
        marks: Math.round(marks),
        executionTime:
          result.results.length > 0 ? result.results[0].executionTime : '0.00s',
        memory: result.results.length > 0 ? result.results[0].memory : '0MB',
        output: result.results.length > 0 ? result.results[0].output : '',
        error: result.results.length > 0 ? result.results[0].error : '',
      });

      await submissionRecord.save();

      results.push({
        questionId,
        verdict: result.overallVerdict,
        marks: Math.round(marks),
        passedTests: result.passedCount,
        totalTests: result.totalTests,
        successRate: result.successRate,
        executionTime:
          result.results.length > 0 ? result.results[0].executionTime : '0.00s',
        memory: result.results.length > 0 ? result.results[0].memory : '0MB',
      });
    }

    res.json({
      success: true,
      message: 'Coding exam submitted successfully',
      data: {
        totalMarks: Math.round(totalMarks),
        results,
      },
    });
  } catch (error) {
    console.error('Error submitting coding exam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit coding exam',
      error: error.message,
    });
  }
};

// GET /api/nextgen/codingExams/my-codingexam
export const getCodingExamsForManager = async (req, res) => {
  try {
    const managerId = req.user.id; // from JWT middleware
    console.log('managerId', managerId);

    // 1. Get manager with assigned course list
    const manager = await User.findById(managerId).select('assignedCourses');

    if (!manager) {
      return res
        .status(404)
        .json({ success: false, message: 'Manager not found' });
    }

    // 2. Fetch exams only for those courses
    const exams = await NGCodingExamWithQuestions.find({
      courseId: { $in: manager.assignedCourses },
    })
      .populate('courseId', 'name') // optional
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { exams },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exams',
      error: error.message,
    });
  }
};

// GET /api/nextgen/codingExams/all-submissions
// Get all coding exam submissions with student and exam details
export const getAllSubmissions = async (req, res) => {
  try {
    console.log('📊 Fetching all coding exam submissions...');

    // Fetch all submissions with populated student and exam data
    const submissions = await NGSubmissionCodingExams.find()
      .populate({
        path: 'student_id',
        select: 'fullName full_name email student_id',
      })
      .populate({
        path: 'exam_id',
        select: 'examName courseName totalQuestions status',
      })
      .sort({ submitted_at: -1 })
      .lean();

    console.log(`✅ Found ${submissions.length} submissions`);

    // Filter out submissions with deleted exams or students
    const validSubmissions = submissions.filter((sub) => {
      if (!sub.exam_id) {
        console.warn(`⚠️ Submission ${sub._id} has no valid exam_id`);
        return false;
      }
      if (!sub.student_id) {
        console.warn(`⚠️ Submission ${sub._id} has no valid student_id`);
        return false;
      }
      return true;
    });

    console.log(`✅ Valid submissions: ${validSubmissions.length}`);

    return res.json({
      success: true,
      data: validSubmissions,
      count: validSubmissions.length,
    });
  } catch (error) {
    console.error('❌ Error fetching all submissions:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch coding exam submissions',
      error: error.message,
    });
  }
};

export default {
  createCodingExam,
  getAllCodingExams,
  getCodingExamById,
  getCodingExamByName,
  updateCodingExamStatus,
  updateCodingExam,
  deleteCodingExam,
  runCode,
  submitCodingExam,
  getCodingExamsForManager,
  getAllSubmissions,
};
