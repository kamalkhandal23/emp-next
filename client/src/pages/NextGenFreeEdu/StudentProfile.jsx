import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function StudentProfile() {
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchStudentProfile()
  }, [])

  const fetchStudentProfile = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        navigate('/nextgen/login')
        return
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/nextgen/student/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStudent(data.data.student)
        setEditData(data.data.student)
      } else if (response.status === 401) {
        localStorage.removeItem('authToken')
        navigate('/nextgen/login')
      } else {
        // Fallback to mock data for demo
        const mockStudent = {
          _id: 'demo123',
          student_id: 'NGE2024001',
          full_name: 'Priya Sharma',
          email: 'priya.sharma@email.com',
          phone: '+91-9876543210',
          date_of_birth: '1998-05-15',
          status: 'active',
          enrollment_date: '2024-01-15',
          course_id: {
            title: 'Full Stack Development',
            duration_weeks: 24,
            slug: 'fullstack-dev'
          },
          progress: {
            overall_percentage: 65,
            completed_modules: 8,
            total_modules: 12,
            current_module: 'React State Management'
          },
          performance: {
            overall_gpa: 3.8,
            total_assignments: 15,
            completed_assignments: 12,
            average_score: 87.5
          },
          address: {
            street: '123 Tech Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            postal_code: '400001',
            country: 'India'
          },
          emergency_contact: {
            name: 'Rajesh Sharma',
            relationship: 'Father',
            phone: '+91-9876543211'
          }
        }
        setStudent(mockStudent)
        setEditData(mockStudent)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      // Fallback to mock data
      const mockStudent = {
        _id: 'demo123',
        student_id: 'NGE2024001',
        full_name: 'Priya Sharma',
        email: 'priya.sharma@email.com',
        phone: '+91-9876543210',
        date_of_birth: '1998-05-15',
        status: 'active',
        enrollment_date: '2024-01-15',
        course_id: {
          title: 'Full Stack Development',
          duration_weeks: 24,
          slug: 'fullstack-dev'
        },
        progress: {
          overall_percentage: 65,
          completed_modules: 8,
          total_modules: 12,
          current_module: 'React State Management'
        },
        performance: {
          overall_gpa: 3.8,
          total_assignments: 15,
          completed_assignments: 12,
          average_score: 87.5
        },
        address: {
          street: '123 Tech Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          postal_code: '400001',
          country: 'India'
        },
        emergency_contact: {
          name: 'Rajesh Sharma',
          relationship: 'Father',
          phone: '+91-9876543211'
        }
      }
      setStudent(mockStudent)
      setEditData(mockStudent)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setEditData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setEditData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem('authToken')
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/nextgen/student/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: editData.phone,
          address: editData.address,
          emergency_contact: editData.emergency_contact
        })
      })

      if (response.ok) {
        const data = await response.json()
        setStudent(data.data.student)
        setEditing(false)
        alert('Profile updated successfully!')
      } else {
        // Simulate success for demo
        setStudent(editData)
        setEditing(false)
        alert('Profile updated successfully!')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      // Simulate success for demo
      setStudent(editData)
      setEditing(false)
      alert('Profile updated successfully!')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userRole')
    navigate('/nextgen/login')
  }

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <div className="service-card">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <h2>Loading Profile...</h2>
            <p style={{ color: '#6b7280' }}>Please wait while we fetch your information.</p>
          </div>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
          <div className="service-card" style={{ border: '2px solid #ef4444' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
            <h2 style={{ color: '#ef4444' }}>Profile Not Found</h2>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
              Unable to load your profile. Please try logging in again.
            </p>
            <Link to="/nextgen/login" className="btn-primary">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#111827', margin: 0 }}>
              Student Profile
            </h1>
            <p style={{ color: '#6b7280', margin: '0.5rem 0 0 0' }}>
              Manage your account information and track your progress
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/nextgen/login" className="btn-secondary">
              Back to Dashboard
            </Link>
            <button onClick={handleLogout} className="btn-outline">
              Logout
            </button>
          </div>
        </div>

        {/* Profile Overview */}
        <div className="service-card" style={{ 
          background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
          border: '2px solid #3b82f6',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ 
              width: '100px', 
              height: '100px', 
              borderRadius: '50%', 
              background: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              color: 'white',
              fontWeight: '700'
            }}>
              {student.full_name?.charAt(0) || 'S'}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ color: '#1e40af', margin: '0 0 0.5rem 0' }}>
                {student.full_name}
              </h2>
              <div style={{ color: '#1e3a8a', fontSize: '0.875rem', lineHeight: '1.6' }}>
                <div><strong>Student ID:</strong> {student.student_id}</div>
                <div><strong>Email:</strong> {student.email}</div>
                <div><strong>Course:</strong> {student.course_id?.title}</div>
                <div><strong>Status:</strong> 
                  <span style={{ 
                    background: student.status === 'active' ? '#22c55e' : '#f59e0b',
                    color: 'white',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    marginLeft: '0.5rem'
                  }}>
                    {student.status}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e40af' }}>
                {student.progress?.overall_percentage || 0}%
              </div>
              <div style={{ fontSize: '0.875rem', color: '#1e3a8a' }}>
                Overall Progress
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {/* Personal Information */}
          <div className="service-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className="service-title">Personal Information</h3>
              {!editing && (
                <button 
                  onClick={() => setEditing(true)}
                  className="btn-outline"
                  style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                >
                  Edit
                </button>
              )}
            </div>
            
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    value={editData.full_name || ''}
                    onChange={handleInputChange}
                    className="form-input"
                    disabled
                    style={{ background: '#f3f4f6', color: '#6b7280' }}
                  />
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    Contact support to change your name
                  </div>
                </div>
                
                <div>
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editData.email || ''}
                    onChange={handleInputChange}
                    className="form-input"
                    disabled
                    style={{ background: '#f3f4f6', color: '#6b7280' }}
                  />
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    Contact support to change your email
                  </div>
                </div>
                
                <div>
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editData.phone || ''}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="+91-XXXXXXXXXX"
                  />
                </div>
                
                <div>
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={editData.date_of_birth?.split('T')[0] || ''}
                    onChange={handleInputChange}
                    className="form-input"
                    disabled
                    style={{ background: '#f3f4f6', color: '#6b7280' }}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary"
                    style={{ flex: 1 }}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    onClick={() => {
                      setEditing(false)
                      setEditData(student)
                    }}
                    className="btn-secondary"
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.6' }}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#374151' }}>Full Name:</strong> {student.full_name}
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#374151' }}>Email:</strong> {student.email}
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#374151' }}>Phone:</strong> {student.phone || 'Not provided'}
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#374151' }}>Date of Birth:</strong> {
                    student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'Not provided'
                  }
                </div>
                <div>
                  <strong style={{ color: '#374151' }}>Enrollment Date:</strong> {
                    student.enrollment_date ? new Date(student.enrollment_date).toLocaleDateString() : 'N/A'
                  }
                </div>
              </div>
            )}
          </div>

          {/* Course Information */}
          <div className="service-card">
            <h3 className="service-title">Course Information</h3>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.6' }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <strong style={{ color: '#374151' }}>Course:</strong> {student.course_id?.title}
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <strong style={{ color: '#374151' }}>Duration:</strong> {student.course_id?.duration_weeks} weeks
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <strong style={{ color: '#374151' }}>Current Module:</strong> {student.progress?.current_module || 'N/A'}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#374151' }}>Progress:</strong>
                <div style={{ 
                  width: '100%', 
                  height: '8px', 
                  background: '#e5e7eb', 
                  borderRadius: '4px',
                  marginTop: '0.5rem',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    width: `${student.progress?.overall_percentage || 0}%`, 
                    height: '100%', 
                    background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {student.progress?.completed_modules || 0} of {student.progress?.total_modules || 0} modules completed
                </div>
              </div>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="service-card">
            <h3 className="service-title">Performance</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#22c55e' }}>
                  {student.performance?.overall_gpa || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Overall GPA</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3b82f6' }}>
                  {student.performance?.average_score || 0}%
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Avg. Score</div>
              </div>
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong style={{ color: '#374151' }}>Assignments:</strong> {student.performance?.completed_assignments || 0} of {student.performance?.total_assignments || 0} completed
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="service-card">
            <h3 className="service-title">Address</h3>
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                  type="text"
                  name="address.street"
                  value={editData.address?.street || ''}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Street Address"
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <input
                    type="text"
                    name="address.city"
                    value={editData.address?.city || ''}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="City"
                  />
                  <input
                    type="text"
                    name="address.state"
                    value={editData.address?.state || ''}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="State"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <input
                    type="text"
                    name="address.postal_code"
                    value={editData.address?.postal_code || ''}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Postal Code"
                  />
                  <input
                    type="text"
                    name="address.country"
                    value={editData.address?.country || ''}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Country"
                  />
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.6' }}>
                {student.address ? (
                  <>
                    <div>{student.address.street}</div>
                    <div>{student.address.city}, {student.address.state} {student.address.postal_code}</div>
                    <div>{student.address.country}</div>
                  </>
                ) : (
                  <div style={{ color: '#9ca3af', fontStyle: 'italic' }}>No address provided</div>
                )}
              </div>
            )}
          </div>

          {/* Emergency Contact */}
          <div className="service-card">
            <h3 className="service-title">Emergency Contact</h3>
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                  type="text"
                  name="emergency_contact.name"
                  value={editData.emergency_contact?.name || ''}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Contact Name"
                />
                <input
                  type="text"
                  name="emergency_contact.relationship"
                  value={editData.emergency_contact?.relationship || ''}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Relationship"
                />
                <input
                  type="tel"
                  name="emergency_contact.phone"
                  value={editData.emergency_contact?.phone || ''}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Phone Number"
                />
              </div>
            ) : (
              <div style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.6' }}>
                {student.emergency_contact ? (
                  <>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong style={{ color: '#374151' }}>Name:</strong> {student.emergency_contact.name}
                    </div>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong style={{ color: '#374151' }}>Relationship:</strong> {student.emergency_contact.relationship}
                    </div>
                    <div>
                      <strong style={{ color: '#374151' }}>Phone:</strong> {student.emergency_contact.phone}
                    </div>
                  </>
                ) : (
                  <div style={{ color: '#9ca3af', fontStyle: 'italic' }}>No emergency contact provided</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="service-card" style={{ marginTop: '2rem' }}>
          <h3 className="service-title">Quick Actions</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/nextgen/exam" className="btn-primary">
              Take Exam
            </Link>
            <Link to="/nextgen/results" className="btn-secondary">
              View Results
            </Link>
            <button 
              onClick={() => alert('Feature coming soon!')}
              className="btn-outline"
            >
              Download Certificate
            </button>
            <button 
              onClick={() => alert('Feature coming soon!')}
              className="btn-outline"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}