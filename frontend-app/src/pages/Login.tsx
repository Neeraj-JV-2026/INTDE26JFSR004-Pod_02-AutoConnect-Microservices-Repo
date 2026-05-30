import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, CheckCircle2, AlertCircle, Car } from 'lucide-react';

const FEATURES = [
  'Role-matched dashboard — see only what matters to you',
  'Real-time notifications across every dealership team',
  'Integrated sales, finance, service & inventory in one platform',
];

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8089/api/auth/login', { email, password });
      const { token, user_id, name, email: userEmail, role } = response.data;
      login(token, { id: user_id, name, email: userEmail, role });
      switch (role) {
        case 'ADMIN':             navigate('/admin');    break;
        case 'CUSTOMER':          navigate('/customer'); break;
        case 'SALES_CONSULTANT':  navigate('/sales');    break;
        case 'SERVICE_ADVISOR':   navigate('/service');  break;
        case 'TECHNICIAN':        navigate('/tech');     break;
        case 'PARTS_MANAGER':     navigate('/parts');    break;
        case 'FINANCE_OFFICER':   navigate('/finance');  break;
        case 'AUDITOR':           navigate('/reports');  break;
        default:                  navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-104px)] flex">

      {/* ── Left panel — brand ──────────────────────────────────────────── */}
      <div className="hidden lg:flex w-[45%] bg-[#020617] flex-col justify-between p-12 relative overflow-hidden">
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: 'linear-gradient(#d4af37 1px,transparent 1px),linear-gradient(90deg,#d4af37 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Glow */}
        <div
          className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)' }}
        />

        {/* Top — logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-brand-yellow rounded-xl flex items-center justify-center shadow-lg">
              <Car className="w-5 h-5 text-gray-900" />
            </div>
            <span className="font-black text-xl tracking-widest text-white">AUTOCONNECT</span>
          </div>

          <h2 className="text-3xl font-extrabold text-white leading-snug tracking-tight mb-4">
            Welcome back to<br />
            <span className="text-brand-yellow">your dealership hub.</span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-10">
            Sign in to access your role-specific console — from Sales and Finance to Service and Parts.
          </p>

          <ul className="space-y-4">
            {FEATURES.map(f => (
              <li key={f} className="flex items-start gap-3 text-sm text-gray-400">
                <CheckCircle2 className="w-4 h-4 text-brand-yellow mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom — tagline */}
        <div className="relative z-10 border-t border-white/10 pt-6">
          <p className="text-xs text-gray-600 italic">
            "The only platform that connects every role in your dealership — without the spreadsheets."
          </p>
        </div>
      </div>

      {/* ── Right panel — form ──────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-brand-yellow rounded-lg flex items-center justify-center">
              <Car className="w-4 h-4 text-gray-900" />
            </div>
            <span className="font-black text-lg tracking-widest text-gray-900">AUTOCONNECT</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">Sign in</h1>
          <p className="text-sm text-gray-500 mb-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-yellow font-semibold hover:text-yellow-600 transition-colors">
              Register here
            </Link>
          </p>

          {error && (
            <div className="flex items-start gap-3 mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 transition-all duration-150"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 transition-all duration-150"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-brand-yellow hover:bg-yellow-400 text-gray-900 font-bold rounded-xl shadow-sm active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Signing in…
                </span>
              ) : (
                <>Sign in <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} AutoConnect · All rights reserved
          </p>
        </div>
      </div>

    </div>
  );
}
