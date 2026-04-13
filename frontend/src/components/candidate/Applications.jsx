import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await apiClient.get('/api/candidate/applications');
        setApplications(res.data);
      } catch (err) {
        console.error("Error fetching applications:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  const filteredApps = applications.filter(app => {
    if (filter === 'all') return true;
    if (filter === 'shortlisted') return app.status === 'shortlisted' || app.status === 'qualified';
    if (filter === 'under_review') return app.status === 'applied' || !app.status;
    if (filter === 'interview') return app.status === 'interview';
    return true;
  });

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase();
    if (s === 'shortlisted' || s === 'qualified') return 'bg-[#f0fdf4] text-[#166534] border-[#dcfce7]';
    if (s === 'interview') return 'bg-[#fef9c3] text-[#854d0e] border-[#fef08a]';
    if (s === 'rejected' || s === 'not selected') return 'bg-[#fef2f2] text-[#991b1b] border-[#fee2e2]';
    return 'bg-[#f0f9ff] text-[#0369a1] border-[#e0f2fe]';
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-semibold animate-pulse">Syncing your application history...</div>;

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* PAGE HEADER & FILTERS */}
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-[1.5rem] shadow-sm border border-[#e5e7eb]">
        <h2 className="text-[22px] font-extrabold text-[#111827] tracking-tight">All Applications ({applications.length})</h2>
        <div className="flex gap-2">
          {[
            { id: 'all', label: 'All' },
            { id: 'shortlisted', label: 'Shortlisted' },
            { id: 'under_review', label: 'Under Review' },
            { id: 'interview', label: 'Interview' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-5 py-2 rounded-full text-[12px] font-extrabold transition-all border ${filter === f.id
                  ? 'bg-[#111827] text-white border-[#111827]'
                  : 'bg-[#f8fafc] text-[#64748b] border-[#e2e8f0] hover:bg-gray-50'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredApps.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-[#e5e7eb] border-dashed">
            <div className="text-5xl mb-4 grayscale">📄</div>
            <h3 className="text-[18px] font-extrabold text-[#111827]">No applications found here</h3>
            <p className="text-[#6b7280] text-[14px] mt-2">Try changing your filters or browse new opportunities.</p>
          </div>
        ) : (
          filteredApps.map((app) => (
            <div
              key={app.id}
              className="bg-white p-6 rounded-[1.5rem] border border-[#e5e7eb] hover:border-indigo-400 hover:shadow-md transition-all duration-300 flex justify-between items-center group cursor-pointer"
            >
              <div className="flex gap-6 items-center">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl border border-gray-100 group-hover:scale-110 transition-transform">
                  {app.company?.charAt(0) || '🏢'}
                </div>
                <div>
                  <h3 className="text-[17px] font-extrabold text-[#111827] tracking-tight">{app.jobTitle}</h3>
                  <p className="text-[13px] text-[#6b7280] font-medium mt-0.5">{app.company} · {app.location} · $120K–$160K</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(app.status)}`}>
                      {app.status === 'shortlisted' ? '⭐ Shortlisted' : app.status === 'interview' ? '📅 Interview' : (app.status || 'Under Review')}
                    </span>
                    <span className="text-[11px] font-bold text-[#94a3b8]">
                      {Math.round((new Date() - new Date(app.uploaded_at)) / 86400000)} days ago
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right pr-4">
                <div className="text-[26px] font-black text-[#111827] group-hover:text-indigo-600 transition-colors">
                  {Math.round(app.score)}%
                </div>
                <div className="w-20 h-2 bg-gray-100 rounded-full mt-1 overflow-hidden shadow-inner">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${app.score}%` }}></div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}