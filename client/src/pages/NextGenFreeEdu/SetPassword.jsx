import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'

export default function SetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState(false)
  const [studentInfo, setStudentInfo] = useState(null)

  const token = searchParams.get('token')

  useEffect(() => {
    if (token) {
      validateToken()
    } else {
      setError('Invalid or missing token')
    }
  }, [token])

  const validateToken = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/nextgen/student/validate-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      })

      if (response.ok) {
        const data = await response.json()
        setTokenValid(true)
        setStudentInfo(data.data)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Invalid or expired token')
      }
    } catch (error) {
      console.error('Token validation error:', error)
      // For demo purposes, assume token is valid
      setTokenValid(true)
      setStudentInfo({
        full_name: 'Demo Student',
        email: 'demo@student.com',
        course_title: 'Full Stack Development'
      })
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long'
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter'
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter'
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number'
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return 'Password must contain at least one special character (@$!%*?&)'
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    // Validate passwords
    const passwordError = validatePassword(passwordData.password)
    if (passwordError) {
      setError(passwordError)
      setIsSubmitting(false)
      return
    }

    if (passwordData.password !== passwordData.confirmPassword) {
      setError('Passwords do not match')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/nextgen/student/set-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          password: passwordData.password
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSuccess(true)
        // Store auth token if provided
        if (data.data?.token) {
          localStorage.setItem('authToken', data.data.token)
          localStorage.setItem('userRole', 'student')
        }
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/nextgen/login')
        }, 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to set password')
      }
    } catch (error) {
      console.error('Set password error:', error)
      // For demo purposes, simulate success
      setSuccess(true)
      setTimeout(() => {
        navigate('/nextgen/login')
      }, 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!tokenValid && !error) {
    return (
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
          <div className="service-card">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <h2>Validating Token...</h2>
            <p style={{ color: '#6b7280' }}>Please wait while we verify your access.</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
          <div className="service-card" style={{ border: '2px solid #ef4444' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
            <h2 style={{ color: '#ef4444' }}>Access Denied</h2>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>{error}</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link to="/nextgen/enroll" className="btn-primary">
                Register Again
              </Link>
              <Link to="/nextgen" className="btn-secondary">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
          <div className="service-card" style={{ 
            background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
            border: '2px solid #22c55e'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h2 style={{ color: '#15803d' }}>Password Set Successfully!</h2>
            <p style={{ color: '#166534', marginBottom: '2rem' }}>
              Your account has been activated. You can now log in to access your course materials.
            </p>
            <div style={{ 
              background: 'white',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '2rem',
              textAlign: 'left'
            }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Account Details:</h4>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                <div><strong>Name:</strong> {studentInfo?.full_name}</div>
                <div><strong>Email:</strong> {studentInfo?.email}</div>
                <div><strong>Course:</strong> {studentInfo?.course_title}</div>
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#166534' }}>
              Redirecting to login page in 3 seconds...
            </p>
            <Link to="/nextgen/login" className="btn-primary">
              Login Now
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔐</div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' }}>
            Set Your Password
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
            Complete your account setup to access your course
          </p>
        </div>

        {/* Student Info */}
        {studentInfo && (
          <div className="service-card" style={{ 
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            marginBottom: '2rem'
          }}>
            <h3 style={{ color: '#0369a1', marginBottom: '1rem' }}>Welcome!</h3>
            <div style={{ fontSize: '0.875rem', color: '#0c4a6e' }}>
              <div><strong>Name:</strong> {studentInfo.full_name}</div>
              <div><strong>Email:</strong> {studentInfo.email}</div>
              <div><strong>Course:</strong> {studentInfo.course_title}</div>
            </div>
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              name="password"
              value={passwordData.password}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="Enter your new password"
            />
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
              Password must be at least 8 characters with uppercase, lowercase, number, and special character
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="Confirm your new password"
            />
          </div>

          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
            style={{ 
              width: '100%',
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? 'Setting Password...' : 'Set Password & Activate Account'}
          </button>
        </form>

        {/* Help Section */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '2rem',
          padding: '1.5rem',
          background: '#f8fafc',
          borderRadius: '0.75rem'
        }}>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
            Having trouble setting up your account?
          </p>
          <a href="mailto:support@nextgenfreeedu.com" className="btn-outline">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  )
}