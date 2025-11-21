import { useState } from 'react';
import { Link } from 'react-router-dom';

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
            identifier: loginData.identifier, // email or student_id
            password: loginData.password,
          }),
        }
      );
      console.log(response);

      if (response.ok) {
        const data = await response.json();
        // Store auth token and user info
        console.log(data);
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('userRole', 'student');
        localStorage.setItem('studentInfo', JSON.stringify(data.data.student));
        setIsLoggedIn(true);
      } else {
        const errorData = await response.json();
        setLoginError(errorData.message || 'Invalid credentials');
      }
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

  if (isLoggedIn) {
    return (
      <div
        className='container'
        style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Welcome Header */}
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
                  style={{ textAlign: 'center' }}>
                  View Profile
                </Link>
                <button className='btn-outline'>Continue Learning</button>
                <button className='btn-outline'>View Assignments</button>
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
                <button
                  className='btn-outline'
                  style={{ justifyContent: 'flex-start' }}>
                  📚 Course Handbook
                </button>
                <button
                  className='btn-outline'
                  style={{ justifyContent: 'flex-start' }}>
                  🎥 Video Lectures
                </button>
                <button
                  className='btn-outline'
                  style={{ justifyContent: 'flex-start' }}>
                  💻 Code Examples
                </button>
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
              onClick={() => setIsLoggedIn(false)}
              className='btn-secondary'>
              Logout
            </button>
          </div>
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

        {/* Demo Credentials */}
        <div
          style={{
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginTop: '1.5rem',
          }}>
          <h3
            style={{
              color: '#0369a1',
              fontSize: '0.875rem',
              marginBottom: '0.5rem',
            }}>
            Demo Credentials (for testing):
          </h3>
          <div
            style={{
              fontSize: '0.75rem',
              color: '#0c4a6e',
              lineHeight: '1.4',
            }}>
            <div>
              <strong>Email:</strong> demo@student.com
            </div>
            <div>
              <strong>Password:</strong> demo123
            </div>
          </div>
        </div>

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
