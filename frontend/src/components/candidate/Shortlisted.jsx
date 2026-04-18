import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';

export default function Shortlisted() {
   const [shortlisted, setShortlisted] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchShortlisted = async () => {
         try {
            const res = await apiClient.get('/api/candidate/applications');
            const filtered = res.data.filter(app =>
               app.status === 'shortlisted' || app.status === 'qualified' || app.status === 'interview'
            );
            setShortlisted(filtered);
         } catch (err) {
            console.error("Error fetching shortlisted jobs:", err);
         } finally {
            setLoading(false);
         }
      };
      fetchShortlisted();
   }, []);

   if (loading) return (
      <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
         <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
         <div className="font-black text-slate-400 text-xs uppercase tracking-[0.2em]">Retreiving Starred Matches</div>
      </div>
   );

   return (
      <div className="animate-fade-in space-y-8 max-w-6xl mx-auto">
         {/* Page Header */}
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-2xl shadow-sm border border-amber-100">⭐</div>
            <div>
               <h2 className="text-3xl font-black text-slate-900 tracking-tight">Active Shortlists</h2>
               <p className="text-slate-500 font-medium mt-1">Found highly relevant roles where recruiters are moving you forward.</p>
            </div>
         </div>

         <div className="space-y-6">
            {shortlisted.length === 0 ? (
               <div className="card p-20 text-center flex flex-col items-center justify-center border-dashed border-2 opacity-50">
                  <div className="text-6xl mb-6">🚀</div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">Momentum Building</h3>
                  <p className="text-slate-500 font-medium mt-2 max-w-sm mx-auto">Keep optimizing your profile and submitting applications. Your shortlists will populate as recruiters analyze your matches.</p>
               </div>
            ) : (
               shortlisted.map((app, i) => {
                  const score = Math.round(app.score || 0);
                  return (
                     <div key={app.id} className="card p-8 group animate-fade-up relative overflow-hidden" style={{ animationDelay: `${i * 0.1}s` }}>
                        
                        {/* Background glow for high matches */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/30 rounded-full blur-3xl -mr-32 -mt-32" />

                        {/* Top Info */}
                        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start gap-8 mb-8 pb-8 border-b border-slate-50">
                           <div className="flex gap-6 items-center flex-1">
                              <div className="w-20 h-20 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-4xl shadow-sm border border-slate-100 group-hover:scale-110 group-hover:bg-amber-50 transition-all font-black text-slate-300">
                                 {app.company?.charAt(0) || '🏢'}
                              </div>
                              <div>
                                 <div className="flex items-center gap-3 flex-wrap mb-1">
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{app.jobTitle}</h2>
                                    <span className="tag tag-emerald">⭐ Top Ranked</span>
                                 </div>
                                 <p className="text-slate-400 font-bold mb-4 uppercase tracking-widest text-[11px]">{app.company} · {app.location || 'Distributed'}</p>
                                 
                                 <div className="flex gap-2">
                                    <span className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase border border-emerald-100 italic">
                                       Highly Selective Match
                                    </span>
                                    {app.status === 'interview' && (
                                       <span className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase border border-indigo-100">
                                          📅 Ready for Video Sync
                                       </span>
                                    )}
                                 </div>
                              </div>
                           </div>

                           <div className="bg-slate-50 border border-slate-100 p-6 rounded-[2rem] text-center min-w-[160px] shadow-sm">
                              <div className="text-4xl font-black text-indigo-600 leading-none mb-1">{score}%</div>
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">BERT Match Factor</div>
                              <div className="w-full bg-slate-200 h-1 rounded-full mt-3 overflow-hidden">
                                 <div className="h-full bg-indigo-600 animate-progress" style={{ width: `${score}%` }} />
                              </div>
                           </div>
                        </div>

                        {/* Insight Section */}
                        <div className="relative z-10 mb-8 p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100">
                           <div className="flex items-center gap-2 mb-5 pl-1">
                              <span className="text-xl">⬡</span>
                              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Neural Recommendation Trace</h3>
                           </div>

                           <div className="grid md:grid-cols-2 gap-4">
                              {[
                                 { title: 'Technical Alignment', desc: `Your stack matches ${score}% with the recruiter's core semantic requirements.`, icon: '⚡', color: 'emerald' },
                                 { title: 'Role Signal', desc: 'Previous projects demonstrate production-scale impact required.', icon: '📊', color: 'indigo' }
                              ].map((item, idx) => (
                                 <div key={idx} className="bg-white p-5 rounded-2xl flex items-start gap-4 shadow-sm border border-slate-100">
                                    <span className={`text-xl mt-0.5 text-${item.color}-500`}>{item.icon}</span>
                                    <div>
                                       <h4 className="text-sm font-black text-slate-900 mb-1">{item.title}</h4>
                                       <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>

                        {/* Actions */}
                        <div className="relative z-10 flex gap-4 flex-wrap">
                           <button className="flex-1 btn-primary py-4 px-8 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-50">
                              📅 Pick Interview Slot
                           </button>
                           <button className="flex-1 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-colors shadow-lg shadow-slate-200">
                              💬 Sync with Recruiter
                           </button>
                           <button className="px-8 py-4 border-2 border-slate-100 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all rounded-2xl font-black text-xs uppercase tracking-widest">
                              Job Details
                           </button>
                        </div>
                     </div>
                  );
               })
            )}
         </div>
      </div>
   );
}
