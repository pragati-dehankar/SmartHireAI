import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/* ─── Floating Particle ─────────────────────────────────── */
function Particle({ style }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: '6px', height: '6px',
        background: 'rgba(99,102,241,0.3)',
        animation: `floatY ${3 + Math.random() * 3}s ease-in-out infinite`,
        animationDelay: `${Math.random() * 3}s`,
        ...style,
      }}
    />
  );
}

const RECRUITER_FEATURES = [
  { icon: '🤖', label: 'BERT Resume Screening', desc: 'Semantic NLP analysis', bert: true },
  { icon: '📊', label: 'Candidate Ranking',     desc: 'AI-powered suitability scores', bert: true },
  { icon: '⚖️', label: 'Bias Detection',        desc: 'Fair & inclusive hiring', bert: true },
  { icon: '🔍', label: 'Explainable AI',         desc: 'Transparent decisions', bert: true },
  { icon: '📈', label: 'Fairness Reports',       desc: 'Metrics & analytics' },
  { icon: '📥', label: 'Export Results',         desc: 'One-click report export' },
];

const CANDIDATE_FEATURES = [
  { icon: '🎯', label: 'Job Matching',     desc: 'BERT-powered recommendations', bert: true },
  { icon: '📊', label: 'AI Match Score',   desc: 'Know your fit before applying', bert: true },
  { icon: '📂', label: 'Resume Upload',    desc: 'Smart parsing & extraction' },
  { icon: '📋', label: 'Application Track', desc: 'Full pipeline visibility' },
  { icon: '⭐', label: 'Shortlisting',     desc: 'See where you stand' },
  { icon: '🔔', label: 'Notifications',   desc: 'Real-time status updates' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const { user, isAuthenticated, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [roleMode, setRoleMode] = useState('recruiter');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const rp = params.get('role');
    if (rp === 'recruiter' || rp === 'candidate') setRoleMode(rp);
  }, [location]);

  // Auto-redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'recruiter' ? '/recruiter' : '/candidate');
    }
  }, [isAuthenticated, user, navigate]);

  const isRecruiter = roleMode === 'recruiter';
  const features = isRecruiter ? RECRUITER_FEATURES : CANDIDATE_FEATURES;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { success, user } = await login(email, password);
    if (success && user) {
      if (user.role !== roleMode) {
        setError(`Wrong portal: your account is a "${user.role}" account.`);
        logout();
      } else {
        navigate(user.role === 'recruiter' ? '/recruiter' : '/candidate');
        return;
      }
    } else {
      setError('Invalid email or password. Please try again.');
    }
    setLoading(false);
  };

  const quickAccess = async () => {
    setLoading(true);
    setError('');
    const { success, user } = await login('demo@techcorp.com', 'demo123');
    if (success && user) {
      if (user.role !== roleMode) {
        setError(`Demo account is a "${user.role}" account, not "${roleMode}".`);
        logout();
      } else {
        navigate(user.role === 'recruiter' ? '/recruiter' : '/candidate');
      }
    } else {
      setError('Demo login failed.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ── Left Panel (Feature Showcase) ─────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 relative overflow-hidden p-10"
        style={{
          background: isRecruiter
            ? 'linear-gradient(160deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)'
            : 'linear-gradient(160deg, #042f4b 0%, #0c4a6e 40%, #1e3a5f 100%)',
        }}
      >
        {/* Ambient glow */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full pointer-events-none"
             style={{ background: isRecruiter ? 'rgba(139,92,246,0.15)' : 'rgba(6,182,212,0.12)', filter: 'blur(80px)' }} />
        <div className="absolute -bottom-40 -right-20 w-[400px] h-[400px] rounded-full pointer-events-none"
             style={{ background: isRecruiter ? 'rgba(99,102,241,0.2)' : 'rgba(14,116,144,0.2)', filter: 'blur(80px)' }} />

        {/* Floating particles */}
        {Array.from({ length: 8 }).map((_, i) => (
          <Particle key={i} style={{ top: `${10 + i * 11}%`, left: `${5 + (i % 4) * 22}%` }} />
        ))}

        {/* Logo */}
        <div className="relative z-10">
          <button onClick={() => navigate('/')} className="flex items-center gap-3 mb-12 group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shadow-xl"
                 style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
              SH
            </div>
            <span className="text-white font-black text-xl tracking-tight">SmartHire AI</span>
          </button>

          <div className="mb-2">
            <span className="bert-badge" style={{ background: 'rgba(6,182,212,0.15)', borderColor: 'rgba(6,182,212,0.4)', color: '#67e8f9' }}>
              BERT · NLP · Explainable AI
            </span>
          </div>
          <h2 className="text-3xl font-black text-white leading-tight mt-3 mb-2">
            {isRecruiter ? 'Recruiter' : 'Candidate'} Portal
          </h2>
          <p className="text-slate-300 text-sm font-medium mb-8">
            {isRecruiter
              ? 'Access your AI-powered hiring command center'
              : 'Browse jobs and track your applications with AI insights'}
          </p>

          {/* Features List */}
          <div className="space-y-3">
            {features.map((f, i) => (
              <div key={i}
                className="flex items-center gap-3 p-3 rounded-xl animate-fade-up"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', animationDelay: `${i * 0.08}s` }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
                     style={{ background: 'rgba(255,255,255,0.08)' }}>
                  {f.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm">{f.label}</span>
                    {f.bert && <span className="bert-badge" style={{ fontSize: '8px', padding: '1px 6px', background: 'rgba(6,182,212,0.15)', borderColor: 'rgba(6,182,212,0.3)', color: '#67e8f9' }}>BERT</span>}
                  </div>
                  <div className="text-slate-400 text-xs">{f.desc}</div>
                </div>
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                     style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399' }}>✓</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10 pt-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <p className="text-slate-300 text-xs font-medium leading-relaxed italic">
            "SmartHire AI processes every resume with BERT embeddings, ensuring
            recruitment decisions are fair, explainable, and data-driven."
          </p>
          <div className="flex items-center gap-2 mt-3">
            <div className="status-dot online" />
            <span className="text-slate-400 text-xs">BERT Engine Online</span>
          </div>
        </div>
      </div>

      {/* ── Right Panel (Form) ─────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md animate-fade-up">

          {/* Role toggle */}
          <div className="flex p-1 rounded-2xl mb-8 shadow-inner" style={{ background: '#e2e8f0' }}>
            {['recruiter', 'candidate'].map(r => (
              <button
                key={r}
                onClick={() => { setRoleMode(r); setError(''); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300"
                style={roleMode === r ? {
                  background: 'white',
                  color: '#4338ca',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                } : { color: '#64748b' }}
              >
                {r === 'recruiter' ? '👩‍💼  Recruiter' : '👨‍💻  Candidate'}
              </button>
            ))}
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 mb-1">
              {isRecruiter ? 'Welcome back' : 'Welcome back'}
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Sign in to your {roleMode} account to continue
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 rounded-xl text-sm font-semibold text-red-700 flex items-center gap-2"
                 style={{ background: '#fee2e2', border: '1px solid #fecaca' }}>
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="demo@techcorp.com"
                required
                className="w-full px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all"
                style={{ borderColor: '#e2e8f0', background: 'white' }}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all pr-12"
                  style={{ borderColor: '#e2e8f0', background: 'white' }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-lg transition-colors">
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-white text-sm transition-all duration-300 disabled:opacity-60"
              style={{
                background: isRecruiter
                  ? 'linear-gradient(135deg, #4338ca, #6366f1)'
                  : 'linear-gradient(135deg, #0369a1, #0ea5e9)',
                boxShadow: isRecruiter
                  ? '0 6px 20px rgba(99,102,241,0.4)'
                  : '0 6px 20px rgba(14,165,233,0.4)',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
                  Authenticating...
                </span>
              ) : (
                `Sign In as ${roleMode.charAt(0).toUpperCase() + roleMode.slice(1)} →`
              )}
            </button>
          </form>

          {/* Quick Demo Access */}
          {isRecruiter && (
            <div className="mt-4">
              <button
                onClick={quickAccess}
                disabled={loading}
                id="demo-access"
                className="w-full py-3 rounded-xl font-bold text-sm border-2 transition-all duration-300 hover:shadow-md disabled:opacity-60"
                style={{ borderColor: '#d1fae5', background: '#ecfdf5', color: '#065f46' }}
              >
                ✅ Quick Demo Access (Recruiter)
              </button>
            </div>
          )}

          {/* BERT indicator */}
          <div className="mt-6 p-4 rounded-2xl" style={{ background: '#f0fdff', border: '1px solid #a5f3fc' }}>
            <div className="flex items-center gap-3">
              <div className="bert-live-indicator">
                <div className="dot" /> BERT Engine Active
              </div>
              <p className="text-slate-500 text-xs font-medium flex-1">
                Your data is processed with BERT semantic analysis & end-to-end encryption.
              </p>
            </div>
          </div>

          {/* Sign up link */}
          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <button
              onClick={() => navigate(`/signup?role=${roleMode}`)}
              className="font-bold hover:underline transition-all"
              style={{ color: '#4338ca' }}
            >
              Create one →
            </button>
          </p>

          <p className="text-center text-xs text-slate-400 mt-4">
            By signing in, you agree to our{' '}
            <span className="underline cursor-pointer">Terms of Service</span> &{' '}
            <span className="underline cursor-pointer">Privacy Policy</span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes floatY {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin { animation: spin 0.7s linear infinite; }
      `}</style>
    </div>
  );
}