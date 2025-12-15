import NGCodingExamWithQuestions from '../../models/nextgen/education/NGCodingExamWithQuestions.js';
import NGSubmissionCodingExams from '../../models/nextgen/education/NGSubmissionCodingExams.js';
import { executeCodeMultipleTests } from '../../services/codeExecutionService.js';
import User from '../../models/core/User.js';
import NG_Approved_Students from '../../models/nextgen/core/NG_ApprovedStudents.js';
import addActivity from '../../services/addActivityServiceImpl.js';


// Ensure NGCodingExamWithQuestions is imported here
// import NGCodingExamWithQuestions from '../models/NGCodingExamWithQuestions'; 

export const createCodingExam = async (req, res) => {
    try {
        // 1. Destructure the new required fields (startTime, endTime) from the request body
        const { 
            examName, 
            courseName, 
            totalQuestions, 
            questionData, 
            courseId,
            startTime, // <--- ADDED
            endTime    // <--- ADDED
        } = req.body;

        // 2. Add validation for the new required fields
        if (!examName || !courseId || !totalQuestions || !questionData || !courseName || !startTime || !endTime) {
            return res.status(400).json({
                success: false,
                message:
                    'Missing required fields: examName, courseName, totalQuestions, questionData, startTime, and endTime are required.',
            });
        }
        
        // Input trimming and basic validation (existing logic retained)
        if (examName.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Exam name cannot be empty',
            });
        }

        if (courseName.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Course name cannot be empty',
            });
        }

        // Validate time sequence
        if (new Date(startTime) >= new Date(endTime)) {
            return res.status(400).json({
                success: false,
                message: 'Exam end time must be after the start time.',
            });
        }

        // Check for existing exam (existing logic retained)
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

        // Question count validation (existing logic retained)
        const questionCount = Object.keys(questionData).length;
        if (questionCount !== parseInt(totalQuestions)) {
            return res.status(400).json({
                success: false,
                message: `Question count mismatch. Expected ${totalQuestions} questions but received ${questionCount}`,
            });
        }

        // Detailed question validation (existing logic retained)
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

        // 3. Pass startTime and endTime to the creation method
        const exam = await NGCodingExamWithQuestions.createFromFrontend(
            examName.trim(),
            courseName.trim(),
            courseId,
            parseInt(totalQuestions),
            questionData,
            startTime, // <--- PASSED
            endTime    // <--- PASSED
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
                startTime: exam.startTime, // Optional: return times in response
                endTime: exam.endTime,     // Optional: return times in response
                createdAt: exam.createdAt,
            },
        });
    } catch (error) {
        console.error('Error creating coding exam:', error);

        // Handle Mongoose Validation Errors (which includes the missing startTime/endTime error)
        if (error.name === 'ValidationError') {
             // Extract specific required field messages if needed, or use a generic one
             return res.status(400).json({
                success: false,
                message: 'Validation failed on required fields (e.g., startTime, endTime). Check your request data.',
                errors: error.errors
            });
        }
        
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


// helper: verdict mapping (MODEL SAFE)
const mapVerdict = (result) => {
  if (result.compilationError) return "Compilation Error";
  if (result.runtimeError) return "Runtime Error";
  if (result.timeLimitExceeded) return "Time Limit Exceeded";
  if (result.memoryLimitExceeded) return "Memory Limit Exceeded";

  if (result.passedCount === result.totalTests && result.totalTests > 0) {
    return "Accepted";
  }

  return "Wrong Answer";
};

// Submit coding exam (FINAL FIXED)
export const submitCodingExam = async (req, res) => {
  try {
    const { examId, submissions } = req.body;

    const studentId =
      req.user?.userId || req.user?.id || req.user?._id;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Student not authenticated",
      });
    }

    if (!examId || !Array.isArray(submissions)) {
      return res.status(400).json({
        success: false,
        message: "examId and submissions array are required",
      });
    }

    const exam = await NGCodingExamWithQuestions.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Coding exam not found",
      });
    }

    const results = [];
    let totalMarks = 0;
    const maxMarksPerQuestion = 100 / exam.totalQuestions;

    for (const submission of submissions) {
      const { questionId, code, language } = submission;

      if (!questionId || !code || !language) {
        return res.status(400).json({
          success: false,
          message: "Invalid submission payload",
        });
      }

      const question = exam.questions.get(questionId);
      if (!question) {
        return res.status(404).json({
          success: false,
          message: `Question ${questionId} not found`,
        });
      }

      // ✅ SAFE FALLBACK FOR HIDDEN TESTS
      const hiddenInputs =
        question.hiddenInputs?.length > 0
          ? question.hiddenInputs
          : question.sampleInputs;

      const hiddenOutputs =
        question.hiddenOutputs?.length > 0
          ? question.hiddenOutputs
          : question.sampleOutputs;

      const result = await executeCodeMultipleTests(
        code,
        language,
        hiddenInputs,
        hiddenOutputs,
        true
      );

      // ✅ SAFE MARKS CALCULATION
      const marks =
        result.totalTests > 0
          ? (result.passedCount / result.totalTests) * maxMarksPerQuestion
          : 0;

      totalMarks += marks;

      const verdict = mapVerdict(result);
      const firstResult = result.results?.[0] || {};

      // ✅ UPSERT (NO DUPLICATE KEY ERROR)
      await NGSubmissionCodingExams.findOneAndUpdate(
        {
          exam_id: examId,
          student_id: studentId,
          question_id: questionId,
        },
        {
          exam_id: examId,
          student_id: studentId,
          question_id: questionId,
          code,
          language,
          verdict,
          marks: Math.round(marks),
          executionTime: firstResult.executionTime || "0.00s",
          memory: firstResult.memory || "0MB",
          output: firstResult.output || "",
          error: firstResult.error || "",
          submitted_at: new Date(),
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      results.push({
        questionId,
        verdict,
        marks: Math.round(marks),
        passedTests: result.passedCount,
        totalTests: result.totalTests,
        successRate: result.successRate,
      });
    }
    await addActivity(studentId, "Coding Exam ", `Completed ${exam.examName} - marks: ${totalMarks}`, {Date: new Date()});
    const student = await NG_Approved_Students.findById(studentId);
    if (student) {
  // 👉 Check if assignment already exists
          student.leaderboardValue.score += 20;
          // 👉 Add new assignment     
        
        await student.save();
      }
        
    return res.json({
      success: true,
      message: "Coding exam submitted successfully",
      data: {
        totalMarks: Math.round(totalMarks),
        results,
      },
    });
  } catch (error) {
    console.error("❌ Error submitting coding exam:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit coding exam",
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
// NOTE: You must uncomment and ensure these imports are correct in your file
// import NGManager from '../models/ngManagerModel'; 
// import NGCodingExamWithQuestions from '../models/NGCodingExamWithQuestions';
// import NGSubmissionCodingExams from '../models/ngSubmissionCodingExamsModel'; // Assuming this is your submission model

export const getAllSubmissions = async (req, res) => {
    try {
        console.log('📊 Fetching coding exam submissions for assigned courses...');
        
        // 1. Get the authenticated Course Manager's MongoDB ID
        // 🛑 IMPORTANT: Confirm req.user.id is the correct path for the manager's MongoDB ID
        const courseManagerMongoId = req.user.id; 

        // --- STEP 1: Find the courses assigned to the manager ---
        
        const manager = await User.findById(courseManagerMongoId)
            .select('assignedCourses')
            .lean();

        if (!manager || manager.assignedCourses.length === 0) {
            console.log(`⚠️ Manager ${courseManagerMongoId} found but has no assigned courses.`);
            return res.json({ success: true, data: [], count: 0 });
        }

        // Extract the list of Course IDs assigned to the manager
        const managedCourseIds = manager.assignedCourses;

        // --- STEP 2: Find all Exams associated with these Course IDs ---

        const managedExams = await NGCodingExamWithQuestions.find({
            courseId: { $in: managedCourseIds }
        }).select('_id').lean();
        
        const managedExamIds = managedExams.map(exam => exam._id);

        if (managedExamIds.length === 0) {
            console.log(`⚠️ No exams found for the assigned courses.`);
            return res.json({ success: true, data: [], count: 0 });
        }

        // --- STEP 3: Filter the Submissions by the managed Exam IDs and Populate Course Title ---

        const submissionFilter = {
            exam_id: { $in: managedExamIds }
        };

        const submissions = await NGSubmissionCodingExams.find(submissionFilter)
            .populate({
                path: 'student_id',
                select: 'fullName  email student_id',
            })
            // Use nested populate to get the Course Title for the frontend
            .populate({
                path: 'exam_id',
                select: 'examName courseId totalQuestions status',
                populate: {
                    path: 'courseId', // The field in the exam schema
                    model: 'Ng_Courses', // Assuming this is your Course model name
                    select: 'title', // Fetch the 'title' field (which acts as courseName)
                }
            })
            .sort({ submitted_at: -1 })
            .lean();

        console.log(`✅ Found ${submissions.length} submissions for assigned courses.`);

        // --- STEP 4: Format and Validation ---
        
        const validSubmissions = submissions.filter((sub) => {
            if (!sub.exam_id || !sub.student_id) {
                console.warn(`⚠️ Submission ${sub._id} has incomplete data.`);
                return false;
            }
            return true;
        }).map(sub => {
            // Map the Course Title to the 'courseName' property expected by the frontend
            const exam = sub.exam_id;
            return {
                ...sub,
                exam_id: {
                    ...exam,
                    // Inject the course title as 'courseName' for frontend compatibility
                    courseName: exam.courseId ? exam.courseId.title : 'N/A',
                }
            };
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
