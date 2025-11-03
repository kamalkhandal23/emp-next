import Result from '../models/education/resultModel.js';
import Exam from '../models/education/examModel.js';
import Student from '../models/education/studentModel.js';
import { sendEmail, emailTemplates } from '../config/email.js';
import mongoose from 'mongoose';
import Registration from "../models/nextgen/core/Registration.js";


//get all registrations
export const getAllRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find();
    res.status(200).json(registrations);
  } catch (error) {
    console.error("Error fetching registrations:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
// Get all results
export const getAllResults = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      student, 
      exam, 
      status,
      minScore,
      maxScore,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const query = {};
    if (student) query.student = student;
    if (exam) query.exam = exam;
    if (status) query.status = status;
    if (minScore || maxScore) {
      query['score.percentage'] = {};
      if (minScore) query['score.percentage'].$gte = parseFloat(minScore);
      if (maxScore) query['score.percentage'].$lte = parseFloat(maxScore);
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const results = await Result.find(query)
      .populate('student', 'firstName lastName studentId email')
      .populate('exam', 'title examId type course')
      .populate('exam.course', 'title courseCode')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sortOptions);

    const total = await Result.countDocuments(query);

    res.json({
      results,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching results', error: error.message });
  }
};

// Get result by ID
export const getResultById = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('student', 'firstName lastName studentId email')
      .populate('exam', 'title examId type course questions')
      .populate('exam.course', 'title courseCode')
      .populate('reviewedBy', 'firstName lastName email');

    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching result', error: error.message });
  }
};

