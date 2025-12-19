import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../utils/api';

export default function CodingExamResults() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedExam, setSelectedExam] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all coding exams
      const examsResponse = await apiClient.getAllNextGenCodingExams();
      const examsList = examsResponse?.data?.exams || [];
      setExams(examsList);

      // Fetch all approved students
      const studentsResponse = await apiClient.getRegistrations('approved');
      const studentsList = studentsResponse?.data?.registrations || [];
      setStudents(studentsList);

      // Fetch all coding exam submissions
      const submissionsResponse = await fetch(
        `${
          import.meta.env.VITE_API_URL || 'https://emp-new-iksg-git-main-teamoflifeboxs-projects.vercel.app/api'
        }/nextgen/codingExams/all-submissions`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!submissionsResponse.ok) {
        throw new Error('Failed to fetch submissions');
      }

      const submissionsData = await submissionsResponse.json();
      const submissions = submissionsData?.data || [];

      // Group submissions by student and exam
      const groupedResults = [];
      const studentExamMap = new Map();

      submissions.forEach((submission) => {
        const key = `${submission.student_id?._id || submission.student_id}-${
          submission.exam_id?._id || submission.exam_id
        }`;

        if (!studentExamMap.has(key)) {
          studentExamMap.set(key, {
            studentId: submission.student_id?._id || submission.student_id,
            studentName:
              submission.student_id?.fullName ||
              submission.student_id?.full_name ||
              'Unknown Student',
            studentEmail: submission.student_id?.email || 'N/A',
            examId: submission.exam_id?._id || submission.exam_id,
            examName: submission.exam_id?.examName || 'Unknown Exam',
            course: submission.exam_id?.courseName || 'N/A',
            submissions: [],
            totalMarks: 0,
            acceptedCount: 0,
            totalQuestions: 0,
            submittedAt: submission.submitted_at || submission.createdAt,
          });
        }

        const result = studentExamMap.get(key);
        result.submissions.push(submission);
        result.totalMarks += submission.marks || 0;
        result.totalQuestions += 1;
        if (submission.verdict === 'Accepted') {
          result.acceptedCount += 1;
        }
      });

      const resultsArray = Array.from(studentExamMap.values());
      setResults(resultsArray);
    } catch (err) {
      console.error('Error fetching coding exam results:', err);
      setError(err.message || 'Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter((result) => {
    const examMatch = selectedExam === 'all' || result.examId === selectedExam;
    const studentMatch =
      selectedStudent === 'all' || result.studentId === selectedStudent;
    return examMatch && studentMatch;
  });

  const getPerformanceColor = (percentage) => {
    if (percentage >= 80) return '#22c55e';
    if (percentage >= 60) return '#3b82f6';
    if (percentage >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const getVerdictColor = (verdict) => {
    switch (verdict) {
      case 'Accepted':
        return '#22c55e';
      case 'Wrong Answer':
        return '#ef4444';
      case 'Time Limit Exceeded':
        return '#f59e0b';
      case 'Runtime Error':
        return '#dc2626';
      case 'Compilation Error':
        return '#9333ea';
      case 'Memory Limit Exceeded':
        return '#ea580c';
      default:
        return '#6b7280';
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Student Name',
      'Student Email',
      'Exam Name',
      'Course',
      'Total Questions',
      'Accepted',
      'Total Marks',
      'Percentage',
      'Submitted At',
    ];
    const rows = filteredResults.map((result) => [
      result.studentName,
      result.studentEmail,
      result.examName,
      result.course,
      result.totalQuestions,
      result.acceptedCount,
      result.totalMarks,
      `${((result.acceptedCount / result.totalQuestions) * 100).toFixed(1)}%`,
      new Date(result.submittedAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coding_exam_results_${
      new Date().toISOString().split('T')[0]
    }.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className='portal-layout'>
        <div className='portal-header'>
          <div className='container'>
            <h1>Coding Exam Results</h1>
          </div>
        </div>
        <div className='portal-content'>
          <div
            className='container'
            style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <h2>Loading Results...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='portal-layout'>
        <div className='portal-header'>
          <div className='container'>
            <h1>Coding Exam Results</h1>
          </div>
        </div>
        <div className='portal-content'>
          <div
            className='container'
            style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
            <h2>Error Loading Results</h2>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>{error}</p>
            <button onClick={fetchData} className='btn-primary'>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='portal-layout'>
      {/* Header */}
      <div className='portal-header'>
        <div
          className='container'
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
              Coding Exam Results
            </h1>
            <p style={{ margin: '0.25rem 0 0 0', opacity: 0.8 }}>
              View all student coding exam submissions
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className='btn-secondary'
            style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
            ← Back
          </button>
        </div>
      </div>

      {/* Content */}
      <div className='portal-content'>
        <div className='container'>
          {/* Stats */}
          <div className='stats-grid' style={{ marginBottom: '2rem' }}>
            <div className='portal-card' style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  color: '#3b82f6',
                  marginBottom: '0.5rem',
                }}>
                {results.length}
              </div>
              <div style={{ color: '#6b7280' }}>Total Submissions</div>
            </div>
            <div className='portal-card' style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  color: '#22c55e',
                  marginBottom: '0.5rem',
                }}>
                {exams.length}
              </div>
              <div style={{ color: '#6b7280' }}>Total Exams</div>
            </div>
            <div className='portal-card' style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  color: '#8b5cf6',
                  marginBottom: '0.5rem',
                }}>
                {students.length}
              </div>
              <div style={{ color: '#6b7280' }}>Total Students</div>
            </div>
            <div className='portal-card' style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  color: '#f59e0b',
                  marginBottom: '0.5rem',
                }}>
                {results.reduce((sum, r) => sum + r.totalMarks, 0)}
              </div>
              <div style={{ color: '#6b7280' }}>Total Marks Scored</div>
            </div>
          </div>

          {/* Filters */}
          <div className='portal-card' style={{ marginBottom: '2rem' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 2fr 1fr',
                gap: '1rem',
                alignItems: 'end',
              }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#374151',
                  }}>
                  Filter by Exam
                </label>
                <select
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value)}
                  className='form-input'
                  style={{ width: '100%' }}>
                  <option value='all'>All Exams</option>
                  {exams.map((exam) => (
                    <option key={exam._id} value={exam._id}>
                      {exam.examName} - {exam.courseName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#374151',
                  }}>
                  Filter by Student
                </label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className='form-input'
                  style={{ width: '100%' }}>
                  <option value='all'>All Students</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.full_name} ({student.email})
                    </option>
                  ))}
                </select>
              </div>

              <button onClick={exportToCSV} className='btn-primary'>
                📥 Export CSV
              </button>
            </div>

            <div
              style={{
                marginTop: '1rem',
                fontSize: '0.875rem',
                color: '#6b7280',
              }}>
              Showing {filteredResults.length} of {results.length} results
            </div>
          </div>

          {/* Results Table */}
          <div className='data-table'>
            <div className='table-header'>Coding Exam Results</div>

            <div
              className='table-row'
              style={{
                gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr 1fr 1fr 1fr 1fr',
                fontWeight: 600,
                background: '#f8fafc',
              }}>
              <div>Student</div>
              <div>Exam</div>
              <div>Course</div>
              <div>Questions</div>
              <div>Accepted</div>
              <div>Total Marks</div>
              <div>Success Rate</div>
              <div>Submitted</div>
            </div>

            {filteredResults.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '3rem',
                  color: '#6b7280',
                }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                <p>No results found</p>
              </div>
            ) : (
              filteredResults.map((result, idx) => {
                const successRate =
                  (result.acceptedCount / result.totalQuestions) * 100;
                return (
                  <div
                    key={idx}
                    className='table-row'
                    style={{
                      gridTemplateColumns:
                        '2fr 1.5fr 1.5fr 1fr 1fr 1fr 1fr 1fr',
                    }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>
                        {result.studentName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {result.studentEmail}
                      </div>
                    </div>
                    <div style={{ fontWeight: 500 }}>{result.examName}</div>
                    <div>{result.course}</div>
                    <div>{result.totalQuestions}</div>
                    <div>
                      <span
                        style={{
                          background: '#f0fdf4',
                          color: '#22c55e',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                        }}>
                        {result.acceptedCount}
                      </span>
                    </div>
                    <div style={{ fontWeight: 600 }}>{result.totalMarks}</div>
                    <div>
                      <span
                        style={{
                          color: getPerformanceColor(successRate),
                          fontWeight: 600,
                          fontSize: '0.875rem',
                        }}>
                        {successRate.toFixed(1)}%
                      </span>
                    </div>
                    <div style={{ fontSize: '0.875rem' }}>
                      {new Date(result.submittedAt).toLocaleDateString()}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Detailed View - Expandable */}
          {filteredResults.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', color: '#111827' }}>
                Detailed Submissions
              </h3>
              {filteredResults.map((result, idx) => (
                <details key={idx} style={{ marginBottom: '1rem' }}>
                  <summary
                    style={{
                      padding: '1rem',
                      background: 'white',
                      borderRadius: '8px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                      fontWeight: 600,
                      color: '#111827',
                    }}>
                    {result.studentName} - {result.examName} (
                    {result.acceptedCount}/{result.totalQuestions} questions
                    solved)
                  </summary>
                  <div
                    style={{
                      padding: '1rem',
                      background: '#f9fafb',
                      borderRadius: '0 0 8px 8px',
                    }}>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                      {result.submissions.map((submission, subIdx) => (
                        <div
                          key={subIdx}
                          style={{
                            padding: '1rem',
                            background: 'white',
                            borderRadius: '6px',
                            borderLeft: `4px solid ${getVerdictColor(
                              submission.verdict
                            )}`,
                          }}>
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                              gap: '1rem',
                              alignItems: 'center',
                            }}>
                            <div>
                              <div
                                style={{
                                  fontWeight: 600,
                                  marginBottom: '0.25rem',
                                }}>
                                Question {subIdx + 1}
                              </div>
                              <div
                                style={{
                                  fontSize: '0.875rem',
                                  color: '#6b7280',
                                }}>
                                Language: {submission.language}
                              </div>
                            </div>
                            <div>
                              <div
                                style={{
                                  fontSize: '0.75rem',
                                  color: '#6b7280',
                                  marginBottom: '0.25rem',
                                }}>
                                Verdict
                              </div>
                              <span
                                style={{
                                  color: getVerdictColor(submission.verdict),
                                  fontWeight: 600,
                                  fontSize: '0.875rem',
                                }}>
                                {submission.verdict}
                              </span>
                            </div>
                            <div>
                              <div
                                style={{
                                  fontSize: '0.75rem',
                                  color: '#6b7280',
                                  marginBottom: '0.25rem',
                                }}>
                                Marks
                              </div>
                              <div style={{ fontWeight: 600 }}>
                                {submission.marks || 0}
                              </div>
                            </div>
                            <div>
                              <div
                                style={{
                                  fontSize: '0.75rem',
                                  color: '#6b7280',
                                  marginBottom: '0.25rem',
                                }}>
                                Time
                              </div>
                              <div style={{ fontSize: '0.875rem' }}>
                                {submission.executionTime || 'N/A'}
                              </div>
                            </div>
                            <div>
                              <div
                                style={{
                                  fontSize: '0.75rem',
                                  color: '#6b7280',
                                  marginBottom: '0.25rem',
                                }}>
                                Memory
                              </div>
                              <div style={{ fontSize: '0.875rem' }}>
                                {submission.memory || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </details>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
