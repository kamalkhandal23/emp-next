import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../utils/api';

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Get student data from localStorage
  const getStudentData = () => {
    const studentInfo = localStorage.getItem('studentInfo');
    return studentInfo ? JSON.parse(studentInfo) : null;
  };

  const studentData = getStudentData();
  const studentCourse = studentData?.course?.title || '';

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getAllNextGenAssignments();

      if (response.success) {
        // Filter to show only published assignments
        const publishedAssignments = (response.data.assignments || []).filter(
          (assignment) => assignment.status === 'published'
        );
        setAssignments(publishedAssignments);
      } else {
        throw new Error(response.message || 'Failed to fetch assignments');
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError(err.message || 'Failed to load assignments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter assignments based on selected course and search term
  const filteredAssignments = assignments.filter((assignment) => {
    const matchesCourse =
      selectedCourse === 'all' || assignment.courseName === selectedCourse;
    const matchesSearch =
      (assignment.assignmentName || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (assignment.courseName || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesCourse && matchesSearch;
  });

  // Get unique course names for filter
  const courseNames = [
    'all',
    ...new Set(assignments.map((a) => a.courseName).filter(Boolean)),
  ];

  // Helper function to format date
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
            Loading assignments...
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
                📚 Course Assignments
              </h1>
              <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
                View and complete your course assignments
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

        {/* Search and Filter */}
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
              <label className='form-label'>Search Assignments</label>
              <input
                type='text'
                placeholder='Search by name or course...'
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
            Showing {filteredAssignments.length} of {assignments.length}{' '}
            assignment(s)
          </div>
        </div>

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
            <button
              onClick={fetchAssignments}
              className='btn-primary'
              style={{ marginTop: '1rem' }}>
              Retry
            </button>
          </div>
        )}

        {/* Assignments Grid */}
        {filteredAssignments.length === 0 ? (
          <div
            className='service-card'
            style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
            <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>
              No Assignments Found
            </h3>
            <p style={{ color: '#6b7280' }}>
              {searchTerm || selectedCourse !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'There are no published assignments available at this time.'}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '1.5rem',
            }}>
            {filteredAssignments.map((assignment) => {
              const isStudentCourse = assignment.courseName === studentCourse;

              return (
                <div
                  key={assignment._id}
                  className='service-card'
                  style={{
                    border: isStudentCourse
                      ? '2px solid #3b82f6'
                      : '1px solid #e5e7eb',
                    background: isStudentCourse
                      ? 'linear-gradient(135deg, #f0f9ff, #ffffff)'
                      : '#ffffff',
                  }}>
                  {/* Course Badge */}
                  <div style={{ marginBottom: '1rem' }}>
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
                      {assignment.courseName}
                      {isStudentCourse && ' ⭐'}
                    </span>
                  </div>

                  {/* Assignment Title */}
                  <h3
                    className='service-title'
                    style={{
                      marginBottom: '0.75rem',
                      color: isStudentCourse ? '#1e40af' : '#111827',
                    }}>
                    {assignment.assignmentName}
                  </h3>

                  {/* Assignment Details */}
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
                        <strong>{assignment.totalQuestions}</strong> Questions
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.5rem',
                      }}>
                      <span>📅</span>
                      <span>Created: {formatDate(assignment.createdAt)}</span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}>
                      <span>✅</span>
                      <span
                        style={{
                          color: '#22c55e',
                          fontWeight: '600',
                        }}>
                        Published
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.75rem',
                      flexDirection: 'column',
                    }}>
                    <button
                      className='btn-primary'
                      style={{ width: '100%' }}
                      onClick={() => {
                        // TODO: Navigate to assignment taking page
                        alert(
                          `Starting assignment: ${assignment.assignmentName}`
                        );
                      }}>
                      Start Assignment
                    </button>
                    <button
                      className='btn-outline'
                      style={{ width: '100%' }}
                      onClick={() => {
                        // TODO: View assignment details
                        alert(
                          `Viewing details for: ${assignment.assignmentName}`
                        );
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
            border: '1px solid #bae6fd',
            borderRadius: '0.75rem',
          }}>
          <h3
            style={{
              color: '#0369a1',
              marginBottom: '1rem',
              fontSize: '1.125rem',
            }}>
            📌 Assignment Information
          </h3>
          <ul
            style={{
              color: '#0c4a6e',
              fontSize: '0.875rem',
              lineHeight: '1.8',
              paddingLeft: '1.5rem',
              margin: 0,
            }}>
            <li>Complete assignments to track your learning progress</li>
            <li>Assignments marked with ⭐ are for your enrolled course</li>
            <li>
              You can view all published assignments from different courses
            </li>
            <li>Make sure to submit your work before the deadline</li>
            <li>
              Contact support if you have any questions about an assignment
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
