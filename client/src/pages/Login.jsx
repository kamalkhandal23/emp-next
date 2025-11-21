import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

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

      console.log(
        `Login successful for ${user.role}. Redirecting to ${redirectTo}`
      );
    } catch (e) {
      console.error('Login failed:', e);
      setErr(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container relative grid place-items-center min-h-[80vh] bg-gray-50'>
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className='absolute top-8 left-8 inline-flex items-center gap-2 px-4 py-2 bg-linear-to-br from-amber-500 to-amber-600 text-white rounded-lg text-sm font-medium transition-all duration-200 border border-amber-600 hover:from-amber-600 hover:to-amber-700 no-underline shadow-md hover:shadow-lg cursor-pointer'>
        ← Back to Home
      </button>

      <form
        onSubmit={handleLogin}
        className='service-card w-[420px] p-8 bg-white rounded-2xl shadow-lg'>
        <h2 className='text-center mb-4 font-semibold text-2xl'>Login</h2>

        <label className='form-label'>Username or Email</label>
        <input
          className='form-input w-full px-3 py-2.5 border border-gray-300 rounded-lg mb-4'
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder='admin.user or you@example.com'
          required
        />

        <label className='form-label'>Password</label>
        <input
          className='form-input w-full px-3 py-2.5 border border-gray-300 rounded-lg'
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {err && <p className='text-red-600 mt-3 text-sm text-center'>{err}</p>}

        <button
          className='btn-primary w-full mt-5 px-4 py-3 rounded-lg  text-white font-medium border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed  '
          disabled={loading}>
          {loading ? 'Logging in…' : 'Login'}
        </button>
      </form>
    </div>
  );
}
