import { Link } from 'react-router-dom'
import directorImage from '../assets/director.png'

export default function Home() {
  const services = [
    { 
      title: 'ERP Development', 
      desc: 'Streamlined operations and data-driven decisions for enterprise growth.',
      icon: '🏢'
    },
    { 
      title: 'CRM Solutions', 
      desc: 'Customer engagement and sales acceleration through intelligent systems.',
      icon: '👥'
    },
    { 
      title: 'Digital Education', 
      desc: 'NextGenFreeEdu platform for practical learning and skill development.',
      icon: '🎓'
    },
    { 
      title: 'Employee Portals', 
      desc: 'Attendance tracking, task management, and productivity metrics.',
      icon: '💼'
    },
  ]

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title">Lifebox NextGen Pvt. Ltd.</h1>
        <p className="hero-subtitle">
          We build modern ERP, CRM, and digital education platforms that scale with your organization. 
          Empowering businesses through innovative technology solutions.
        </p>
        <div className="hero-buttons">
          <Link to="/nextgen" className="btn-primary">
            Explore NextGenFreeEdu
          </Link>
          <Link to="/services" className="btn-outline">
            View Services →
          </Link>
        </div>
      </section>

      {/* Director Section */}
      <section className="section">
        <div className="director-section">
          <div className="director-content">
            <h2 className="section-title">Message from Our Director</h2>
            <div className="director-message">
              <h3 style={{ color: '#2563eb', marginBottom: '1rem', fontSize: '1.5rem' }}>
                "Empowering the Next Generation through Innovation"
              </h3>
              <p className="section-content" style={{ textAlign: 'left', lineHeight: '1.8' }}>
                At LifeBox NextGen Pvt. Ltd., we're redefining how people reflect on their lives with an AI-powered digital diary. 
                Our platform helps users capture thoughts, store memories, and gain emotional clarity.
              </p>
              <p className="section-content" style={{ textAlign: 'left', lineHeight: '1.8', marginTop: '1rem' }}>
                💡 Born from the idea "What if memories could speak back?", LifeBox blends journaling, memory preservation, 
                and mood analysis into one intelligent space.
              </p>
              <p className="section-content" style={{ textAlign: 'left', lineHeight: '1.8', marginTop: '1rem' }}>
                👨‍💼 Founded by <strong>Syagam Reddy Bhanu Prakash Reddy</strong>, a tech innovator passionate about AI and emotional wellness, 
                LifeBox is built to inspire self-growth.
              </p>
              <div style={{ marginTop: '1.5rem' }}>
                <h4 style={{ color: '#1f2937', marginBottom: '1rem' }}>🚀 Key Features:</h4>
                <ul style={{ listStyle: 'none', padding: 0, lineHeight: '1.8' }}>
                  <li>🔹 AI Mood & Memory Analysis</li>
                  <li>🔹 Smart Diary Interface</li>
                  <li>🔹 Private Memory Vault</li>
                  <li>🔹 Reflection & Growth Tools</li>
                </ul>
              </div>
              <p className="section-content" style={{ textAlign: 'left', lineHeight: '1.8', marginTop: '1.5rem', fontStyle: 'italic' }}>
                "We're not just storing memories — we help users understand them."
              </p>
            </div>
          </div>
          <div className="director-image">
            <img 
              src={directorImage} 
              alt="Syagam Reddy Bhanu Prakash Reddy - Director, LifeBox NextGen Pvt. Ltd." 
              style={{
                width: '100%',
                maxWidth: '400px',
                height: 'auto',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                border: '3px solid #e5e7eb'
              }}
            />
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <h4 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>Syagam Reddy Bhanu Prakash Reddy</h4>
              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Director & Founder</p>
              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>LifeBox NextGen Pvt. Ltd.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="section">
        <h2 className="section-title">About the Company</h2>
        <p className="section-content">
          We deliver secure, scalable software solutions for enterprises, educational institutes, and startups. 
          Our flagship initiative, NextGenFreeEdu, empowers students through practical learning experiences 
          and transparent evaluation systems, bridging the gap between academic knowledge and industry requirements.
        </p>
      </section>

      {/* Quick Links */}
      <section className="section">
        <h2 className="section-title">Quick Access</h2>
        <div className="quick-links-grid">
          <Link to="/nextgen/enroll" className="quick-link-card">
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
            <div style={{ fontWeight: '600' }}>Course Enrollment</div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
              Register for courses
            </div>
          </Link>
          <Link to="/nextgen/login" className="quick-link-card">
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔐</div>
            <div style={{ fontWeight: '600' }}>Student Login</div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
              Access your dashboard
            </div>
          </Link>
          <Link to="/nextgen/exam" className="quick-link-card">
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
            <div style={{ fontWeight: '600' }}>Take Exam</div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
              Start your assessment
            </div>
          </Link>
          <Link to="/nextgen/results" className="quick-link-card">
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
            <div style={{ fontWeight: '600' }}>View Results</div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
              Check your scores
            </div>
          </Link>
        </div>
      </section>

      {/* Services */}
      <section className="section">
        <h2 className="section-title">Our Services</h2>
        <div className="services-grid">
          {services.map((service) => (
            <div key={service.title} className="service-card">
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{service.icon}</div>
              <h3 className="service-title">{service.title}</h3>
              <p className="service-description">{service.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="section">
        <h2 className="section-title">What Our Partners Say</h2>
        <div className="testimonial-card">
          <blockquote className="testimonial-quote">
            "Lifebox NextGen delivered exceptional software solutions that transformed our operations. 
            Their NextGenFreeEdu platform provides practical training with reliable assessment systems. 
            Highly recommended for any organization seeking innovative technology partners."
          </blockquote>
          <figcaption className="testimonial-author">
            — Dr. Sarah Johnson, Academic Director at TechEdu Institute
          </figcaption>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h2 className="section-title">Ready to Get Started?</h2>
        <p className="section-content" style={{ marginBottom: '2rem' }}>
          Join thousands of students and organizations already benefiting from our innovative solutions.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/contact" className="btn-primary">
            Contact Us Today
          </Link>
          <Link to="/about" className="btn-secondary">
            Learn More About Us
          </Link>
        </div>
      </section>
    </div>
  )
}