import Exam from '../models/education/examModel.js';
import Result from '../models/education/resultModel.js';
import Student from '../models/education/studentModel.js';
import NG_Courses from '../models/education/NG_Courses.js';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import addActivity from '../services/addActivityServiceImpl.js';

// Get all exams
export const getAllExams = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      course,
      type,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { examId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (course) query.course = course;
    if (type) query.type = type;
    if (status) query.status = status;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const exams = await Exam.find(query)
      .populate('course', 'title courseCode')
      .populate('createdBy', 'firstName lastName email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sortOptions);

    const total = await Exam.countDocuments(query);

    res.json({
      exams,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching exams', error: error.message });
  }
};

// Get exam by ID
export const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('course', 'title courseCode')
      .populate('createdBy', 'firstName lastName email')
      .populate('eligibility.students', 'firstName lastName studentId email');

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    res.json(exam);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching exam', error: error.message });
  }
};

// Create new exam
export const createExam = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Generate exam ID
    const examCount = await Exam.countDocuments();
    const examId = `EXM${String(examCount + 1).padStart(6, '0')}`;

    const examData = {
      ...req.body,
      examId,
      createdBy: req.user.id,
    };

    // Handle start time and end time if provided
    if (req.body.startTime && req.body.endTime) {
      examData.schedule = {
        startDate: new Date(req.body.startTime),
        endDate: new Date(req.body.endTime),
        timezone: req.body.timezone || 'UTC',
      };
    }

    const exam = new Exam(examData);
    await exam.save();

    res.status(201).json({
      message: 'Exam created successfully',
      exam: {
        id: exam._id,
        examId: exam.examId,
        title: exam.title,
        course: exam.course,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error creating exam', error: error.message });
  }
};

// Update exam
export const updateExam = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const examData = {
      ...req.body,
      lastModifiedBy: req.user.id,
    };

    const exam = await Exam.findByIdAndUpdate(req.params.id, examData, {
      new: true,
      runValidators: true,
    }).populate('course', 'title courseCode');

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    res.json({
      message: 'Exam updated successfully',
      exam,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error updating exam', error: error.message });
  }
};

// Delete exam
export const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Check if there are any results
    const resultCount = await Result.countDocuments({ exam: req.params.id });
    if (resultCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete exam with existing results',
        resultCount,
      });
    }

    await Exam.findByIdAndDelete(req.params.id);

    res.json({ message: 'Exam deleted successfully' });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error deleting exam', error: error.message });
  }
};

