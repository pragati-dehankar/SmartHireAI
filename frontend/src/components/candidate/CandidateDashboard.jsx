import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function CandidateDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview onTabChange={setActiveTab} />;
      case 'recommendations':
        return <Recommendations />;
      case 'context_match':
        return <ContextMatch />;
      case 'jobs':
        return <BrowseJobs />;
      case 'applications':
        return <CandidateApplications />;
      case 'shortlisted':
        return <Shortlisted />;
      case 'profile':
        return <ProfilePage />;
      case 'resume':
        return <ResumePage />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <CandidateSidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />

      <div className="flex-1 ml-72">
        {/* CONTENT AREA */}
        <div className="p-8 max-w-[1400px] mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}