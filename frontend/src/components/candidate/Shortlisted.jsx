import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';

export default function Shortlisted() {
   const [shortlisted, setShortlisted] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchShortlisted = async () => {
         try {
            const res = await apiClient.get('/api/candidate/applications');
            // Filter for shortlisted or qualified status
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

   if (loading) return <div className="p-8 text-center text-gray-500 font-semibold animate-pulse">Retrieving your success matches...</div>;

   return (
      <div className="animate-in fade-in duration-500 space-y-8 max-w-6xl mx-auto">
         {/* HEADER */}
         <div className="flex items-center gap-3">
            <span className="text-2xl">⭐</span>
            <h2 className="text-[24px] font-extrabold text-[#111827] tracking-tight">You've Been Shortlisted ({shortlisted.length})</h2>
         </div>

         <div className="space-y-6">
            {shortlisted.length === 0 ? (
               <div className="bg-white rounded-[2rem] p-16 text-center border border-[#e5e7eb] border-dashed">
                  <div className="text-5xl mb-6 grayscale">🚀</div>
                  <h3 className="text-[18px] font-extrabold text-[#111827]">Almost there!</h3>
                  <p className="text-[#6b7280] text-[14px] mt-2 max-w-sm mx-auto">Keep applying and optimizing your profile. Your shortlisted opportunities will appear here once recruiters move you forward.</p>
               </div>
            ) : (
               shortlisted.map((app) => (
                  <div key={app.id} className="bg-white rounded-[2rem] p-8 shadow-sm border border-[#e5e7eb] relative overflow-hidden group hover:shadow-md transition-shadow">

                     {/* Header Section */}
                     <div className="flex justify-between items-start mb-8">
                        <div className="flex gap-6 items-center">
                           <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl border border-gray-100 group-hover:scale-105 transition-transform">🏢</div>
                           <div>
                              <h2 className="text-[24px] font-extrabold text-[#111827] tracking-tight leading-tight uppercase font-heading">{app.jobTitle}</h2>
                              <p className="text-[#64748b] text-[14px] font-bold mt-1">{app.company} · {app.location} · $120K–$160K</p>
                              <div className="flex gap-3 mt-4">
                                 <span className="bg-[#f0fdf4] text-[#166534] border border-[#dcfce7] px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider">
                                    ⭐ Shortlisted {Math.round((new Date() - new Date(app.uploaded_at)) / 3600000)} hrs ago
                                 </span>
                                 <span className="bg-[#fff7ed] text-[#9a3412] border border-[#ffedd5] px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider">
                                    {app.status === 'interview' ? 'Interview Scheduled' : 'Technical Interview Next'}
                                 </span>
                              </div>
                           </div>
                        </div>
                        <div className="bg-[#f8fafc] border border-[#e2e8f0] p-6 rounded-[1.5rem] text-center shadow-sm min-w-[140px]">
                           <div className="text-[36px] font-black text-indigo-600 leading-none">{Math.round(app.score)}%</div>
                           <div className="text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.1em] mt-2">AI Context Score</div>
                        </div>
                     </div>

                     {/* Reasoning Section (Screenshot Style) */}
                     <div className="mb-8">
                        <div className="flex items-center gap-3 mb-6">
                           <span className="text-2xl">🧠</span>
                           <h3 className="text-[15px] font-black text-[#1e293b] uppercase tracking-wide">Why the Recruiter's AI Picked You</h3>
                           <span className="bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0] px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest">Context Analysis</span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                           {[
                              { title: 'Skill Semantic Match', desc: `React + TypeScript aligned ${Math.round(app.score)}% via BERT matching.`, icon: '⚡', tag: 'Strong' },
                              { title: 'Work Style Context', desc: 'Remote preference matched to their culture signal.', icon: '🌐', tag: 'Good' }
                           ].map((item, idx) => (
                              <div key={idx} className="bg-[#f8fafc] border border-[#f1f5f9] p-5 rounded-2xl flex items-start gap-4">
                                 <span className="text-xl mt-1">{item.icon}</span>
                                 <div>
                                    <h4 className="text-[14px] font-extrabold text-[#111827]">{item.title}</h4>
                                    <p className="text-[12.5px] text-[#64748b] font-semibold mt-1 leading-relaxed">{item.desc}</p>
                                    <div className={`inline-block mt-3 px-2 py-0.5 rounded text-[10px] font-black uppercase ${item.tag === 'Strong' ? 'bg-[#dcfce7] text-[#166534]' : 'bg-[#dbeafe] text-[#1e40af]'}`}>
                                       {item.tag}
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>

                     {/* Footer Actions */}
                     <div className="flex gap-4 pt-6 border-t border-gray-50">
                        <button className="bg-[#10b981] text-white px-8 py-3.5 rounded-xl font-black text-[14px] hover:bg-[#059669] transition shadow-lg shadow-emerald-100 flex items-center gap-2">
                           📅 Schedule Interview
                        </button>
                        <button className="bg-[#111827] text-white px-8 py-3.5 rounded-xl font-black text-[14px] hover:bg-black transition shadow-md shadow-gray-100 flex items-center gap-2">
                           💬 Message Recruiter
                        </button>
                        <button className="bg-white text-[#475569] px-8 py-3.5 rounded-xl font-black text-[14px] border border-[#e5e7eb] hover:bg-gray-50 transition shadow-sm">
                           View Job Details
                        </button>
                     </div>
                  </div>
               ))
            )}
         </div>
      </div>
   );
}
