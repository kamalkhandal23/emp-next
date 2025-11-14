import NGExamWithQuestions from '../../models/nextgen/education/NGExamWithQuestions.js';

// Create a new exam with all questions
export const createExam = async (req, res) => {
  try {
    const { examName, totalQuestions, questionData } = req.body;

    // Validate required fields
    if (!examName || !totalQuestions || !questionData) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: examName, totalQuestions, and questionData are required'
      });
    }

    // Validate that examName is not empty
    if (examName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Exam name cannot be empty'
      });
    }

    // Check if exam with same name already exists
    const existingExam = await NGExamWithQuestions.findOne({ 
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

    // Validate each question has required fields
    for (const [qNum, qData] of Object.entries(questionData)) {
      if (!qData.type || !qData.question) {
        return res.status(400).json({
          success: false,
          message: `Question ${qNum} is missing required fields (type or question)`
        });
      }

      // Validate MCQ questions have options
      if (qData.type === 'MCQ' && (!qData.options || qData.options.length === 0)) {
        return res.status(400).json({
          success: false,
          message: `Question ${qNum} is MCQ type but has no options`
        });
      }
    }

    // Create the exam using the static method
    const exam = await NGExamWithQuestions.createFromFrontend(
      examName.trim(),
      parseInt(totalQuestions),
      questionData
    );

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Exam created successfully',
      data: {
        id: exam._id,
        examName: exam.examName,
        totalQuestions: exam.totalQuestions,
        status: exam.status,
        createdAt: exam.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating exam:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An exam with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create exam',
      error: error.message
    });
  }
};

// Get all exams
export const getAllExams = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    const query = {};
    
    if (status) {
      query.status = status;
    }

    if (search) {
      query.examName = { $regex: search, $options: 'i' };
    }

    const exams = await NGExamWithQuestions.find(query)
      .select('examName totalQuestions status createdAt updatedAt')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await NGExamWithQuestions.countDocuments(query);

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
    console.error('Error fetching exams:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exams',
      error: error.message
    });
  }
};

// Get exam by ID
export const getExamById = async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await NGExamWithQuestions.findById(id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    res.json({
      success: true,
      data: exam.getExamData()
    });

  } catch (error) {
    console.error('Error fetching exam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exam',
      error: error.message
    });
  }
};

// Get exam by name
export const getExamByName = async (req, res) => {
  try {
    const { examName } = req.params;

    const exam = await NGExamWithQuestions.findOne({ 
      examName: examName.trim() 
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    res.json({
      success: true,
      data: exam.getExamData()
    });

  } catch (error) {
    console.error('Error fetching exam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exam',
      error: error.message
    });
  }
};

// Update exam status
export const updateExamStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['draft', 'published', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: draft, published, archived'
      });
    }

    const exam = await NGExamWithQuestions.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    res.json({
      success: true,
      message: 'Exam status updated successfully',
      data: {
        id: exam._id,
        examName: exam.examName,
        status: exam.status
      }
    });

  } catch (error) {
    console.error('Error updating exam status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update exam status',
      error: error.message
    });
  }
};

// Update entire exam
export const updateExam = async (req, res) => {
  try {
    const { id } = req.params;
    const { examName, totalQuestions, questionData, status } = req.body;

    // Validate required fields
    if (!examName || !totalQuestions || !questionData) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: examName, totalQuestions, and questionData are required'
      });
    }

    // Validate examName
    if (examName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Exam name cannot be empty'
      });
    }

    // Check if another exam with same name exists (excluding current)
    const existingExam = await NGExamWithQuestions.findOne({
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
      if (!qData.type || !qData.question) {
        return res.status(400).json({
          success: false,
          message: `Question ${qNum} is missing required fields (type or question)`
        });
      }

      if (qData.type === 'MCQ' && (!qData.options || qData.options.length === 0)) {
        return res.status(400).json({
          success: false,
          message: `Question ${qNum} is MCQ type but has no options`
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
    const exam = await NGExamWithQuestions.findById(id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    // Convert questionData to Map
    const questionsMap = new Map();
    Object.keys(questionData).forEach(key => {
      questionsMap.set(key, questionData[key]);
    });

    // Update the exam fields
    exam.examName = examName.trim();
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
      message: 'Exam updated successfully',
      data: {
        id: exam._id,
        examName: exam.examName,
        totalQuestions: exam.totalQuestions,
        status: exam.status,
        updatedAt: exam.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating exam:', error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An exam with this name already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update exam',
      error: error.message
    });
  }
};

// Delete exam
export const deleteExam = async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await NGExamWithQuestions.findByIdAndDelete(id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    res.json({
      success: true,
      message: 'Exam deleted successfully',
      data: {
        examName: exam.examName
      }
    });

  } catch (error) {
    console.error('Error deleting exam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete exam',
      error: error.message
    });
  }
};

export default {
  createExam,
  getAllExams,
  getExamById,
  getExamByName,
  updateExamStatus,
  updateExam,
  deleteExam
};
