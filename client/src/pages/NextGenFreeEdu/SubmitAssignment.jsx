import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../../utils/api';

export default function SubmitAssignment() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [submissionType, setSubmissionType] = useState('text'); // text, code, file
  const [textSubmission, setTextSubmission] = useState('');
  const [codeSubmission, setCodeSubmission] = useState({
    language: 'javascript',
    code: '',
  });
  const [files, setFiles] = useState([]);
  const [existingSubmission, setExistingSubmission] = useState(null);

  // Answers for each question
  const [answers, setAnswers] = useState({});
  const [submittedQuestions, setSubmittedQuestions] = useState({});

  // Get student data
  const getStudentData = () => {
    const studentInfo = localStorage.getItem('studentInfo');
    return studentInfo ? JSON.parse(studentInfo) : null;
  };

  const studentData = getStudentData();
  const studentId = studentData?._id || studentData?.id;

  useEffect(() => {
    if (assignmentId && studentId) {
      fetchAssignment();
      fetchExistingSubmission();
    }
  }, [assignmentId, studentId]);

  const fetchAssignment = async () => {
    try {
      const response = await apiClient.getNextGenAssignmentById(assignmentId);
      if (response.success) {
        setAssignment(response.data);
        // Initialize answers object for all questions
        const initialAnswers = {};
        if (response.data.questions) {
          Object.keys(response.data.questions).forEach((qKey) => {
            initialAnswers[qKey] = '';
          });
        }
        setAnswers(initialAnswers);
      }
    } catch (err) {
      console.error('Error fetching assignment:', err);
      setError('Failed to load assignment details');
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingSubmission = async () => {
    try {
      const response = await apiClient.getSubmission(assignmentId, studentId);
      if (response.success && response.data) {
        setExistingSubmission(response.data);
        setTextSubmission(response.data.textSubmission || '');
        setCodeSubmission(
          response.data.codeSubmission || { language: 'javascript', code: '' }
        );

        // Load existing answers
        if (response.data.answers) {
          const existingAnswers =
            response.data.answers instanceof Map
              ? Object.fromEntries(response.data.answers)
              : response.data.answers;
          setAnswers(existingAnswers);

          // Mark questions as submitted if they have answers
          const submitted = {};
          Object.keys(existingAnswers).forEach((key) => {
            if (existingAnswers[key] && existingAnswers[key].trim() !== '') {
              submitted[key] = true;
            }
          });
          setSubmittedQuestions(submitted);
        }
      }
    } catch (err) {
      // No existing submission is fine
      console.log('No existing submission found');
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleQuestionSubmit = async (qKey) => {
    if (!answers[qKey] || answers[qKey].trim() === '') {
      setError('Please provide an answer before submitting');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      // Save answer to backend
      const response = await apiClient.saveQuestionAnswer(
        assignmentId,
        studentId,
        qKey,
        answers[qKey]
      );

      if (response.success) {
        // Mark question as submitted
        setSubmittedQuestions({ ...submittedQuestions, [qKey]: true });

        // Show success message
        const successMsg = document.getElementById(`success-${qKey}`);
        if (successMsg) {
          successMsg.style.display = 'block';
          setTimeout(() => {
            successMsg.style.display = 'none';
          }, 2000);
        }
      }
    } catch (err) {
      console.error('Error submitting question:', err);
      setError('Failed to save answer. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!studentId) {
      setError('Please log in to submit assignment');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('assignmentId', assignmentId);
      formData.append('studentId', studentId);

      // Add answers to formData
      formData.append('answers', JSON.stringify(answers));

      if (submissionType === 'text') {
        formData.append('textSubmission', textSubmission);
      } else if (submissionType === 'code') {
        formData.append('codeSubmission', JSON.stringify(codeSubmission));
      } else if (submissionType === 'file') {
        files.forEach((file) => {
          formData.append('files', file);
        });
      }

      const response = await apiClient.submitAssignment(formData);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/nextgen/assignments');
        }, 2000);
      }
    } catch (err) {
      console.error('Error submitting assignment:', err);
      setError(err.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        className='container'
        style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
            Loading assignment...
          </p>
        </div>
      </div>
    );
  }

  if (!assignment) {
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
          <Link to='/nextgen/assignments' className='btn-primary'>
            Back to Assignments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className='container'
      style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <Link
            to='/nextgen/assignments'
            className='btn-outline'
            style={{ marginBottom: '1rem', display: 'inline-block' }}>
            ← Back to Assignments
          </Link>
          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '0.5rem',
            }}>
            Submit Assignment
          </h1>
          <div
            style={{
              background: '#f0f9ff',
              padding: '1rem',
              borderRadius: '0.75rem',
              marginTop: '1rem',
            }}>
            <h3 style={{ color: '#1e40af', margin: 0, marginBottom: '0.5rem' }}>
              {assignment.assignmentName}
            </h3>
            <p style={{ color: '#1e3a8a', margin: 0, fontSize: '0.875rem' }}>
              Course: {assignment.courseName} • {assignment.totalQuestions}{' '}
              Questions
            </p>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div
            style={{
              background: '#d1fae5',
              border: '1px solid #6ee7b7',
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '2rem',
            }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>✅</span>
              <div>
                <p style={{ color: '#065f46', fontWeight: '600', margin: 0 }}>
                  Success!
                </p>
                <p
                  style={{
                    color: '#047857',
                    fontSize: '0.875rem',
                    margin: '0.25rem 0 0 0',
                  }}>
                  Your assignment has been submitted successfully.
                  Redirecting...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '2rem',
            }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>⚠️</span>
              <div>
                <p style={{ color: '#dc2626', fontWeight: '600', margin: 0 }}>
                  Error
                </p>
                <p
                  style={{
                    color: '#991b1b',
                    fontSize: '0.875rem',
                    margin: '0.25rem 0 0 0',
                  }}>
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Existing Submission Info */}
        {existingSubmission && existingSubmission.status === 'graded' && (
          <div
            style={{
              background: '#fef3c7',
              border: '1px solid #fcd34d',
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '2rem',
            }}>
            <h4 style={{ color: '#92400e', margin: '0 0 0.5rem 0' }}>
              Previous Submission Graded
            </h4>
            <p style={{ color: '#78350f', fontSize: '0.875rem', margin: 0 }}>
              Score: <strong>{existingSubmission.score}%</strong>
            </p>
            {existingSubmission.feedback && (
              <p
                style={{
                  color: '#78350f',
                  fontSize: '0.875rem',
                  margin: '0.5rem 0 0 0',
                }}>
                Feedback: {existingSubmission.feedback}
              </p>
            )}
            <p
              style={{
                color: '#78350f',
                fontSize: '0.875rem',
                margin: '0.5rem 0 0 0',
                fontStyle: 'italic',
              }}>
              You can resubmit to improve your score.
            </p>
          </div>
        )}

        {/* Submission Form */}
        <form onSubmit={handleSubmit} className='contact-form'>
          {/* Questions Section */}
          {assignment.questions &&
            Object.keys(assignment.questions).length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h3
                  style={{
                    color: '#111827',
                    marginBottom: '1.5rem',
                    fontSize: '1.5rem',
                  }}>
                  📋 Assignment Questions
                </h3>
                {Object.entries(assignment.questions).map(
                  ([qKey, question], index) => (
                    <div
                      key={qKey}
                      className='service-card'
                      style={{
                        marginBottom: '1.5rem',
                        border: '2px solid #e5e7eb',
                      }}>
                      {/* Question Header */}
                      <div style={{ marginBottom: '1rem' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '0.5rem',
                          }}>
                          <span
                            style={{
                              background: '#3b82f6',
                              color: 'white',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '9999px',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                            }}>
                            Q{index + 1}
                          </span>
                          <span
                            style={{
                              background: '#dbeafe',
                              color: '#1e40af',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                            }}>
                            {question.type || 'Question'}
                          </span>
                        </div>
                        <p
                          style={{
                            color: '#111827',
                            fontSize: '1.125rem',
                            lineHeight: '1.75',
                            margin: '0.75rem 0',
                            fontWeight: '500',
                          }}>
                          {question.question}
                        </p>
                      </div>

                      {/* MCQ Options */}
                      {question.type === 'MCQ' && question.options && (
                        <div style={{ marginBottom: '1rem' }}>
                          {question.options.map((option, optIndex) => (
                            <label
                              key={optIndex}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem',
                                marginBottom: '0.5rem',
                                border: '1px solid #e5e7eb',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                background:
                                  answers[qKey] === option
                                    ? '#dbeafe'
                                    : '#ffffff',
                                transition: 'all 0.2s',
                              }}>
                              <input
                                type='radio'
                                name={qKey}
                                value={option}
                                checked={answers[qKey] === option}
                                onChange={(e) =>
                                  setAnswers({
                                    ...answers,
                                    [qKey]: e.target.value,
                                  })
                                }
                                style={{ cursor: 'pointer' }}
                              />
                              <span
                                style={{ color: '#374151', fontSize: '1rem' }}>
                                {option}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}

                      {/* Answer-based or Coding Questions */}
                      {(question.type === 'Answer-based' ||
                        question.type === 'Coding') && (
                        <div className='form-group'>
                          <label className='form-label'>Your Answer</label>
                          <textarea
                            className='form-input'
                            rows={question.type === 'Coding' ? '12' : '6'}
                            value={answers[qKey] || ''}
                            onChange={(e) =>
                              setAnswers({ ...answers, [qKey]: e.target.value })
                            }
                            placeholder={
                              question.type === 'Coding'
                                ? '// Write your code here...'
                                : 'Enter your answer here...'
                            }
                            style={{
                              resize: 'vertical',
                              fontFamily:
                                question.type === 'Coding'
                                  ? 'monospace'
                                  : 'inherit',
                              fontSize:
                                question.type === 'Coding'
                                  ? '0.875rem'
                                  : '1rem',
                            }}
                          />
                        </div>
                      )}

                      {/* Test Case Info for Coding Questions */}
                      {question.type === 'Coding' && question.testCase && (
                        <div
                          style={{
                            background: '#f0f9ff',
                            border: '1px solid #bae6fd',
                            borderRadius: '0.5rem',
                            padding: '0.75rem',
                            marginTop: '0.5rem',
                          }}>
                          <p
                            style={{
                              color: '#0369a1',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              margin: '0 0 0.25rem 0',
                            }}>
                            💡 Test Case:
                          </p>
                          <p
                            style={{
                              color: '#0c4a6e',
                              fontSize: '0.875rem',
                              margin: 0,
                              fontFamily: 'monospace',
                            }}>
                            {question.testCase}
                          </p>
                        </div>
                      )}

                      {/* Submit Button for Individual Question */}
                      <div style={{ marginTop: '1rem' }}>
                        <button
                          type='button'
                          className='btn-primary'
                          onClick={() => handleQuestionSubmit(qKey)}
                          disabled={submittedQuestions[qKey]}
                          style={{
                            width: '100%',
                            background: submittedQuestions[qKey]
                              ? '#10b981'
                              : '#3b82f6',
                            opacity: submittedQuestions[qKey] ? 0.8 : 1,
                            cursor: submittedQuestions[qKey]
                              ? 'default'
                              : 'pointer',
                          }}>
                          {submittedQuestions[qKey]
                            ? '✓ Submitted'
                            : 'Submit Answer'}
                        </button>
                        <div
                          id={`success-${qKey}`}
                          style={{
                            display: 'none',
                            marginTop: '0.5rem',
                            padding: '0.5rem',
                            background: '#d1fae5',
                            border: '1px solid #6ee7b7',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            color: '#065f46',
                            textAlign: 'center',
                          }}>
                          ✓ Answer saved successfully!
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

          {/* Additional Submission Type Selector */}
          <div className='form-group' style={{ marginTop: '2rem' }}>
            <label className='form-label'>
              Additional Submission (Optional)
            </label>
            <p
              style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                marginBottom: '0.75rem',
              }}>
              You can optionally attach additional files, code, or notes with
              your submission
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                }}>
                <input
                  type='radio'
                  name='submissionType'
                  value='text'
                  checked={submissionType === 'text'}
                  onChange={(e) => setSubmissionType(e.target.value)}
                />
                <span>📝 Text Notes</span>
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                }}>
                <input
                  type='radio'
                  name='submissionType'
                  value='code'
                  checked={submissionType === 'code'}
                  onChange={(e) => setSubmissionType(e.target.value)}
                />
                <span>💻 Additional Code</span>
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                }}>
                <input
                  type='radio'
                  name='submissionType'
                  value='file'
                  checked={submissionType === 'file'}
                  onChange={(e) => setSubmissionType(e.target.value)}
                />
                <span>📎 File Upload</span>
              </label>
            </div>
          </div>

          {/* Text Submission */}
          {submissionType === 'text' && (
            <div className='form-group'>
              <label className='form-label'>Additional Notes</label>
              <textarea
                className='form-input'
                rows='6'
                value={textSubmission}
                onChange={(e) => setTextSubmission(e.target.value)}
                placeholder='Add any additional notes or explanations...'
                style={{ resize: 'vertical' }}
              />
            </div>
          )}

          {/* Code Submission */}
          {submissionType === 'code' && (
            <>
              <div className='form-group'>
                <label className='form-label'>Programming Language</label>
                <select
                  className='form-input'
                  value={codeSubmission.language}
                  onChange={(e) =>
                    setCodeSubmission({
                      ...codeSubmission,
                      language: e.target.value,
                    })
                  }>
                  <option value='javascript'>JavaScript</option>
                  <option value='python'>Python</option>
                  <option value='java'>Java</option>
                  <option value='cpp'>C++</option>
                  <option value='c'>C</option>
                  <option value='html'>HTML</option>
                  <option value='css'>CSS</option>
                  <option value='other'>Other</option>
                </select>
              </div>
              <div className='form-group'>
                <label className='form-label'>Your Code</label>
                <textarea
                  className='form-input'
                  rows='15'
                  value={codeSubmission.code}
                  onChange={(e) =>
                    setCodeSubmission({
                      ...codeSubmission,
                      code: e.target.value,
                    })
                  }
                  placeholder='// Write your code here...'
                  required
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    resize: 'vertical',
                  }}
                />
              </div>
            </>
          )}

          {/* File Upload */}
          {submissionType === 'file' && (
            <div className='form-group'>
              <label className='form-label'>Upload Files</label>
              <input
                type='file'
                className='form-input'
                multiple
                onChange={handleFileChange}
                accept='.pdf,.doc,.docx,.txt,.zip,.rar,.jpg,.jpeg,.png,.gif,.js,.py,.java,.cpp,.c,.html,.css,.json,.xml'
                required
              />
              <p
                style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  marginTop: '0.5rem',
                }}>
                Accepted: Documents, Images, Code files, Archives (Max 5 files,
                10MB each)
              </p>
              {files.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                    }}>
                    Selected Files:
                  </p>
                  <ul
                    style={{
                      fontSize: '0.875rem',
                      color: '#374151',
                      paddingLeft: '1.5rem',
                    }}>
                    {files.map((file, index) => (
                      <li key={index}>
                        {file.name} ({(file.size / 1024).toFixed(2)} KB)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Final Submit Button */}
          <button
            type='submit'
            className='btn-primary'
            disabled={submitting}
            style={{
              width: '100%',
              opacity: submitting ? 0.7 : 1,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}>
            {submitting
              ? 'Submitting Final Assignment...'
              : existingSubmission
              ? 'Resubmit Final Assignment'
              : 'Submit Final Assignment'}
          </button>
        </form>

        {/* Info Box */}
        <div
          style={{
            marginTop: '2rem',
            padding: '1rem',
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '0.75rem',
          }}>
          <h4
            style={{
              color: '#0369a1',
              margin: '0 0 0.5rem 0',
              fontSize: '1rem',
            }}>
            📌 Submission Guidelines
          </h4>
          <ul
            style={{
              color: '#0c4a6e',
              fontSize: '0.875rem',
              lineHeight: '1.6',
              paddingLeft: '1.5rem',
              margin: 0,
            }}>
            <li>
              Choose the appropriate submission type based on the assignment
              requirements
            </li>
            <li>
              For file uploads, ensure files are properly named and organized
            </li>
            <li>You can resubmit your work to improve your score</li>
            <li>
              Once graded, you'll receive an email notification with your score
              and feedback
            </li>
            <li>Make sure to review your submission before clicking submit</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
