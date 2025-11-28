import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export default function Exam() {
  const [searchParams] = useSearchParams();
  const examId = searchParams.get('examId'); // /nextgen/exam?examId=...

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds
  const [examStarted, setExamStarted] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [examStartTime, setExamStartTime] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // New states for time-based validation
  const [examAvailability, setExamAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(true);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  // ---- Student info (localStorage se) ----
  const getStudentData = () => {
    const studentInfo = localStorage.getItem('studentInfo');
    return studentInfo ? JSON.parse(studentInfo) : null;
  };

  const studentData = getStudentData();
  const studentId = studentData?._id || studentData?.id || null;

  // Mock exam data (abhi backend se questions nahi aa rahe, sirf submission jaa raha hai)
  const examData = {
    title: 'React Fundamentals Assessment',
    course: 'Full Stack Development',
    duration: '60 minutes',
    totalQuestions: 10,
    passingScore: 70,
    instructions: [
      'Read each question carefully before answering',
      'You can navigate between questions using the navigation panel',
      'Make sure to save your answers before submitting',
      'You cannot change answers after submission',
      'Ensure stable internet connection throughout the exam',
    ],
  };

  const questions = [
    {
      id: 1,
      type: 'multiple-choice',
      question: 'What is React?',
      options: [
        'A JavaScript library for building user interfaces',
        'A database management system',
        'A server-side programming language',
        'A CSS framework',
      ],
      correctAnswer: 0,
    },
    {
      id: 2,
      type: 'multiple-choice',
      question: 'Which method is used to create components in React?',
      options: [
        'React.createComponent()',
        'React.createElement()',
        'React.component()',
        'React.makeComponent()',
      ],
      correctAnswer: 1,
    },
    {
      id: 3,
      type: 'multiple-choice',
      question: 'What is JSX?',
      options: [
        'A JavaScript extension',
        'A syntax extension for JavaScript',
        'A new programming language',
        'A CSS preprocessor',
      ],
      correctAnswer: 1,
    },
    {
      id: 4,
      type: 'text',
      question:
        'Explain the difference between state and props in React. (Write your answer in 2-3 sentences)',
      correctAnswer:
        'State is internal component data that can change, while props are external data passed from parent components and are read-only.',
    },
    {
      id: 5,
      type: 'multiple-choice',
      question: 'Which hook is used to manage state in functional components?',
      options: ['useEffect', 'useState', 'useContext', 'useReducer'],
      correctAnswer: 1,
    },
    {
      id: 6,
      type: 'code',
      question:
        'Complete the following React component to display "Hello, World!":\n\nfunction HelloWorld() {\n  return (\n    // Your code here\n  );\n}',
      correctAnswer: '<div>Hello, World!</div>',
    },
    {
      id: 7,
      type: 'multiple-choice',
      question: 'What is the virtual DOM?',
      options: [
        'A copy of the real DOM kept in memory',
        'A new type of HTML element',
        'A JavaScript framework',
        'A CSS technique',
      ],
      correctAnswer: 0,
    },
    {
      id: 8,
      type: 'multiple-choice',
      question:
        'Which lifecycle method is called after a component is mounted?',
      options: [
        'componentWillMount',
        'componentDidMount',
        'componentWillUpdate',
        'componentDidUpdate',
      ],
      correctAnswer: 1,
    },
    {
      id: 9,
      type: 'text',
      question:
        'What are the benefits of using React? List at least 3 benefits.',
      correctAnswer:
        'Component reusability, virtual DOM for performance, large ecosystem, easy to learn',
    },
    {
      id: 10,
      type: 'multiple-choice',
      question:
        'How do you pass data from a parent component to a child component?',
      options: ['Using state', 'Using props', 'Using context', 'Using refs'],
      correctAnswer: 1,
    },
  ];

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleStartExam = () => {
    setExamStarted(true);
    setExamStartTime(new Date().toISOString());

    // Set timer based on exam availability data
    if (examAvailability && examAvailability.timeRemaining) {
      setTimeLeft(examAvailability.timeRemaining);
    }
  };

  // Check exam availability on component mount
  useEffect(() => {
    if (!examId) {
      setCheckingAvailability(false);
      return;
    }

    const checkAvailability = async () => {
      try {
        const baseUrl =
          import.meta.env.VITE_API_URL || 'http://localhost:5002/api';
        const response = await fetch(
          `${baseUrl}/nextgen/exams/${examId}/availability`
        );
        const data = await response.json();

        if (data.success) {
          setExamAvailability(data.data);
        }
      } catch (error) {
        console.error('Error checking exam availability:', error);
      } finally {
        setCheckingAvailability(false);
      }
    };

    checkAvailability();
  }, [examId]);

  // Timer effect with auto-submit
  useEffect(() => {
    if (examStarted && !examSubmitted && timeLeft > 0) {
      // Show warnings
      if (timeLeft === 300 && !showTimeWarning) {
        setWarningMessage('⏰ 5 minutes remaining!');
        setShowTimeWarning(true);
        setTimeout(() => setShowTimeWarning(false), 5000);
      }

      if (timeLeft === 60 && !showTimeWarning) {
        setWarningMessage('⚠️ 1 minute remaining!');
        setShowTimeWarning(true);
        setTimeout(() => setShowTimeWarning(false), 5000);
      }

      const timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }

    // Auto-submit when time expires
    if (examStarted && !examSubmitted && timeLeft === 0) {
      alert('⏰ Time is up! Your exam will be submitted automatically.');
      handleSubmitExam();
    }
  }, [examStarted, examSubmitted, timeLeft, showTimeWarning]);

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((question) => {
      if (question.type === 'multiple-choice') {
        if (answers[question.id] === question.correctAnswer) {
          correct++;
        }
      } else {
        // For text and code questions, we'll assume they're correct for demo
        if (answers[question.id] && answers[question.id].trim().length > 10) {
          correct++;
        }
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  // ---- Exam submit: backend call to ng_submission_exams ----
  async function handleSubmitExam() {
    try {
      if (isSubmitting || examSubmitted) return;

      if (!examId) {
        alert('Exam ID missing in URL.');
        return;
      }

      if (!studentId) {
        alert('Student not logged in. Please login again.');
        return;
      }

      setIsSubmitting(true);
      setSubmitError(null);

      const score = calculateScore();

      const baseUrl =
        import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

      const res = await fetch(
        `${baseUrl}/nextgen/student/exams/${examId}/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`,
          },
          body: JSON.stringify({
            studentId,
            answers,
            score,
            startedAt: examStartTime,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit exam');
      }

      // Success
      setExamSubmitted(true);
      setShowConfirmSubmit(false);
    } catch (err) {
      console.error('Error submitting exam:', err);
      setSubmitError(err.message || 'Failed to submit exam');
      alert(err.message || 'Failed to submit exam');
    } finally {
      setIsSubmitting(false);
    }
  }

  // ---- Result screen ----
  if (examSubmitted) {
    const score = calculateScore();
    const passed = score >= examData.passingScore;

    return (
      <div
        className='container'
        style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            textAlign: 'center',
          }}>
          <div
            className='service-card'
            style={{
              background: passed
                ? 'linear-gradient(135deg, #dcfce7, #bbf7d0)'
                : 'linear-gradient(135deg, #fef2f2, #fecaca)',
              border: passed ? '2px solid #22c55e' : '2px solid #ef4444',
              padding: '3rem 2rem',
            }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
              {passed ? '🎉' : '📚'}
            </div>
            <h1
              style={{
                color: passed ? '#15803d' : '#dc2626',
                marginBottom: '1rem',
              }}>
              Exam {passed ? 'Completed Successfully!' : 'Completed'}
            </h1>

            <div
              style={{
                background: 'white',
                borderRadius: '0.75rem',
                padding: '2rem',
                marginBottom: '2rem',
              }}>
              <h2 style={{ color: '#374151', marginBottom: '1.5rem' }}>
                Your Results
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                }}>
                <div>
                  <div
                    style={{
                      fontSize: '2rem',
                      fontWeight: '700',
                      color: passed ? '#22c55e' : '#ef4444',
                    }}>
                    {score}%
                  </div>
                  <div
                    style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                    }}>
                    Final Score
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '2rem',
                      fontWeight: '700',
                      color: '#3b82f6',
                    }}>
                    {getAnsweredCount()}/{questions.length}
                  </div>
                  <div
                    style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                    }}>
                    Questions Answered
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: '1rem',
                  background: passed ? '#f0fdf4' : '#fef2f2',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem',
                }}>
                <div
                  style={{
                    fontWeight: '600',
                    color: passed ? '#15803d' : '#dc2626',
                    marginBottom: '0.5rem',
                  }}>
                  {passed
                    ? 'Congratulations! You passed the exam.'
                    : 'You need to retake the exam.'}
                </div>
                <div
                  style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                  }}>
                  Passing score: {examData.passingScore}% • Your score: {score}%
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}>
              <Link to='/nextgen/results' className='btn-primary'>
                View Detailed Results
              </Link>
              {!passed && (
                <button
                  onClick={() => {
                    setExamSubmitted(false);
                    setExamStarted(false);
                    setAnswers({});
                    setCurrentQuestion(0);
                    setTimeLeft(3600);
                    setExamStartTime(null);
                    setSubmitError(null);
                  }}
                  className='btn-secondary'>
                  Retake Exam
                </button>
              )}
              <Link to='/nextgen/login' className='btn-outline'>
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---- Pre-exam instructions ----
  if (!examStarted) {
    // Show loading while checking availability
    if (checkingAvailability) {
      return (
        <div
          className='container'
          style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
          <div
            style={{
              maxWidth: '600px',
              margin: '0 auto',
              textAlign: 'center',
            }}>
            <div className='service-card'>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
              <h2>Checking Exam Availability...</h2>
              <p style={{ color: '#6b7280' }}>
                Please wait while we verify exam access.
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Show exam not started message
    if (examAvailability && examAvailability.status === 'not-started') {
      const startDate = new Date(examAvailability.startTime);
      const hours = Math.floor(examAvailability.timeUntilStart / 3600);
      const minutes = Math.floor((examAvailability.timeUntilStart % 3600) / 60);

      return (
        <div
          className='container'
          style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
          <div
            style={{
              maxWidth: '600px',
              margin: '0 auto',
              textAlign: 'center',
            }}>
            <div
              className='service-card'
              style={{ border: '2px solid #f59e0b' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏰</div>
              <h2 style={{ color: '#d97706' }}>Exam Has Not Started Yet</h2>
              <p style={{ color: '#6b7280', margin: '1.5rem 0' }}>
                This exam will be available starting:
              </p>
              <div
                style={{
                  background: '#fef3c7',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem',
                  color: '#92400e',
                  fontWeight: '600',
                }}>
                {startDate.toLocaleString()}
              </div>
              <p style={{ color: '#6b7280' }}>
                Time remaining: {hours > 0 && `${hours}h `}
                {minutes}m
              </p>
              <Link
                to='/nextgen/login'
                className='btn-primary'
                style={{ marginTop: '2rem' }}>
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      );
    }

    // Show exam ended message
    if (examAvailability && examAvailability.status === 'ended') {
      const endDate = new Date(examAvailability.endTime);

      return (
        <div
          className='container'
          style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
          <div
            style={{
              maxWidth: '600px',
              margin: '0 auto',
              textAlign: 'center',
            }}>
            <div
              className='service-card'
              style={{ border: '2px solid #ef4444' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
              <h2 style={{ color: '#dc2626' }}>Exam Has Ended</h2>
              <p style={{ color: '#6b7280', margin: '1.5rem 0' }}>
                This exam ended on:
              </p>
              <div
                style={{
                  background: '#fef2f2',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem',
                  color: '#991b1b',
                  fontWeight: '600',
                }}>
                {endDate.toLocaleString()}
              </div>
              <p style={{ color: '#6b7280' }}>
                No more submissions are allowed for this exam.
              </p>
              <Link
                to='/nextgen/login'
                className='btn-primary'
                style={{ marginTop: '2rem' }}>
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className='container'
        style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Exam Header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
            <h1
              style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '0.5rem',
              }}>
              {examData.title}
            </h1>
            <p
              style={{
                color: '#6b7280',
                fontSize: '1.125rem',
              }}>
              {examData.course} • {examData.duration} •{' '}
              {examData.totalQuestions} Questions
            </p>
          </div>

          <div
            className='services-grid'
            style={{ gridTemplateColumns: '2fr 1fr' }}>
            {/* Instructions */}
            <div className='service-card'>
              <h2 className='service-title'>Exam Instructions</h2>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: '1.5rem',
                  lineHeight: '1.8',
                }}>
                {examData.instructions.map((instruction, index) => (
                  <li
                    key={index}
                    style={{ marginBottom: '0.75rem', color: '#374151' }}>
                    {instruction}
                  </li>
                ))}
              </ul>

              <div
                style={{
                  background: '#fef3c7',
                  border: '1px solid #f59e0b',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  marginTop: '1.5rem',
                }}>
                <div
                  style={{
                    fontWeight: '600',
                    color: '#92400e',
                    marginBottom: '0.5rem',
                  }}>
                  ⚠️ Important Notice
                </div>
                <div
                  style={{
                    fontSize: '0.875rem',
                    color: '#78350f',
                  }}>
                  Once you start the exam, the timer will begin and cannot be
                  paused. Make sure you have a stable internet connection and
                  enough time to complete the exam.
                </div>
              </div>
            </div>

            {/* Exam Details */}
            <div className='service-card'>
              <h3 className='service-title'>Exam Details</h3>
              <div style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
                <div
                  style={{
                    marginBottom: '0.75rem',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid #f3f4f6',
                  }}>
                  <div
                    style={{
                      fontWeight: '600',
                      color: '#374151',
                    }}>
                    Duration
                  </div>
                  <div style={{ color: '#6b7280' }}>{examData.duration}</div>
                </div>
                <div
                  style={{
                    marginBottom: '0.75rem',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid #f3f4f6',
                  }}>
                  <div
                    style={{
                      fontWeight: '600',
                      color: '#374151',
                    }}>
                    Total Questions
                  </div>
                  <div style={{ color: '#6b7280' }}>
                    {examData.totalQuestions}
                  </div>
                </div>
                <div
                  style={{
                    marginBottom: '0.75rem',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid #f3f4f6',
                  }}>
                  <div
                    style={{
                      fontWeight: '600',
                      color: '#374151',
                    }}>
                    Passing Score
                  </div>
                  <div style={{ color: '#6b7280' }}>
                    {examData.passingScore}%
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: '600',
                      color: '#374151',
                    }}>
                    Question Types
                  </div>
                  <div style={{ color: '#6b7280' }}>
                    Multiple Choice, Text, Code
                  </div>
                </div>
              </div>

              <button
                onClick={handleStartExam}
                className='btn-primary'
                style={{ width: '100%', marginTop: '1.5rem' }}>
                Start Exam
              </button>
            </div>
          </div>

          {/* Help Section */}
          <div
            style={{
              textAlign: 'center',
              marginTop: '3rem',
              padding: '2rem',
              background: '#f8fafc',
              borderRadius: '0.75rem',
            }}>
            <h3 style={{ color: '#374151', marginBottom: '1rem' }}>
              Need Help?
            </h3>
            <p
              style={{
                color: '#6b7280',
                marginBottom: '1rem',
              }}>
              If you encounter any technical issues during the exam, contact
              support immediately.
            </p>
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}>
              <a
                href='mailto:support@nextgenfreeedu.com'
                className='btn-outline'>
                Contact Support
              </a>
              <Link to='/nextgen/login' className='btn-outline'>
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---- Live exam screen ----
  const currentQ = questions[currentQuestion];

  return (
    <div
      className='container'
      style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Time Warning Banner */}
        {showTimeWarning && (
          <div
            style={{
              position: 'fixed',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
              background: timeLeft <= 60 ? '#dc2626' : '#f59e0b',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '0.5rem',
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
              fontSize: '1.125rem',
              fontWeight: '600',
              animation: 'pulse 1s ease-in-out infinite',
            }}>
            {warningMessage}
          </div>
        )}

        {/* Exam Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            padding: '1rem',
            background: 'white',
            borderRadius: '0.75rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '1.5rem',
                color: '#374151',
              }}>
              {examData.title}
            </h1>
            <p
              style={{
                margin: '0.25rem 0 0 0',
                color: '#6b7280',
                fontSize: '0.875rem',
              }}>
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: timeLeft < 600 ? '#ef4444' : '#374151',
                marginBottom: '0.25rem',
              }}>
              {formatTime(timeLeft)}
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                color: '#6b7280',
              }}>
              Time Remaining
            </div>
          </div>
        </div>

        {submitError && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.75rem',
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              color: '#b91c1c',
              fontSize: '0.875rem',
            }}>
            {submitError}
          </div>
        )}

        <div
          className='services-grid'
          style={{ gridTemplateColumns: '3fr 1fr' }}>
          {/* Question Area */}
          <div className='service-card' style={{ height: 'fit-content' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div
                style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  marginBottom: '0.5rem',
                }}>
                Question {currentQuestion + 1} of {questions.length}
              </div>
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#374151',
                  lineHeight: '1.6',
                  marginBottom: '1.5rem',
                }}>
                {currentQ.question}
              </h2>
            </div>

            {/* Answer Options */}
            {currentQ.type === 'multiple-choice' && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}>
                {currentQ.options.map((option, index) => (
                  <label
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '1rem',
                      border:
                        answers[currentQ.id] === index
                          ? '2px solid #3b82f6'
                          : '2px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      background:
                        answers[currentQ.id] === index ? '#f0f9ff' : 'white',
                      transition: 'all 0.2s ease',
                    }}>
                    <input
                      type='radio'
                      name={`question-${currentQ.id}`}
                      value={index}
                      checked={answers[currentQ.id] === index}
                      onChange={() => handleAnswerChange(currentQ.id, index)}
                    />
                    <span style={{ flex: 1 }}>{option}</span>
                  </label>
                ))}
              </div>
            )}

            {(currentQ.type === 'text' || currentQ.type === 'code') && (
              <textarea
                value={answers[currentQ.id] || ''}
                onChange={(e) =>
                  handleAnswerChange(currentQ.id, e.target.value)
                }
                rows={currentQ.type === 'code' ? 8 : 4}
                className='form-input'
                placeholder={
                  currentQ.type === 'code'
                    ? 'Write your code here...'
                    : 'Write your answer here...'
                }
                style={{
                  fontFamily:
                    currentQ.type === 'code' ? 'monospace' : 'inherit',
                  fontSize: currentQ.type === 'code' ? '0.875rem' : '1rem',
                }}
              />
            )}

            {/* Navigation Buttons */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '2rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid #e5e7eb',
              }}>
              <button
                onClick={() =>
                  setCurrentQuestion(Math.max(0, currentQuestion - 1))
                }
                disabled={currentQuestion === 0}
                className='btn-secondary'
                style={{
                  opacity: currentQuestion === 0 ? 0.5 : 1,
                  cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
                }}>
                Previous
              </button>

              {currentQuestion === questions.length - 1 ? (
                <button
                  onClick={() => setShowConfirmSubmit(true)}
                  className='btn-primary'
                  style={{
                    background: '#22c55e',
                    opacity: isSubmitting ? 0.7 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  }}
                  disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Exam'}
                </button>
              ) : (
                <button
                  onClick={() =>
                    setCurrentQuestion(
                      Math.min(questions.length - 1, currentQuestion + 1)
                    )
                  }
                  className='btn-primary'>
                  Next
                </button>
              )}
            </div>
          </div>

          {/* Question Navigation */}
          <div className='service-card' style={{ height: 'fit-content' }}>
            <h3 className='service-title'>Question Navigation</h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '0.5rem',
                marginBottom: '1.5rem',
              }}>
              {questions.map((q, index) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestion(index)}
                  style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '0.375rem',
                    border: '2px solid',
                    borderColor:
                      currentQuestion === index
                        ? '#3b82f6'
                        : answers[q.id] !== undefined
                        ? '#22c55e'
                        : '#e5e7eb',
                    background:
                      currentQuestion === index
                        ? '#3b82f6'
                        : answers[q.id] !== undefined
                        ? '#22c55e'
                        : 'white',
                    color:
                      currentQuestion === index || answers[q.id] !== undefined
                        ? 'white'
                        : '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}>
                  {index + 1}
                </button>
              ))}
            </div>

            <div
              style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                lineHeight: '1.6',
              }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ color: '#22c55e' }}>●</span> Answered (
                {getAnsweredCount()})
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ color: '#6b7280' }}>●</span> Not Answered (
                {questions.length - getAnsweredCount()})
              </div>
              <div>
                <span style={{ color: '#3b82f6' }}>●</span> Current Question
              </div>
            </div>
          </div>
        </div>

        {/* Submit Confirmation Modal */}
        {showConfirmSubmit && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}>
            <div
              className='service-card'
              style={{ maxWidth: '500px', margin: '1rem' }}>
              <h3 style={{ color: '#374151', marginBottom: '1rem' }}>
                Submit Exam?
              </h3>
              <p
                style={{
                  color: '#6b7280',
                  marginBottom: '1.5rem',
                }}>
                Are you sure you want to submit your exam? You have answered{' '}
                {getAnsweredCount()} out of {questions.length} questions. You
                cannot change your answers after submission.
              </p>
              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  justifyContent: 'flex-end',
                }}>
                <button
                  onClick={() => setShowConfirmSubmit(false)}
                  className='btn-secondary'>
                  Cancel
                </button>
                <button
                  onClick={handleSubmitExam}
                  className='btn-primary'
                  style={{
                    background: '#22c55e',
                    opacity: isSubmitting ? 0.7 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  }}
                  disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Yes, Submit Exam'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
