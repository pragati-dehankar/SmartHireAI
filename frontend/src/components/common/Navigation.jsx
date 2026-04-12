import React from 'react';

const TABS = [
  { id: 'health', label: 'Health Check', icon: '🏥' },
  { id: 'auth', label: 'Authentication', icon: '🔐' },
  { id: 'jobs', label: 'Jobs', icon: '💼' },
  { id: 'resumes', label: 'Resumes', icon: '📄' },
  { id: 'analytics', label: 'Analytics', icon: '📊' },
];

export default function Navigation({ activeTab, onTabChange }) {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b-2 border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 min-w-max px-6 py-4 font-semibold text-sm border-b-4 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                  : 'border-transparent text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}