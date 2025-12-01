import { Link } from 'react-router-dom'

export default function About() {
  const values = [
    {
      title: 'Integrity',
      description: 'We maintain the highest standards of honesty and transparency in all our business dealings.',
      icon: '🤝'
    },
    {
      title: 'Innovation',
      description: 'We continuously push boundaries to deliver cutting-edge solutions that drive progress.',
      icon: '💡'
    },
    {
      title: 'Impact',
      description: 'We focus on creating meaningful change that benefits our clients and communities.',
      icon: '🎯'
    },
    {
      title: 'Excellence',
      description: 'We strive for perfection in every project, ensuring quality that exceeds expectations.',
      icon: '⭐'
    }
  ]

  const milestones = [
    {
      year: '2023',
      title: 'Company Founded',
      description: 'Established Lifebox NextGen Pvt. Ltd. with a vision to transform digital education.'
    },
    {
      year: '2024',
      title: 'NextGenFreedu Launch',
      description: 'Launched our flagship educational platform serving thousands of students.'
    },
    {
      year: '2024',
      title: 'MSME Registration',
      description: 'Officially registered as MSME and incorporated as Private Limited company.'
    },
    {
      year: '2025',
      title: 'Expansion Phase',
      description: 'Scaling operations and expanding our service offerings to enterprise clients.'
    }
  ]

  const team = [
    {
      name: 'Leadership Team',
      role: 'Experienced professionals with 10+ years in technology and education',
      icon: '👥'
    },
    {
      name: 'Development Team',
      role: 'Full-stack developers specializing in modern web technologies',
      icon: '💻'
    },
    {
      name: 'Education Specialists',
      role: 'Curriculum designers and educational technology experts',
      icon: '🎓'
    }
  ]

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title">About Lifebox NextGen</h1>
        <p className="hero-subtitle">
          We are a technology company dedicated to delivering innovative digital solutions 
          for enterprises and educational institutions. Our mission is to bridge the gap 
          between traditional learning and modern industry requirements.
        </p>
        <div className="hero-buttons">
          <Link to="/contact" className="btn-primary">
            Get In Touch
          </Link>
          <Link to="/services" className="btn-outline">
            Our Services →
          </Link>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="section">
        <div className="services-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          <div className="service-card" style={{ background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔮</div>
            <h3 className="service-title">Our Vision</h3>
            <p className="service-description">
              To enable accessible, high-quality technology and education for all, 
              creating a world where learning knows no boundaries and innovation thrives.
            </p>
          </div>
          <div className="service-card" style={{ background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🚀</div>
            <h3 className="service-title">Our Mission</h3>
            <p className="service-description">
              To build scalable platforms and empower learners with real-world skills, 
              while providing enterprises with robust solutions that drive growth and efficiency.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section">
        <h2 className="section-title">Our Core Values</h2>
        <p className="section-content" style={{ marginBottom: '2rem' }}>
          These fundamental principles guide every decision we make and every solution we create.
        </p>
        <div className="services-grid">
          {values.map((value) => (
            <div key={value.title} className="service-card">
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{value.icon}</div>
              <h3 className="service-title">{value.title}</h3>
              <p className="service-description">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Company Journey */}
      <section className="section">
        <h2 className="section-title">Our Journey</h2>
        <p className="section-content" style={{ marginBottom: '2rem' }}>
          From inception to growth, here's how we've evolved to serve our clients better.
        </p>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {milestones.map((milestone, index) => (
            <div key={milestone.year} className="service-card" style={{ 
              background: index % 2 === 0 ? 'linear-gradient(135deg, #fef3c7, #fde68a)' : 'white',
              border: index % 2 === 0 ? '2px solid #f59e0b' : '1px solid #e5e7eb'
            }}>
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                color: '#d97706',
                marginBottom: '0.5rem' 
              }}>
                {milestone.year}
              </div>
              <h3 className="service-title">{milestone.title}</h3>
              <p className="service-description">{milestone.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team Overview */}
      <section className="section">
        <h2 className="section-title">Our Team</h2>
        <p className="section-content" style={{ marginBottom: '2rem' }}>
          A diverse group of professionals united by our passion for technology and education.
        </p>
        <div className="services-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
          {team.map((member) => (
            <div key={member.name} className="service-card">
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{member.icon}</div>
              <h3 className="service-title">{member.name}</h3>
              <p className="service-description">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Company Registration */}
      <section className="section">
        <div className="testimonial-card" style={{ 
          background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
          border: '2px solid #0ea5e9'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏛️</div>
            <h3 className="service-title">Official Registration</h3>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontWeight: '600', color: '#0369a1', marginBottom: '0.25rem' }}>
                MSME Registered
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                Micro, Small & Medium Enterprise
              </div>
            </div>
            <div>
              <div style={{ fontWeight: '600', color: '#0369a1', marginBottom: '0.25rem' }}>
                Private Limited
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                Incorporated Company
              </div>
            </div>
            <div>
              <div style={{ fontWeight: '600', color: '#0369a1', marginBottom: '0.25rem' }}>
                Compliance Ready
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                All Legal Requirements Met
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h2 className="section-title">Ready to Work Together?</h2>
        <p className="section-content" style={{ marginBottom: '2rem' }}>
          Let's discuss how we can help transform your organization with innovative technology solutions.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/contact" className="btn-primary">
            Start a Conversation
          </Link>
          <Link to="/nextgen" className="btn-secondary">
            Explore NextGenFreedu
          </Link>
        </div>
      </section>
    </div>
  )
}