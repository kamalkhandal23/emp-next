import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function normalizeStudent(raw) {
  if (!raw) return null;

  const course = raw.course_id || raw.course || {};
  const progress = raw.progress || {};
  const performance = raw.performance || {};
  return {
    _id: raw._id,
    student_id: raw.student_id || raw.studentId || raw.code || '',
    full_name: raw.full_name || raw.fullName || raw.name || '',
    email: raw.email || '',
    phone: raw.phone || '',
    date_of_birth: raw.date_of_birth || raw.dateOfBirth || '',
    status: raw.status || 'active',
    enrollment_date: raw.enrollment_date || raw.enrollmentDate || '',
    course_id: {
      title: course.title || course.name || '',
      duration_weeks: course.duration_weeks || course.durationWeeks || '',
      slug: course.slug || '',
    },
    progress: {
      overall_percentage:
        progress.overall_percentage || progress.overallPercentage || 0,
      completed_modules:
        progress.completed_modules || progress.completedModules || 0,
      total_modules: progress.total_modules || progress.totalModules || 0,
      current_module: progress.current_module || progress.currentModule || '',
    },
    performance: {
      overall_gpa: performance.overall_gpa || performance.gpa || 0,
      total_assignments:
        performance.total_assignments || performance.totalAssignments || 0,
      completed_assignments:
        performance.completed_assignments ||
        performance.completedAssignments ||
        0,
      average_score: performance.average_score || performance.averageScore || 0,
    },
  };
}

