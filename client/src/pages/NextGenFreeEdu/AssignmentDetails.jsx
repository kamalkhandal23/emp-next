import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../../utils/api';

export default function AssignmentDetails() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  console.log('AssignmentDetails component mounted');
  console.log('Assignment ID from params:', assignmentId);

  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get student data
  const getStudentData = () => {
    const studentInfo = localStorage.getItem('studentInfo');
    return studentInfo ? JSON.parse(studentInfo) : null;
  };

  const studentData = getStudentData();
  const studentId = studentData?._id || studentData?.id;

  useEffect(() => {
    if (assignmentId) {
      fetchAssignmentDetails();
    }
  }, [assignmentId]);

  const fetchAssignmentDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching assignment with ID:', assignmentId);

      // Fetch assignment details
      const assignmentResponse = await apiClient.getNextGenAssignmentById(
        assignmentId
      );

      console.log('Assignment response:', assignmentResponse);

      if (assignmentResponse.success) {
        setAssignment(assignmentResponse.data);
        console.log('Assignment set:', assignmentResponse.data);
      } else {
        setError('Assignment not found');
      }

      // Fetch submission if student is logged in
      if (studentId) {
        try {
          const submissionResponse = await apiClient.getSubmission(
            assignmentId,
            studentId
          );
          console.log('Submission response:', submissionResponse);
          if (submissionResponse.success && submissionResponse.data) {
            setSubmission(submissionResponse.data);
          }
        } catch (err) {
          console.log('No submission found:', err);
        }
      }
    } catch (err) {
      console.error('Error fetching assignment details:', err);
      setError('Failed to load assignment details: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = () => {
    if (!submission) {
      return { text: 'Not Started', color: '#6b7280', bg: '#f3f4f6' };
    }

    switch (submission.status) {
      case 'graded':
        return { text: 'Graded', color: '#059669', bg: '#d1fae5' };
      case 'submitted':
        return { text: 'Submitted', color: '#2563eb', bg: '#dbeafe' };
      case 'in-progress':
        return { text: 'In Progress', color: '#d97706', bg: '#fef3c7' };
      default:
        return { text: 'Not Started', color: '#6b7280', bg: '#f3f4f6' };
    }
  };

  const getQuestionTypeLabel = (type) => {
    const types = {
      mcq: { label: 'Multiple Choice', icon: '☑️', color: '#3b82f6' },
      coding: { label: 'Coding', icon: '💻', color: '#8b5cf6' },
      answer: { label: 'Answer-based', icon: '✍️', color: '#10b981' },
    };
    return types[type] || { label: type, icon: '📝', color: '#6b7280' };
  };

  if (loading) {
    return (
      <div
        className='container'
        style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
            Loading assignment details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div
        className='container'
        style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div
          className='service-card'
          style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
          <h3 style={{ color: '#374151', marginBottom: '1rem' }}>
            Assignment Not Found
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
            {error || 'The assignment you are looking for does not exist.'}
          </p>
          <Link to='/nextgen/assignments' className='btn-primary'>
            Back to Assignments
          </Link>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge();
  const questions = assignment.questions
    ? Object.entries(assignment.questions)
    : [];

  return (
    <div
      className='container'
      style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <Link
            to='/nextgen/assignments'
            className='btn-outline'
            style={{
              marginBottom: '1rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
            ← Back to Assignments
          </Link>
        </div>

        {/* Main Content Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '2rem',
            '@media (min-width: 768px)': { gridTemplateColumns: '2fr 1fr' },
          }}>
          {/* Left Column - Assignment Details */}
          <div>
            {/* Assignment Header Card */}
            <div className='service-card' style={{ marginBottom: '2rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  marginBottom: '1rem',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}>
                <div style={{ flex: 1 }}>
                  <h2
                    style={{
                      color: '#1f2937',
                      marginBottom: '0.5rem',
                      fontSize: '1.875rem',
                    }}>
                    {assignment.assignmentName}
                  </h2>
                  <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
                    📚 {assignment.courseName}
                  </p>
                </div>
                <div
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    background: statusBadge.bg,
                    color: statusBadge.color,
                    fontWeight: '600',
                    fontSize: '0.875rem',
                  }}>
                  {statusBadge.text}
                </div>
              </div>

              {/* Assignment Meta Info */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  marginTop: '1.5rem',
                }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}>
                  <span style={{ fontSize: '1.25rem' }}>📊</span>
                  <div>
                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        margin: 0,
                      }}>
                      Total Questions
                    </p>
                    <p
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        margin: 0,
                      }}>
                      {assignment.totalQuestions || 0}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}>
                  <span style={{ fontSize: '1.25rem' }}>🎯</span>
                  <div>
                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        margin: 0,
                      }}>
                      Assignment Order
                    </p>
                    <p
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        margin: 0,
                      }}>
                      #{assignment.order || 1}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}>
                  <span style={{ fontSize: '1.25rem' }}>📅</span>
                  <div>
                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        margin: 0,
                      }}>
                      Created
                    </p>
                    <p
                      style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        margin: 0,
                      }}>
                      {formatDate(assignment.createdAt)}
                    </p>
                  </div>
                </div>

                {submission &&
                  submission.score !== undefined &&
                  submission.score !== null && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}>
                      <span style={{ fontSize: '1.25rem' }}>⭐</span>
                      <div>
                        <p
                          style={{
                            fontSize: '0.875rem',
                            color: '#6b7280',
                            margin: 0,
                          }}>
                          Your Score
                        </p>
                        <p
                          style={{
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            color: '#059669',
                            margin: 0,
                          }}>
                          {submission.score}%
                        </p>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Description */}
            {assignment.description && (
              <div className='service-card' style={{ marginBottom: '2rem' }}>
                <h3
                  style={{
                    color: '#1f2937',
                    marginBottom: '1rem',
                    fontSize: '1.25rem',
                  }}>
                  📋 Description
                </h3>
                <p
                  style={{
                    color: '#4b5563',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap',
                  }}>
                  {assignment.description}
                </p>
              </div>
            )}

            {/* Questions Overview */}
            <div className='service-card' style={{ marginBottom: '2rem' }}>
              <h3
                style={{
                  color: '#1f2937',
                  marginBottom: '1.5rem',
                  fontSize: '1.25rem',
                }}>
                📝 Questions ({questions.length})
              </h3>

              {questions.length > 0 ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}>
                  {questions.map(([key, question], index) => {
                    const typeInfo = getQuestionTypeLabel(question.type);
                    const studentAnswer = submission?.answers?.[key];

                    return (
                      <div
                        key={key}
                        style={{
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.75rem',
                          padding: '1rem',
                          background: studentAnswer ? '#f0fdf4' : '#ffffff',
                        }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'start',
                            marginBottom: '0.75rem',
                            gap: '1rem',
                            flexWrap: 'wrap',
                          }}>
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '0.5rem',
                              }}>
                              <span
                                style={{ fontWeight: '600', color: '#1f2937' }}>
                                Q{index + 1}.
                              </span>
                              <span
                                style={{
                                  padding: '0.25rem 0.75rem',
                                  borderRadius: '0.375rem',
                                  background: `${typeInfo.color}15`,
                                  color: typeInfo.color,
                                  fontSize: '0.75rem',
                                  fontWeight: '600',
                                }}>
                                {typeInfo.icon} {typeInfo.label}
                              </span>
                              {studentAnswer && (
                                <span
                                  style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '0.375rem',
                                    background: '#dcfce7',
                                    color: '#059669',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                  }}>
                                  ✓ Answered
                                </span>
                              )}
                            </div>
                            <p
                              style={{
                                color: '#374151',
                                margin: '0.5rem 0',
                                lineHeight: '1.5',
                              }}>
                              {question.questionText}
                            </p>
                          </div>
                          {question.marks && (
                            <div
                              style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '0.375rem',
                                background: '#fef3c7',
                                color: '#92400e',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                whiteSpace: 'nowrap',
                              }}>
                              {question.marks} marks
                            </div>
                          )}
                        </div>

                        {/* Show MCQ options */}
                        {question.type === 'mcq' && question.options && (
                          <div
                            style={{
                              marginTop: '0.75rem',
                              paddingLeft: '1.5rem',
                            }}>
                            {question.options.map((option, idx) => (
                              <div
                                key={idx}
                                style={{
                                  padding: '0.5rem',
                                  marginBottom: '0.25rem',
                                  borderRadius: '0.375rem',
                                  background:
                                    studentAnswer === option
                                      ? '#dcfce7'
                                      : '#f9fafb',
                                  border:
                                    studentAnswer === option
                                      ? '2px solid #059669'
                                      : '1px solid #e5e7eb',
                                  color: '#374151',
                                  fontSize: '0.875rem',
                                }}>
                                {String.fromCharCode(65 + idx)}. {option}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Show student's answer if submitted */}
                        {studentAnswer && question.type !== 'mcq' && (
                          <div
                            style={{
                              marginTop: '0.75rem',
                              padding: '0.75rem',
                              background: '#ffffff',
                              border: '1px solid #d1fae5',
                              borderRadius: '0.5rem',
                            }}>
                            <p
                              style={{
                                fontSize: '0.75rem',
                                color: '#059669',
                                fontWeight: '600',
                                marginBottom: '0.5rem',
                              }}>
                              Your Answer:
                            </p>
                            <p
                              style={{
                                color: '#374151',
                                fontSize: '0.875rem',
                                margin: 0,
                                whiteSpace: 'pre-wrap',
                              }}>
                              {studentAnswer}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p
                  style={{
                    color: '#6b7280',
                    textAlign: 'center',
                    padding: '2rem',
                  }}>
                  No questions available for this assignment.
                </p>
              )}
            </div>
          </div>

          {/* Right Column - Actions & Submission Info */}
          <div>
            {/* Action Card */}
            <div
              className='service-card'
              style={{ position: 'sticky', top: '2rem', marginBottom: '2rem' }}>
              <h3
                style={{
                  color: '#1f2937',
                  marginBottom: '1.5rem',
                  fontSize: '1.25rem',
                }}>
                🚀 Actions
              </h3>

              {submission ? (
                <>
                  {/* Submission Info */}
                  <div
                    style={{
                      marginBottom: '1.5rem',
                      padding: '1rem',
                      background: '#f9fafb',
                      borderRadius: '0.5rem',
                    }}>
                    <h4
                      style={{
                        color: '#374151',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        marginBottom: '0.75rem',
                      }}>
                      Submission Details
                    </h4>

                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                      }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}>
                        <span style={{ color: '#6b7280' }}>Status:</span>
                        <span
                          style={{
                            color: statusBadge.color,
                            fontWeight: '600',
                          }}>
                          {statusBadge.text}
                        </span>
                      </div>

                      {submission.submitted_at && (
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}>
                          <span style={{ color: '#6b7280' }}>Submitted:</span>
                          <span style={{ color: '#374151', fontWeight: '500' }}>
                            {formatDate(submission.submitted_at)}
                          </span>
                        </div>
                      )}

                      {submission.score !== undefined &&
                        submission.score !== null && (
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                            }}>
                            <span style={{ color: '#6b7280' }}>Score:</span>
                            <span
                              style={{
                                color: '#059669',
                                fontWeight: '600',
                                fontSize: '1rem',
                              }}>
                              {submission.score}%
                            </span>
                          </div>
                        )}

                      {submission.answers && (
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}>
                          <span style={{ color: '#6b7280' }}>Answered:</span>
                          <span style={{ color: '#374151', fontWeight: '500' }}>
                            {Object.keys(submission.answers).length} /{' '}
                            {questions.length}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Feedback */}
                  {submission.feedback && (
                    <div
                      style={{
                        marginBottom: '1.5rem',
                        padding: '1rem',
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: '0.5rem',
                      }}>
                      <h4
                        style={{
                          color: '#1e40af',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          marginBottom: '0.5rem',
                        }}>
                        💬 Instructor Feedback
                      </h4>
                      <p
                        style={{
                          color: '#1e3a8a',
                          fontSize: '0.875rem',
                          margin: 0,
                          lineHeight: '1.5',
                        }}>
                        {submission.feedback}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}>
                    {submission.status === 'in-progress' && (
                      <button
                        className='btn-primary'
                        style={{ width: '100%' }}
                        onClick={() =>
                          navigate(
                            `/nextgen/assignments/${assignmentId}/submit`
                          )
                        }>
                        📝 Resume Submission
                      </button>
                    )}

                    {submission.status === 'submitted' ||
                    submission.status === 'graded' ? (
                      <button
                        className='btn-primary'
                        style={{ width: '100%' }}
                        onClick={() =>
                          navigate(
                            `/nextgen/assignments/${assignmentId}/submit`
                          )
                        }>
                        🔄 Retake Assignment
                      </button>
                    ) : null}

                    <button
                      className='btn-outline'
                      style={{ width: '100%' }}
                      onClick={() => navigate('/nextgen/assignments')}>
                      ← Back to All Assignments
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* No Submission Yet */}
                  <div
                    style={{
                      marginBottom: '1.5rem',
                      padding: '1rem',
                      background: '#fef3c7',
                      border: '1px solid #fcd34d',
                      borderRadius: '0.5rem',
                      textAlign: 'center',
                    }}>
                    <p
                      style={{
                        color: '#92400e',
                        fontSize: '0.875rem',
                        margin: 0,
                      }}>
                      You haven't started this assignment yet.
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}>
                    <button
                      className='btn-primary'
                      style={{ width: '100%' }}
                      onClick={() =>
                        navigate(`/nextgen/assignments/${assignmentId}/submit`)
                      }>
                      🚀 Start Assignment
                    </button>

                    <button
                      className='btn-outline'
                      style={{ width: '100%' }}
                      onClick={() => navigate('/nextgen/assignments')}>
                      ← Back to All Assignments
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Tips Card */}
            <div
              className='service-card'
              style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}>
              <h4
                style={{
                  color: '#0369a1',
                  marginBottom: '1rem',
                  fontSize: '1rem',
                }}>
                💡 Tips
              </h4>
              <ul
                style={{
                  color: '#075985',
                  fontSize: '0.875rem',
                  lineHeight: '1.6',
                  margin: 0,
                  paddingLeft: '1.25rem',
                }}>
                <li>Read all questions carefully before starting</li>
                <li>You can save answers for individual questions</li>
                <li>Make sure to submit the final assignment when done</li>
                <li>You can retake the assignment after submission</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
