import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function SignupPage() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany]   = useState('');
  const [role, setRole]         = useState('recruiter');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const { user, isAuthenticated, signup } = useAuth();
  const navigate                = useNavigate();
  const location                = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const rp = params.get('role');
    if (rp === 'recruiter' || rp === 'candidate') setRole(rp);
  }, [location]);
  
  // Auto-redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'recruiter' ? '/recruiter' : '/candidate');
    }
  }, [isAuthenticated, user, navigate]);

  const isRecruiter = role === 'recruiter';

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { success, user } = await signup(name, email, password, role, company);
    if (success && user) {
      navigate(user.role === 'recruiter' ? '/recruiter' : '/candidate');
    } else {
      setError('Signup failed. Please try again or use a different email.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ── Left Panel (Brand) ─────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[440px] shrink-0 relative overflow-hidden p-10"
        style={{
          background: isRecruiter
            ? 'linear-gradient(160deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)'
            : 'linear-gradient(160deg, #042f4b 0%, #0c4a6e 40%, #1e3a5f 100%)',
        }}
      >
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full pointer-events-none"
             style={{ background: 'rgba(139,92,246,0.12)', filter: 'blur(80px)' }} />
        <div className="absolute -bottom-40 -right-20 w-[400px] h-[400px] rounded-full pointer-events-none"
             style={{ background: 'rgba(99,102,241,0.15)', filter: 'blur(80px)' }} />

        <div className="relative z-10">
          <button onClick={() => navigate('/')} className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shadow-xl"
                 style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
              SH
            </div>
            <span className="text-white font-black text-xl tracking-tight">SmartHire AI</span>
          </button>

          <span className="bert-badge mb-4 inline-block"
                style={{ background: 'rgba(6,182,212,0.15)', borderColor: 'rgba(6,182,212,0.4)', color: '#67e8f9' }}>
            BERT · NLP · AI Hiring
          </span>

          <h2 className="text-3xl font-black text-white leading-tight mt-3 mb-3">
            Join SmartHire AI
          </h2>
          <p className="text-slate-300 text-sm font-medium leading-relaxed mb-8">
            {isRecruiter
              ? 'Start using BERT-powered resume screening, candidate ranking, bias detection, and explainable AI.'
              : 'Get matched to the best roles with AI-powered resume analysis and real-time application tracking.'}
          </p>

          {/* Feature highlights */}
          <div className="space-y-3">
            {(isRecruiter ? [
              { icon: '🤖', text: 'AI Resume Screening with BERT NLP' },
              { icon: '📊', text: 'Intelligent Candidate Ranking' },
              { icon: '⚖️', text: 'Bias Detection & Fair Hiring' },
              { icon: '🔍', text: 'Explainable AI Decisions' },
            ] : [
              { icon: '🎯', text: 'BERT-Powered Job Matching' },
              { icon: '📄', text: 'Smart Resume Parsing' },
              { icon: '📈', text: 'AI Match Score for Every Role' },
              { icon: '⭐', text: 'Real-time Shortlist Alerts' },
            ]).map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl"
                   style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-lg">{f.icon}</span>
                <span className="text-white text-sm font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 pt-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bert-pulse" />
            <span className="text-slate-400 text-xs font-medium">BERT Engine Online · Secure Registration</span>
          </div>
        </div>
      </div>

      {/* ── Right Panel (Form) ─────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md animate-fade-up">

          {/* Role Toggle */}
          <div className="flex p-1 rounded-2xl mb-8 shadow-inner" style={{ background: '#e2e8f0' }}>
            {['recruiter', 'candidate'].map(r => (
              <button
                key={r}
                onClick={() => { setRole(r); setError(''); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300"
                style={role === r ? {
                  background: 'white', color: '#4338ca',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                } : { color: '#64748b' }}
              >
                {r === 'recruiter' ? '👩‍💼 Recruiter' : '👨‍💻 Candidate'}
              </button>
            ))}
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 mb-1">Create your account</h1>
            <p className="text-slate-500 text-sm font-medium">
              Register as a {role} to get started
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
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
              <input
                id="signup-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your full name"
                required
                className="w-full px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all"
                style={{ borderColor: '#e2e8f0', background: 'white' }}
              />
            </div>

            {isRecruiter && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Company</label>
                <input
                  id="signup-company"
                  type="text"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="Company name"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all"
                  style={{ borderColor: '#e2e8f0', background: 'white' }}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className="w-full px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all"
                style={{ borderColor: '#e2e8f0', background: 'white' }}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Create a strong password"
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
              id="signup-submit"
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-white text-sm transition-all duration-300 disabled:opacity-60 mt-2"
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
                  Creating Account...
                </span>
              ) : (
                `Create ${role.charAt(0).toUpperCase() + role.slice(1)} Account →`
              )}
            </button>
          </form>

          {/* BERT Strip */}
          <div className="mt-6 p-4 rounded-2xl" style={{ background: '#f0fdff', border: '1px solid #a5f3fc' }}>
            <div className="flex items-center gap-3">
              <div className="bert-live-indicator">
                <div className="dot" /> Secured
              </div>
              <p className="text-slate-500 text-xs font-medium flex-1">
                Your data is protected with end-to-end encryption & role-based access control.
              </p>
            </div>
          </div>

          {/* Login Link */}
          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <button
              onClick={() => navigate(`/login?role=${role}`)}
              className="font-bold hover:underline transition-all"
              style={{ color: '#4338ca' }}
            >
              Sign In →
            </button>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 0.7s linear infinite; }
      `}</style>
    </div>
  );
}