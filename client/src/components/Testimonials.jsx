import { useState } from 'react'

const testimonials = [
  {
    id: 1,
    name: 'Rajesh Kumar',
    position: 'CTO, TechCorp Solutions',
    company: 'TechCorp Solutions',
    content: 'Lifebox NextGen delivered an exceptional ERP system that transformed our operations. Their technical expertise and project management were outstanding.',
    rating: 5,
    image: '👨‍💼',
    project: 'ERP Development'
  },
  {
    id: 2,
    name: 'Dr. Priya Sharma',
    position: 'Director, Excellence Institute',
    company: 'Excellence Institute',
    content: 'The NextGenFreeEdu platform revolutionized our teaching methodology. Student engagement and learning outcomes improved significantly.',
    rating: 5,
    image: '👩‍🎓',
    project: 'Digital Education Platform'
  },
  {
    id: 3,
    name: 'Amit Patel',
    position: 'HR Manager, InnovateTech',
    company: 'InnovateTech',
    content: 'Their employee portal solution streamlined our HR processes completely. The attendance and task management features are excellent.',
    rating: 5,
    image: '👨‍💻',
    project: 'Employee Portal'
  },
  {
    id: 4,
    name: 'Sneha Reddy',
    position: 'Operations Manager, RetailPlus',
    company: 'RetailPlus',
    content: 'The CRM system helped us increase our sales by 40%. The customer insights and automation features are game-changing.',
    rating: 5,
    image: '👩‍💼',
    project: 'CRM Solutions'
  },
  {
    id: 5,
    name: 'Vikram Singh',
    position: 'Founder, StartupHub',
    company: 'StartupHub',
    content: 'From concept to deployment, Lifebox NextGen provided end-to-end solutions. Their team is professional and delivers on time.',
    rating: 5,
    image: '👨‍🚀',
    project: 'Custom Software Development'
  },
  {
    id: 6,
    name: 'Kavya Nair',
    position: 'IT Director, HealthCare Plus',
    company: 'HealthCare Plus',
    content: 'The cloud migration was seamless and our system performance improved dramatically. Excellent technical support throughout.',
    rating: 5,
    image: '👩‍⚕️',
    project: 'Cloud Migration'
  }
]

export default function Testimonials({ showAll = false, limit = 3 }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const displayedTestimonials = showAll ? testimonials : testimonials.slice(0, limit)
  
  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % displayedTestimonials.length)
  }
  
  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + displayedTestimonials.length) % displayedTestimonials.length)
  }

  if (showAll) {
    return (
      <div className="services-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
        {testimonials.map((testimonial) => (
          <TestimonialCard key={testimonial.id} testimonial={testimonial} />
        ))}
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Navigation buttons */}
      {displayedTestimonials.length > 1 && (
        <>
          <button
            onClick={prevTestimonial}
            style={{
              position: 'absolute',
              left: '-20px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'white',
              border: '2px solid #e5e7eb',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              zIndex: 10
            }}
          >
            ←
          </button>
          <button
            onClick={nextTestimonial}
            style={{
              position: 'absolute',
              right: '-20px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'white',
              border: '2px solid #e5e7eb',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              zIndex: 10
            }}
          >
            →
          </button>
        </>
      )}

      {/* Testimonial carousel */}
      <div style={{ overflow: 'hidden', borderRadius: '0.75rem' }}>
        <div 
          style={{ 
            display: 'flex',
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: 'transform 0.5s ease-in-out'
          }}
        >
          {displayedTestimonials.map((testimonial) => (
            <div key={testimonial.id} style={{ minWidth: '100%', padding: '0 10px' }}>
              <TestimonialCard testimonial={testimonial} />
            </div>
          ))}
        </div>
      </div>

      {/* Dots indicator */}
      {displayedTestimonials.length > 1 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '0.5rem',
          marginTop: '1.5rem'
        }}>
          {displayedTestimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                border: 'none',
                background: currentIndex === index ? '#3b82f6' : '#d1d5db',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function TestimonialCard({ testimonial }) {
  return (
    <div className="testimonial-card">
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ fontSize: '3rem' }}>{testimonial.image}</div>
        <div>
          <div style={{ fontWeight: '600', color: '#374151', fontSize: '1.125rem' }}>
            {testimonial.name}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
            {testimonial.position}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
            {testimonial.company}
          </div>
        </div>
      </div>
      
      <div style={{ 
        display: 'flex', 
        gap: '0.25rem', 
        marginBottom: '1rem',
        color: '#fbbf24'
      }}>
        {[...Array(testimonial.rating)].map((_, i) => (
          <span key={i} style={{ fontSize: '1.25rem' }}>⭐</span>
        ))}
      </div>
      
      <blockquote className="testimonial-quote" style={{ marginBottom: '1rem' }}>
        "{testimonial.content}"
      </blockquote>
      
      <div style={{ 
        fontSize: '0.75rem', 
        color: '#3b82f6',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>
        Project: {testimonial.project}
      </div>
    </div>
  )
}