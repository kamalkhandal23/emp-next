import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function StudentProfileNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('studentInfo');
    navigate('/nextgen/login', { replace: true });
  };

  const navItems = [
    {
      path: '/nextgen/login',
      label: 'Dashboard',
      icon: '🏠',
    },
    {
      path: '/nextgen/profile',
      label: 'Profile',
      icon: '👤',
    },
    {
      path: '/nextgen/results',
      label: 'Results',
      icon: '📊',
    },
    {
      path: '/nextgen/lectures',
      label: 'Lectures',
      icon: '📚',
    },
    {
      path: '/nextgen/assignments',
      label: 'Assignments',
      icon: '📝',
    },
    {
      path: '/nextgen/exams',
      label: 'Exams',
      icon: '📋',
    },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav
      style={{
        background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
        borderRadius: '0.75rem',
        padding: '0.75rem 1rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}>
      <div
        style={{
          display: 'flex',
          gap: '0.25rem',
          flexWrap: 'nowrap',
          justifyContent: 'center',
          alignItems: 'center',
          overflowX: 'auto',
        }}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '500',
              fontSize: '0.875rem',
              transition: 'all 0.3s ease',
              background: isActive(item.path)
                ? 'rgba(255, 255, 255, 0.25)'
                : 'transparent',
              color: isActive(item.path)
                ? '#ffffff'
                : 'rgba(255, 255, 255, 0.8)',
              border: isActive(item.path)
                ? '2px solid rgba(255, 255, 255, 0.5)'
                : '2px solid transparent',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              if (!isActive(item.path)) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.color = '#ffffff';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive(item.path)) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
              }
            }}>
            <span style={{ fontSize: '1rem' }}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            border: '2px solid rgba(255, 255, 255, 0.5)',
            background: 'rgba(239, 68, 68, 0.2)',
            color: '#ffffff',
            fontWeight: '500',
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.4)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.8)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
          }}>
          <span style={{ fontSize: '1rem' }}>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}
