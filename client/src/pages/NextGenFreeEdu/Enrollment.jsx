import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Enrollment() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    education: '',
    course: '',
    experience: '',
    motivation: '',
    agreeTerms: false
  })
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  const courses = [
    {
      id: 'fullstack',
      title: 'Full Stack Development',
      duration: '6 months',
      description: 'Master modern web development with React, Node.js, and cloud technologies',
      prerequisites: 'Basic programming knowledge helpful but not required',
      icon: '🌐'
    },
    {
      id: 'cybersecurity',
      title: 'Cybersecurity Fundamentals',
      duration: '4 months',
      description: 'Learn essential cybersecurity concepts and hands-on security practices',
      prerequisites: 'Basic computer knowledge required',
      icon: '🔒'
    },
    {
      id: 'digital-marketing',
      title: 'Digital Marketing & Media',
      duration: '3 months',
      description: 'Create compelling digital content and master modern marketing strategies',
      prerequisites: 'No prior experience required',
      icon: '📱'
    }
  ]

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitStatus('success')
    }, 2000)
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.fullName && formData.email && formData.phone && formData.dateOfBirth
      case 2:
        return formData.education && formData.course
      case 3:
        return formData.motivation && formData.agreeTerms
      default:
        return false
    }
  }

  if (submitStatus === 'success') {
    return (
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div style={{ 
          maxWidth: '600px', 
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <div className="service-card" style={{
            background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
            border: '2px solid #22c55e',
            padding: '3rem 2rem'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h1 style={{ color: '#15803d', marginBottom: '1rem' }}>
              Enrollment Successful!
            </h1>
            <p style={{ color: '#166534', marginBottom: '2rem', fontSize: '1.125rem' }}>
              Welcome to NextGenFreeEdu! Your enrollment for <strong>{courses.find(c => c.id === formData.course)?.title}</strong> has been confirmed.
            </p>
            
            <div style={{ 
              background: 'white',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              marginBottom: '2rem',
              textAlign: 'left'
            }}>
              <h3 style={{ color: '#374151', marginBottom: '1rem' }}>What's Next?</h3>
              <ul style={{ color: '#6b7280', lineHeight: '1.6' }}>
                <li>Check your email for course access details</li>
                <li>Join our student community on WhatsApp</li>
                <li>Download the NextGenFreeEdu mobile app</li>
                <li>Complete your profile setup</li>
                <li>Start with the orientation module</li>
              </ul>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/nextgen/login" className="btn-primary">
                Login to Dashboard
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

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#111827', marginBottom: '1rem' }}>
            Course Enrollment
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
            Join thousands of students in our free, industry-focused courses
          </p>
        </div>

        {/* Progress Indicator */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginBottom: '3rem',
          gap: '1rem'
        }}>
          {[1, 2, 3].map((step) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '50%',
                background: currentStep >= step ? '#3b82f6' : '#e5e7eb',
                color: currentStep >= step ? 'white' : '#9ca3af',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600',
                fontSize: '0.875rem'
              }}>
                {step}
              </div>
              {step < 3 && (
                <div style={{
                  width: '3rem',
                  height: '2px',
                  background: currentStep > step ? '#3b82f6' : '#e5e7eb',
                  marginLeft: '0.5rem'
                }} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="contact-form">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div>
              <h2 style={{ marginBottom: '1.5rem', color: '#374151' }}>
                Step 1: Personal Information
              </h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth *</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Educational Background & Course Selection */}
          {currentStep === 2 && (
            <div>
              <h2 style={{ marginBottom: '1.5rem', color: '#374141' }}>
                Step 2: Education & Course Selection
              </h2>
              
              <div className="form-group">
                <label className="form-label">Highest Education *</label>
                <select
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                >
                  <option value="">Select your education level</option>
                  <option value="high-school">High School (12th)</option>
                  <option value="diploma">Diploma</option>
                  <option value="undergraduate">Undergraduate (Pursuing/Completed)</option>
                  <option value="postgraduate">Postgraduate</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Programming Experience</label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="">Select your experience level</option>
                  <option value="none">No programming experience</option>
                  <option value="beginner">Beginner (0-1 years)</option>
                  <option value="intermediate">Intermediate (1-3 years)</option>
                  <option value="advanced">Advanced (3+ years)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Choose Your Course *</label>
                <div style={{ display: 'grid', gap: '1rem', marginTop: '0.5rem' }}>
                  {courses.map((course) => (
                    <label key={course.id} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1rem',
                      padding: '1rem',
                      border: formData.course === course.id ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      background: formData.course === course.id ? '#f0f9ff' : 'white',
                      transition: 'all 0.2s ease'
                    }}>
                      <input
                        type="radio"
                        name="course"
                        value={course.id}
                        checked={formData.course === course.id}
                        onChange={handleInputChange}
                        style={{ marginTop: '0.25rem' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '1.5rem' }}>{course.icon}</span>
                          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600' }}>
                            {course.title}
                          </h3>
                          <span style={{ 
                            background: '#22c55e', 
                            color: 'white', 
                            padding: '0.125rem 0.5rem', 
                            borderRadius: '0.25rem',
                            fontSize: '0.75rem',
                            fontWeight: '500'
                          }}>
                            {course.duration}
                          </span>
                        </div>
                        <p style={{ margin: '0 0 0.5rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                          {course.description}
                        </p>
                        <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.75rem' }}>
                          <strong>Prerequisites:</strong> {course.prerequisites}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Motivation & Agreement */}
          {currentStep === 3 && (
            <div>
              <h2 style={{ marginBottom: '1.5rem', color: '#374151' }}>
                Step 3: Final Details
              </h2>
              
              <div className="form-group">
                <label className="form-label">Why do you want to join this course? *</label>
                <textarea
                  name="motivation"
                  value={formData.motivation}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  className="form-input"
                  placeholder="Tell us about your goals and what you hope to achieve..."
                />
              </div>

              <div style={{ 
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ color: '#374151', marginBottom: '1rem' }}>Course Summary</h3>
                {formData.course && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>
                        {courses.find(c => c.id === formData.course)?.icon}
                      </span>
                      <strong>{courses.find(c => c.id === formData.course)?.title}</strong>
                    </div>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
                      Duration: {courses.find(c => c.id === formData.course)?.duration} • 
                      Completely Free • Industry Certification
                    </p>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleInputChange}
                    required
                    style={{ marginTop: '0.25rem' }}
                  />
                  <span style={{ fontSize: '0.875rem', lineHeight: '1.5', color: '#374151' }}>
                    I agree to the <a href="#" style={{ color: '#3b82f6' }}>Terms and Conditions</a> and 
                    <a href="#" style={{ color: '#3b82f6' }}> Privacy Policy</a>. I understand that this is a 
                    free course and I commit to actively participate in the learning process.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginTop: '2rem',
            paddingTop: '2rem',
            borderTop: '1px solid #e5e7eb'
          }}>
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="btn-secondary"
              style={{ 
                opacity: currentStep === 1 ? 0.5 : 1,
                cursor: currentStep === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Previous
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!isStepValid()}
                className="btn-primary"
                style={{ 
                  opacity: !isStepValid() ? 0.5 : 1,
                  cursor: !isStepValid() ? 'not-allowed' : 'pointer'
                }}
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                disabled={!isStepValid() || isSubmitting}
                className="btn-primary"
                style={{ 
                  opacity: (!isStepValid() || isSubmitting) ? 0.5 : 1,
                  cursor: (!isStepValid() || isSubmitting) ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? 'Enrolling...' : 'Complete Enrollment'}
              </button>
            )}
          </div>
        </form>

        {/* Help Section */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '3rem',
          padding: '2rem',
          background: '#f8fafc',
          borderRadius: '0.75rem'
        }}>
          <h3 style={{ color: '#374151', marginBottom: '1rem' }}>Need Help?</h3>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
            Have questions about the enrollment process or courses?
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="mailto:support@nextgenfreeedu.com" className="btn-outline">
              Email Support
            </a>
            <Link to="/nextgen" className="btn-outline">
              Back to Courses
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}