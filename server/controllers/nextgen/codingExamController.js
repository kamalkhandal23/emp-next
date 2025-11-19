import NGCodingExamWithQuestions from '../../models/nextgen/education/NGCodingExamWithQuestions.js';

// Create a new coding exam with all questions
export const createCodingExam = async (req, res) => {
  try {
    const { examName, courseName, totalQuestions, questionData } = req.body;

    // Validate required fields
    if (!examName || !courseName || !totalQuestions || !questionData) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: examName, courseName, totalQuestions, and questionData are required'
      });
    }

    // Validate that examName is not empty
    if (examName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Exam name cannot be empty'
      });
    }

    // Validate that courseName is not empty
    if (courseName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Course name cannot be empty'
      });
    }

    // Check if exam with same name already exists
    const existingExam = await NGCodingExamWithQuestions.findOne({
      examName: examName.trim()
    });

    if (existingExam) {
      return res.status(409).json({
        success: false,
        message: 'An exam with this name already exists. Please choose a different name.'
      });
    }

    // Validate that questionData matches totalQuestions
    const questionCount = Object.keys(questionData).length;
    if (questionCount !== parseInt(totalQuestions)) {
      return res.status(400).json({
        success: false,
        message: `Question count mismatch. Expected ${totalQuestions} questions but received ${questionCount}`
      });
    }

    // Validate each question has required fields and is coding type
    for (const [qNum, qData] of Object.entries(questionData)) {
      if (!qData.type || qData.type !== 'Coding') {
        return res.status(400).json({
          success: false,
          message: `Question ${qNum} must be of type 'Coding'`
        });
      }

      if (!qData.question || qData.question.trim() === '') {
        return res.status(400).json({
          success: false,
          message: `Question ${qNum} is missing the question text`
        });
      }

      if (!qData.testCase || qData.testCase.trim() === '') {
        return res.status(400).json({
          success: false,
          message: `Question ${qNum} is missing test case description`
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
        createdAt: exam.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating coding exam:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An exam with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create coding exam',
      error: error.message
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
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Error fetching coding exams:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coding exams',
      error: error.message
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
        message: 'Coding exam not found'
      });
    }

    res.json({
      success: true,
      data: exam.getCodingExamData()
    });

  } catch (error) {
    console.error('Error fetching coding exam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coding exam',
      error: error.message
    });
  }
};

// Get coding exam by name
export const getCodingExamByName = async (req, res) => {
  try {
    const { examName } = req.params;

    const exam = await NGCodingExamWithQuestions.findOne({
      examName: examName.trim()
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Coding exam not found'
      });
    }

    res.json({
      success: true,
      data: exam.getCodingExamData()
    });

  } catch (error) {
    console.error('Error fetching coding exam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coding exam',
      error: error.message
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
        message: 'Invalid status. Must be one of: draft, published, archived'
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
        message: 'Coding exam not found'
      });
    }

    res.json({
      success: true,
      message: 'Coding exam status updated successfully',
      data: {
        id: exam._id,
        examName: exam.examName,
        status: exam.status
      }
    });

  } catch (error) {
    console.error('Error updating coding exam status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update coding exam status',
      error: error.message
    });
  }
};

// Update entire coding exam
export const updateCodingExam = async (req, res) => {
  try {
    const { id } = req.params;
    const { examName, courseName, totalQuestions, questionData, status } = req.body;

    // Validate required fields
    if (!examName || !courseName || !totalQuestions || !questionData) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: examName, courseName, totalQuestions, and questionData are required'
      });
    }

    // Validate examName
    if (examName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Exam name cannot be empty'
      });
    }

    // Validate courseName
    if (courseName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Course name cannot be empty'
      });
    }

    // Check if another exam with same name exists (excluding current)
    const existingExam = await NGCodingExamWithQuestions.findOne({
      examName: examName.trim(),
      _id: { $ne: id }
    });

    if (existingExam) {
      return res.status(409).json({
        success: false,
        message: 'An exam with this name already exists. Please choose a different name.'
      });
    }

    // Validate questionData matches totalQuestions
    const questionCount = Object.keys(questionData).length;
    if (questionCount !== parseInt(totalQuestions)) {
      return res.status(400).json({
        success: false,
        message: `Question count mismatch. Expected ${totalQuestions} questions but received ${questionCount}`
      });
    }

    // Validate each question
    for (const [qNum, qData] of Object.entries(questionData)) {
      if (!qData.type || qData.type !== 'Coding') {
        return res.status(400).json({
          success: false,
          message: `Question ${qNum} must be of type 'Coding'`
        });
      }

      if (!qData.question || qData.question.trim() === '') {
        return res.status(400).json({
          success: false,
          message: `Question ${qNum} is missing the question text`
        });
      }

      if (!qData.testCase || qData.testCase.trim() === '') {
        return res.status(400).json({
          success: false,
          message: `Question ${qNum} is missing test case description`
        });
      }
    }

    // Validate status if provided
    if (status && !['draft', 'published', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: draft, published, archived'
      });
    }

    // Find the exam first
    const exam = await NGCodingExamWithQuestions.findById(id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Coding exam not found'
      });
    }

    // Convert questionData to Map
    const questionsMap = new Map();
    Object.keys(questionData).forEach(key => {
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
        updatedAt: exam.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating coding exam:', error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An exam with this name already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update coding exam',
      error: error.message
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
        message: 'Coding exam not found'
      });
    }

    res.json({
      success: true,
      message: 'Coding exam deleted successfully',
      data: {
        examName: exam.examName
      }
    });

  } catch (error) {
    console.error('Error deleting coding exam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete coding exam',
      error: error.message
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
  deleteCodingExam
};
