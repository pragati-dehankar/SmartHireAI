import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function RecruiterSidebar({ activeTab, onTabChange, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'jobs', label: 'Job Postings', icon: '💼' },
    { id: 'screening', label: 'AI Screening', icon: '🤖' },
    { id: 'candidates', label: 'Ranked Candidates', icon: '👥' },
    { id: 'comparison', label: 'Comparison', icon: '⚖️' },
    { id: 'fairness', label: 'Fairness Report', icon: '✨' },
    { id: 'export', label: 'Export & Reports', icon: '📥' },
  ];

  return (
    <div className="fixed left-0 top-0 w-64 h-screen bg-white border-r border-gray-200 shadow-lg p-6 overflow-y-auto">
      <div className="mb-8">
        <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          ⚡ Smart Hire
        </div>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
              activeTab === item.id
                ? 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-600 border-l-4 border-indigo-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="w-full mt-8 bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition"
      >
        🚪 Logout
      </button>
    </div>
  );
}