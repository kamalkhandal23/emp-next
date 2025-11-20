import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [identifier, setIdentifier] = useState(''); 
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

  // 🔹 Helper function to decide redirect path
  const portalPath = (role) => {
    switch (role) {
      case 'admin':
      case 'super_admin':
        return '/portal/admin';
      case 'course_manager':
        return '/portal/coursemanager';
      case 'manager':
        return '/portal/manager';
      case 'team_lead':
        return '/portal/team-lead';
      case 'hr':
        return '/portal/hr';
      case 'employee':
        return '/employee-portal';
      case 'student':
        return '/nextgen/dashboard';
      default:
        return '/'; // fallback
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const json = await res.json();

      if (!res.ok || !json?.success) {
        throw new Error(json?.message || 'Login failed');
      }

     
      const { token, user } = json.data || {};

      if (!token || !user) {
        throw new Error('Invalid response from server');
      }

   
      localStorage.setItem('authToken', token);
      localStorage.setItem('userRole', user.role || '');
      localStorage.setItem('user', JSON.stringify(user));

     
      const redirectTo = portalPath(user.role);
      navigate(redirectTo, { replace: true });

      console.log(`Login successful for ${user.role}. Redirecting to ${redirectTo}`);
    } catch (e) {
      console.error('Login failed:', e);
      setErr(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container"
      style={{
        display: 'grid',
        placeItems: 'center',
        minHeight: '80vh',
        background: '#f9fafb',
      }}
    >
      <form
        onSubmit={handleLogin}
        className="service-card"
        style={{
          width: 420,
          padding: '2rem',
          background: '#fff',
          borderRadius: '1rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            marginBottom: '1rem',
            fontWeight: 600,
            fontSize: '1.5rem',
          }}
        >
          Login
        </h2>

        <label className="form-label">Username or Email</label>
        <input
          className="form-input"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="admin.user or you@example.com"
          required
          style={{
            width: '100%',
            padding: '0.6rem',
            border: '1px solid #ccc',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
          }}
        />

        <label className="form-label">Password</label>
        <input
          className="form-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '0.6rem',
            border: '1px solid #ccc',
            borderRadius: '0.5rem',
          }}
        />

        {err && (
          <p
            style={{
              color: '#dc2626',
              marginTop: '0.75rem',
              fontSize: '0.9rem',
              textAlign: 'center',
            }}
          >
            {err}
          </p>
        )}

        <button
          className="btn-primary"
          style={{
            width: '100%',
            marginTop: '1.25rem',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            backgroundColor: '#2563eb',
            color: '#fff',
            fontWeight: 500,
            border: 'none',
            cursor: 'pointer',
          }}
          disabled={loading}
        >
          {loading ? 'Logging in…' : 'Login'}
        </button>
      </form>
    </div>
  );
}
