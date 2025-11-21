import AssignmentSubmission from '../../models/nextgen/education/AssignmentSubmission.js';
import NGAssignmentWithQuestions from '../../models/nextgen/education/NGAssignmentWithQuestions.js';
import Student from '../../models/nextgen/student-management/Student.js';
import { sendGradedAssignmentEmail } from '../../services/emailService.js';

// Create or update submission
export const submitAssignment = async (req, res) => {
  try {
    const { assignmentId, studentId, textSubmission, codeSubmission, answers } =
      req.body;
    const files = req.files || [];

    if (!assignmentId || !studentId) {
      return res.status(400).json({
        success: false,
        message: 'Assignment ID and Student ID are required',
      });
    }

    // Get assignment details
    const assignment = await NGAssignmentWithQuestions.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    // Prepare file submissions data
    const fileSubmissions = files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size,
      uploadedAt: new Date(),
    }));

    // Find existing submission or create new one
    let submission = await AssignmentSubmission.findOne({
      assignment_id: assignmentId,
      student_id: studentId,
    });

    if (submission) {
      // Update existing submission
      submission.textSubmission = textSubmission || submission.textSubmission;
      submission.codeSubmission = codeSubmission || submission.codeSubmission;
      submission.answers = answers || submission.answers;
      submission.fileSubmissions = [
        ...submission.fileSubmissions,
        ...fileSubmissions,
      ];
      submission.submitted_at = new Date();
      submission.status = 'submitted';
    } else {
      // Create new submission
      submission = new AssignmentSubmission({
        assignment_id: assignmentId,
        student_id: studentId,
        courseName: assignment.courseName,
        textSubmission: textSubmission || '',
        codeSubmission: codeSubmission || {},
        answers: answers || {},
        fileSubmissions,
        submitted_at: new Date(),
        status: 'submitted',
      });
    }

    await submission.save();

    res.status(200).json({
      success: true,
      message: 'Assignment submitted successfully',
      data: {
        submissionId: submission._id,
        status: submission.status,
        submitted_at: submission.submitted_at,
      },
    });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit assignment',
      error: error.message,
    });
  }
};

// Get student's submission for an assignment
export const getSubmission = async (req, res) => {
  try {
    const { assignmentId, studentId } = req.params;

    const submission = await AssignmentSubmission.findOne({
      assignment_id: assignmentId,
      student_id: studentId,
    }).populate('assignment_id', 'assignmentName courseName');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }

    res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submission',
      error: error.message,
    });
  }
};

// Get all submissions for an assignment (for instructors)
export const getAssignmentSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { status } = req.query;

    const query = { assignment_id: assignmentId };
    if (status) {
      query.status = status;
    }

    const submissions = await AssignmentSubmission.find(query)
      .populate('student_id', 'fullName email student_id')
      .populate('assignment_id', 'assignmentName courseName')
      .sort({ submitted_at: -1 });

    res.status(200).json({
      success: true,
      data: {
        submissions,
        total: submissions.length,
      },
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions',
      error: error.message,
    });
  }
};

// Grade a submission
export const gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { score, feedback, gradedBy } = req.body;

    if (score === undefined || score < 0 || score > 100) {
      return res.status(400).json({
        success: false,
        message: 'Score must be between 0 and 100',
      });
    }

    const submission = await AssignmentSubmission.findById(submissionId)
      .populate('student_id', 'fullName email')
      .populate('assignment_id', 'assignmentName');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }

    // Update submission with grade
    submission.score = score;
    submission.feedback = feedback || '';
    submission.status = 'graded';
    submission.graded_by = gradedBy;
    submission.graded_at = new Date();

    await submission.save();

    // Send email notification to student
    if (submission.student_id && submission.student_id.email) {
      await sendGradedAssignmentEmail(
        submission.student_id.email,
        submission.student_id.fullName,
        submission.assignment_id.assignmentName,
        score,
        feedback
      );
    }

    res.status(200).json({
      success: true,
      message: 'Assignment graded successfully',
      data: {
        submissionId: submission._id,
        score: submission.score,
        status: submission.status,
        graded_at: submission.graded_at,
      },
    });
  } catch (error) {
    console.error('Error grading submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to grade submission',
      error: error.message,
    });
  }
};

// Get student's submission history
export const getStudentSubmissions = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { status, courseName } = req.query;

    const query = { student_id: studentId };
    if (status) query.status = status;
    if (courseName) query.courseName = courseName;

    const submissions = await AssignmentSubmission.find(query)
      .populate('assignment_id', 'assignmentName courseName totalQuestions')
      .sort({ submitted_at: -1 });

    res.status(200).json({
      success: true,
      data: {
        submissions,
        total: submissions.length,
      },
    });
  } catch (error) {
    console.error('Error fetching student submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions',
      error: error.message,
    });
  }
};

export default {
  submitAssignment,
  getSubmission,
  getAssignmentSubmissions,
  gradeSubmission,
  getStudentSubmissions,
};
