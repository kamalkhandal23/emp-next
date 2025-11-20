import NGAssignmentWithQuestions from '../../models/nextgen/education/NGAssignmentWithQuestions.js';
import NGSubmissionAssignment from '../../models/nextgen/education/NGSubmissionAssignment.js';

// Create a new assignment with all questions
export const createAssignment = async (req, res) => {
  try {
    const { assignmentName, courseName, totalQuestions, questionData } = req.body;

    // Validate required fields
    if (!assignmentName || !courseName || !totalQuestions || !questionData) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: assignmentName, courseName, totalQuestions, and questionData are required'
      });
    }

    // Validate that assignmentName is not empty
    if (assignmentName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Assignment name cannot be empty'
      });
    }

    // Validate that courseName is not empty
    if (courseName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Course name cannot be empty'
      });
    }

    // Check if assignment with same name already exists
    const existingAssignment = await NGAssignmentWithQuestions.findOne({
      assignmentName: assignmentName.trim()
    });

    if (existingAssignment) {
      return res.status(409).json({
        success: false,
        message: 'An assignment with this name already exists. Please choose a different name.'
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

    // Create the assignment using the static method
    const assignment = await NGAssignmentWithQuestions.createFromFrontend(
      assignmentName.trim(),
      courseName.trim(),
      parseInt(totalQuestions),
      questionData
    );

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: {
        id: assignment._id,
        assignmentName: assignment.assignmentName,
        courseName: assignment.courseName,
        totalQuestions: assignment.totalQuestions,
        status: assignment.status,
        createdAt: assignment.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating assignment:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An assignment with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create assignment',
      error: error.message
    });
  }
};

// Get all assignments
export const getAllAssignments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, courseName } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.assignmentName = { $regex: search, $options: 'i' };
    }

    if (courseName) {
      query.courseName = { $regex: courseName, $options: 'i' };
    }

    const assignments = await NGAssignmentWithQuestions.find(query)
      .select('assignmentName courseName totalQuestions status createdAt updatedAt')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await NGAssignmentWithQuestions.countDocuments(query);

    res.json({
      success: true,
      data: {
        assignments,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignments',
      error: error.message
    });
  }
};

// Get assignment by ID
export const getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await NGAssignmentWithQuestions.findById(id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    res.json({
      success: true,
      data: assignment.getAssignmentData()
    });

  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignment',
      error: error.message
    });
  }
};

// Get assignment by name
export const getAssignmentByName = async (req, res) => {
  try {
    const { assignmentName } = req.params;

    const assignment = await NGAssignmentWithQuestions.findOne({
      assignmentName: assignmentName.trim()
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    res.json({
      success: true,
      data: assignment.getAssignmentData()
    });

  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignment',
      error: error.message
    });
  }
};

// Update assignment status
export const updateAssignmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['draft', 'published', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: draft, published, archived'
      });
    }

    const assignment = await NGAssignmentWithQuestions.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    res.json({
      success: true,
      message: 'Assignment status updated successfully',
      data: {
        id: assignment._id,
        assignmentName: assignment.assignmentName,
        status: assignment.status
      }
    });

  } catch (error) {
    console.error('Error updating assignment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update assignment status',
      error: error.message
    });
  }
};

