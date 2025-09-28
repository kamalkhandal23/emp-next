import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitStatus('success')
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: '',
        inquiryType: 'general'
      })
    }, 2000)
  }

  const contactMethods = [
    {
      title: 'Email Us',
      description: 'Send us an email and we\'ll respond within 24 hours',
      value: 'careers@lifeboxnextgen.co.site',
      icon: '📧',
      link: 'mailto:careers@lifeboxnextgen.co.site'
    },
    {
      title: 'Call Us',
      description: 'Speak directly with our team during business hours',
      value: '+91 XXX XXX XXXX',
      icon: '📞',
      link: 'tel:+91XXXXXXXXXX'
    },
    {
      title: 'Visit Us',
      description: 'Meet us at our office locations',
      value: 'Kakinada • Narasaraopet',
      icon: '📍',
      link: '#locations'
    },
    {
      title: 'LinkedIn',
      description: 'Connect with us on professional networks',
      value: 'Lifebox NextGen',
      icon: '💼',
      link: 'https://linkedin.com'
    }
  ]

  const inquiryTypes = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'services', label: 'Services & Solutions' },
    { value: 'nextgen', label: 'NextGenFreeEdu' },
    { value: 'careers', label: 'Career Opportunities' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'support', label: 'Technical Support' }
  ]

  const officeLocations = [
    {
      city: 'Kakinada',
      address: 'Technology Hub, Kakinada, Andhra Pradesh',
      description: 'Main development center and headquarters',
      icon: '🏢'
    },
    {
      city: 'Narasaraopet',
      address: 'Business Center, Narasaraopet, Andhra Pradesh',
      description: 'Regional office and client services',
      icon: '🏛️'
    }
  ]

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title">Get In Touch</h1>
        <p className="hero-subtitle">
          Ready to transform your organization with innovative technology solutions? 
          We'd love to hear from you. Let's discuss how we can help you achieve your goals.
        </p>
        <div className="hero-buttons">
          <a href="mailto:careers@lifeboxnextgen.co.site" className="btn-primary">
            Email Us Directly
          </a>
          <Link to="/services" className="btn-outline">
            View Our Services →
          </Link>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="section">
        <h2 className="section-title">How to Reach Us</h2>
        <div className="services-grid">
          {contactMethods.map((method) => (
            <a 
              key={method.title} 
              href={method.link}
              className="service-card"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{method.icon}</div>
              <h3 className="service-title">{method.title}</h3>
              <p className="service-description" style={{ marginBottom: '0.75rem' }}>
                {method.description}
              </p>
              <div style={{ 
                fontWeight: '600', 
                color: '#3b82f6',
                fontSize: '0.875rem'
              }}>
                {method.value}
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Contact Form */}
      <section className="section">
        <div className="services-grid" style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'start' }}>
          <div>
            <h2 className="section-title">Send Us a Message</h2>
            <p className="section-content" style={{ marginBottom: '2rem' }}>
              Fill out the form below and we'll get back to you as soon as possible. 
              All fields marked with * are required.
            </p>
            
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
                  Message sent successfully!
                </div>
                <div style={{ fontSize: '0.875rem', color: '#166534', marginTop: '0.25rem' }}>
                  We'll respond within 24 hours.
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
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
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Company</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Your organization"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Inquiry Type *</label>
                <select
                  name="inquiryType"
                  value={formData.inquiryType}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                >
                  {inquiryTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Subject *</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="Brief description of your inquiry"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows="5"
                  className="form-input"
                  placeholder="Tell us more about your requirements..."
                />
              </div>

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
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          <div style={{ paddingLeft: '2rem' }}>
            <div className="service-card" style={{ 
              background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
              border: '2px solid #0ea5e9',
              marginBottom: '2rem'
            }}>
              <h3 className="service-title">Quick Response Promise</h3>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚡</div>
              <ul style={{ 
                listStyle: 'none', 
                padding: 0, 
                margin: 0,
                color: '#64748b'
              }}>
                <li style={{ marginBottom: '0.5rem' }}>✓ Response within 24 hours</li>
                <li style={{ marginBottom: '0.5rem' }}>✓ Free consultation call</li>
                <li style={{ marginBottom: '0.5rem' }}>✓ Detailed project proposal</li>
                <li>✓ Transparent pricing</li>
              </ul>
            </div>

            <div className="service-card">
              <h3 className="service-title">Business Hours</h3>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🕒</div>
              <div style={{ color: '#64748b', lineHeight: '1.6' }}>
                <div><strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM</div>
                <div><strong>Saturday:</strong> 10:00 AM - 4:00 PM</div>
                <div><strong>Sunday:</strong> Closed</div>
                <div style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
                  <em>All times are in Indian Standard Time (IST)</em>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Office Locations */}
      <section className="section" id="locations">
        <h2 className="section-title">Our Locations</h2>
        <p className="section-content" style={{ marginBottom: '2rem' }}>
          Visit us at our office locations across Andhra Pradesh.
        </p>
        <div className="services-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {officeLocations.map((location) => (
            <div key={location.city} className="service-card">
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{location.icon}</div>
              <h3 className="service-title">{location.city}</h3>
              <p style={{ 
                fontWeight: '500', 
                color: '#374151', 
                marginBottom: '0.5rem' 
              }}>
                {location.address}
              </p>
              <p className="service-description">{location.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="services-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          <div className="service-card">
            <h3 className="service-title">How quickly can you start a project?</h3>
            <p className="service-description">
              We can typically begin new projects within 1-2 weeks after initial consultation and agreement finalization.
            </p>
          </div>
          <div className="service-card">
            <h3 className="service-title">Do you offer ongoing support?</h3>
            <p className="service-description">
              Yes, we provide comprehensive maintenance and support packages for all our solutions.
            </p>
          </div>
          <div className="service-card">
            <h3 className="service-title">Can you work with existing systems?</h3>
            <p className="service-description">
              Absolutely! We specialize in integrating with existing infrastructure and legacy systems.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}