import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Careers() {
  const [selectedJob, setSelectedJob] = useState(null)
  const [applicationData, setApplicationData] = useState({
    fullName: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    portfolio: '',
    coverLetter: '',
    resume: null
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  const jobOpenings = [
    {
      id: 1,
      title: 'Full Stack Developer',
      department: 'Engineering',
      type: 'Full-time',
      location: 'Kakinada / Remote',
      experience: '2-4 years',
      salary: '₹4-8 LPA',
      description: 'Build scalable web applications using modern technologies like React, Node.js, and cloud platforms.',
      requirements: [
        'Proficiency in JavaScript, React, Node.js',
        'Experience with databases (MongoDB, PostgreSQL)',
        'Knowledge of cloud platforms (AWS, Azure)',
        'Understanding of RESTful APIs and GraphQL',
        'Version control with Git'
      ],
      responsibilities: [
        'Develop and maintain web applications',
        'Collaborate with design and product teams',
        'Write clean, maintainable code',
        'Participate in code reviews',
        'Optimize application performance'
      ],
      icon: '💻'
    },
    {
      id: 2,
      title: 'Cybersecurity Specialist',
      department: 'Security',
      type: 'Full-time',
      location: 'Narasaraopet / Hybrid',
      experience: '3-5 years',
      salary: '₹6-12 LPA',
      description: 'Protect our systems and client data through comprehensive security measures and threat analysis.',
      requirements: [
        'CISSP, CEH, or similar certifications',
        'Experience with security tools and frameworks',
        'Knowledge of network security protocols',
        'Incident response and forensics experience',
        'Understanding of compliance standards'
      ],
      responsibilities: [
        'Monitor and analyze security threats',
        'Implement security policies and procedures',
        'Conduct security assessments',
        'Respond to security incidents',
        'Train team members on security best practices'
      ],
      icon: '🔒'
    },
    {
      id: 3,
      title: 'Digital Media Specialist',
      department: 'Marketing',
      type: 'Full-time',
      location: 'Kakinada / Hybrid',
      experience: '1-3 years',
      salary: '₹3-6 LPA',
      description: 'Create engaging content and manage our digital presence across multiple platforms.',
      requirements: [
        'Proficiency in Adobe Creative Suite',
        'Experience with social media management',
        'Video editing and motion graphics skills',
        'Understanding of digital marketing trends',
        'Strong communication skills'
      ],
      responsibilities: [
        'Create visual content for marketing campaigns',
        'Manage social media accounts',
        'Produce educational videos for NextGenFreeEdu',
        'Design marketing materials',
        'Analyze content performance metrics'
      ],
      icon: '🎨'
    },
    {
      id: 4,
      title: 'DevOps Engineer',
      department: 'Engineering',
      type: 'Full-time',
      location: 'Remote',
      experience: '2-5 years',
      salary: '₹5-10 LPA',
      description: 'Streamline our development and deployment processes using modern DevOps practices.',
      requirements: [
        'Experience with Docker and Kubernetes',
        'Knowledge of CI/CD pipelines',
        'Cloud platform expertise (AWS/Azure)',
        'Infrastructure as Code (Terraform, CloudFormation)',
        'Monitoring and logging tools experience'
      ],
      responsibilities: [
        'Design and maintain CI/CD pipelines',
        'Manage cloud infrastructure',
        'Implement monitoring and alerting',
        'Optimize deployment processes',
        'Ensure system reliability and scalability'
      ],
      icon: '⚙️'
    }
  ]

  const internshipPrograms = [
    {
      title: 'Full Stack Development Internship',
      duration: '6 months',
      stipend: '₹15,000/month',
      description: 'AICTE supported program through NextGenFreeEdu platform',
      requirements: ['Final year students', 'Basic programming knowledge', 'Eagerness to learn'],
      icon: '🎓'
    },
    {
      title: 'Cybersecurity Internship',
      duration: '6 months',
      stipend: '₹12,000/month',
      description: 'Hands-on experience with security tools and practices',
      requirements: ['Computer Science background', 'Interest in cybersecurity', 'Problem-solving skills'],
      icon: '🛡️'
    },
    {
      title: 'Digital Marketing Internship',
      duration: '4 months',
      stipend: '₹10,000/month',
      description: 'Learn content creation and digital marketing strategies',
      requirements: ['Creative mindset', 'Social media familiarity', 'Communication skills'],
      icon: '📱'
    }
  ]

  const benefits = [
    {
      title: 'Competitive Salary',
      description: 'Market-competitive compensation with performance bonuses',
      icon: '💰'
    },
    {
      title: 'Flexible Work',
      description: 'Remote and hybrid work options available',
      icon: '🏠'
    },
    {
      title: 'Learning & Development',
      description: 'Continuous learning opportunities and skill development',
      icon: '📚'
    },
    {
      title: 'Health Benefits',
      description: 'Comprehensive health insurance coverage',
      icon: '🏥'
    },
    {
      title: 'Team Events',
      description: 'Regular team building activities and celebrations',
      icon: '🎉'
    },
    {
      title: 'Innovation Time',
      description: '20% time for personal projects and innovation',
      icon: '💡'
    }
  ]

  const handleInputChange = (e) => {
    const { name, value, files } = e.target
    setApplicationData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }))
  }

  const handleJobSelect = (job) => {
    setSelectedJob(job)
    setApplicationData(prev => ({ ...prev, position: job.title }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitStatus('success')
      setApplicationData({
        fullName: '',
        email: '',
        phone: '',
        position: '',
        experience: '',
        portfolio: '',
        coverLetter: '',
        resume: null
      })
      setSelectedJob(null)
    }, 2000)
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title">Join Our Team</h1>
        <p className="hero-subtitle">
          Build the future of technology and education with us. We're looking for passionate 
          individuals who want to make a real impact through innovative solutions.
        </p>
        <div className="hero-buttons">
          <a href="#openings" className="btn-primary">
            View Open Positions
          </a>
          <a href="#internships" className="btn-outline">
            Internship Programs →
          </a>
        </div>
      </section>

      {/* Why Work With Us */}
      <section className="section">
        <h2 className="section-title">Why Choose Lifebox NextGen?</h2>
        <p className="section-content" style={{ marginBottom: '2rem' }}>
          We believe in creating an environment where innovation thrives and every team member can grow.
        </p>
        <div className="services-grid">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="service-card">
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{benefit.icon}</div>
              <h3 className="service-title">{benefit.title}</h3>
              <p className="service-description">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Job Openings */}
      <section className="section" id="openings">
        <h2 className="section-title">Current Openings</h2>
        <p className="section-content" style={{ marginBottom: '2rem' }}>
          Explore exciting opportunities to grow your career with us.
        </p>
        <div className="services-grid">
          {jobOpenings.map((job) => (
            <div key={job.id} className="service-card" style={{ cursor: 'pointer' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{job.icon}</div>
              <h3 className="service-title">{job.title}</h3>
              <div style={{ 
                display: 'flex', 
                gap: '0.5rem', 
                marginBottom: '0.75rem',
                flexWrap: 'wrap'
              }}>
                <span style={{ 
                  background: '#dbeafe', 
                  color: '#1d4ed8', 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}>
                  {job.type}
                </span>
                <span style={{ 
                  background: '#dcfce7', 
                  color: '#15803d', 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}>
                  {job.location}
                </span>
              </div>
              <p className="service-description" style={{ marginBottom: '1rem' }}>
                {job.description}
              </p>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginTop: 'auto'
              }}>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  <div><strong>Experience:</strong> {job.experience}</div>
                  <div><strong>Salary:</strong> {job.salary}</div>
                </div>
                <button 
                  onClick={() => handleJobSelect(job)}
                  className="btn-primary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  Apply Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Internship Programs */}
      <section className="section" id="internships">
        <h2 className="section-title">Internship Programs</h2>
        <p className="section-content" style={{ marginBottom: '2rem' }}>
          AICTE supported internship programs through our NextGenFreeEdu platform.
        </p>
        <div className="services-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {internshipPrograms.map((program) => (
            <div key={program.title} className="service-card" style={{ 
              background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
              border: '2px solid #f59e0b'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{program.icon}</div>
              <h3 className="service-title">{program.title}</h3>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontWeight: '600', color: '#92400e' }}>
                  Duration: {program.duration}
                </div>
                <div style={{ fontWeight: '600', color: '#92400e' }}>
                  Stipend: {program.stipend}
                </div>
              </div>
              <p className="service-description" style={{ marginBottom: '1rem' }}>
                {program.description}
              </p>
              <div>
                <strong style={{ color: '#92400e' }}>Requirements:</strong>
                <ul style={{ margin: '0.5rem 0', paddingLeft: '1rem', color: '#78350f' }}>
                  {program.requirements.map((req, index) => (
                    <li key={index} style={{ fontSize: '0.875rem' }}>{req}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Application Form */}
      {selectedJob && (
        <section className="section">
          <div className="services-grid" style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'start' }}>
            <div>
              <h2 className="section-title">Apply for {selectedJob.title}</h2>
              
              {submitStatus === 'success' && (
                <div style={{
                  background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
                  border: '2px solid #22c55e',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  marginBottom: '2rem',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                  <div style={{ fontWeight: '600', color: '#15803d' }}>
                    Application submitted successfully!
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#166534', marginTop: '0.25rem' }}>
                    We'll review your application and get back to you soon.
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={applicationData.fullName}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={applicationData.email}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={applicationData.phone}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Years of Experience *</label>
                    <select
                      name="experience"
                      value={applicationData.experience}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                    >
                      <option value="">Select experience</option>
                      <option value="0-1">0-1 years</option>
                      <option value="1-3">1-3 years</option>
                      <option value="3-5">3-5 years</option>
                      <option value="5+">5+ years</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Portfolio/LinkedIn URL</label>
                  <input
                    type="url"
                    name="portfolio"
                    value={applicationData.portfolio}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="https://your-portfolio.com"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Resume *</label>
                  <input
                    type="file"
                    name="resume"
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    accept=".pdf,.doc,.docx"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Cover Letter *</label>
                  <textarea
                    name="coverLetter"
                    value={applicationData.coverLetter}
                    onChange={handleInputChange}
                    required
                    rows="5"
                    className="form-input"
                    placeholder="Tell us why you're interested in this position..."
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="btn-primary"
                    style={{ 
                      flex: 1,
                      opacity: isSubmitting ? 0.7 : 1,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setSelectedJob(null)}
                    className="btn-secondary"
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>

            <div style={{ paddingLeft: '2rem' }}>
              <div className="service-card" style={{ marginBottom: '2rem' }}>
                <h3 className="service-title">Job Details</h3>
                <div style={{ marginBottom: '1rem' }}>
                  <div><strong>Department:</strong> {selectedJob.department}</div>
                  <div><strong>Type:</strong> {selectedJob.type}</div>
                  <div><strong>Location:</strong> {selectedJob.location}</div>
                  <div><strong>Experience:</strong> {selectedJob.experience}</div>
                  <div><strong>Salary:</strong> {selectedJob.salary}</div>
                </div>
                <p style={{ marginBottom: '1rem' }}>{selectedJob.description}</p>
              </div>

              <div className="service-card">
                <h3 className="service-title">Requirements</h3>
                <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                  {selectedJob.requirements.map((req, index) => (
                    <li key={index} style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="section" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h2 className="section-title">Don't See the Right Role?</h2>
        <p className="section-content" style={{ marginBottom: '2rem' }}>
          We're always looking for talented individuals. Send us your resume and we'll keep you in mind for future opportunities.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/contact" className="btn-primary">
            Send Your Resume
          </Link>
          <a href="mailto:careers@lifeboxnextgen.co.site" className="btn-secondary">
            Email HR Directly
          </a>
        </div>
      </section>
    </div>
  )
}