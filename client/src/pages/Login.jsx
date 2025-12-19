import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_URL || 'https://emp-new-iksg-git-main-teamoflifeboxs-projects.vercel.app/api';

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
        return '/';
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);

    try {
      localStorage.clear();

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || 'Invalid credentials');
      }

      const { token, user } = json.data;
      localStorage.setItem('authToken', token);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('user', JSON.stringify(user));

      navigate(portalPath(user.role?.toLowerCase()), { replace: true });
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-br from-amber-50 to-gray-100">

      {/* LEFT BRAND PANEL */}
      <div className="hidden lg:flex flex-col justify-center px-20 bg-gradient-to-br from-amber-500 to-amber-600 text-white">
        <h1 className="text-4xl font-bold mb-4">Welcome Back 👋</h1>
        <p className="text-lg opacity-90 leading-relaxed">
          Manage Courses, Teams, Employees and Students
          <br />from one unified platform.
        </p>

        <div className="mt-10 text-sm opacity-80">
          Secure • Fast • Role-based Access
        </div>
      </div>

      {/* RIGHT LOGIN PANEL */}
      <div className="flex items-center justify-center px-6">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white"
        >
          <h2 className="text-2xl font-bold text-center mb-2" style={{color:'black'}}>
            Sign In
          </h2>
          <p className="text-sm text-gray-500 text-center mb-6">
            Enter your credentials to continue
          </p>

          {/* Identifier */}
          <div className="mb-5">
            <label className="text-sm text-gray-600">Username or Email</label>
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-lg border focus:ring-2 focus:ring-amber-500 focus:outline-none transition"
              placeholder="you@example.com"
              autoComplete="username"
              required
            />
          </div>

          {/* Password */}
          <div className="mb-4 relative">
            <label className="text-sm text-gray-600">Password</label>
            <input
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-lg border focus:ring-2 focus:ring-amber-500 focus:outline-none transition"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-1 top-8 "
            >
              {showPwd ? '🙈' : '👁️'}
            </button>
          </div>

          {/* Error */}
          {err && (
            <p className="text-red-600 text-sm text-center mb-3 animate-pulse">
              {err}
            </p>
          )}

          {/* Submit */}
          <button
            disabled={loading}
            className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-medium transition-all disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Login'}
          </button>

          {/* Footer */}
          <p className="text-xs text-gray-500 text-center mt-6">
            © {new Date().getFullYear()} LifeBox NextGen Pvt. Ltd. All rights reserved.
          </p>
        </form>
      </div>
    </div>
  );
}
