import React from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CandidateSidebar from './CandidateSidebar';
import DashboardOverview from './DashboardOverview';
import BrowseJobs from './BrowseJobs';
import CandidateApplications from './Applications';
import ProfilePage from './ProfilePage';
import ResumePage from './ResumePage';
import Shortlisted from './Shortlisted';
import Recommendations from './Recommendations';
import ContextMatch from './ContextMatch';

const TAB_META = {
  dashboard:       { label: 'Dashboard',        icon: '🏠', desc: 'Your job search overview' },
  jobs:            { label: 'Browse Jobs',       icon: '🔍', desc: 'Discover opportunities' },
  applications:    { label: 'My Applications',  icon: '📄', desc: 'Track your pipeline' },
  shortlisted:     { label: 'Shortlisted',       icon: '⭐', desc: 'Recruiters who noticed you' },
  recommendations: { label: 'AI Job Matches',   icon: '🧠', bert: true,  desc: 'BERT-powered recommendations' },
  context_match:   { label: 'Context Match',    icon: '🎯', bert: true,  desc: 'Semantic role alignment' },
  profile:         { label: 'My Profile',       icon: '👤', desc: 'Manage your information' },
  resume:          { label: 'Resume',           icon: '📃', desc: 'Upload & manage resume' },
};

export default function CandidateDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract the tab from the URL path
  const currentPath = location.pathname.split('/').pop() || 'dashboard';
  const meta = TAB_META[currentPath] || TAB_META.dashboard;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex min-h-screen" style={{ background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      <CandidateSidebar 
        activeTab={currentPath} 
        onTabChange={(tab) => navigate(`/candidate/${tab}`)} 
        onLogout={handleLogout} 
      />

      <div className="flex-1 ml-72 flex flex-col min-h-screen">

        {/* ── Top Bar ──────────────────────────────────── */}
        <div className="sticky top-0 z-20 bg-white border-b px-8" style={{ borderColor: '#f1f5f9' }}>
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="text-xl">{meta.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-black text-slate-900">{meta.label}</h1>
                  {meta.bert && <span className="bert-badge">BERT</span>}
                </div>
                <p className="text-xs text-slate-400 font-medium">{meta.desc}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bert-live-indicator">
                <div className="dot" /> BERT Active
              </div>
              <div className="flex items-center gap-2.5">
                <div>
                  <div className="text-sm font-bold text-slate-900 text-right">{user?.name}</div>
                  <div className="text-xs text-slate-400 text-right">Candidate</div>
                </div>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm"
                     style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
                  {user?.name?.charAt(0) || 'C'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Content ───────────────────────────────────── */}
        <div className="flex-1 p-8 animate-fade-in">
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardOverview />} />
            <Route path="recommendations" element={<Recommendations />} />
            <Route path="context_match" element={<ContextMatch />} />
            <Route path="jobs" element={<BrowseJobs />} />
            <Route path="applications" element={<CandidateApplications />} />
            <Route path="shortlisted" element={<Shortlisted />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="resume" element={<ResumePage />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}