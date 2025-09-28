export default function LoadingSpinner({ size = 'medium', message = 'Loading...' }) {
  const sizes = {
    small: { width: '20px', height: '20px', borderWidth: '2px' },
    medium: { width: '40px', height: '40px', borderWidth: '3px' },
    large: { width: '60px', height: '60px', borderWidth: '4px' }
  }

  const spinnerSize = sizes[size] || sizes.medium

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      padding: '2rem'
    }}>
      <div
        className="loading-spinner"
        style={{
          width: spinnerSize.width,
          height: spinnerSize.height,
          border: `${spinnerSize.borderWidth} solid #f3f3f3`,
          borderTop: `${spinnerSize.borderWidth} solid #3b82f6`,
          borderRadius: '50%'
        }}
      />
      {message && (
        <p style={{
          margin: 0,
          color: '#6b7280',
          fontSize: '0.875rem',
          fontWeight: '500'
        }}>
          {message}
        </p>
      )}
    </div>
  )
}

// Full page loading component
export function FullPageLoader({ message = 'Loading application...' }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(255, 255, 255, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '1rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
      }}>
        <LoadingSpinner size="large" message={message} />
      </div>
    </div>
  )
}

// Inline loading component
export function InlineLoader({ message = 'Loading...' }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      background: '#f8fafc',
      borderRadius: '0.5rem',
      border: '1px solid #e5e7eb'
    }}>
      <LoadingSpinner size="small" message={message} />
    </div>
  )
}