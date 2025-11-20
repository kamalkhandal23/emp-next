import { Link } from 'react-router-dom';

export default function CourseCard({ course }) {
  return (
    <div
      className="service-card"
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        border: '1px solid #e5e7eb',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
      }}>
      {/* Course Icon */}
      <div
        style={{
          fontSize: '4rem',
          textAlign: 'center',
          marginBottom: '1rem',
          padding: '1rem',
          background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
          borderRadius: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '120px',
        }}>
        {course.icon}
      </div>

      {/* Title and Price Badge */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '0.75rem',
          gap: '0.5rem',
        }}>
        <h3
          className="service-title"
          style={{
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#111827',
            lineHeight: '1.4',
            minHeight: '3.5rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
          {course.title}
        </h3>
        <span
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            padding: '0.375rem 0.875rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '700',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)',
          }}>
          {course.price}
        </span>
      </div>

      {/* Description */}
      <p
        className="service-description"
        style={{
          marginBottom: '1.25rem',
          fontSize: '0.875rem',
          lineHeight: '1.6',
          color: '#6b7280',
          minHeight: '4.5rem',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
        {course.description}
      </p>

      {/* Course Details Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.75rem',
          marginBottom: '1.25rem',
          padding: '1rem',
          background: '#f9fafb',
          borderRadius: '0.75rem',
          fontSize: '0.875rem',
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.125rem' }}>⏱️</span>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Duration</div>
            <div style={{ fontWeight: '600', color: '#374151' }}>
              {course.duration}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.125rem' }}>📚</span>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Level</div>
            <div style={{ fontWeight: '600', color: '#374151' }}>
              {course.level}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.125rem' }}>👥</span>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Students</div>
            <div style={{ fontWeight: '600', color: '#374151' }}>
              {course.students}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.125rem' }}>⭐</span>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Rating</div>
            <div
              style={{
                fontWeight: '700',
                color: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}>
              {course.rating}
            </div>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div style={{ marginBottom: '1.5rem', flex: 1 }}>
        <h4
          style={{
            fontSize: '0.875rem',
            fontWeight: '700',
            marginBottom: '0.75rem',
            color: '#374151',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
          <span>💡</span>
          Skills You'll Learn:
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {course.skills.slice(0, 3).map((skill, skillIndex) => (
            <span
              key={skillIndex}
              style={{
                background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                color: '#1e40af',
                padding: '0.375rem 0.75rem',
                borderRadius: '0.5rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                border: '1px solid #93c5fd',
              }}>
              {skill}
            </span>
          ))}
          {course.skills.length > 3 && (
            <span
              style={{
                background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                color: '#92400e',
                padding: '0.375rem 0.75rem',
                borderRadius: '0.5rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                border: '1px solid #fcd34d',
              }}>
              +{course.skills.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Enroll Button */}
      <Link
        to="/nextgen/enroll"
        className="btn-primary"
        style={{
          width: '100%',
          textAlign: 'center',
          display: 'block',
          textDecoration: 'none',
          padding: '0.875rem 2rem',
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          color: 'white',
          fontWeight: '600',
          fontSize: '0.875rem',
          letterSpacing: '0.025em',
          textTransform: 'uppercase',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 14px 0 rgba(245, 158, 11, 0.39)',
          borderRadius: '0.5rem',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background =
            'linear-gradient(135deg, #d97706, #b45309)';
          e.currentTarget.style.transform = 'scale(1.02)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background =
            'linear-gradient(135deg, #f59e0b, #d97706)';
          e.currentTarget.style.transform = 'scale(1)';
        }}>
        Enroll in This Course
      </Link>
    </div>
  );
}