// Get exam for student (without answers)
export const getExamForStudent = async (req, res) => {
  try {
    const examId = req.params.id;
    const studentId = req.user.id;

    const exam = await Exam.findById(examId)
      .populate('course', 'title courseCode')
      .select(
        '-questions.correctAnswer -questions.options.isCorrect -questions.explanation'
      );

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Check if exam is active and student can take it
    if (!exam.canStudentTakeExam(studentId)) {
      return res
        .status(403)
        .json({ message: 'You are not eligible to take this exam' });
    }

    // Check previous attempts
    const previousAttempts = await Result.countDocuments({
      student: studentId,
      exam: examId,
    });

    if (previousAttempts >= exam.settings.attemptsAllowed) {
      return res.status(403).json({
        message: 'Maximum attempts exceeded',
        attemptsUsed: previousAttempts,
        attemptsAllowed: exam.settings.attemptsAllowed,
      });
    }

    // Randomize questions and options if enabled
    let questions = [...exam.questions];
    if (exam.settings.randomizeQuestions) {
      questions = questions.sort(() => Math.random() - 0.5);
    }

    if (exam.settings.randomizeOptions) {
      questions = questions.map((q) => ({
        ...q.toObject(),
        options: q.options ? q.options.sort(() => Math.random() - 0.5) : [],
      }));
    }

    res.json({
      exam: {
        id: exam._id,
        examId: exam.examId,
        title: exam.title,
        description: exam.description,
        course: exam.course,
        type: exam.type,
        settings: exam.settings,
        questions: questions.map((q) => ({
          questionId: q.questionId,
          type: q.type,
          question: q.question,
          options: q.options
            ? q.options.map((opt) => ({ text: opt.text }))
            : [],
          points: q.points,
        })),
      },
      attemptsUsed: previousAttempts,
      attemptsRemaining: exam.settings.attemptsAllowed - previousAttempts,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching exam', error: error.message });
  }
};

// Submit exam
export const submitExam = async (req, res) => {
  try {
    const examId = req.params.id;
    const studentId = req.user.id;
    const { answers, startTime, endTime } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Validate submission
    const timeSpent = Math.round(
      (new Date(endTime) - new Date(startTime)) / (1000 * 60)
    );
    if (timeSpent > exam.settings.duration + 5) {
      // 5 minute grace period
      return res.status(400).json({ message: 'Exam time exceeded' });
    }

    // Check attempts
    const attemptNumber =
      (await Result.countDocuments({
        student: studentId,
        exam: examId,
      })) + 1;

    if (attemptNumber > exam.settings.attemptsAllowed) {
      return res.status(403).json({ message: 'Maximum attempts exceeded' });
    }
    await addActivity(studentId, "exam_submission", `Submitted exam ${exam.title} `, {Date: new Date()});
    // Generate result ID
    const resultCount = await Result.countDocuments();
    const resultId = `RES${String(resultCount + 1).padStart(8, '0')}`;

    // Process answers
    const processedAnswers = answers.map((answer) => {
      const question = exam.questions.find(
        (q) => q.questionId === answer.questionId
      );
      let isCorrect = false;

      if (question) {
        switch (question.type) {
          case 'multiple-choice':
            const correctOption = question.options.find((opt) => opt.isCorrect);
            isCorrect = correctOption && correctOption.text === answer.answer;
            break;
          case 'true-false':
            isCorrect = question.correctAnswer === answer.answer;
            break;
          case 'short-answer':
            isCorrect =
              question.correctAnswer.toLowerCase().trim() ===
              answer.answer.toLowerCase().trim();
            break;
          default:
            isCorrect = false; // Manual grading required
        }
      }

      return {
        ...answer,
        isCorrect,
        pointsEarned: isCorrect ? question.points : 0,
      };
    });

    // Create result
    const result = new Result({
      resultId,
      student: studentId,
      exam: examId,
      attempt: attemptNumber,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      timeSpent,
      answers: processedAnswers,
      status: 'completed',
    });

    await result.calculateScore(exam);
    await result.generateAnalytics(exam);
    await result.generateFeedback(exam);

    // Update student's exam results
    const student = await Student.findById(studentId);
    const existingResultIndex = student.examResults.findIndex(
      (r) => r.exam.toString() === examId
    );

    const examResult = {
      exam: examId,
      score: result.score.raw,
      grade: result.score.grade,
      dateTaken: new Date(),
      attempts: attemptNumber,
    };

    if (existingResultIndex >= 0) {
      student.examResults[existingResultIndex] = examResult;
    } else {
      student.examResults.push(examResult);
    }

    await student.save();

    res.json({
      message: 'Exam submitted successfully',
      result: {
        id: result._id,
        resultId: result.resultId,
        score: result.score,
        timeSpent: result.timeSpent,
        feedback: exam.settings.showResultsImmediately ? result.feedback : null,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error submitting exam', error: error.message });
  }
};

// Get exam statistics
export const getExamStatistics = async (req, res) => {
  try {
    const examId = req.params.id;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const stats = await Result.getExamStatistics(examId);

    // Get additional statistics
    const detailedStats = await Result.aggregate([
      {
        $match: { exam: mongoose.Types.ObjectId(examId), status: 'completed' },
      },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          uniqueStudents: { $addToSet: '$student' },
          averageScore: { $avg: '$score.percentage' },
          highestScore: { $max: '$score.percentage' },
          lowestScore: { $min: '$score.percentage' },
          averageTime: { $avg: '$timeSpent' },
          passCount: { $sum: { $cond: ['$score.passed', 1, 0] } },
        },
      },
      {
        $addFields: {
          uniqueStudentCount: { $size: '$uniqueStudents' },
          passRate: {
            $multiply: [{ $divide: ['$passCount', '$totalAttempts'] }, 100],
          },
        },
      },
    ]);

    const result = {
      exam: {
        id: exam._id,
        title: exam.title,
        examId: exam.examId,
        totalQuestions: exam.totalQuestions,
        totalPoints: exam.settings.totalPoints,
      },
      statistics: detailedStats[0] || {
        totalAttempts: 0,
        uniqueStudentCount: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        averageTime: 0,
        passCount: 0,
        passRate: 0,
      },
    };

    res.json(result);
  } catch (error) {
    res
      .status(500)
      .json({
        message: 'Error fetching exam statistics',
        error: error.message,
      });
  }
};

// Update exam status
export const updateExamStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const examId = req.params.id;

    const exam = await Exam.findByIdAndUpdate(
      examId,
      { status, lastModifiedBy: req.user.id },
      { new: true, runValidators: true }
    );

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    res.json({
      message: 'Exam status updated successfully',
      exam: {
        id: exam._id,
        title: exam.title,
        status: exam.status,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error updating exam status', error: error.message });
  }
};

export default {
  getAllExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  getExamForStudent,
  submitExam,
  getExamStatistics,
  updateExamStatus,
};
