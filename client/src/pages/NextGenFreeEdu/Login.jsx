import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { apiClient } from '../../utils/api';
import StudentProfileNav from '../../components/StudentProfileNav';

export default function StudentLogin() {
  const location = useLocation();
  const [loginData, setLoginData] = useState({
    identifier: '',
    password: '',
    rememberMe: false,
  });

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [codingStats, setCodingStats] = useState({
    streak: 0,
    total_solved: 0,
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('studentInfo');
      if (!stored) return;

      const student = JSON.parse(stored);
      const studentId = student?._id || student?.id;
      if (!studentId) return;

      const baseUrl =
        import.meta.env.VITE_API_URL || 'https://emp-new-iksg-git-main-teamoflifeboxs-projects.vercel.app/api';

      fetch(`${baseUrl}/nextgen/coding/stats/${studentId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setCodingStats({
              streak: data.data.streak || 0,
              total_solved: data.data.total_solved || 0,
            });
          }
        })
        .catch((err) => {
          console.error('Error fetching coding stats:', err);
        });
    } catch (err) {
      console.error('Error parsing studentInfo:', err);
    }
  }, []);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const studentInfo = localStorage.getItem('studentInfo');
    if (authToken && studentInfo) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [location]); // Re-check when location changes (e.g., after logout redirect)
  const [profileDataView, setProfileDataView] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [assignmentPending, setAssignmentPending] = useState(0);
  const [overallProgress, setOverAll] = useState(0);
  const [assignments, setAssignments] = useState([]);
  const [showAssignments, setShowAssignments] = useState(false);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [assignmentsError, setAssignmentsError] = useState('');
  const [studentRank, setStudentRank] = useState(null);
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
          import.meta.env.VITE_API_URL || 'https://emp-new-iksg-git-main-teamoflifeboxs-projects.vercel.app/api'
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
  const profileData = async () => {
    if (isLoggedIn) {
      try {
        const studentData = getStudentData();
        console.log('Student Data:', studentData);
        const studentId = studentData?.student_id || studentData?.id;
        console.log('Student ID:', studentId);
        const courseId = studentData?.course?._id;

        const token = localStorage.getItem('authToken');
        const response = await apiClient.getNextGenStudentProfileData(
          studentId,
          courseId,
          token
        );
        if (
          response.Data.course.assignments.length -
            response.Data.completedAssignments >=
          0
        ) {
          setAssignmentPending(
            response.Data.course.assignments.length -
              response.Data.completedAssignments
          );
        } else {
          setAssignmentPending(0);
        }
        setProfileDataView(response.Data);
        setRecentActivities(response.Data.recentActivity.activities);

        const NoOfClassAttended = response.Data.noOfClassAttended;
        console.log(response.Data);
        if (NoOfClassAttended / 38 <= 1) {
          setOverAll(Math.round((NoOfClassAttended / 38) * 100));
        } else {
          setOverAll(100);
        }

        console.log('Profile Data Response:', recentActivities);
        if (response.success) {
          setStudentRank(response.data.rank);
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
      }
    }
  };
  useEffect(() => {
    profileData();
  }, [isLoggedIn]);

  if (isLoggedIn) {
    return (
      <div
        className='container'
        style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Navigation Bar */}
          <StudentProfileNav />

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
                    {overallProgress}%
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
                      width: `${overallProgress}%`,
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
                    {profileDataView?.studentRank || 1}
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
              <h3 className='service-title'>Coding Practice</h3>

              <p
                style={{
                  fontSize: '0.9rem',
                  color: '#6b7280',
                  marginBottom: '1rem',
                }}>
                Improve your coding by solving interactive challenges using live
                compiler.
              </p>

              <button
                onClick={() => navigate('/nextgen/coding-practice')}
                style={{
                  width: '100%',
                  background: '#2563eb',
                  color: 'white',
                  padding: '10px',
                  fontSize: '1rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: '0.2s',
                }}
                onMouseEnter={(e) => (e.target.style.background = '#1d4ed8')}
                onMouseLeave={(e) => (e.target.style.background = '#2563eb')}>
                Start Coding Practice 🚀
              </button>

              <div
                style={{
                  marginTop: '1.5rem',
                  fontSize: '0.85rem',
                  color: '#6b7280',
                }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  🔥 <strong>Streak:</strong> {codingStats.streak} days
                </div>
                <div>
                  🧠 <strong>Total Problems Solved:</strong>{' '}
                  {codingStats.total_solved}
                </div>
              </div>
            </div>

            {/*Recent Events */}
            <div
              className='service-card'
              style={{
                padding: '1rem',
                background: '#fff',
                borderRadius: '0.7rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                maxHeight: '350px',
                overflowY: 'auto',
                scrollbarWidth: 'thin', // for Firefox
                scrollbarColor: 'transparent transparent', // hide scrollbar in Firefox
              }}>
              <h3
                className='service-title'
                style={{
                  marginBottom: '1rem',
                  fontSize: '1.25rem',
                  fontWeight: '700',
                }}>
                Recent Activity
              </h3>

              <div
                style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  lineHeight: '1.6',
                }}>
                {recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: '0.75rem',
                      paddingBottom: '0.75rem',
                      borderBottom:
                        index !== recentActivities.length - 1
                          ? '1px solid #f3f4f6'
                          : 'none',
                    }}>
                    <div style={{ fontWeight: '500', color: '#374151' }}>
                      {activity.activityType}: {activity.description}
                    </div>
                    <div>
                      {activity.extraData?.score !== undefined &&
                        `Score: ${activity.extraData.score}% • `}
                      {new Date(activity.timestamp).toLocaleDateString(
                        'en-US',
                        {
                          month: 'short',
                          day: 'numeric',
                        }
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Custom scrollbar for Webkit browsers */}
              <style jsx>{`
                .service-card::-webkit-scrollbar {
                  width: 6px;
                }
                .service-card::-webkit-scrollbar-track {
                  background: transparent;
                }
                .service-card::-webkit-scrollbar-thumb {
                  background-color: rgba(107, 114, 128, 0.5);
                  border-radius: 3px;
                  transition: background-color 0.2s;
                }
                .service-card::-webkit-scrollbar-thumb:hover {
                  background-color: rgba(107, 114, 128, 0.8);
                }
              `}</style>
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
                    {profileDataView?.studentScore || 0}
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
                    {profileDataView?.completedAssignments || 0}
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
                    {assignmentPending || 0}
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
                    {profileDataView?.studentRank || 1}
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
                  📚 Class Lecture
                </Link>
                <Link
                  to={`/nextgen/lectures`}
                  className='btn-outline'
                  style={{ justifyContent: 'flex-start' }}>
                  🎥 Video Lectures
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
        </div>
      </div>
    );
  }
  console.log('==========', overallProgress);
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
