import express from 'express';
import NGSubmissionExams from '../../../models/nextgen/education/NGSubmissionExams.js';
import NGSubmissionCodingExams from '../../../models/nextgen/education/NGSubmissionCodingExams.js';
import { studentAuth } from '../../../middleware/studentAuth.js';

const router = express.Router();

/* =========================================================================
   GET /api/nextgen/student/results
   Protected - Get all exam results for logged-in student
   ======================================================================= */
router.get('/', studentAuth, async (req, res) => {
  try {
    const studentId = req.student._id;

    // Fetch exam submissions
    const examSubmissions = await NGSubmissionExams.find({
      student_id: studentId,
    })
      .populate('exam_id', 'examName totalQuestions status')
      .sort({ submitted_at: -1 })
      .lean();

    console.log('📊 Exam Submissions Found:', examSubmissions.length);
    if (examSubmissions.length > 0) {
      console.log(
        'Sample submission:',
        JSON.stringify(examSubmissions[0], null, 2)
      );
      console.log(
        'submission_data type:',
        typeof examSubmissions[0].submission_data
      );
      console.log(
        'submission_data isEmpty:',
        Object.keys(examSubmissions[0].submission_data || {}).length === 0
      );
      console.log(
        'submission_data keys:',
        Object.keys(examSubmissions[0].submission_data || {})
      );
    }

    // Filter out submissions where exam was deleted (exam_id is null after populate)
    const validExamSubmissions = examSubmissions.filter((sub) => {
      if (!sub.exam_id) {
        console.warn(
          `⚠️  Submission ${sub._id} has no valid exam_id (exam may have been deleted)`
        );
        return false;
      }
      return true;
    });

    // Fetch coding exam submissions grouped by exam
    const codingSubmissions = await NGSubmissionCodingExams.find({
      student_id: studentId,
    })
      .populate('exam_id', 'examName totalQuestions status')
      .sort({ submitted_at: -1 })
      .lean();

    console.log('💻 Coding Submissions Found:', codingSubmissions.length);
    if (codingSubmissions.length > 0) {
      console.log(
        'Sample coding submission:',
        JSON.stringify(codingSubmissions[0], null, 2)
      );
    }

    // Filter out submissions where exam was deleted
    const validCodingSubmissions = codingSubmissions.filter((sub) => {
      if (!sub.exam_id) {
        console.warn(
          `⚠️  Coding submission ${sub._id} has no valid exam_id (exam may have been deleted)`
        );
        return false;
      }
      return true;
    });

    // Group coding submissions by exam_id
    const codingExamMap = new Map();
    validCodingSubmissions.forEach((submission) => {
      const examId = submission.exam_id._id.toString();
      if (!codingExamMap.has(examId)) {
        codingExamMap.set(examId, {
          exam: submission.exam_id,
          submissions: [],
          totalMarks: 0,
          submitted_at: submission.submitted_at,
        });
      }
      const examData = codingExamMap.get(examId);
      examData.submissions.push(submission);
      examData.totalMarks += submission.marks || 0;
    });

    // Format exam results
    const examResults = validExamSubmissions.map((sub) => ({
      id: sub._id,
      type: 'exam',
      examTitle: sub.exam_id?.examName || 'Unnamed Exam',
      examId: sub.exam_id?._id,
      grade: sub.grade,
      feedback: sub.feedback || 'No feedback provided',
      status: sub.status,
      submittedAt: sub.submitted_at,
      submissionData: sub.submission_data,
    }));

    // Format coding exam results
    const codingResults = Array.from(codingExamMap.values()).map((data) => ({
      id: data.exam._id,
      type: 'coding-exam',
      examTitle: data.exam?.examName || 'Unnamed Coding Exam',
      examId: data.exam?._id,
      grade: data.totalMarks,
      feedback: `Completed ${
        data.submissions.filter((s) => s.verdict === 'Accepted').length
      } out of ${data.submissions.length} questions`,
      status: 'graded',
      submittedAt: data.submitted_at,
      submissions: data.submissions,
    }));

    return res.json({
      success: true,
      data: {
        examResults,
        codingResults,
      },
    });
  } catch (error) {
    console.error('Error fetching student results:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching results',
    });
  }
});

/* =========================================================================
   GET /api/nextgen/student/results/exam/:id
   Protected - Get detailed exam result
   ======================================================================= */
router.get('/exam/:id', studentAuth, async (req, res) => {
  try {
    const studentId = req.student._id;
    const submissionId = req.params.id;

    const submission = await NGSubmissionExams.findOne({
      _id: submissionId,
      student_id: studentId,
    })
      .populate('exam_id')
      .lean();

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }

    return res.json({
      success: true,
      data: submission,
    });
  } catch (error) {
    console.error('Error fetching exam result:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching exam result',
    });
  }
});

/* =========================================================================
   GET /api/nextgen/student/results/coding-exam/:examId
   Protected - Get detailed coding exam result
   ======================================================================= */
router.get('/coding-exam/:examId', studentAuth, async (req, res) => {
  try {
    const studentId = req.student._id;
    const examId = req.params.examId;

    const submissions = await NGSubmissionCodingExams.find({
      exam_id: examId,
      student_id: studentId,
    })
      .populate('exam_id')
      .sort({ question_id: 1 })
      .lean();

    if (!submissions.length) {
      return res.status(404).json({
        success: false,
        message: 'Submissions not found',
      });
    }

    return res.json({
      success: true,
      data: {
        exam: submissions[0].exam_id,
        submissions,
      },
    });
  } catch (error) {
    console.error('Error fetching coding exam result:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching coding exam result',
    });
  }
});

export default router;