// Update entire assignment
export const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignmentName, courseName, totalQuestions, questionData, status } = req.body;

    // Validate required fields
    if (!assignmentName || !courseName || !totalQuestions || !questionData) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: assignmentName, courseName, totalQuestions, and questionData are required'
      });
    }

    // Validate assignmentName
    if (assignmentName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Assignment name cannot be empty'
      });
    }

    // Validate courseName
    if (courseName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Course name cannot be empty'
      });
    }

    // Check if another assignment with same name exists (excluding current)
    const existingAssignment = await NGAssignmentWithQuestions.findOne({
      assignmentName: assignmentName.trim(),
      _id: { $ne: id }
    });

    if (existingAssignment) {
      return res.status(409).json({
        success: false,
        message: 'An assignment with this name already exists. Please choose a different name.'
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

    // Find the assignment first
    const assignment = await NGAssignmentWithQuestions.findById(id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Convert questionData to Map
    const questionsMap = new Map();
    Object.keys(questionData).forEach(key => {
      questionsMap.set(key, questionData[key]);
    });

    // Update the assignment fields
    assignment.assignmentName = assignmentName.trim();
    assignment.courseName = courseName.trim();
    assignment.totalQuestions = parseInt(totalQuestions);
    assignment.questions = questionsMap;

    if (status) {
      assignment.status = status;
    }

    // Mark questions as modified since it's a Map
    assignment.markModified('questions');

    // Save the updated assignment
    await assignment.save();

    res.json({
      success: true,
      message: 'Assignment updated successfully',
      data: {
        id: assignment._id,
        assignmentName: assignment.assignmentName,
        courseName: assignment.courseName,
        totalQuestions: assignment.totalQuestions,
        status: assignment.status,
        updatedAt: assignment.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating assignment:', error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An assignment with this name already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update assignment',
      error: error.message
    });
  }
};

// Delete assignment
export const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await NGAssignmentWithQuestions.findByIdAndDelete(id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    res.json({
      success: true,
      message: 'Assignment deleted successfully',
      data: {
        assignmentName: assignment.assignmentName
      }
    });

  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete assignment',
      error: error.message
    });
  }
};

// Get submissions for a specific assignment
export const getSubmissionsForAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify assignment exists
    const assignment = await NGAssignmentWithQuestions.findById(id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    const submissions = await NGSubmissionAssignment.find({ assignment_id: id })
      .populate('student_id', 'full_name email')
      .sort({ submitted_at: -1 });

    res.json({
      success: true,
      data: {
        assignment: {
          id: assignment._id,
          assignmentName: assignment.assignmentName,
          courseName: assignment.courseName
        },
        submissions: submissions.map(sub => ({
          id: sub._id,
          student: sub.student_id ? {
            id: sub.student_id._id,
            fullName: sub.student_id.full_name,
            email: sub.student_id.email
          } : null,
          submission_data: sub.submission_data,
          submitted_at: sub.submitted_at,
          status: sub.status,
          grade: sub.grade,
          feedback: sub.feedback
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions',
      error: error.message
    });
  }
};

// Submit an assignment
export const submitAssignment = async (req, res) => {
  try {
    const { assignment_id, student_id, submission_data } = req.body;

    // Validate required fields
    if (!assignment_id || !student_id || !submission_data) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: assignment_id, student_id, and submission_data are required'
      });
    }

    // Verify assignment exists
    const assignment = await NGAssignmentWithQuestions.findById(assignment_id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check if student already submitted
    const existingSubmission = await NGSubmissionAssignment.findOne({
      assignment_id,
      student_id
    });

    if (existingSubmission) {
      return res.status(409).json({
        success: false,
        message: 'Student has already submitted this assignment'
      });
    }

    // Create submission
    const submission = new NGSubmissionAssignment({
      student_id,
      assignment_id,
      submission_data
    });

    await submission.save();

    res.status(201).json({
      success: true,
      message: 'Assignment submitted successfully',
      data: {
        id: submission._id,
        submitted_at: submission.submitted_at
      }
    });

  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit assignment',
      error: error.message
    });
  }
};

// Grade a submission
export const gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;

    // Validate grade
    if (grade !== null && grade !== undefined && (grade < 0 || grade > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Grade must be between 0 and 100'
      });
    }

    const submission = await NGSubmissionAssignment.findById(submissionId);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Update grade and feedback
    if (grade !== null && grade !== undefined) {
      submission.grade = grade;
    }
    if (feedback !== undefined) {
      submission.feedback = feedback;
    }
    submission.status = 'graded';

    await submission.save();

    res.json({
      success: true,
      message: 'Submission graded successfully',
      data: {
        id: submission._id,
        grade: submission.grade,
        feedback: submission.feedback,
        status: submission.status
      }
    });

  } catch (error) {
    console.error('Error grading submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to grade submission',
      error: error.message
    });
  }
};

export default {
  createAssignment,
  getAllAssignments,
  getAssignmentById,
  getAssignmentByName,
  updateAssignmentStatus,
  updateAssignment,
  deleteAssignment,
  getSubmissionsForAssignment,
  submitAssignment,
  gradeSubmission
};
