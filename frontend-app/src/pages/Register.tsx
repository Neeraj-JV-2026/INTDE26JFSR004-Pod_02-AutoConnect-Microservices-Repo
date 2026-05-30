import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  User, Mail, Phone, Lock, ChevronDown, ArrowRight,
  Clock, CheckCircle2, AlertCircle, Car, ShieldCheck,
} from 'lucide-react';

const ROLE_INFO: Record<string, { label: string; desc: string }> = {
  CUSTOMER:        { label: 'Customer',         desc: 'Book services, track vehicles, view invoices' },
  SALES_CONSULTANT:{ label: 'Sales Consultant',  desc: 'Manage leads, build quotes, close deals' },
  SERVICE_ADVISOR: { label: 'Service Advisor',   desc: 'Schedule appointments, manage work orders' },
  TECHNICIAN:      { label: 'Technician',        desc: 'View assigned jobs, update repair progress' },
  PARTS_MANAGER:   { label: 'Parts Manager',     desc: 'Control inventory, manage part orders' },
  FINANCE_OFFICER: { label: 'Finance Officer',   desc: 'Invoicing, commissions, reconciliations' },
  ADMIN:           { label: 'Administrator',     desc: 'Full platform access and user management' },
  AUDITOR:         { label: 'Auditor / BI',      desc: 'Analytics dashboards and custom reports' },
};

export default function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', role: 'CUSTOMER',
  });
  const [error, setError]                 = useState('');
  const [success, setSuccess]             = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);
  const [loading, setLoading]             = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post('http://localhost:8089/api/auth/register', formData);
      const { role } = formData;
      if (role !== 'CUSTOMER' && role !== 'ADMIN') {
        setPendingApproval(true);
      } else {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Pending approval screen ──────────────────────────────────────────────────
  if (pendingApproval) {
    return (
      <div className="min-h-[calc(100vh-104px)] flex items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-10">
            <div className="w-16 h-16 bg-amber-50 border-2 border-amber-200 rounded-full flex items-center justify-center mx-auto mb-5">
              <Clock className="w-7 h-7 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">Request Submitted</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Your <span className="font-semibold text-gray-700">{ROLE_INFO[formData.role]?.label}</span> account
              is pending administrator approval. You'll receive access once an admin reviews your request.
            </p>
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-700 font-medium mb-7">
              Typically approved within 1 business day
            </div>
            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-[#020617] hover:bg-gray-800 text-white font-semibold rounded-xl transition-all duration-150 active:scale-[0.98]"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
        {/* Glow top-right */}
        <div
          className="absolute -top-20 -right-20 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.10) 0%, transparent 70%)' }}
        />

        {/* Top — logo + copy */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-brand-yellow rounded-xl flex items-center justify-center shadow-lg">
              <Car className="w-5 h-5 text-gray-900" />
            </div>
            <span className="font-black text-xl tracking-widest text-white">AUTOCONNECT</span>
          </div>

          <h2 className="text-3xl font-extrabold text-white leading-snug tracking-tight mb-4">
            Join the platform<br />
            <span className="text-brand-yellow">built for dealerships.</span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-10">
            One account. Your role-specific console. Full visibility into every
            deal, service order, and customer interaction.
          </p>

          {/* Role preview cards */}
          <div className="space-y-3">
            {(['CUSTOMER', 'SALES_CONSULTANT', 'SERVICE_ADVISOR', 'FINANCE_OFFICER'] as const).map(r => (
              <div
                key={r}
                className={`flex items-start gap-3 px-4 py-3 rounded-xl border transition-all duration-150 ${
                  formData.role === r
                    ? 'border-brand-yellow/40 bg-brand-yellow/5'
                    : 'border-white/5 bg-white/[0.02]'
                }`}
              >
                <ShieldCheck className={`w-4 h-4 mt-0.5 shrink-0 ${formData.role === r ? 'text-brand-yellow' : 'text-gray-600'}`} />
                <div>
                  <p className={`text-xs font-semibold ${formData.role === r ? 'text-brand-yellow' : 'text-gray-400'}`}>
                    {ROLE_INFO[r].label}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">{ROLE_INFO[r].desc}</p>
                </div>
              </div>
            ))}
            <p className="text-xs text-gray-600 pl-1">+ 4 more roles available</p>
          </div>
        </div>

        {/* Bottom — note */}
        <div className="relative z-10 border-t border-white/10 pt-6">
          <div className="flex items-start gap-2 text-xs text-gray-600">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
            Staff roles (Sales, Service, Finance, etc.) require admin approval before first login.
          </div>
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

          <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">Create your account</h1>
          <p className="text-sm text-gray-500 mb-8">
            Already registered?{' '}
            <Link to="/login" className="text-brand-yellow font-semibold hover:text-yellow-600 transition-colors">
              Sign in here
            </Link>
          </p>

          {/* Success banner */}
          {success && (
            <div className="flex items-center gap-3 mb-6 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Account created! Redirecting to sign in…
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-3 mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text" name="name" required
                    value={formData.name} onChange={handleChange}
                    placeholder="Jane Smith"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 transition-all duration-150"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email" name="email" required
                    value={formData.email} onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 transition-all duration-150"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Phone <span className="normal-case text-gray-400 font-normal">(optional)</span></label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel" name="phone"
                    value={formData.phone} onChange={handleChange}
                    placeholder="+1 800 123 4567"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 transition-all duration-150"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password" name="password" required
                    value={formData.password} onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 transition-all duration-150"
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">I am a…</label>
                <div className="relative">
                  <select
                    name="role"
                    value={formData.role} onChange={handleChange}
                    className="w-full appearance-none pl-4 pr-10 py-3 border border-gray-200 rounded-xl bg-white text-sm text-gray-800 shadow-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 transition-all duration-150 cursor-pointer"
                  >
                    {Object.entries(ROLE_INFO).map(([val, { label }]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                {/* Role description hint */}
                {ROLE_INFO[formData.role] && (
                  <p className="text-xs text-gray-400 mt-1.5 pl-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3 text-brand-yellow shrink-0" />
                    {ROLE_INFO[formData.role].desc}
                    {formData.role !== 'CUSTOMER' && formData.role !== 'ADMIN' && (
                      <span className="ml-1 text-amber-600 font-medium">· requires approval</span>
                    )}
                  </p>
                )}
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
                    Creating account…
                  </span>
                ) : (
                  <>Create Account <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} AutoConnect · All rights reserved
          </p>
        </div>
      </div>

    </div>
  );
}