export default function StudentProfile() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStudentProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStudentProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const storedInfo = localStorage.getItem('studentInfo');

      // Debug logging
      console.log(
        '🔍 StudentProfile - authToken:',
        token ? 'exists' : 'missing'
      );
      console.log(
        '🔍 StudentProfile - studentInfo:',
        storedInfo ? 'exists' : 'missing'
      );

      // agar login hi nahi hai
      if (!token || !storedInfo) {
        console.warn('⚠️ Redirecting to login - missing token or studentInfo');
        navigate('/nextgen/login');
        return;
      }

      // 🔹 pehle localStorage ka data dikha dete hain (instant load)
      const localStudentRaw = JSON.parse(storedInfo);
      const localStudent = normalizeStudent(localStudentRaw);
      setStudent(localStudent);
      setEditData(localStudent);

      // 🔹 ab backend se fresh profile try karte hain (optional)
      const baseUrl =
        import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

      const response = await fetch(`${baseUrl}/nextgen/student/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const apiStudent = normalizeStudent(data.data.student);
        if (apiStudent) {
          setStudent(apiStudent);
          setEditData(apiStudent);
        }
      } else if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('studentInfo');
        localStorage.removeItem('userRole');
        navigate('/nextgen/login');
      } else {
        // API fail ho gayi to bhi localStorage wala data already dikha raha hai
        console.warn('Profile API failed, using localStorage studentInfo');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // error pe bhi localStorage wala data already set ho chuka hoga
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setEditData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const baseUrl =
        import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

      const response = await fetch(`${baseUrl}/nextgen/student/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: editData.phone,
          address: editData.address,
          emergency_contact: editData.emergency_contact,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const updated = normalizeStudent(data.data.student);
        setStudent(updated);
        setEditData(updated);

        // optional: localStorage bhi update kar do
        const raw = JSON.parse(localStorage.getItem('studentInfo') || '{}');
        const merged = { ...raw, ...data.data.student };
        localStorage.setItem('studentInfo', JSON.stringify(merged));

        setEditing(false);
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile. Please try again later.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again later.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('studentInfo');
    navigate('/nextgen/login');
  };

  if (loading) {
    return (
      <div
        className='container'
        style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div
          style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <div className='service-card'>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <h2>Loading Profile...</h2>
            <p style={{ color: '#6b7280' }}>
              Please wait while we fetch your information.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div
        className='container'
        style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div
          style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
          <div className='service-card' style={{ border: '2px solid #ef4444' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
            <h2 style={{ color: '#ef4444' }}>Profile Not Found</h2>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
              Unable to load your profile. Please try logging in again.
            </p>
            <Link to='/nextgen/login' className='btn-primary'>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ⬇️ niche ka UI block mostly tumhara hi hai, sirf logic upar change hua hai
  return (
    <div
      className='container'
      style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
          <div>
            <h1
              style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: '#111827',
                margin: 0,
              }}>
              Student Profile
            </h1>
            <p style={{ color: '#6b7280', margin: '0.5rem 0 0 0' }}>
              Manage your account information and track your progress
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to='/nextgen/login' className='btn-secondary'>
              Back to Dashboard
            </Link>
            <button onClick={handleLogout} className='btn-outline'>
              Logout
            </button>
          </div>
        </div>

        {/* Profile Overview */}
        <div
          className='service-card'
          style={{
            background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
            border: '2px solid #3b82f6',
            marginBottom: '2rem',
          }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2rem',
              flexWrap: 'wrap',
            }}>
            <div
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                color: 'white',
                fontWeight: '700',
              }}>
              {student.full_name?.charAt(0) || 'S'}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ color: '#1e40af', margin: '0 0 0.5rem 0' }}>
                {student.full_name}
              </h2>
              <div
                style={{
                  color: '#1e3a8a',
                  fontSize: '0.875rem',
                  lineHeight: '1.6',
                }}>
                <div>
                  <strong>Student ID:</strong> {student.student_id}
                </div>
                <div>
                  <strong>Email:</strong> {student.email}
                </div>
                <div>
                  <strong>Course:</strong> {student.course_id?.title}
                </div>
                <div>
                  <strong>Status:</strong>
                  <span
                    style={{
                      background:
                        student.status === 'active' ? '#22c55e' : '#f59e0b',
                      color: 'white',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      marginLeft: '0.5rem',
                    }}>
                    {student.status}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#1e40af',
                }}>
                {student.progress?.overall_percentage || 0}%
              </div>
              <div style={{ fontSize: '0.875rem', color: '#1e3a8a' }}>
                Overall Progress
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
          }}>
          {/* Personal Information */}
          <div className='service-card'>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
              }}>
              <h3 className='service-title'>Personal Information</h3>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className='btn-outline'
                  style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                  Edit
                </button>
              )}
            </div>

            {editing ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}>
                <div>
                  <label className='form-label'>Full Name</label>
                  <input
                    type='text'
                    name='full_name'
                    value={editData.full_name || ''}
                    onChange={handleInputChange}
                    className='form-input'
                    disabled
                    style={{ background: '#f3f4f6', color: '#6b7280' }}
                  />
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      marginTop: '0.25rem',
                    }}>
                    Contact support to change your name
                  </div>
                </div>

                <div>
                  <label className='form-label'>Email</label>
                  <input
                    type='email'
                    name='email'
                    value={editData.email || ''}
                    onChange={handleInputChange}
                    className='form-input'
                    disabled
                    style={{ background: '#f3f4f6', color: '#6b7280' }}
                  />
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      marginTop: '0.25rem',
                    }}>
                    Contact support to change your email
                  </div>
                </div>

                <div>
                  <label className='form-label'>Phone</label>
                  <input
                    type='tel'
                    name='phone'
                    value={editData.phone || ''}
                    onChange={handleInputChange}
                    className='form-input'
                    placeholder='+91-XXXXXXXXXX'
                  />
                </div>

                <div>
                  <label className='form-label'>Date of Birth</label>
                  <input
                    type='date'
                    name='date_of_birth'
                    value={editData.date_of_birth?.split('T')[0] || ''}
                    onChange={handleInputChange}
                    className='form-input'
                    disabled
                    style={{ background: '#f3f4f6', color: '#6b7280' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className='btn-primary'
                    style={{ flex: 1 }}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setEditData(student);
                    }}
                    className='btn-secondary'
                    style={{ flex: 1 }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  lineHeight: '1.6',
                }}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#374151' }}>Full Name:</strong>{' '}
                  {student.full_name}
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#374151' }}>Email:</strong>{' '}
                  {student.email}
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#374151' }}>Phone:</strong>{' '}
                  {student.phone || 'Not provided'}
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#374151' }}>Date of Birth:</strong>{' '}
                  {student.date_of_birth
                    ? new Date(student.date_of_birth).toLocaleDateString()
                    : 'Not provided'}
                </div>
                <div>
                  <strong style={{ color: '#374151' }}>Enrollment Date:</strong>{' '}
                  {student.enrollment_date
                    ? new Date(student.enrollment_date).toLocaleDateString()
                    : 'N/A'}
                </div>
              </div>
            )}
          </div>

          {/* Course Information */}
          <div className='service-card'>
            <h3 className='service-title'>Course Information</h3>
            <div
              style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                lineHeight: '1.6',
              }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <strong style={{ color: '#374151' }}>Course:</strong>{' '}
                {student.course_id?.title}
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <strong style={{ color: '#374151' }}>Duration:</strong>{' '}
                {student.course_id?.duration_weeks} weeks
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <strong style={{ color: '#374151' }}>Current Module:</strong>{' '}
                {student.progress?.current_module || 'N/A'}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#374151' }}>Progress:</strong>
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    background: '#e5e7eb',
                    borderRadius: '4px',
                    marginTop: '0.5rem',
                    overflow: 'hidden',
                  }}>
                  <div
                    style={{
                      width: `${student.progress?.overall_percentage || 0}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
                <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {student.progress?.completed_modules || 0} of{' '}
                  {student.progress?.total_modules || 0} modules completed
                </div>
              </div>
            </div>
          </div>

          {/* Performance Stats */}
          <div className='service-card'>
            <h3 className='service-title'>Performance</h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1rem',
              }}>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#22c55e',
                  }}>
                  {student.performance?.overall_gpa || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  Overall GPA
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#3b82f6',
                  }}>
                  {student.performance?.average_score || 0}%
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  Avg. Score
                </div>
              </div>
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong style={{ color: '#374151' }}>Assignments:</strong>{' '}
                {student.performance?.completed_assignments || 0} of{' '}
                {student.performance?.total_assignments || 0} completed
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className='service-card' style={{ marginTop: '2rem' }}>
          <h3 className='service-title'>Quick Actions</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to='/nextgen/exam' className='btn-primary'>
              Take Exam
            </Link>
            <Link to='/nextgen/results' className='btn-secondary'>
              View Results
            </Link>
            <button
              onClick={() => alert('Feature coming soon!')}
              className='btn-outline'>
              Download Certificate
            </button>
            <button
              onClick={() => alert('Feature coming soon!')}
              className='btn-outline'>
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
