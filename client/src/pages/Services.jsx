import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Services() {
  const [selectedService, setSelectedService] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  const services = [
    {
      id: 1,
      title: 'ERP Development',
      category: 'Enterprise Solutions',
      description: 'Comprehensive Enterprise Resource Planning solutions that streamline your business operations and drive data-driven decisions.',
      icon: '🏢',
      features: [
        'Financial Management & Accounting',
        'Inventory & Supply Chain Management',
        'Human Resources Management',
        'Customer Relationship Management',
        'Business Intelligence & Analytics',
        'Multi-location Support',
        'Role-based Access Control',
        'Real-time Reporting & Dashboards'
      ],
      technologies: ['React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker', 'Redis'],
      pricing: {
        starter: '₹2,50,000 - ₹5,00,000',
        professional: '₹5,00,000 - ₹15,00,000',
        enterprise: 'Custom Pricing'
      },
      timeline: '3-8 months',
      caseStudy: {
        client: 'Manufacturing Company',
        challenge: 'Manual processes causing delays and errors',
        solution: 'Integrated ERP system with automated workflows',
        result: '40% reduction in processing time, 60% fewer errors'
      }
    },
    {
      id: 2,
      title: 'CRM Solutions',
      category: 'Customer Management',
      description: 'Advanced Customer Relationship Management systems that enhance customer engagement and accelerate sales growth.',
      icon: '👥',
      features: [
        'Lead Management & Tracking',
        'Sales Pipeline Automation',
        'Customer Communication History',
        'Email Marketing Integration',
        'Performance Analytics',
        'Mobile CRM Access',
        'Third-party Integrations',
        'Automated Follow-up Systems'
      ],
      technologies: ['React', 'Express.js', 'MongoDB', 'AWS SES', 'Stripe API', 'Twilio'],
      pricing: {
        starter: '₹1,50,000 - ₹3,00,000',
        professional: '₹3,00,000 - ₹8,00,000',
        enterprise: 'Custom Pricing'
      },
      timeline: '2-5 months',
      caseStudy: {
        client: 'Educational Institute',
        challenge: 'Poor student enrollment tracking',
        solution: 'Custom CRM with automated lead nurturing',
        result: '50% increase in enrollment conversion rate'
      }
    },
    {
      id: 3,
      title: 'NextGenFreedu Platform',
      category: 'Digital Education',
      description: 'Revolutionary digital education platform providing practical learning experiences with transparent evaluation systems.',
      icon: '🎓',
      features: [
        'Interactive Course Management',
        'Real-time Assessment System',
        'Student Progress Tracking',
        'Instructor Dashboard',
        'Certificate Generation',
        'Mobile Learning App',
        'Discussion Forums',
        'AICTE Integration Support'
      ],
      technologies: ['React Native', 'Node.js', 'MongoDB', 'Socket.io', 'AWS S3', 'FFmpeg'],
      pricing: {
        starter: '₹3,00,000 - ₹6,00,000',
        professional: '₹6,00,000 - ₹12,00,000',
        enterprise: 'Custom Pricing'
      },
      timeline: '4-8 months',
      caseStudy: {
        client: 'Technical College',
        challenge: 'Limited practical training opportunities',
        solution: 'Comprehensive digital learning platform',
        result: '80% improvement in student practical skills'
      }
    },
    {
      id: 4,
      title: 'Employee Portals & Attendance',
      category: 'HR Solutions',
      description: 'Modern employee management systems with attendance tracking, task management, and productivity analytics.',
      icon: '💼',
      features: [
        'Biometric Attendance Integration',
        'Leave Management System',
        'Task Assignment & Tracking',
        'Performance Evaluation',
        'Payroll Integration',
        'Employee Self-Service Portal',
        'Mobile Attendance App',
        'Analytics & Reporting'
      ],
      technologies: ['React', 'Node.js', 'PostgreSQL', 'Redis', 'WebRTC', 'Chart.js'],
      pricing: {
        starter: '₹1,00,000 - ₹2,50,000',
        professional: '₹2,50,000 - ₹6,00,000',
        enterprise: 'Custom Pricing'
      },
      timeline: '2-4 months',
      caseStudy: {
        client: 'IT Services Company',
        challenge: 'Manual attendance and task tracking',
        solution: 'Integrated employee portal with automation',
        result: '70% reduction in HR administrative work'
      }
    },
    {
      id: 5,
      title: 'Custom Software Development',
      category: 'Bespoke Solutions',
      description: 'Tailored software solutions designed specifically for your unique business requirements and workflows.',
      icon: '⚙️',
      features: [
        'Requirements Analysis & Design',
        'Full-stack Web Applications',
        'Mobile App Development',
        'API Development & Integration',
        'Database Design & Optimization',
        'Cloud Deployment & Scaling',
        'Maintenance & Support',
        'Legacy System Modernization'
      ],
      technologies: ['React', 'React Native', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes'],
      pricing: {
        starter: '₹2,00,000 - ₹5,00,000',
        professional: '₹5,00,000 - ₹20,00,000',
        enterprise: 'Custom Pricing'
      },
      timeline: '3-12 months',
      caseStudy: {
        client: 'Healthcare Provider',
        challenge: 'Need for specialized patient management system',
        solution: 'Custom healthcare management platform',
        result: '90% improvement in patient data management'
      }
    },
    {
      id: 6,
      title: 'Cloud Migration & DevOps',
      category: 'Infrastructure',
      description: 'Seamless cloud migration services and DevOps implementation for scalable, reliable infrastructure.',
      icon: '☁️',
      features: [
        'Cloud Strategy & Planning',
        'AWS/Azure Migration',
        'CI/CD Pipeline Setup',
        'Infrastructure as Code',
        'Monitoring & Alerting',
        'Security Implementation',
        'Performance Optimization',
        'Disaster Recovery Planning'
      ],
      technologies: ['AWS', 'Azure', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'Prometheus'],
      pricing: {
        starter: '₹1,50,000 - ₹4,00,000',
        professional: '₹4,00,000 - ₹10,00,000',
        enterprise: 'Custom Pricing'
      },
      timeline: '2-6 months',
      caseStudy: {
        client: 'E-commerce Platform',
        challenge: 'Scalability issues with on-premise infrastructure',
        solution: 'Complete cloud migration with auto-scaling',
        result: '99.9% uptime and 50% cost reduction'
      }
    }
  ]

  const processSteps = [
    {
      step: 1,
      title: 'Discovery & Analysis',
      description: 'We analyze your requirements and create a detailed project roadmap.',
      icon: '🔍'
    },
    {
      step: 2,
      title: 'Design & Planning',
      description: 'UI/UX design and technical architecture planning with your approval.',
      icon: '📋'
    },
    {
      step: 3,
      title: 'Development & Testing',
      description: 'Agile development with regular updates and comprehensive testing.',
      icon: '⚡'
    },
    {
      step: 4,
      title: 'Deployment & Support',
      description: 'Smooth deployment with training and ongoing support services.',
      icon: '🚀'
    }
  ]

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      position: 'CTO, TechCorp Solutions',
      content: 'Lifebox NextGen delivered an exceptional ERP system that transformed our operations. Their technical expertise and project management were outstanding.',
      rating: 5,
      project: 'ERP Development'
    },
    {
      name: 'Dr. Priya Sharma',
      position: 'Director, Excellence Institute',
      content: 'The NextGenFreedu platform revolutionized our teaching methodology. Student engagement and learning outcomes improved significantly.',
      rating: 5,
      project: 'Digital Education Platform'
    },
    {
      name: 'Amit Patel',
      position: 'HR Manager, InnovateTech',
      content: 'Their employee portal solution streamlined our HR processes completely. The attendance and task management features are excellent.',
      rating: 5,
      project: 'Employee Portal'
    }
  ]

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title">Our Services</h1>
        <p className="hero-subtitle">
          Comprehensive technology solutions designed to transform your business operations, 
          enhance productivity, and drive sustainable growth through innovative software development.
        </p>
        <div className="hero-buttons">
          <Link to="/contact" className="btn-primary">
            Get Free Consultation
          </Link>
          <a href="#services-grid" className="btn-outline">
            Explore Services →
          </a>
        </div>
      </section>

      {/* Services Overview */}
      <section className="section" id="services-grid">
        <h2 className="section-title">What We Offer</h2>
        <p className="section-content" style={{ marginBottom: '2rem' }}>
          From enterprise solutions to custom development, we provide end-to-end technology services.
        </p>
        <div className="services-grid">
          {services.map((service) => (
            <div 
              key={service.id} 
              className="service-card"
              style={{ cursor: 'pointer' }}
              onClick={() => setSelectedService(service)}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{service.icon}</div>
              <div style={{ 
                background: '#dbeafe', 
                color: '#1d4ed8', 
                padding: '0.25rem 0.5rem', 
                borderRadius: '0.25rem',
                fontSize: '0.75rem',
                fontWeight: '500',
                marginBottom: '0.75rem',
                display: 'inline-block'
              }}>
                {service.category}
              </div>
              <h3 className="service-title">{service.title}</h3>
              <p className="service-description" style={{ marginBottom: '1rem' }}>
                {service.description}
              </p>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginTop: 'auto'
              }}>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  <div><strong>Timeline:</strong> {service.timeline}</div>
                </div>
                <button 
                  className="btn-primary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  Learn More
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Service Details Modal */}
      {selectedService && (
        <section className="section">
          <div style={{ 
            background: 'white',
            border: '2px solid #e5e7eb',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <div>
                <h2 className="section-title" style={{ marginBottom: '0.5rem' }}>
                  {selectedService.icon} {selectedService.title}
                </h2>
                <p style={{ color: '#6b7280', margin: 0 }}>{selectedService.description}</p>
              </div>
              <button 
                onClick={() => setSelectedService(null)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0.5rem'
                }}
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              marginBottom: '2rem',
              borderBottom: '2px solid #f3f4f6'
            }}>
              {['overview', 'features', 'pricing', 'case-study'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    fontWeight: '600',
                    color: activeTab === tab ? '#3b82f6' : '#6b7280',
                    borderBottom: activeTab === tab ? '2px solid #3b82f6' : 'none',
                    textTransform: 'capitalize'
                  }}
                >
                  {tab.replace('-', ' ')}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div>
              {activeTab === 'overview' && (
                <div className="services-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
                  <div>
                    <h3 className="service-title">Service Overview</h3>
                    <p className="service-description" style={{ marginBottom: '1.5rem' }}>
                      {selectedService.description}
                    </p>
                    <div>
                      <h4 style={{ marginBottom: '1rem', color: '#374151' }}>Technologies Used:</h4>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {selectedService.technologies.map((tech) => (
                          <span key={tech} style={{
                            background: '#f3f4f6',
                            color: '#374151',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '1rem',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}>
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="service-card">
                    <h4 style={{ marginBottom: '1rem' }}>Quick Facts</h4>
                    <div style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
                      <div><strong>Category:</strong> {selectedService.category}</div>
                      <div><strong>Timeline:</strong> {selectedService.timeline}</div>
                      <div><strong>Starting Price:</strong> {selectedService.pricing.starter}</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'features' && (
                <div>
                  <h3 className="service-title">Key Features</h3>
                  <div className="services-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                    {selectedService.features.map((feature, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem',
                        background: '#f8fafc',
                        borderRadius: '0.5rem',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div style={{ color: '#22c55e', fontSize: '1.25rem' }}>✓</div>
                        <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'pricing' && (
                <div>
                  <h3 className="service-title">Pricing Packages</h3>
                  <div className="services-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                    <div className="service-card">
                      <h4 style={{ color: '#059669', marginBottom: '0.5rem' }}>Starter Package</h4>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#374151', marginBottom: '1rem' }}>
                        {selectedService.pricing.starter}
                      </div>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        Perfect for small businesses and startups looking to get started.
                      </p>
                    </div>
                    <div className="service-card" style={{ border: '2px solid #3b82f6' }}>
                      <h4 style={{ color: '#3b82f6', marginBottom: '0.5rem' }}>Professional Package</h4>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#374151', marginBottom: '1rem' }}>
                        {selectedService.pricing.professional}
                      </div>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        Comprehensive solution for growing businesses with advanced features.
                      </p>
                    </div>
                    <div className="service-card">
                      <h4 style={{ color: '#7c3aed', marginBottom: '0.5rem' }}>Enterprise Package</h4>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#374151', marginBottom: '1rem' }}>
                        {selectedService.pricing.enterprise}
                      </div>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        Fully customized solution with dedicated support and advanced integrations.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'case-study' && (
                <div>
                  <h3 className="service-title">Success Story</h3>
                  <div className="service-card" style={{ 
                    background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
                    border: '2px solid #0ea5e9'
                  }}>
                    <h4 style={{ color: '#0369a1', marginBottom: '1rem' }}>
                      Client: {selectedService.caseStudy.client}
                    </h4>
                    <div style={{ marginBottom: '1rem' }}>
                      <strong style={{ color: '#dc2626' }}>Challenge:</strong>
                      <p style={{ margin: '0.5rem 0', color: '#374151' }}>
                        {selectedService.caseStudy.challenge}
                      </p>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <strong style={{ color: '#059669' }}>Solution:</strong>
                      <p style={{ margin: '0.5rem 0', color: '#374151' }}>
                        {selectedService.caseStudy.solution}
                      </p>
                    </div>
                    <div>
                      <strong style={{ color: '#7c3aed' }}>Result:</strong>
                      <p style={{ margin: '0.5rem 0', color: '#374151', fontWeight: '600' }}>
                        {selectedService.caseStudy.result}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              justifyContent: 'center',
              marginTop: '2rem'
            }}>
              <Link to="/contact" className="btn-primary">
                Get Quote for This Service
              </Link>
              <button 
                onClick={() => setSelectedService(null)}
                className="btn-secondary"
              >
                Close Details
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Our Process */}
      <section className="section">
        <h2 className="section-title">Our Development Process</h2>
        <p className="section-content" style={{ marginBottom: '2rem' }}>
          We follow a proven methodology to ensure successful project delivery.
        </p>
        <div className="services-grid">
          {processSteps.map((step) => (
            <div key={step.step} className="service-card">
              <div style={{ 
                background: '#3b82f6',
                color: 'white',
                width: '3rem',
                height: '3rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: '700',
                marginBottom: '1rem'
              }}>
                {step.step}
              </div>
              <h3 className="service-title">{step.title}</h3>
              <p className="service-description">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Client Testimonials */}
      <section className="section">
        <h2 className="section-title">What Our Clients Say</h2>
        <div className="services-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div style={{ 
                display: 'flex', 
                gap: '0.25rem', 
                marginBottom: '1rem',
                color: '#fbbf24'
              }}>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i}>⭐</span>
                ))}
              </div>
              <blockquote className="testimonial-quote">
                "{testimonial.content}"
              </blockquote>
              <div>
                <div style={{ fontWeight: '600', color: '#374151' }}>
                  {testimonial.name}
                </div>
                <div className="testimonial-author">
                  {testimonial.position}
                </div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#3b82f6',
                  marginTop: '0.25rem',
                  fontWeight: '500'
                }}>
                  Project: {testimonial.project}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="section" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h2 className="section-title">Ready to Transform Your Business?</h2>
        <p className="section-content" style={{ marginBottom: '2rem' }}>
          Let's discuss your project requirements and create a solution that drives your success.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/contact" className="btn-primary">
            Start Your Project
          </Link>
          <Link to="/about" className="btn-secondary">
            Learn About Our Company
          </Link>
        </div>
      </section>
    </div>
  )
}