// src/pages/NextGenFreeEdu/StudentExams.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StudentProfileNav from '../../components/StudentProfileNav';

export default function StudentExams() {
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // ---- Student info (localStorage se) ----
  const getStudentData = () => {
    const studentInfo = localStorage.getItem('studentInfo');
    return studentInfo ? JSON.parse(studentInfo) : null;
  };

  const studentData = getStudentData();
  const studentCourse = studentData?.course?.title || '';

  // ---- Exams fetch karna ----
  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        setError(null);

        const baseUrl =
          import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

        // ✅ Ab courseName ke hisaab se exams fetch kar rahe hain
        const params =
          studentCourse && studentCourse.trim()
            ? `?courseName=${encodeURIComponent(studentCourse)}`
            : '';

        const url = `${baseUrl}/nextgen/student/exams${params}`;

        const res = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`,
          },
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to fetch exams');
        }

        // Expect: data.data.exams = array from ng_exams
        const rawExams = data.data?.exams || data.data || [];

        // Thoda normalize kar lete hain
        const normalized = rawExams.map((exam) => ({
          _id: exam._id,
          title: exam.title || exam.examName || exam.name || 'Untitled Exam',
          courseName:
            exam.courseName || exam.course?.title || studentCourse || 'Course',
          totalQuestions: exam.totalQuestions || exam.questions?.length || 0,
          duration: exam.duration || exam.durationMinutes || 0,
          totalMarks: exam.totalMarks || exam.maxMarks || 0,
          createdAt: exam.createdAt,
          isLocked: exam.isLocked || false,
          isCompleted: exam.isCompleted || false,
          submission: exam.submission || null,
          // keep raw for passing to next page
          raw: exam,
        }));

        setExams(normalized);
      } catch (err) {
        console.error('Error fetching exams:', err);
        setError(
          err.message || 'Failed to load exams. Please try again later.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [studentCourse]); // ✅ sirf course change hone par refetch

  // ---- Filter + Search ----
  const filteredExams = exams.filter((exam) => {
    const matchesCourse =
      selectedCourse === 'all' || exam.courseName === selectedCourse;

    const matchesSearch =
      (exam.title || '')
        .toLowerCase()
        .includes(searchTerm.trim().toLowerCase()) ||
      (exam.courseName || '')
        .toLowerCase()
        .includes(searchTerm.trim().toLowerCase());

    return matchesCourse && matchesSearch;
  });

  const courseNames = [
    'all',
    ...new Set(exams.map((e) => e.courseName).filter(Boolean)),
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div
        className='container'
        style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
            Loading exams...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className='container'
      style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <StudentProfileNav />
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
            }}>
            <div>
              <h1
                style={{
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  color: '#111827',
                  marginBottom: '0.5rem',
                }}>
                📘 Course Exams
              </h1>
              <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
                View and attempt your upcoming and active exams
              </p>
            </div>
            <Link to='/nextgen/login' className='btn-outline'>
              ← Back to Dashboard
            </Link>
          </div>

          {studentCourse && (
            <div
              style={{
                background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                border: '2px solid #3b82f6',
                borderRadius: '0.75rem',
                padding: '1rem',
                marginTop: '1rem',
              }}>
              <p style={{ margin: 0, color: '#1e40af', fontWeight: '500' }}>
                Your Course: <strong>{studentCourse}</strong>
              </p>
            </div>
          )}
        </div>

        {/* Search + Filter */}
        <div
          style={{
            background: '#f8fafc',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            marginBottom: '2rem',
          }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem',
            }}>
            {/* Search */}
            <div>
              <label className='form-label'>Search Exams</label>
              <input
                type='text'
                placeholder='Search by exam or course...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='form-input'
                style={{ width: '100%' }}
              />
            </div>

            {/* Course Filter */}
            <div>
              <label className='form-label'>Filter by Course</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className='form-input'
                style={{ width: '100%' }}>
                {courseNames.map((course) => (
                  <option key={course} value={course}>
                    {course === 'all' ? 'All Courses' : course}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            style={{
              marginTop: '1rem',
              color: '#6b7280',
              fontSize: '0.875rem',
            }}>
            Showing {filteredExams.length} of {exams.length} exam(s)
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: '#fef2f2',
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
            <button
              onClick={() => window.location.reload()}
              className='btn-primary'
              style={{ marginTop: '1rem' }}>
              Retry
            </button>
          </div>
        )}

        {/* Exams Grid */}
        {filteredExams.length === 0 ? (
          <div
            className='service-card'
            style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
            <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>
              No Exams Found
            </h3>
            <p style={{ color: '#6b7280' }}>
              {searchTerm || selectedCourse !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'There are no active exams available at this time.'}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '1.5rem',
            }}>
            {filteredExams.map((exam) => {
              const isStudentCourse = exam.courseName === studentCourse;
              const isLocked = exam.isLocked || false;
              const isCompleted = exam.isCompleted || false;

              return (
                <div
                  key={exam._id}
                  className='service-card'
                  style={{
                    border: isStudentCourse
                      ? '2px solid #3b82f6'
                      : '1px solid #e5e7eb',
                    background: isLocked
                      ? 'linear-gradient(135deg, #f3f4f6, #ffffff)'
                      : isStudentCourse
                      ? 'linear-gradient(135deg, #f0f9ff, #ffffff)'
                      : '#ffffff',
                    opacity: isLocked ? 0.7 : 1,
                  }}>
                  {/* Badges */}
                  <div
                    style={{
                      marginBottom: '1rem',
                      display: 'flex',
                      gap: '0.5rem',
                      flexWrap: 'wrap',
                    }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        background: isStudentCourse ? '#dbeafe' : '#f3f4f6',
                        color: isStudentCourse ? '#1e40af' : '#374151',
                      }}>
                      {exam.courseName}
                      {isStudentCourse && ' ⭐'}
                    </span>
                    {isLocked && (
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          background: '#fef3c7',
                          color: '#92400e',
                        }}>
                        🔒 Locked
                      </span>
                    )}
                    {isCompleted && (
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          background: '#d1fae5',
                          color: '#065f46',
                        }}>
                        ✓ Completed
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3
                    className='service-title'
                    style={{
                      marginBottom: '0.75rem',
                      color: isLocked
                        ? '#6b7280'
                        : isStudentCourse
                        ? '#1e40af'
                        : '#111827',
                    }}>
                    {isLocked && '🔒 '}
                    {exam.title}
                  </h3>

                  {/* Details */}
                  <div
                    style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      marginBottom: '1rem',
                      lineHeight: '1.6',
                    }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.5rem',
                      }}>
                      <span>📊</span>
                      <span>
                        <strong>{exam.totalQuestions}</strong> Questions
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.5rem',
                      }}>
                      <span>⏱</span>
                      <span>
                        Duration: <strong>{exam.duration}</strong> mins
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.5rem',
                      }}>
                      <span>🎯</span>
                      <span>Total Marks: {exam.totalMarks}</span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.5rem',
                      }}>
                      <span>📅</span>
                      <span>Created: {formatDate(exam.createdAt)}</span>
                    </div>
                    {isCompleted && exam.submission && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginTop: '0.5rem',
                        }}>
                        <span>⭐</span>
                        <span style={{ color: '#22c55e', fontWeight: '600' }}>
                          Score: {exam.submission.score || 'N/A'}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.75rem',
                      flexDirection: 'column',
                    }}>
                    <button
                      className='btn-primary'
                      style={{
                        width: '100%',
                        opacity: isLocked ? 0.5 : 1,
                        cursor: isLocked ? 'not-allowed' : 'pointer',
                      }}
                      disabled={isLocked}
                      onClick={() => {
                        if (!isLocked) {
                          // Pass exam object in navigation state so Exam page can render immediately
                          navigate({
                            pathname: '/nextgen/exam',
                            search: `?examId=${encodeURIComponent(exam._id)}`,
                          }, { state: { exam } });
                        }
                      }}>
                      {isCompleted ? 'Retake Exam' : 'Start Exam'}
                    </button>
                    <button
                      className='btn-outline'
                      style={{ width: '100%' }}
                      onClick={() => {
                        navigate({
                          pathname: '/nextgen/exam',
                          search: `?examId=${encodeURIComponent(exam._id)}&view=details`,
                        }, { state: { exam } });
                      }}>
                      View Details
                    </button>
                  </div>

                  {isStudentCourse && (
                    <div
                      style={{
                        marginTop: '1rem',
                        padding: '0.5rem',
                        background: '#dbeafe',
                        borderRadius: '0.5rem',
                        textAlign: 'center',
                        fontSize: '0.75rem',
                        color: '#1e40af',
                        fontWeight: '600',
                      }}>
                      This is for your enrolled course
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Info Section */}
        <div
          style={{
            marginTop: '3rem',
            padding: '1.5rem',
            background: '#f0f9ff',
          }}>
          <h3
            style={{
              color: '#0369a1',
              marginBottom: '1rem',
              fontSize: '1.125rem',
            }}>
            📌 Exam Information
          </h3>
          <ul
            style={{
              color: '#0c4a6e',
              fontSize: '0.875rem',
              lineHeight: '1.8',
              paddingLeft: '1.5rem',
              margin: 0,
            }}>
            <li>
              <strong>🔒 Progressive Access:</strong> Some exams may unlock only
              after completing previous ones.
            </li>
            <li>
              <strong>⭐ Your Course:</strong> Exams marked with ⭐ are for your
              enrolled course.
            </li>
            <li>
              <strong>✓ Track Progress:</strong> Completed exams show your score
              and status.
            </li>
            <li>
              <strong>🔄 Retake:</strong> If enabled, you can retake exams to
              improve your score.
            </li>
            <li>
              <strong>📚 Multiple Courses:</strong> You can browse exams from
              different courses.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
