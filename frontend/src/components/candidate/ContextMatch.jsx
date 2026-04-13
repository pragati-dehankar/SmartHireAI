import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';

export default function ContextMatch() {
   const [data, setData] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      const fetchData = async () => {
         try {
            const res = await apiClient.get('/api/candidate/context-analysis');
            setData(res.data);
         } catch (err) {
            console.error("Error fetching context analysis:", err);
            setError(err.response?.data?.error || "Profile analysis unavailable");
         } finally {
            setLoading(false);
         }
      };
      fetchData();
   }, []);

   if (loading) return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
         <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
         <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">Deep Analysis of Career Trajectory...</p>
      </div>
   );

   if (error) return (
      <div className="p-20 text-center">
         <div className="text-4xl mb-4">📄</div>
         <h3 className="text-xl font-extrabold text-[#111827]">Analysis Unavailable</h3>
         <p className="text-gray-500 mt-2">Please upload a resume to see your complete Context Match breakdown.</p>
      </div>
   );

   const signals = data.signals;

   return (
      <div className="animate-in fade-in duration-700 space-y-8 max-w-6xl mx-auto pb-12">
         {/* HEADER */}
         <div className="flex justify-between items-center bg-white rounded-[1.5rem] p-8 shadow-sm border border-[#e5e7eb]">
            <div>
               <h1 className="text-[26px] font-extrabold text-[#111827] tracking-tight leading-tight">Context Match Breakdown</h1>
               <p className="text-[#6b7280] text-[15px] font-medium mt-1">How the AI reads your profile when recruiters shortlist candidates</p>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 bg-[#f0f9ff] text-[#0369a1] px-4 py-2 rounded-full text-[12px] font-black border border-[#bae6fd]">
                  <span className="relative flex h-2 w-2">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0ea5e9] opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0ea5e9]"></span>
                  </span>
                  AI Matching Active
               </div>
               <button className="w-10 h-10 rounded-full bg-white border border-[#e5e7eb] flex items-center justify-center text-yellow-500 shadow-sm relative">
                  🔔 <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
               </button>
               <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md">S</div>
            </div>
         </div>

         <div className="bg-white rounded-[2.5rem] p-10 border border-[#e5e7eb] shadow-sm space-y-10">
            <div className="flex items-center gap-3">
               <span className="text-2xl">🎯</span>
               <h3 className="text-[19px] font-extrabold text-[#111827]">Your Context Match Breakdown</h3>
            </div>

            <div className="bg-[#f0f9ff]/50 border border-[#e0f2fe] p-6 rounded-2xl">
               <p className="text-[14px] text-[#0369a1] font-semibold leading-relaxed">
                  This shows exactly how the AI reads your profile — not just skills, but the full picture of who you are as a candidate. Recruiters using Smart Hire AI see this analysis when deciding who to shortlist.
               </p>
            </div>

            {/* SIGNAL STRENGTH SECTION */}
            <div>
               <h4 className="text-[14px] font-black text-[#111827] uppercase tracking-wider mb-8">Match Signal Strength</h4>
               <div className="space-y-6">
                  {signals.map((signal, idx) => (
                     <div key={idx} className="flex items-center gap-8">
                        <div className="w-40 text-[13px] font-bold text-[#64748b]">{signal.label}</div>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                           <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-1000"
                              style={{ width: `${signal.value}%` }}
                           ></div>
                        </div>
                        <div className="w-12 text-right text-[14px] font-black text-indigo-600">{signal.value}%</div>
                     </div>
                  ))}
               </div>
            </div>

            {/* DETECTED SIGNALS SECTION */}
            <div>
               <h4 className="text-[14px] font-black text-[#111827] uppercase tracking-wider mb-8">Detected Profile Signals</h4>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* TECHNICAL */}
                  <div className="bg-[#f8fafc] p-6 rounded-[2rem] border border-[#e2e8f0] space-y-6">
                     <div className="flex items-center gap-2 text-[#64748b]">
                        <span className="text-sm">📉</span>
                        <span className="text-[11px] font-black uppercase tracking-widest">Technical</span>
                     </div>
                     <div className="flex flex-wrap gap-2">
                        {data.technicalSignals.map((tag, i) => (
                           <span key={i} className={`px-4 py-1.5 rounded-xl text-[12px] font-bold border ${i === 0 ? 'bg-[#f0faff] text-[#0ea5e9] border-[#bae6fd]' : 'bg-white text-[#64748b] border-[#e2e8f0]'}`}>
                              {tag}
                           </span>
                        ))}
                     </div>
                  </div>

                  {/* WORK STYLE */}
                  <div className="bg-[#f8fafc] p-6 rounded-[2rem] border border-[#e2e8f0] space-y-6">
                     <div className="flex items-center gap-2 text-[#64748b]">
                        <span className="text-sm">🌐</span>
                        <span className="text-[11px] font-black uppercase tracking-widest">Work Style</span>
                     </div>
                     <div className="flex flex-wrap gap-2">
                        {data.workStyleSignals.map((tag, i) => (
                           <span key={i} className="bg-white text-[#10b981] border border-[#d1fae5] px-4 py-1.5 rounded-xl text-[12px] font-bold">
                              {tag}
                           </span>
                        ))}
                     </div>
                  </div>

                  {/* CAREER */}
                  <div className="bg-[#f8fafc] p-6 rounded-[2rem] border border-[#e2e8f0] space-y-6">
                     <div className="flex items-center gap-2 text-[#64748b]">
                        <span className="text-sm">📈</span>
                        <span className="text-[11px] font-black uppercase tracking-widest">Career</span>
                     </div>
                     <div className="flex flex-wrap gap-2">
                        {data.careerSignals.map((tag, i) => (
                           <span key={i} className="bg-white text-[#f59e0b] border border-[#fef3c7] px-4 py-1.5 rounded-xl text-[12px] font-bold">
                              {tag}
                           </span>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            {/* OPPORTUNITY BANNER */}
            <div className="bg-[#fffbeb] border border-[#fef3c7] p-4 rounded-2xl flex justify-between items-center shadow-sm">
               <div className="flex items-center gap-3">
                  <span className="text-xl">⚡</span>
                  <p className="text-[14px] text-[#92400e] font-extrabold">
                     Biggest Opportunity: <span className="font-medium text-[#b45309]">Adding GitHub/Portfolio could raise your match score by ~8% across all roles.</span>
                  </p>
               </div>
               <button className="bg-white text-[#92400e] px-6 py-2 rounded-xl font-black text-[12px] border border-[#fef3c7] hover:bg-orange-50 transition shadow-sm">
                  Add Now →
               </button>
            </div>
         </div>
      </div>
   );
}
