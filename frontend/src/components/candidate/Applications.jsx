import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';

function AppCard({ app, idx }) {
   const score = Math.round(app.score || 0);
   const status = app.status?.toLowerCase();
   
   const getStatusInfo = (s) => {
      if (s === 'shortlisted' || s === 'qualified') return { label: 'Shortlisted', color: 'emerald', icon: '⭐' };
      if (s === 'interview') return { label: 'Interview Scheduled', color: 'indigo', icon: '📅' };
      if (s === 'rejected' || s === 'not selected') return { label: 'Not Selected', color: 'rose', icon: '✕' };
      return { label: 'Under Review', color: 'slate', icon: '⏳' };
   };

   const info = getStatusInfo(status);

   return (
      <div 
         className="card card-interactive p-6 flex flex-col md:flex-row justify-between items-center group animate-fade-up"
         style={{ animationDelay: `${idx * 0.05}s` }}
      >
         <div className="flex gap-6 items-center flex-1">
            <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-3xl font-black transition-all duration-300 group-hover:scale-110 shadow-sm border border-slate-50 ${status === 'shortlisted' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-300'}`}>
               {app.company?.charAt(0) || '🏢'}
            </div>
            <div>
               <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">{app.jobTitle}</h3>
                  <span className="bert-badge">BERT Scored</span>
               </div>
               <p className="text-sm text-slate-400 font-bold mb-3">{app.company} · {app.location} · {app.salary_range || '$140K+'}</p>
               <div className="flex items-center gap-4">
                  <span className={`tag tag-${info.color} px-4 py-1.5 border-none shadow-sm`}>
                     {info.icon} {info.label}
                  </span>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                     Applied {new Date(app.uploaded_at).toLocaleDateString()}
                  </span>
               </div>
            </div>
         </div>

         <div className="flex items-center gap-10 mt-6 md:mt-0">
            <div className="text-right">
               <div className={`text-3xl font-black ${score >= 75 ? 'text-emerald-500' : score >= 50 ? 'text-indigo-600' : 'text-slate-400'}`}>
                  {score}%
               </div>
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Match Rank</div>
               <div className="w-24 h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full animate-progress" style={{ width: `${score}%` }} />
               </div>
            </div>
            <div className="w-px h-12 bg-slate-50 hidden md:block" />
            <div className="text-indigo-600 font-black text-xs uppercase tracking-widest group-hover:translate-x-1 transition-transform">
               Tracker →
            </div>
         </div>
      </div>
   );
}

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
    const s = app.status?.toLowerCase();
    if (filter === 'all') return true;
    if (filter === 'shortlisted') return s === 'shortlisted' || s === 'qualified';
    if (filter === 'under_review') return s === 'applied' || !s || s === 'reviewed';
    if (filter === 'interview') return s === 'interview';
    return true;
  });

  if (loading) return (
     <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
        <div className="font-black text-slate-400 text-xs uppercase tracking-[0.2em]">Retrieving Pipeline</div>
     </div>
  );

  return (
    <div className="animate-fade-in space-y-8 max-w-6xl mx-auto">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[2rem] shadow-sm border border-slate-50 gap-6">
         <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Application Pipeline</h2>
            <p className="text-slate-500 font-medium mt-1">Manage all your active and historic job applications.</p>
         </div>
         <div className="flex p-1 bg-slate-100 rounded-2xl gap-1">
            {[
              { id: 'all', label: 'All' },
              { id: 'shortlisted', label: 'Shortlisted' },
              { id: 'under_review', label: 'Reviewing' },
              { id: 'interview', label: 'Interviews' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                  filter === f.id ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-400 hover:text-indigo-500'
                }`}
              >
                {f.label}
              </button>
            ))}
         </div>
      </div>

      <div className="space-y-4">
        {filteredApps.length === 0 ? (
          <div className="card p-20 text-center flex flex-col items-center justify-center border-dashed border-2 opacity-50">
            <div className="text-5xl mb-6">📭</div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">No applications found</h3>
            <p className="text-slate-400 font-medium mt-2">Start your search to see your pipeline grow.</p>
          </div>
        ) : (
          filteredApps.map((app, i) => (
            <AppCard key={app.id} app={app} idx={i} />
          ))
        )}
      </div>
    </div>
  );
}