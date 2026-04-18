import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_SECTIONS = [
  {
    title: 'OVERVIEW',
    items: [
      { id: 'dashboard',     label: 'Dashboard',         icon: '🏠', bert: false },
      { id: 'applications',  label: 'My Applications',   icon: '📄', bert: false },
      { id: 'shortlisted',   label: 'Shortlisted',       icon: '⭐', bert: false },
    ],
  },
  {
    title: 'AI TOOLS',
    items: [
      { id: 'recommendations', label: 'AI Job Matches',   icon: '🧠', bert: true },
      { id: 'context_match',   label: 'Context Match',    icon: '🎯', bert: true },
    ],
  },
  {
    title: 'MY PROFILE',
    items: [
      { id: 'profile', label: 'Profile',  icon: '👤', bert: false },
      { id: 'resume',  label: 'Resume',   icon: '📃', bert: false },
    ],
  },
];

export default function CandidateSidebar({ onLogout }) {
  const { user } = useAuth();

  return (
    <div className="fixed left-0 top-0 w-72 h-screen flex flex-col z-30"
         style={{ background: '#fff', borderRight: '1px solid #f1f5f9', boxShadow: '4px 0 20px rgba(0,0,0,0.03)', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Logo ─────────────────────────────────────── */}
      <div className="px-5 pt-6 pb-4 shrink-0">
        <div className="flex items-center gap-2.5 mb-0.5" style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/'}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg"
               style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
            SH
          </div>
          <span className="text-sm font-black text-slate-900">SmartHire AI</span>
        </div>
        <div className="text-[10px] font-extrabold text-slate-400 tracking-[0.15em] uppercase ml-[42px]">
          Candidate Portal
        </div>
      </div>

      {/* ── BERT Insight Strip ───────────────────────── */}
      <div className="mx-4 mb-4 p-3 rounded-2xl"
           style={{ background: 'linear-gradient(135deg, #f0f9ff, #eef2ff)', border: '1px solid #bfdbfe' }}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse-glow" />
          <span className="text-xs font-black text-indigo-700 tracking-wide uppercase">AI Match Engine</span>
        </div>
        <div className="text-xs text-indigo-500 font-medium">
          BERT analyzes your resume to find the best job fits
        </div>
      </div>

      {/* ── Navigation ──────────────────────────────── */}
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
                  to={`/candidate/${item.id}`}
                  className={({ isActive }) => 
                    `sidebar-nav-item w-full transition-all duration-200 ${isActive ? 'active' : ''}`
                  }
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.bert && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                          style={{ background: '#eef2ff', color: '#4338ca', border: '1px solid #c7d2fe' }}>
                      BERT
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Profile Footer ───────────────────────────── */}
      <div className="p-4 border-t shrink-0" style={{ borderColor: '#f1f5f9' }}>
        <NavLink to="/candidate/profile" className="flex items-center gap-3 p-3 rounded-2xl mb-3 hover:bg-slate-100 transition-colors" style={{ background: '#f8fafc' }}>
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm shadow"
                 style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
              {user?.name?.charAt(0) || 'C'}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white bg-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-black text-slate-900 truncate">{user?.name || 'Candidate'}</div>
            <div className="text-xs text-slate-400 font-medium truncate">{user?.job_title || 'Applicant'}</div>
          </div>
        </NavLink>
        <button
          onClick={onLogout}
          id="candidate-logout"
          className="w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-300 hover:shadow-md"
          style={{ background: '#fff1f2', color: '#be123c', border: '1px solid #fecdd3' }}
        >
          🚪 Sign Out
        </button>
      </div>
    </div>
  );
}
