import React, { useState } from 'react';
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

export default function RecruiterDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, logout } = useAuth();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'jobs':
        return <JobPostings />;
      case 'applications':
        return <Applications />;
      case 'screening':
        return <AIScreening />;
      case 'candidates':
        return <RankedCandidates />;
      case 'comparison':
        return <Comparison />;
      case 'fairness':
        return <FairnessReport />;
      case 'export':
        return <ExportReports />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <RecruiterSidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={logout} />

      <div className="flex-1 ml-64">
        {/* TOP BAR */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="flex justify-between items-center px-8 py-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {activeTab === 'dashboard' && '📊 Dashboard'}
              {activeTab === 'jobs' && '💼 Job Postings'}
              {activeTab === 'applications' && '📧 Applications'}
              {activeTab === 'screening' && '🤖 AI Screening'}
              {activeTab === 'candidates' && '👥 Ranked Candidates'}
              {activeTab === 'comparison' && '⚖️ Comparison'}
              {activeTab === 'fairness' && '✨ Fairness Report'}
              {activeTab === 'export' && '📥 Export & Reports'}
            </h1>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{user?.name}</div>
                <div className="text-xs text-gray-600">Recruiter • {user?.company}</div>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}