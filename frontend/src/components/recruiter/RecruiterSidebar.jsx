import React from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_SECTIONS = [
  {
    title: 'OVERVIEW',
    items: [
      { id: 'dashboard',    label: 'Dashboard',        icon: '📊', path: '/recruiter/dashboard' },
      { id: 'jobs',         label: 'Job Postings',      icon: '💼', path: '/recruiter/jobs' },
      { id: 'applications', label: 'Applications',      icon: '📧', path: '/recruiter/applications' },
    ],
  },
  {
    title: 'AI FEATURES',
    items: [
      { id: 'screening',   label: 'AI Screening',       icon: '🤖', bert: true, badge: 'BERT', path: '/recruiter/screening' },
      { id: 'candidates',  label: 'Ranked Candidates',   icon: '👥', bert: true, badge: 'BERT', path: '/recruiter/candidates' },
      { id: 'comparison',  label: 'Candidate Compare',   icon: '⚖️', bert: false, path: '/recruiter/comparison' },
      { id: 'fairness',    label: 'Bias & Fairness',     icon: '📈', bert: true, badge: 'BERT', path: '/recruiter/fairness' },
    ],
  },
  {
    title: 'REPORTS',
    items: [
      { id: 'export', label: 'Export & Reports', icon: '📥', path: '/recruiter/export' },
    ],
  },
];

export default function RecruiterSidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="fixed left-0 top-0 w-64 h-screen flex flex-col z-30"
         style={{ background: '#fff', borderRight: '1px solid #f1f5f9', boxShadow: '4px 0 20px rgba(0,0,0,0.03)' }}>

      {/* ── Logo ──────────────────────────────────────── */}
      <div className="px-5 pt-6 pb-4">
        <button onClick={() => navigate('/')} className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg"
               style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            SH
          </div>
          <div>
            <div className="text-sm font-black text-slate-900 tracking-tight">SmartHire AI</div>
          </div>
        </button>
        <div className="mt-2">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-[0.15em]">RECRUITER PORTAL</span>
        </div>
      </div>

      {/* ── BERT Live Status ──────────────────────────── */}
      <div className="mx-4 mb-4 p-3 rounded-2xl" style={{ background: 'linear-gradient(135deg, #ecfeff, #f0fdff)', border: '1px solid #a5f3fc' }}>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bert-pulse" />
          <span className="text-xs font-black text-cyan-700 tracking-wider uppercase">BERT Engine</span>
        </div>
        <div className="text-xs text-cyan-600 font-medium leading-relaxed">
          NLP & semantic analysis <span className="font-bold text-cyan-700">active</span>
        </div>
      </div>

      {/* ── Navigation ────────────────────────────────── */}
      <nav className="flex-1 px-3 space-y-5 overflow-y-auto pb-4">
        {NAV_SECTIONS.map((section, si) => (
          <div key={si}>
            <div className="text-[10px] font-black text-slate-400 tracking-[0.18em] px-3 mb-1.5 uppercase">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map(item => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  id={`nav-${item.id}`}
                  className={({ isActive }) => 
                    `sidebar-nav-item w-full transition-all duration-200 ${isActive ? 'active' : ''}`
                  }
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.bert && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                          style={{ background: '#ecfeff', color: '#0e7490', border: '1px solid #a5f3fc' }}>
                      BERT
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ── User Profile Footer ───────────────────────── */}
      <div className="p-4 border-t" style={{ borderColor: '#f1f5f9' }}>
        <div className="flex items-center gap-3 p-3 rounded-2xl mb-3" style={{ background: '#f8fafc' }}>
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm shadow"
                 style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              {user?.name?.charAt(0) || 'R'}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white bg-emerald-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-black text-slate-900 truncate">{user?.name || 'Recruiter'}</div>
            <div className="text-xs text-slate-400 font-medium truncate">{user?.company || 'Company'}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          id="logout-btn"
          className="w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-300 hover:shadow-md"
          style={{ background: '#fff1f2', color: '#be123c', border: '1px solid #fecdd3' }}
        >
          🚪 Sign Out
        </button>
      </div>
    </div>
  );
}