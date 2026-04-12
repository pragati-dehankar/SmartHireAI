import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CandidateSidebar from './CandidateSidebar';
import BrowseJobs from './BrowseJobs';
import CandidateApplications from './Applications';
import ProfilePage from './ProfilePage';
import ResumePage from './ResumePage';
import Notifications from './Notifications';

export default function CandidateDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <BrowseJobs />;
      case 'jobs':
        return <BrowseJobs />;
      case 'applications':
        return <CandidateApplications />;
      case 'profile':
        return <ProfilePage />;
      case 'resume':
        return <ResumePage />;
      case 'notifications':
        return <Notifications />;
      default:
        return <BrowseJobs />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <CandidateSidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />

      <div className="flex-1 ml-64">
        {/* TOP BAR */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="flex justify-between items-center px-8 py-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {activeTab === 'dashboard' && '🏠 Dashboard'}
              {activeTab === 'jobs' && '💼 Browse Jobs'}
              {activeTab === 'applications' && '📄 My Applications'}
              {activeTab === 'profile' && '👤 My Profile'}
              {activeTab === 'resume' && '📃 My Resume'}
              {activeTab === 'notifications' && '🔔 Notifications'}
            </h1>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{user?.name}</div>
                <div className="text-xs text-gray-600">Job Seeker</div>
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