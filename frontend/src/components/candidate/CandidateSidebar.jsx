import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function CandidateSidebar({ activeTab, onTabChange, onLogout }) {
  const { user } = useAuth();

  const sections = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
        { id: 'applications', label: 'My Applications', icon: '📄', count: 5 },
        { id: 'shortlisted', label: 'Shortlisted', icon: '⭐', count: 2 },
      ]
    },
    {
      title: 'AI TOOLS',
      items: [
        { id: 'recommendations', label: 'AI Recommendations', icon: '🧠', count: 8 },
        { id: 'context_match', label: 'Context Match', icon: '🎯' },
      ]
    },
    {
      title: 'PROFILE',
      items: [
        { id: 'profile', label: 'My Profile', icon: '👤' },
        { id: 'resume', label: 'Resume', icon: '📃' },
      ]
    }
  ];

  return (
    <div className="fixed left-0 top-0 w-72 h-screen bg-white border-r border-[#f1f5f9] flex flex-col pt-8 pb-6 px-6 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-30">
      {/* LOGO */}
      <div className="mb-12 px-2 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-lg font-black shadow-lg shadow-indigo-200">
          S
        </div>
        <div>
          <div className="text-[19px] font-black text-[#111827] tracking-tight flex items-center gap-1">
            Smart Hire AI
          </div>
          <div className="text-[10px] font-extrabold text-[#6b7280] uppercase tracking-[0.2em]">CANDIDATE PORTAL</div>
        </div>
      </div>

      {/* NAVIGATION */}
      <div className="flex-1 space-y-9 overflow-y-auto custom-scrollbar pr-1">
        {sections.map((section, idx) => (
          <div key={idx}>
            <h3 className="text-[11px] font-black text-[#94a3b8] tracking-[0.15em] mb-4 pl-3 uppercase">{section.title}</h3>
            <div className="space-y-1">
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full group flex items-center justify-between px-3 py-3 rounded-2xl transition-all duration-300 relative ${activeTab === item.id
                      ? 'bg-[#f0f9ff] text-[#0ea5e9]'
                      : 'text-[#64748b] hover:bg-gray-50 hover:text-[#111827]'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-[18px] transition-transform duration-300 group-hover:scale-110 ${activeTab === item.id ? '' : 'grayscale group-hover:grayscale-0'}`}>
                      {item.icon}
                    </span>
                    <span className={`text-[13.5px] font-extrabold ${activeTab === item.id ? 'text-[#0369a1]' : ''}`}>
                      {item.label}
                    </span>
                  </div>
                  {item.count && (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${activeTab === item.id ? 'bg-[#0ea5e9] text-white' : 'bg-[#f1f5f9] text-[#64748b]'
                      }`}>
                      {item.count}
                    </span>
                  )}
                  {activeTab === item.id && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#0ea5e9] rounded-r-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* PROFILE FOOTER */}
      <div className="mt-8">
        <div className="p-4 bg-gray-50/80 rounded-[1.5rem] border border-[#f1f5f9] mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[18px] font-black shadow-md">
                {user?.name?.charAt(0) || 'S'}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
            </div>
            <div className="flex-1 truncate">
              <div className="text-[14px] font-black text-[#111827] truncate">{user?.name || 'Sarah Johnson'}</div>
              <div className="text-[11px] font-bold text-[#94a3b8] truncate">{user?.job_title || 'Senior Frontend Dev'}</div>
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-extrabold text-[#ef4444] border border-[#fee2e2] bg-[#fef2f2] hover:bg-[#fee2e2] transition shadow-sm"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
