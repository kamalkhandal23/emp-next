import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '@utils/api.js';

export default function StudentLogin() {
  const [loginData, setLoginData] = useState({
    identifier: '',
    password: '',
    rememberMe: false,
  });

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const studentInfo = localStorage.getItem('studentInfo');
    if (authToken && studentInfo) {
      setIsLoggedIn(true);
    }
  }, []);
  const [assignments, setAssignments] = useState([]);
  const [showAssignments, setShowAssignments] = useState(false);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [assignmentsError, setAssignmentsError] = useState('');
  const navigate = useNavigate();

  // Get student data from localStorage
  const getStudentData = () => {
    const studentInfo = localStorage.getItem('studentInfo');
    return studentInfo ? JSON.parse(studentInfo) : null;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setLoginError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || 'http://localhost:5002/api'
        }/nextgen/student/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            identifier: loginData.identifier,
            password: loginData.password,
          }),
        }
      );

      // Pehle JSON parse karo
      const data = await response.json();
      console.log('Login response data:', data);

      if (!response.ok || data.success === false) {
        setLoginError(data.message || 'Invalid credentials');
        return;
      }

      // ✅ Yaha multiple possible shapes handle kar rahe hain
      const token =
        data?.data?.token || // { data: { token, student } }
        data?.token || // { token, student }
        data?.accessToken; // { accessToken, user }

      const student =
        data?.data?.student || // { data: { student } }
        data?.student || // { student }
        data?.user; // { user }

      if (!token) {
        console.error('No token in response JSON:', data);
        setLoginError(
          'Login successful but no token received. Please contact support.'
        );
        return;
      }

      // ✅ Token & student info save
      localStorage.setItem('authToken', token);
      localStorage.setItem('userRole', 'student');

      if (student) {
        localStorage.setItem('studentInfo', JSON.stringify(student));
        console.log('✅ Login successful - saved authToken and studentInfo');
      } else {
        console.warn('⚠️ Login successful but no student data to save');
      }

      setIsLoggedIn(true);
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Network error. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setShowForgotPassword(true);
    setTimeout(() => {
      setShowForgotPassword(false);
      alert('Password reset link sent to your email!');
    }, 1000);
  };

  const handleViewAssignments = async () => {
    try {
      setAssignmentsLoading(true);
      setAssignmentsError('');
      const studentData = getStudentData();
      if (!studentData || !studentData.course || !studentData.course.title) {
        setAssignmentsError(
          'Unable to determine your course. Please refresh the page.'
        );
        return;
      }

      const response = await apiClient.getAllNextGenAssignments({
        status: 'published',
        courseName: studentData.course.title,
      });

      if (response.success) {
        setAssignments(response.data.assignments || []);
        setShowAssignments(true);
      } else {
        throw new Error(response.message || 'Failed to fetch assignments');
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setAssignmentsError(err.message);
    } finally {
      setAssignmentsLoading(false);
    }
  };

  if (isLoggedIn) {
    return (
      <div
        className='container'
        style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* ,Welcome Header */}
          <div
            className='service-card'
            style={{
              background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
              border: '2px solid #3b82f6',
              marginBottom: '2rem',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '3rem' }}>👋</div>
              <div>
                <h1 style={{ margin: 0, color: '#1e40af' }}>
                  Welcome back, {getStudentData()?.fullName}!
                </h1>
                <p style={{ margin: '0.5rem 0 0 0', color: '#1e3a8a' }}>
                  Student ID: {getStudentData()?.student_id} •{' '}
                  {getStudentData()?.course?.title || 'Course'}
                </p>
              </div>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className='services-grid'>
            {/* Course Progress */}
            <div className='service-card'>
              <h3 className='service-title'>Course Progress</h3>
              <div style={{ marginBottom: '1rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem',
                  }}>
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Overall Progress
                  </span>
                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#374151',
                    }}>
                    0%
                  </span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    background: '#e5e7eb',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}>
                  <div
                    style={{
                      width: `0%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                <div>Current Module: React Fundamentals</div>
                <div>Next: State Management with Redux</div>
                {/* Student Rank */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.8rem',
                    marginTop: '0.5rem',
                  }}>
                  <span
                    style={{
                      fontSize: '1rem',
                      color: '#4b5563',
                      fontWeight: '600',
                    }}>
                    Current Rank
                  </span>
                  <span
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: '#111827',
                    }}>
                    {/*{studentRank || 1}*/ 1}
                  </span>
                </div>

                <button
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                  onClick={() => navigate('/nextgen/leaderboard')}>
                  View Leaderboard
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className='service-card'>
              <h3 className='service-title'>Quick Actions</h3>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}>
                <Link
                  to='/nextgen/exam'
                  className='btn-primary'
                  style={{ textAlign: 'center' }}>
                  Take Pending Exam
                </Link>

                <Link
                  to='/nextgen/profile'
                  className='btn-secondary'
                  style={{ textAlign: 'center' }}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/nextgen/profile');
                  }}>
                  View Profile
                </Link>

                <Link
                  to='/nextgen/exams'
                  className='btn-outline'
                  style={{ textAlign: 'center' }}>
                  View Exams
                </Link>

                <Link
                  to='/nextgen/assignments'
                  className='btn-outline'
                  style={{ textAlign: 'center' }}>
                  View Assignments
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className='service-card'>
              <h3 className='service-title'>Recent Activity</h3>
              <div
                style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  lineHeight: '1.6',
                }}>
                <div
                  style={{
                    marginBottom: '0.75rem',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid #f3f4f6',
                  }}>
                  <div style={{ fontWeight: '500', color: '#374151' }}>
                    Completed: JavaScript Basics
                  </div>
                  <div>Score: 92% • 2 days ago</div>
                </div>
                <div
                  style={{
                    marginBottom: '0.75rem',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid #f3f4f6',
                  }}>
                  <div style={{ fontWeight: '500', color: '#374151' }}>
                    Submitted: Portfolio Project
                  </div>
                  <div>Status: Under Review • 3 days ago</div>
                </div>
                <div>
                  <div style={{ fontWeight: '500', color: '#374151' }}>
                    Attended: Live Session
                  </div>
                  <div>Topic: React Hooks • 5 days ago</div>
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className='service-card'>
              <h3 className='service-title'>Upcoming Events</h3>
              <div
                style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  lineHeight: '1.6',
                }}>
                <div
                  style={{
                    marginBottom: '0.75rem',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid #f3f4f6',
                  }}>
                  <div style={{ fontWeight: '500', color: '#374151' }}>
                    Live Session: Redux Deep Dive
                  </div>
                  <div>Tomorrow, 7:00 PM IST</div>
                </div>
                <div
                  style={{
                    marginBottom: '0.75rem',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid #f3f4f6',
                  }}>
                  <div style={{ fontWeight: '500', color: '#374151' }}>
                    Assignment Due: API Integration
                  </div>
                  <div>In 3 days</div>
                </div>
                <div>
                  <div style={{ fontWeight: '500', color: '#374151' }}>
                    Mid-term Assessment
                  </div>
                  <div>Next week</div>
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className='service-card'>
              <h3 className='service-title'>Performance Stats</h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                }}>
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: '2rem',
                      fontWeight: '700',
                      color: '#22c55e',
                    }}>
                    92%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    Avg. Score
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: '2rem',
                      fontWeight: '700',
                      color: '#3b82f6',
                    }}>
                    15
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    Completed
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: '2rem',
                      fontWeight: '700',
                      color: '#f59e0b',
                    }}>
                    3
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    Pending
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: '2rem',
                      fontWeight: '700',
                      color: '#8b5cf6',
                    }}>
                    8
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    Rank
                  </div>
                </div>
              </div>
            </div>

            {/* Course Materials */}
            <div className='service-card'>
              <h3 className='service-title'>Course Materials</h3>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}>
                <Link
                  to={`/nextgen/class-link`}
                  className='btn-outline'
                  style={{ justifyContent: 'flex-start' }}>
                  📚 Course Handbook
                </Link>

                <Link
                  to={`/nextgen/lectures`}
                  style={{ textDecoration: 'none' }}>
                  <button
                    className='btn-outline'
                    style={{
                      justifyContent: 'flex-start',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px 16px',
                      cursor: 'pointer',
                    }}>
                    🎥 View Available Lectures
                  </button>
                </Link>
                <Link
                  to='/nextgen/coding-exams'
                  className='btn-outline'
                  style={{ justifyContent: 'flex-start' }}>
                  💻 Coding Exams
                </Link>
                <Link
                  to='/nextgen/results'
                  className='btn-outline'
                  style={{ justifyContent: 'flex-start' }}>
                  📊 View All Results
                </Link>
              </div>
            </div>
          </div>

          {/* Logout */}
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button
              onClick={() => {
                localStorage.removeItem('authToken');
                localStorage.removeItem('studentInfo');
                localStorage.removeItem('userRole');
                setIsLoggedIn(false);
              }}
              className='btn-secondary'>
              Logout
            </button>
          </div>
        </div>
        <div
          style={{
            width: '100%',
            height: '8px',
            background: '#e5e7eb',
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
          <div
            style={{
              width: `0%`,
              height: '100%',
              background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          <div>Current Module: React Fundamentals</div>
          <div>Next: State Management with Redux</div>
          {/* Student Rank */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.8rem',
              marginTop: '0.5rem',
            }}>
            <span
              style={{
                fontSize: '1rem',
                color: '#4b5563',
                fontWeight: '600',
              }}>
              Current Rank
            </span>
            <span
              style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#111827',
              }}>
              {/*{studentRank || 1}*/ 1}
            </span>
          </div>

          <button
            style={{
              width: '100%',
              padding: '0.5rem',
              background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.85rem',
              cursor: 'pointer',
              fontWeight: '600',
            }}
            onClick={() => console.log('Leaderboard')}>
            View Leaderboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className='container'
      style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎓</div>
          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '0.5rem',
            }}>
            Student Login
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
            Access your NextGenFreeEdu dashboard
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className='contact-form'>
          <div className='form-group'>
            <label className='form-label'>Email or Student ID</label>
            <input
              type='text'
              name='identifier'
              value={loginData.identifier}
              onChange={handleInputChange}
              required
              className='form-input'
              placeholder='Enter your email or student ID'
              style={{ borderColor: loginError ? '#ef4444' : undefined }}
            />
          </div>

          <div className='form-group'>
            <label className='form-label'>Password</label>
            <input
              type='password'
              name='password'
              value={loginData.password}
              onChange={handleInputChange}
              required
              className='form-input'
              placeholder='Enter your password'
              style={{ borderColor: loginError ? '#ef4444' : undefined }}
            />
          </div>

          {loginError && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                marginBottom: '1rem',
              }}>
              {loginError}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
            }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
              }}>
              <input
                type='checkbox'
                name='rememberMe'
                checked={loginData.rememberMe}
                onChange={handleInputChange}
              />
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>
                Remember me
              </span>
            </label>
            <button
              type='button'
              onClick={handleForgotPassword}
              disabled={showForgotPassword}
              style={{
                background: 'none',
                border: 'none',
                color: '#3b82f6',
                fontSize: '0.875rem',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}>
              {showForgotPassword ? 'Sending...' : 'Forgot Password?'}
            </button>
          </div>

          <button
            type='submit'
            disabled={isLoggingIn}
            className='btn-primary'
            style={{
              width: '100%',
              opacity: isLoggingIn ? 0.7 : 1,
              cursor: isLoggingIn ? 'not-allowed' : 'pointer',
            }}>
            {isLoggingIn ? 'Logging in...' : 'Login to Dashboard'}
          </button>
        </form>

        {/* Sign Up Link */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '2rem',
            padding: '1.5rem',
            background: '#f8fafc',
            borderRadius: '0.75rem',
          }}>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
            Don't have an account yet?
          </p>
          <Link to='/nextgen/enroll' className='btn-primary'>
            Enroll in a Course
          </Link>
        </div>

        {/* Help Section */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <p
            style={{
              color: '#9ca3af',
              fontSize: '0.875rem',
              marginBottom: '1rem',
            }}>
            Need help accessing your account?
          </p>
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}>
            <a href='mailto:support@nextgenfreeedu.com' className='btn-outline'>
              Contact Support
            </a>
            <Link to='/nextgen' className='btn-outline'>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
