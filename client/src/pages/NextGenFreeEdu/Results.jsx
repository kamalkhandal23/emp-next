import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../../utils/api';
import StudentProfileNav from '../../components/StudentProfileNav';

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('exams');
  const [selectedResult, setSelectedResult] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [codingExamResult, setCodingExamResult] = useState(null);
  const [results, setResults] = useState([]);
  const [codingResults, setCodingResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detailedSubmission, setDetailedSubmission] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const studentInfo = localStorage.getItem('studentInfo');

    if (!authToken || !studentInfo) {
      console.warn('⚠️ No auth credentials found, redirecting to login');
      navigate('/nextgen/login', { replace: true });
      return;
    }
  }, [navigate]);

  // Fetch results from backend
  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching results...');
      console.log(
        '📦 Auth token in localStorage:',
        localStorage.getItem('authToken')?.substring(0, 20) + '...'
      );
      console.log('👤 Student info:', localStorage.getItem('studentInfo'));

      const response = await apiClient.getStudentResults();
      console.log('📥 Results response:', response);

      if (response.success) {
        setResults(response.data.examResults || []);
        setCodingResults(response.data.codingResults || []);
      } else {
        setError('Failed to fetch results');
      }
    } catch (err) {
      console.error('Error fetching results:', err);
      setError(err.message || 'Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  const fetchDetailedSubmission = async (submissionId) => {
    try {
      setLoadingDetails(true);
      const response = await apiClient.getExamResultDetail(submissionId);
      console.log('📄 Detailed submission response:', response);

      if (response.success) {
        setDetailedSubmission(response.data);
      }
    } catch (err) {
      console.error('Error fetching detailed submission:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Check for coding exam result from navigation state
  useEffect(() => {
    if (location.state?.codingExamResult) {
      setCodingExamResult(location.state.codingExamResult);
      setActiveTab('coding-exams');
      setSelectedResult('coding-exam');
    }
  }, [location.state]);

  const filteredResults = results.filter((result) => {
    if (filterStatus === 'all') return true;
    return result.status === filterStatus;
  });

  const filteredCodingResults = codingResults.filter((result) => {
    if (filterStatus === 'all') return true;
    return result.status === filterStatus;
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.submittedAt) - new Date(a.submittedAt);
      case 'score':
        return (b.grade || 0) - (a.grade || 0);
      case 'title':
        return a.examTitle.localeCompare(b.examTitle);
      default:
        return 0;
    }
  });

  const sortedCodingResults = [...filteredCodingResults].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.submittedAt) - new Date(a.submittedAt);
      case 'score':
        return (b.grade || 0) - (a.grade || 0);
      case 'title':
        return a.examTitle.localeCompare(b.examTitle);
      default:
        return 0;
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'graded':
        return { bg: '#dcfce7', color: '#15803d', border: '#22c55e' };
      case 'failed':
        return { bg: '#fef2f2', color: '#dc2626', border: '#ef4444' };
      case 'pending':
      case 'submitted':
        return { bg: '#fef3c7', color: '#92400e', border: '#f59e0b' };
      default:
        return { bg: '#f3f4f6', color: '#374151', border: '#9ca3af' };
    }
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return '#22c55e';
    if (percentage >= 80) return '#3b82f6';
    if (percentage >= 70) return '#f59e0b';
    return '#ef4444';
  };

  if (selectedResult === 'coding-exam' && codingExamResult) {
    const result = {
      examTitle: location.state?.examName || 'Coding Exam',
      module: 'Coding Challenge',
      date: new Date().toISOString().split('T')[0],
      score: codingExamResult.totalMarks,
      maxScore: 100,
      percentage: codingExamResult.totalMarks,
      status: codingExamResult.totalMarks >= 50 ? 'passed' : 'failed',
      timeSpent: 'N/A',
      attempts: 1,
      feedback: `You passed ${
        codingExamResult.results.filter((r) => r.verdict === 'Accepted').length
      } out of ${codingExamResult.results.length} questions.`,
      questions: {
        total: codingExamResult.results.length,
        correct: codingExamResult.results.filter(
          (r) => r.verdict === 'Accepted'
        ).length,
        incorrect: codingExamResult.results.filter(
          (r) => r.verdict !== 'Accepted'
        ).length,
        skipped: 0,
      },
      topicWise: codingExamResult.results.map((r, index) => ({
        topic: `Question ${index + 1}`,
        score: r.marks,
      })),
    };
    const statusStyle = getStatusColor(result.status);

    return (
      <div
        className='container'
        style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem',
            }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '2rem', color: '#374151' }}>
                {result.examTitle}
              </h1>
              <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280' }}>
                {result.module} • {new Date(result.date).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedResult(null);
                setCodingExamResult(null);
              }}
              className='btn-secondary'>
              ← Back to Results
            </button>
          </div>

          {/* Score Overview */}
          <div
            className='services-grid'
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              marginBottom: '2rem',
            }}>
            <div className='service-card' style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '3rem',
                  fontWeight: '700',
                  color: getGradeColor(result.percentage),
                  marginBottom: '0.5rem',
                }}>
                {result.percentage}%
              </div>
              <div style={{ color: '#6b7280' }}>Final Score</div>
            </div>
            <div className='service-card' style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '3rem',
                  fontWeight: '700',
                  color: '#3b82f6',
                  marginBottom: '0.5rem',
                }}>
                {result.questions.correct}/{result.questions.total}
              </div>
              <div style={{ color: '#6b7280' }}>Questions Passed</div>
            </div>
            <div className='service-card' style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '3rem',
                  fontWeight: '700',
                  color: '#8b5cf6',
                  marginBottom: '0.5rem',
                }}>
                {Math.round(
                  (result.questions.correct / result.questions.total) * 100
                )}
                %
              </div>
              <div style={{ color: '#6b7280' }}>Success Rate</div>
            </div>
            <div className='service-card' style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '3rem',
                  fontWeight: '700',
                  color: '#f59e0b',
                  marginBottom: '0.5rem',
                }}>
                {result.attempts}
              </div>
              <div style={{ color: '#6b7280' }}>Attempts</div>
            </div>
          </div>

          <div
            className='services-grid'
            style={{ gridTemplateColumns: '2fr 1fr' }}>
            {/* Detailed Analysis */}
            <div>
              {/* Question Breakdown */}
              <div className='service-card' style={{ marginBottom: '2rem' }}>
                <h3 className='service-title'>Question Analysis</h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1rem',
                  }}>
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '1rem',
                      background: '#f0fdf4',
                      borderRadius: '0.5rem',
                    }}>
                    <div
                      style={{
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: '#22c55e',
                      }}>
                      {result.questions.correct}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#15803d' }}>
                      Passed
                    </div>
                  </div>
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '1rem',
                      background: '#fef2f2',
                      borderRadius: '0.5rem',
                    }}>
                    <div
                      style={{
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: '#ef4444',
                      }}>
                      {result.questions.incorrect}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#dc2626' }}>
                      Failed
                    </div>
                  </div>
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '1rem',
                      background: '#fef3c7',
                      borderRadius: '0.5rem',
                    }}>
                    <div
                      style={{
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: '#f59e0b',
                      }}>
                      {result.questions.skipped}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#92400e' }}>
                      Skipped
                    </div>
                  </div>
                </div>
              </div>

              {/* Question-wise Performance */}
              <div className='service-card' style={{ marginBottom: '2rem' }}>
                <h3 className='service-title'>Question-wise Performance</h3>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}>
                  {codingExamResult.results.map((questionResult, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '1rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        background:
                          questionResult.verdict === 'Accepted'
                            ? '#f0fdf4'
                            : '#fef2f2',
                      }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '0.5rem',
                        }}>
                        <span style={{ fontWeight: '500', color: '#374151' }}>
                          Question {index + 1}
                        </span>
                        <div
                          style={{
                            display: 'flex',
                            gap: '1rem',
                            alignItems: 'center',
                          }}>
                          <span
                            style={{
                              fontWeight: '600',
                              color:
                                questionResult.verdict === 'Accepted'
                                  ? '#22c55e'
                                  : '#ef4444',
                            }}>
                            {questionResult.verdict}
                          </span>
                          <span
                            style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            {questionResult.passedTests}/
                            {questionResult.totalTests} tests passed
                          </span>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        Execution Time: {questionResult.executionTime} | Memory:{' '}
                        {questionResult.memory}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructor Feedback */}
              <div className='service-card'>
                <h3 className='service-title'>Feedback</h3>
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    fontStyle: 'italic',
                    color: '#374151',
                    lineHeight: '1.6',
                  }}>
                  "{result.feedback}"
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div>
              {/* Status */}
              <div className='service-card' style={{ marginBottom: '2rem' }}>
                <h3 className='service-title'>Exam Status</h3>
                <div
                  style={{
                    background: statusStyle.bg,
                    border: `2px solid ${statusStyle.border}`,
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    textAlign: 'center',
                  }}>
                  <div
                    style={{
                      fontSize: '2rem',
                      marginBottom: '0.5rem',
                    }}>
                    {result.status === 'passed' ? '✅' : '❌'}
                  </div>
                  <div
                    style={{
                      fontWeight: '600',
                      color: statusStyle.color,
                      textTransform: 'capitalize',
                    }}>
                    {result.status}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className='service-card'>
                <h3 className='service-title'>Actions</h3>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}>
                  <Link to='/nextgen/coding-exams' className='btn-primary'>
                    Take Another Coding Exam
                  </Link>
                  <button className='btn-secondary'>
                    Download Certificate
                  </button>
                  <button className='btn-outline'>View Code Submissions</button>
                  <button className='btn-outline'>Share Result</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (
    selectedResult &&
    activeTab === 'coding-exams' &&
    selectedResult !== 'coding-exam'
  ) {
    const result = codingResults.find((r) => r.id === selectedResult);
    const statusStyle = getStatusColor(result.status);

    return (
      <div
        className='container'
        style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem',
            }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '2rem', color: '#374151' }}>
                {result.examTitle}
              </h1>
              <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280' }}>
                {result.module} • {new Date(result.date).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedResult(null);
                setCodingExamResult(null);
              }}
              className='btn-secondary'>
              ← Back to Results
            </button>
          </div>

          {/* Score Overview */}
          <div
            className='services-grid'
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              marginBottom: '2rem',
            }}>
            <div className='service-card' style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '3rem',
                  fontWeight: '700',
                  color: getGradeColor(result.percentage),
                  marginBottom: '0.5rem',
                }}>
                {result.percentage}%
              </div>
              <div style={{ color: '#6b7280' }}>Final Score</div>
            </div>
            <div className='service-card' style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '3rem',
                  fontWeight: '700',
                  color: '#3b82f6',
                  marginBottom: '0.5rem',
                }}>
                {result.questions.correct}/{result.questions.total}
              </div>
              <div style={{ color: '#6b7280' }}>Questions Passed</div>
            </div>
            <div className='service-card' style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '3rem',
                  fontWeight: '700',
                  color: '#8b5cf6',
                  marginBottom: '0.5rem',
                }}>
                {result.timeSpent}
              </div>
              <div style={{ color: '#6b7280' }}>Time Spent</div>
            </div>
            <div className='service-card' style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '3rem',
                  fontWeight: '700',
                  color: '#f59e0b',
                  marginBottom: '0.5rem',
                }}>
                {result.attempts}
              </div>
              <div style={{ color: '#6b7280' }}>Attempts</div>
            </div>
          </div>

          <div
            className='services-grid'
            style={{ gridTemplateColumns: '2fr 1fr' }}>
            {/* Detailed Analysis */}
            <div>
              {/* Question Breakdown */}
              <div className='service-card' style={{ marginBottom: '2rem' }}>
                <h3 className='service-title'>Question Analysis</h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1rem',
                  }}>
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '1rem',
                      background: '#f0fdf4',
                      borderRadius: '0.5rem',
                    }}>
                    <div
                      style={{
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: '#22c55e',
                      }}>
                      {result.questions.correct}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#15803d' }}>
                      Passed
                    </div>
                  </div>
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '1rem',
                      background: '#fef2f2',
                      borderRadius: '0.5rem',
                    }}>
                    <div
                      style={{
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: '#ef4444',
                      }}>
                      {result.questions.incorrect}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#dc2626' }}>
                      Failed
                    </div>
                  </div>
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '1rem',
                      background: '#fef3c7',
                      borderRadius: '0.5rem',
                    }}>
                    <div
                      style={{
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: '#f59e0b',
                      }}>
                      {result.questions.skipped}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#92400e' }}>
                      Skipped
                    </div>
                  </div>
                </div>
              </div>

              {/* Question-wise Performance */}
              <div className='service-card' style={{ marginBottom: '2rem' }}>
                <h3 className='service-title'>Question-wise Performance</h3>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}>
                  {result.results.map((questionResult, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '1rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        background:
                          questionResult.verdict === 'Accepted'
                            ? '#f0fdf4'
                            : '#fef2f2',
                      }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '0.5rem',
                        }}>
                        <span style={{ fontWeight: '500', color: '#374151' }}>
                          Question {index + 1}
                        </span>
                        <div
                          style={{
                            display: 'flex',
                            gap: '1rem',
                            alignItems: 'center',
                          }}>
                          <span
                            style={{
                              fontWeight: '600',
                              color:
                                questionResult.verdict === 'Accepted'
                                  ? '#22c55e'
                                  : '#ef4444',
                            }}>
                            {questionResult.verdict}
                          </span>
                          <span
                            style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            {questionResult.passedTests}/
                            {questionResult.totalTests} tests passed
                          </span>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        Execution Time: {questionResult.executionTime} | Memory:{' '}
                        {questionResult.memory} | Marks: {questionResult.marks}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructor Feedback */}
              <div className='service-card'>
                <h3 className='service-title'>Feedback</h3>
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    fontStyle: 'italic',
                    color: '#374151',
                    lineHeight: '1.6',
                  }}>
                  "{result.feedback}"
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div>
              {/* Status */}
              <div className='service-card' style={{ marginBottom: '2rem' }}>
                <h3 className='service-title'>Exam Status</h3>
                <div
                  style={{
                    background: statusStyle.bg,
                    border: `2px solid ${statusStyle.border}`,
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    textAlign: 'center',
                  }}>
                  <div
                    style={{
                      fontSize: '2rem',
                      marginBottom: '0.5rem',
                    }}>
                    {result.status === 'passed' ? '✅' : '❌'}
                  </div>
                  <div
                    style={{
                      fontWeight: '600',
                      color: statusStyle.color,
                      textTransform: 'capitalize',
                    }}>
                    {result.status}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className='service-card'>
                <h3 className='service-title'>Actions</h3>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}>
                  <Link to='/nextgen/coding-exams' className='btn-primary'>
                    Take Another Coding Exam
                  </Link>
                  <button className='btn-secondary'>
                    Download Certificate
                  </button>
                  <button className='btn-outline'>View Code Submissions</button>
                  <button className='btn-outline'>Share Result</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedResult && activeTab === 'exams') {
    const foundResult = results.find((r) => r.id === selectedResult);

    if (!foundResult) {
      return (
        <div
          className='container'
          style={{ paddingTop: '2rem', textAlign: 'center' }}>
          <h2>Result not found</h2>
          <button
            onClick={() => setSelectedResult(null)}
            className='btn-primary'>
            Back to Results
          </button>
        </div>
      );
    }

    // Parse submission data - use detailed submission if available
    let submissionAnswers = [];
    const submissionToUse = detailedSubmission || foundResult;
    console.log('🔍 Using submission:', submissionToUse);
    console.log('🔍 submission_data:', submissionToUse.submission_data);

    try {
      // Try to get submission_data (backend uses snake_case)
      const subData =
        submissionToUse.submission_data || submissionToUse.submissionData;
      console.log('🔍 Extracted subData:', subData);

      if (
        !subData ||
        (typeof subData === 'object' && Object.keys(subData).length === 0)
      ) {
        console.warn('⚠️ No submission data available');
      } else {
        const parsedData =
          typeof subData === 'string' ? JSON.parse(subData) : subData;
        console.log('🔍 Parsed data:', parsedData);

        // Handle different possible structures
        if (parsedData?.answers) {
          submissionAnswers = parsedData.answers;
        } else if (Array.isArray(parsedData)) {
          submissionAnswers = parsedData;
        } else if (parsedData && typeof parsedData === 'object') {
          // Convert object with question IDs to array
          submissionAnswers = Object.entries(parsedData).map(
            ([qId, answer]) => {
              if (typeof answer === 'object') {
                return {
                  questionId: qId,
                  selectedAnswer:
                    answer.selectedAnswer || answer.answer || answer.userAnswer,
                  isCorrect: answer.isCorrect,
                  correctAnswer: answer.correctAnswer,
                  question: answer.question,
                  type: answer.type,
                };
              }
              // Handle simple value
              return {
                questionId: qId,
                selectedAnswer: answer,
              };
            }
          );
        }
      }

      console.log(
        '🔍 Final submissionAnswers:',
        submissionAnswers,
        'Length:',
        submissionAnswers.length
      );
    } catch (e) {
      console.error('Error parsing submission data:', e);
    }

    // Transform backend data to match detail view expectations
    const result = {
      ...foundResult,
      percentage: foundResult.grade || 0,
      date: foundResult.submittedAt,
      module: 'Exam Module',
      timeSpent: 'N/A',
      attempts: 1,
      questions: {
        total: submissionAnswers.length || 0,
        correct: submissionAnswers.filter((a) => a.isCorrect).length || 0,
        incorrect:
          submissionAnswers.filter(
            (a) => !a.isCorrect && a.isCorrect !== undefined
          ).length || 0,
        skipped: 0,
      },
      submissionAnswers: submissionAnswers,
      topicWise: [],
    };

    const statusStyle = getStatusColor(result.status);

    return (
      <div
        className='container'
        style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem',
            }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '2rem', color: '#374151' }}>
                {result.examTitle}
              </h1>
              <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280' }}>
                {result.module} • {new Date(result.date).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => setSelectedResult(null)}
              className='btn-secondary'>
              ← Back to Results
            </button>
          </div>

          {/* Submitted Answers */}
          {result.submissionAnswers && result.submissionAnswers.length > 0 ? (
            <div className='service-card' style={{ marginBottom: '2rem' }}>
              <h3 className='service-title'>Submitted Answers</h3>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}>
                {result.submissionAnswers.map((answer, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '1rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      background:
                        answer.isCorrect === true
                          ? '#f0fdf4'
                          : answer.isCorrect === false
                          ? '#fef2f2'
                          : '#f9fafb',
                    }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start',
                        marginBottom: '0.5rem',
                      }}>
                      <span style={{ fontWeight: '600', color: '#374151' }}>
                        Question {index + 1} {answer.type && `(${answer.type})`}
                      </span>
                      {answer.isCorrect !== undefined && (
                        <span
                          style={{
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: answer.isCorrect ? '#22c55e' : '#ef4444',
                          }}>
                          {answer.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                        </span>
                      )}
                    </div>
                    {answer.question && (
                      <div
                        style={{
                          fontSize: '0.875rem',
                          color: '#374151',
                          marginBottom: '0.75rem',
                          fontWeight: '500',
                        }}>
                        <strong>Q:</strong> {answer.question}
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: '0.875rem',
                        color: '#1f2937',
                        marginBottom: '0.5rem',
                        background: '#f3f4f6',
                        padding: '0.5rem',
                        borderRadius: '0.25rem',
                      }}>
                      <strong>Your Answer:</strong>{' '}
                      {answer.selectedAnswer || answer.answer || 'Not answered'}
                    </div>
                    {!answer.isCorrect && answer.correctAnswer && (
                      <div
                        style={{
                          fontSize: '0.875rem',
                          color: '#059669',
                          background: '#d1fae5',
                          padding: '0.5rem',
                          borderRadius: '0.25rem',
                        }}>
                        <strong>Correct Answer:</strong> {answer.correctAnswer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div
              className='service-card'
              style={{
                marginBottom: '2rem',
                textAlign: 'center',
                padding: '2rem',
              }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
              <h3 style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                No Submission Data Available
              </h3>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                The answers for this exam were not saved in the system. Please
                contact support if you believe this is an error.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div
        className='container'
        style={{
          paddingTop: '2rem',
          paddingBottom: '2rem',
          textAlign: 'center',
        }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
        <h2>Loading Results...</h2>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className='container'
        style={{
          paddingTop: '2rem',
          paddingBottom: '2rem',
          textAlign: 'center',
        }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
        <h2>Error Loading Results</h2>
        <p style={{ color: '#6b7280' }}>{error}</p>
        <button
          onClick={fetchResults}
          className='btn-primary'
          style={{ marginTop: '1rem' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      className='container'
      style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Navigation Bar */}
        <StudentProfileNav />

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '0.5rem',
            }}>
            Exam Results
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
            Track your progress and performance across all assessments
          </p>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '2rem',
            borderBottom: '2px solid #e5e7eb',
          }}>
          <button
            onClick={() => setActiveTab('exams')}
            style={{
              padding: '1rem 2rem',
              background: activeTab === 'exams' ? '#3b82f6' : 'transparent',
              color: activeTab === 'exams' ? 'white' : '#6b7280',
              border: 'none',
              borderBottom:
                activeTab === 'exams' ? '3px solid #2563eb' : 'none',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}>
            📝 Exam Results ({results.length})
          </button>
          <button
            onClick={() => setActiveTab('coding-exams')}
            style={{
              padding: '1rem 2rem',
              background:
                activeTab === 'coding-exams' ? '#3b82f6' : 'transparent',
              color: activeTab === 'coding-exams' ? 'white' : '#6b7280',
              border: 'none',
              borderBottom:
                activeTab === 'coding-exams' ? '3px solid #2563eb' : 'none',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}>
            💻 Coding Exam Results ({codingResults.length})
          </button>
        </div>

        {/* Filters and Sort */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            gap: '1rem',
            flexWrap: 'wrap',
          }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <label
              style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
              }}>
              Filter by Status:
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className='form-input'
              style={{ width: 'auto', minWidth: '120px' }}>
              <option value='all'>All Results</option>
              <option value='graded'>Graded</option>
              <option value='failed'>Failed</option>
              <option value='pending'>Pending</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <label
              style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
              }}>
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className='form-input'
              style={{ width: 'auto', minWidth: '120px' }}>
              <option value='date'>Date</option>
              <option value='score'>Score</option>
              <option value='title'>Title</option>
            </select>
          </div>
        </div>

        {/* Results Grid - Exam Results */}
        {activeTab === 'exams' && (
          <>
            <div className='services-grid'>
              {sortedResults.map((result) => {
                const statusStyle = getStatusColor(result.status);

                return (
                  <div
                    key={result.id}
                    className='service-card'
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedResult(result.id)}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '1rem',
                      }}>
                      <div>
                        <h3
                          className='service-title'
                          style={{ margin: 0, fontSize: '1.125rem' }}>
                          {result.examTitle}
                        </h3>
                        <p
                          style={{
                            margin: '0.25rem 0',
                            color: '#6b7280',
                            fontSize: '0.875rem',
                          }}>
                          {result.module}
                        </p>
                      </div>
                      <div
                        style={{
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          padding: '0.25rem 0.75rem',
                          borderRadius: '1rem',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          textTransform: 'capitalize',
                        }}>
                        {result.status}
                      </div>
                    </div>

                    {/* Grade */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div
                        style={{
                          fontSize: '0.875rem',
                          color: '#6b7280',
                          marginBottom: '0.25rem',
                        }}>
                        Grade
                      </div>
                      <div
                        style={{
                          fontSize: '2rem',
                          fontWeight: '700',
                          color: getGradeColor(result.grade || 0),
                        }}>
                        {result.grade || 0}%
                      </div>
                    </div>

                    {/* Feedback */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div
                        style={{
                          fontSize: '0.875rem',
                          color: '#6b7280',
                          marginBottom: '0.25rem',
                        }}>
                        Instructor Feedback
                      </div>
                      <p
                        style={{
                          fontSize: '0.875rem',
                          color: '#374151',
                          lineHeight: '1.5',
                          margin: 0,
                        }}>
                        {result.feedback || 'No feedback provided'}
                      </p>
                    </div>

                    <button
                      className='btn-primary'
                      style={{ width: '100%', fontSize: '0.875rem' }}
                      onClick={async () => {
                        setSelectedResult(result.id);
                        await fetchDetailedSubmission(result.id);
                      }}>
                      View Submissions
                    </button>
                  </div>
                );
              })}
            </div>

            {sortedResults.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '3rem',
                  color: '#6b7280',
                }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                <h3>No exam results found</h3>
                <p>No exam results match your current filter criteria.</p>
              </div>
            )}
          </>
        )}

        {/* Results Grid - Coding Exam Results */}
        {activeTab === 'coding-exams' && (
          <>
            <div className='services-grid'>
              {sortedCodingResults.map((result) => {
                const statusStyle = getStatusColor(result.status);

                return (
                  <div
                    key={result.id}
                    className='service-card'
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedResult(result.id)}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '1rem',
                      }}>
                      <div>
                        <h3
                          className='service-title'
                          style={{ margin: 0, fontSize: '1.125rem' }}>
                          💻 {result.examTitle}
                        </h3>
                        <p
                          style={{
                            margin: '0.25rem 0',
                            color: '#6b7280',
                            fontSize: '0.875rem',
                          }}>
                          {result.module}
                        </p>
                      </div>
                      <div
                        style={{
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          padding: '0.25rem 0.75rem',
                          borderRadius: '1rem',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          textTransform: 'capitalize',
                        }}>
                        {result.status}
                      </div>
                    </div>

                    {/* Grade */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div
                        style={{
                          fontSize: '0.875rem',
                          color: '#6b7280',
                          marginBottom: '0.25rem',
                        }}>
                        Grade
                      </div>
                      <div
                        style={{
                          fontSize: '2rem',
                          fontWeight: '700',
                          color: getGradeColor(result.grade || 0),
                        }}>
                        {result.grade || 0}%
                      </div>
                    </div>

                    {/* Feedback */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div
                        style={{
                          fontSize: '0.875rem',
                          color: '#6b7280',
                          marginBottom: '0.25rem',
                        }}>
                        Instructor Feedback
                      </div>
                      <p
                        style={{
                          fontSize: '0.875rem',
                          color: '#374151',
                          lineHeight: '1.5',
                          margin: 0,
                        }}>
                        {result.feedback || 'No feedback provided'}
                      </p>
                    </div>

                    <button
                      className='btn-primary'
                      style={{ width: '100%', fontSize: '0.875rem' }}
                      onClick={() => {
                        setCodingExamResult(result);
                        setSelectedResult('coding-exam');
                      }}>
                      View Submissions
                    </button>
                  </div>
                );
              })}
            </div>

            {sortedCodingResults.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '3rem',
                  color: '#6b7280',
                }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💻</div>
                <h3>No coding exam results found</h3>
                <p>
                  No coding exam results match your current filter criteria.
                </p>
              </div>
            )}
          </>
        )}

        {sortedResults.length === 0 && activeTab === 'exams' && (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#6b7280',
            }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
            <h3>No results found</h3>
            <p>No exam results match your current filter criteria.</p>
          </div>
        )}

        {/* Performance Summary */}
        <div className='service-card' style={{ marginTop: '3rem' }}>
          <h2 className='section-title'>
            {activeTab === 'exams'
              ? 'Exam Performance Summary'
              : 'Coding Exam Performance Summary'}
          </h2>
          {activeTab === 'exams' ? (
            <div className='services-grid'>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    color: '#22c55e',
                  }}>
                  {results.filter((r) => r.status === 'graded').length}
                </div>
                <div style={{ color: '#6b7280' }}>Exams Graded</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    color: '#3b82f6',
                  }}>
                  {Math.round(
                    results
                      .filter((r) => r.status !== 'pending' && r.grade != null)
                      .reduce((acc, r) => acc + (r.grade || 0), 0) /
                      results.filter(
                        (r) => r.status !== 'pending' && r.grade != null
                      ).length
                  ) || 0}
                  %
                </div>
                <div style={{ color: '#6b7280' }}>Average Score</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    color: '#f59e0b',
                  }}>
                  {results.filter((r) => r.status === 'pending').length}
                </div>
                <div style={{ color: '#6b7280' }}>Pending Exams</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    color: '#8b5cf6',
                  }}>
                  {Math.max(
                    ...results
                      .filter((r) => r.status !== 'pending' && r.grade != null)
                      .map((r) => r.grade || 0)
                  ) || 0}
                  %
                </div>
                <div style={{ color: '#6b7280' }}>Highest Score</div>
              </div>
            </div>
          ) : (
            <div className='services-grid'>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    color: '#22c55e',
                  }}>
                  {codingResults.filter((r) => r.status === 'graded').length}
                </div>
                <div style={{ color: '#6b7280' }}>Coding Exams Graded</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    color: '#3b82f6',
                  }}>
                  {Math.round(
                    codingResults
                      .filter((r) => r.grade != null)
                      .reduce((acc, r) => acc + (r.grade || 0), 0) /
                      codingResults.filter((r) => r.grade != null).length
                  ) || 0}
                  %
                </div>
                <div style={{ color: '#6b7280' }}>Average Score</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    color: '#f59e0b',
                  }}>
                  {codingResults.reduce(
                    (acc, r) =>
                      acc +
                      (r.submissions?.filter((s) => s.verdict === 'Accepted')
                        .length || 0),
                    0
                  )}
                </div>
                <div style={{ color: '#6b7280' }}>Total Problems Solved</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    color: '#8b5cf6',
                  }}>
                  {Math.max(
                    ...codingResults
                      .filter((r) => r.grade != null)
                      .map((r) => r.grade || 0)
                  ) || 0}
                  %
                </div>
                <div style={{ color: '#6b7280' }}>Highest Score</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
