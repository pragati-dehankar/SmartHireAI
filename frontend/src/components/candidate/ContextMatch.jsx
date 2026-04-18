import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';

export default function ContextMatch() {
   const [data, setData] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError]       = useState(null);

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
      <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
         <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
         <div className="font-black text-slate-400 text-xs uppercase tracking-[0.2em]">Deconstructing Neural Profile</div>
      </div>
   );

   if (error || !data) return (
      <div className="card p-20 text-center flex flex-col items-center justify-center border-dashed border-2 m-8">
         <div className="text-5xl mb-6 opacity-30">📡</div>
         <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">Analysis Offline</h3>
         <p className="text-slate-500 font-medium mt-2 max-w-sm mx-auto">Please ensure your resume is uploaded and processed by BERT to generate a semantic alignment report.</p>
         <button className="btn-primary mt-8 px-10 py-4 rounded-2xl">Upload Resume</button>
      </div>
   );

   const signals = data.signals || [];

   return (
      <div className="animate-fade-in space-y-8 max-w-6xl mx-auto pb-12">
         {/* Page Header */}
         <div className="card p-1 relative overflow-hidden bg-white border-slate-50">
            <div className="p-8 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
               <div>
                  <div className="flex items-center gap-3">
                     <h2 className="text-3xl font-black text-slate-900 tracking-tight">Semantic Context Match</h2>
                     <span className="bert-badge">XAI Enabled</span>
                  </div>
                  <p className="text-slate-500 font-medium mt-1">Transparency report on how the BERT engine interprets your career signals.</p>
               </div>
               <div className="text-right">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Analysis</div>
                  <div className="text-sm font-bold text-slate-900">Today, 12:45 PM</div>
               </div>
            </div>
            <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600 shimmer-bg" />
         </div>

         {/* Simple Explanation Banner */}
         <div className="card p-8 bg-gradient-to-br from-indigo-50 to-white border-indigo-100 shadow-indigo-100/20">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
               <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl shadow-lg shrink-0">💡</div>
               <div>
                  <h3 className="text-lg font-black text-slate-900 mb-1">What this analysis means for you</h3>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                     Instead of just scanning for "keywords", our BERT AI reads your resume like a human recruiter would. 
                     It understands the <strong>context</strong> behind your projects and the <strong>complexity</strong> of your roles. 
                     A high score here means your professional "vibe" and technical depth align perfectly with what leading companies are currently seeking.
                  </p>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Progress Bars */}
            <div className="lg:col-span-2 space-y-8">
               <div className="card p-8">
                  <div className="flex items-center gap-3 mb-10">
                     <span className="text-xl">📊</span>
                     <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Match Signal Strength</h3>
                  </div>
                  
                  <div className="space-y-10">
                     {signals.map((signal, idx) => (
                        <div key={idx} className="space-y-4">
                           <div className="flex justify-between items-end">
                              <div>
                                 <div className="text-sm font-black text-slate-900 tracking-tight">{signal.label}</div>
                                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Vector Reliability: Stable</div>
                              </div>
                              <div className="text-lg font-black text-indigo-600">{signal.value}%</div>
                           </div>
                           <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden shadow-inner flex border border-slate-100 p-0.5">
                              <div
                                 className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 rounded-full transition-all duration-1000 ease-out shimmer-bg"
                                 style={{ width: `${signal.value}%` }}
                              />
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Opportunity Panel */}
               <div className="bg-indigo-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                  <div className="relative z-10 flex items-center justify-between gap-8">
                     <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-3xl border border-white/10 shadow-lg">⚡</div>
                        <div>
                           <div className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Optimization Target</div>
                           <p className="text-sm font-bold leading-relaxed max-w-md">
                              Integrating your <span className="text-indigo-200">GitHub Portfolio</span> could raise your domain alignment match score by <span className="text-indigo-200">~8.4%</span> across all technical roles.
                           </p>
                        </div>
                     </div>
                     <button className="bg-white text-indigo-900 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-colors shadow-xl shrink-0">
                        Connect Repo
                     </button>
                  </div>
                  <div className="absolute top-0 right-0 w-64 h-full bg-indigo-500/10 skew-x-[-20deg] translate-x-20" />
               </div>
            </div>

            {/* Right Column: Signal Tags */}
            <div className="space-y-8">
               {/* Technical Signals */}
               <div className="card p-8 bg-white">
                  <div className="flex items-center gap-2 mb-8">
                     <span className="text-lg">🛠️</span>
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stack Signals</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                     {(data.technicalSignals || []).map((tag, i) => (
                        <span key={i} className={`tag text-[10px] py-2 px-4 ${i === 0 ? 'tag-indigo border-2' : ''}`}>
                           {tag}
                        </span>
                     ))}
                  </div>
               </div>

               {/* Style Signals */}
               <div className="card p-8 bg-slate-900 text-white border-none">
                  <div className="flex items-center gap-2 mb-8">
                     <span className="text-lg text-emerald-400">🌐</span>
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational Context</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                     {(data.workStyleSignals || []).map((tag, i) => (
                        <span key={i} className="bg-white/5 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                           {tag}
                        </span>
                     ))}
                  </div>
               </div>

               {/* Growth Signals */}
               <div className="card p-8 bg-white">
                  <div className="flex items-center gap-2 mb-8">
                     <span className="text-lg text-amber-500">📈</span>
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Career Trajectory</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                     {(data.careerSignals || []).map((tag, i) => (
                        <span key={i} className="bg-amber-50 text-amber-600 border border-amber-100 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                           {tag}
                        </span>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