// Get student's results
export const getStudentResults = async (req, res) => {
  try {
    const { page = 1, limit = 10, exam, status } = req.query;
    const studentId = req.params.studentId;

    const options = { examId: exam, status };
    const results = await Result.getStudentResults(studentId, options);

    const paginatedResults = results
      .slice((page - 1) * limit, page * limit);

    res.json({
      results: paginatedResults,
      totalPages: Math.ceil(results.length / limit),
      currentPage: page,
      total: results.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student results', error: error.message });
  }
};

// Get exam results
export const getExamResults = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, minScore, maxScore } = req.query;
    const examId = req.params.examId;

    const query = { exam: examId };
    if (status) query.status = status;
    if (minScore || maxScore) {
      query['score.percentage'] = {};
      if (minScore) query['score.percentage'].$gte = parseFloat(minScore);
      if (maxScore) query['score.percentage'].$lte = parseFloat(maxScore);
    }

    const results = await Result.find(query)
      .populate('student', 'firstName lastName studentId email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ 'score.percentage': -1, createdAt: -1 });

    const total = await Result.countDocuments(query);

    res.json({
      results,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exam results', error: error.message });
  }
};

// Update result (for manual grading)
export const updateResult = async (req, res) => {
  try {
    const { answers, reviewComments, status } = req.body;
    const resultId = req.params.id;

    const result = await Result.findById(resultId).populate('exam');
    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    // Update manually graded answers
    if (answers) {
      answers.forEach(updatedAnswer => {
        const answerIndex = result.answers.findIndex(
          a => a.questionId === updatedAnswer.questionId
        );
        if (answerIndex >= 0) {
          result.answers[answerIndex].isCorrect = updatedAnswer.isCorrect;
          result.answers[answerIndex].pointsEarned = updatedAnswer.pointsEarned;
        }
      });

      // Recalculate score
      await result.calculateScore(result.exam);
      await result.generateAnalytics(result.exam);
      await result.generateFeedback(result.exam);
    }

    // Update review information
    if (reviewComments) result.reviewComments = reviewComments;
    if (status) result.status = status;
    
    result.reviewedBy = req.user.id;
    result.reviewedAt = new Date();

    await result.save();

    // Update student's exam result
    const student = await Student.findById(result.student);
    const examResultIndex = student.examResults.findIndex(
      r => r.exam.toString() === result.exam._id.toString()
    );

    if (examResultIndex >= 0) {
      student.examResults[examResultIndex].score = result.score.raw;
      student.examResults[examResultIndex].grade = result.score.grade;
      await student.save();
    }

    // Send notification email if result is finalized
    if (status === 'graded') {
      const studentData = await Student.findById(result.student);
      if (studentData && studentData.email) {
        await sendEmail(
          studentData.email,
          `Exam Result Available - ${result.exam.title}`,
          `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Exam Result Available</h2>
              <p>Dear ${studentData.fullName},</p>
              <p>Your exam result for <strong>${result.exam.title}</strong> is now available.</p>
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Score:</strong> ${result.score.raw}/${result.exam.settings.totalPoints} (${result.score.percentage}%)</p>
                <p><strong>Grade:</strong> ${result.score.grade}</p>
                <p><strong>Status:</strong> ${result.score.passed ? 'Passed' : 'Failed'}</p>
              </div>
              <p>Please log in to your portal to view detailed results and feedback.</p>
              <p>Best regards,<br>Academic Team</p>
            </div>
          `
        );
      }
    }

    res.json({
      message: 'Result updated successfully',
      result: {
        id: result._id,
        score: result.score,
        status: result.status,
        reviewedAt: result.reviewedAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating result', error: error.message });
  }
};

// Delete result
export const deleteResult = async (req, res) => {
  try {
    const result = await Result.findByIdAndDelete(req.params.id);

    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    // Remove from student's exam results
    const student = await Student.findById(result.student);
    if (student) {
      student.examResults = student.examResults.filter(
        r => r.exam.toString() !== result.exam.toString()
      );
      await student.save();
    }

    res.json({ message: 'Result deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting result', error: error.message });
  }
};

// Get result analytics
export const getResultAnalytics = async (req, res) => {
  try {
    const resultId = req.params.id;
    
    const result = await Result.findById(resultId)
      .populate('exam', 'title questions settings')
      .populate('student', 'firstName lastName studentId');

    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    // Question-wise analysis
    const questionAnalysis = result.answers.map(answer => {
      const question = result.exam.questions.find(q => q.questionId === answer.questionId);
      return {
        questionId: answer.questionId,
        question: question ? question.question : 'Question not found',
        type: question ? question.type : 'unknown',
        difficulty: question ? question.difficulty : 'unknown',
        points: question ? question.points : 0,
        studentAnswer: answer.answer,
        correctAnswer: question ? question.correctAnswer : null,
        isCorrect: answer.isCorrect,
        pointsEarned: answer.pointsEarned,
        timeSpent: answer.timeSpent
      };
    });

    // Performance by difficulty
    const difficultyAnalysis = {
      easy: { total: 0, correct: 0, points: 0, earnedPoints: 0 },
      medium: { total: 0, correct: 0, points: 0, earnedPoints: 0 },
      hard: { total: 0, correct: 0, points: 0, earnedPoints: 0 }
    };

    questionAnalysis.forEach(qa => {
      if (difficultyAnalysis[qa.difficulty]) {
        difficultyAnalysis[qa.difficulty].total++;
        difficultyAnalysis[qa.difficulty].points += qa.points;
        difficultyAnalysis[qa.difficulty].earnedPoints += qa.pointsEarned;
        if (qa.isCorrect) {
          difficultyAnalysis[qa.difficulty].correct++;
        }
      }
    });

    // Calculate percentages
    Object.keys(difficultyAnalysis).forEach(difficulty => {
      const data = difficultyAnalysis[difficulty];
      data.accuracy = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
      data.scorePercentage = data.points > 0 ? Math.round((data.earnedPoints / data.points) * 100) : 0;
    });

    const analytics = {
      result: {
        id: result._id,
        resultId: result.resultId,
        student: result.student,
        exam: {
          id: result.exam._id,
          title: result.exam.title
        }
      },
      performance: {
        score: result.score,
        timeSpent: result.timeSpent,
        analytics: result.analytics,
        feedback: result.feedback
      },
      questionAnalysis,
      difficultyAnalysis,
      recommendations: result.feedback.recommendations
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching result analytics', error: error.message });
  }
};

// Generate certificate
export const generateCertificate = async (req, res) => {
  try {
    const resultId = req.params.id;
    
    const result = await Result.findById(resultId)
      .populate('student', 'firstName lastName studentId email')
      .populate('exam', 'title course')
      .populate('exam.course', 'title courseCode');

    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    if (!result.score.passed) {
      return res.status(400).json({ message: 'Certificate can only be generated for passed exams' });
    }

    if (result.certificate.issued) {
      return res.json({
        message: 'Certificate already issued',
        certificate: result.certificate
      });
    }

    // Generate certificate ID
    const certificateId = `CERT${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    // In a real application, you would generate an actual certificate PDF here
    // For now, we'll just create a certificate record
    result.certificate = {
      issued: true,
      certificateId,
      issuedAt: new Date(),
      certificateUrl: `/certificates/${certificateId}.pdf` // This would be the actual PDF URL
    };

    await result.save();

    // Send certificate email
    if (result.student.email) {
      await sendEmail(
        result.student.email,
        'Certificate of Completion',
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Congratulations!</h2>
            <p>Dear ${result.student.firstName} ${result.student.lastName},</p>
            <p>Congratulations on successfully completing <strong>${result.exam.title}</strong>!</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Certificate ID:</strong> ${certificateId}</p>
              <p><strong>Course:</strong> ${result.exam.course.title}</p>
              <p><strong>Score:</strong> ${result.score.percentage}%</p>
              <p><strong>Grade:</strong> ${result.score.grade}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            <p>Your certificate is attached to this email and can also be downloaded from your student portal.</p>
            <p>Best regards,<br>Academic Team</p>
          </div>
        `
      );
    }

    res.json({
      message: 'Certificate generated successfully',
      certificate: result.certificate
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating certificate', error: error.message });
  }
};

// Get results summary
export const getResultsSummary = async (req, res) => {
  try {
    const { period = '30', examId, studentId } = req.query;
    
    const dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - parseInt(period));

    const matchQuery = {
      createdAt: { $gte: dateFilter },
      status: 'completed'
    };

    if (examId) matchQuery.exam = mongoose.Types.ObjectId(examId);
    if (studentId) matchQuery.student = mongoose.Types.ObjectId(studentId);

    const summary = await Result.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalResults: { $sum: 1 },
          averageScore: { $avg: '$score.percentage' },
          highestScore: { $max: '$score.percentage' },
          lowestScore: { $min: '$score.percentage' },
          passCount: { $sum: { $cond: ['$score.passed', 1, 0] } },
          totalTimeSpent: { $sum: '$timeSpent' }
        }
      },
      {
        $addFields: {
          passRate: { $multiply: [{ $divide: ['$passCount', '$totalResults'] }, 100] },
          averageTimeSpent: { $divide: ['$totalTimeSpent', '$totalResults'] }
        }
      }
    ]);

    // Grade distribution
    const gradeDistribution = await Result.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$score.grade',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      summary: summary[0] || {
        totalResults: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        passCount: 0,
        passRate: 0,
        averageTimeSpent: 0
      },
      gradeDistribution: gradeDistribution.reduce((acc, grade) => {
        acc[grade._id] = grade.count;
        return acc;
      }, {}),
      period: `${period} days`
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching results summary', error: error.message });
  }
};

export default {
  getAllResults,
  getResultById,
  getStudentResults,
  getExamResults,
  updateResult,
  deleteResult,
  getResultAnalytics,
  generateCertificate,
  getResultsSummary
};