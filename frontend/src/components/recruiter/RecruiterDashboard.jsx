import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import RecruiterSidebar from './RecruiterSidebar';
import JobPostings from './JobPostings';
import Applications from './Applications';
import AIScreening from './AIScreening';
import RankedCandidates from './RankedCandidates';
import Comparison from './Comparison';
import FairnessReport from './FairnessReport';
import ExportReports from './ExportReports';
import DashboardOverview from './DashboardOverview';

const TAB_META = {
  dashboard:    { label: 'Dashboard',          icon: '📊', bert: false, desc: 'Hiring overview & top metrics' },
  jobs:         { label: 'Job Postings',        icon: '💼', bert: false, desc: 'Manage active job listings' },
  applications: { label: 'Applications',       icon: '📧', bert: false, desc: 'Incoming candidate applications' },
  screening:    { label: 'AI Screening',        icon: '🤖', bert: true,  desc: 'BERT-powered resume analysis pipeline' },
  candidates:   { label: 'Ranked Candidates',   icon: '👥', bert: true,  desc: 'AI-ranked candidates with suitability scores' },
  comparison:   { label: 'Candidate Compare',   icon: '⚖️', bert: false, desc: 'Side-by-side candidate comparison' },
  fairness:     { label: 'Bias & Fairness',     icon: '📈', bert: true,  desc: 'Algorithmic bias detection & fairness metrics' },
  export:       { label: 'Export & Reports',    icon: '📥', bert: false, desc: 'Download and share hiring reports' },
};

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const location = useLocation();
  
  // Get active tab from path (e.g. /recruiter/jobs -> jobs)
  // More robust detection: take the first part after '/recruiter/'
  const pathParts = location.pathname.split('/').filter(Boolean);
  const recruiterIndex = pathParts.indexOf('recruiter');
  const activeTab = (recruiterIndex !== -1 && pathParts[recruiterIndex + 1]) || 'dashboard';
  const meta = TAB_META[activeTab] || TAB_META.dashboard;

  return (
    <div className="flex min-h-screen" style={{ background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      <RecruiterSidebar activeTab={activeTab} />

      <div className="flex-1 ml-64 flex flex-col min-h-screen">

        {/* ── Top Bar ──────────────────────────────────── */}
        <div className="sticky top-0 z-20 bg-white border-b px-8 py-0" style={{ borderColor: '#f1f5f9' }}>
          <div className="flex items-center justify-between h-16">

            {/* Left: Page title */}
            <div className="flex items-center gap-3">
              <span className="text-xl">{meta.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-black text-slate-900">{meta.label}</h1>
                  {meta.bert && (
                    <span className="bert-badge text-[9px] px-2 py-0.5">BERT</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-medium">{meta.desc}</p>
              </div>
            </div>

            {/* Right: BERT status + user */}
            <div className="flex items-center gap-4">
              <div className="bert-live-indicator">
                <div className="dot" />
                BERT Active
              </div>

              <button 
                onClick={() => alert("No new notifications")}
                className="relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-50 transition"
                style={{ border: '1px solid #e2e8f0' }}
              >
                <span className="text-base">🔔</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 border-2 border-white" />
              </button>

              {/* User avatar */}
              <div className="flex items-center gap-2.5">
                <div>
                  <div className="text-sm font-bold text-slate-900 text-right leading-tight">{user?.name}</div>
                  <div className="text-xs text-slate-400 text-right">{user?.company}</div>
                </div>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm shadow"
                     style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  {user?.name?.charAt(0) || 'R'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Page Content ─────────────────────────────── */}
        <div className="flex-1 p-8 animate-fade-in">
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardOverview />} />
            <Route path="jobs" element={<JobPostings />} />
            <Route path="applications" element={<Applications />} />
            <Route path="screening" element={<AIScreening />} />
            <Route path="candidates" element={<RankedCandidates />} />
            <Route path="comparison" element={<Comparison />} />
            <Route path="fairness" element={<FairnessReport />} />
            <Route path="export" element={<ExportReports />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}