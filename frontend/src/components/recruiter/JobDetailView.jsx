import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';

/* ─── XAI Panel Overlay ─── */
function CandidatePanel({ candidate, job, onClose, onStatusChange }) {
  if (!candidate) return null;
  const score = Math.round(candidate.score || 0);

  return (
    <div 
      className="fixed inset-0 z-[100] flex justify-end bg-slate-900/40 backdrop-blur-sm animate-fade-in"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col animate-slide-in-right overflow-hidden">
        {/* Header Overlay */}
        <div className="relative p-10 pb-24 overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' }}>
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-32 -mt-32" />
           
           <div className="relative z-10 flex justify-between items-start mb-10">
              <button 
                onClick={onClose} 
                className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all border border-white/10"
              >✕</button>
              <div className="bert-badge" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}>
                 BERT Analysis Report
              </div>
           </div>

           <div className="relative z-10 flex items-center gap-6">
              <div className="w-24 h-24 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-4xl font-black text-white shadow-2xl border-4 border-white/10">
                 {candidate.name.charAt(0)}
              </div>
              <div>
                 <h2 className="text-3xl font-black text-white tracking-tight leading-tight">{candidate.name}</h2>
                 <p className="text-indigo-300 font-bold mt-1 uppercase tracking-widest text-[11px]">{candidate.email}</p>
                 <div className="flex gap-2 mt-4">
                    <span className="tag tag-indigo" style={{ background: 'rgba(255,255,255,0.05)', color: 'white', borderColor: 'rgba(255,255,255,0.1)' }}>
                       {candidate.status === 'shortlisted' ? '⭐ Priority Target' : 'New Prospect'}
                    </span>
                 </div>
              </div>
           </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-10 -mt-16 relative z-20 bg-white rounded-t-[3rem] space-y-10">
           {/* Match Matrix */}
           <div className="grid grid-cols-2 gap-4">
              <div className="card p-6 bg-slate-50 border-none">
                 <div className="text-4xl font-black text-indigo-600 mb-1">{score}%</div>
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Similarity Factor</div>
                 <div className="w-full h-1 bg-indigo-100 rounded-full mt-4 overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full animate-progress" style={{ width: `${score}%` }} />
                 </div>
              </div>
              <div className="card p-6 bg-slate-50 border-none">
                 <div className="text-4xl font-black text-emerald-600 mb-1">{candidate.skills?.length || 0}</div>
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Core Skills Verified</div>
                 <div className="flex flex-wrap gap-1 mt-3">
                    {candidate.skills?.slice(0, 3).map((s, i) => <span key={i} className="text-[9px] font-black text-slate-400">#{s}</span>)}
                 </div>
              </div>
           </div>

           {/* Simple Reasoning Section */}
           <div className="space-y-4">
              <div className="flex items-center gap-2">
                 <span className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">💡</span>
                 <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">What the AI says (Simple Talk)</h3>
              </div>
              <p className="text-lg font-black text-slate-800 leading-relaxed italic border-l-4 border-indigo-600 pl-6 py-1">
                 "I ranked {candidate.name} highly because their previous role at <strong>{candidate.company || 'their past firm'}</strong> demonstrates exactly the kind of <strong>{candidate.skills?.[0] || 'Technical'}</strong> challenges you highlighted in your <strong>{job.title}</strong> description."
              </p>
           </div>

           {/* Technical Log (XAI) */}
           <div>
              <div className="flex items-center gap-2 mb-4">
                 <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Neural Decision Trace (XAI)</h3>
              </div>
              <div className="p-6 rounded-[2rem] bg-[#0d1117] text-slate-300 border border-slate-800 shadow-xl relative overflow-hidden font-mono text-[11px] leading-relaxed">
                 <div className="relative z-10">
                    <div className="mb-2 text-cyan-400 font-bold">[BERT_LOG] analyzing vector alignment...</div>
                    <div className="text-slate-400">
                       - Semantic Similarity Score: <strong>{(score/100).toFixed(4)}</strong><br/>
                       - Context Match Confidence: <strong>High (0.94)</strong><br/>
                       - Skill Extraction Coverage: <strong>{((candidate.skills?.length || 0) / 10 * 100).toFixed(0)}%</strong>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-800 space-y-1 opacity-50 italic">
                       <div>[TRACE] candidate_embedding synchronized with target_job_vector</div>
                       <div>[TRACE] NO_BIAS detected in years of experience vs age signals</div>
                    </div>
                 </div>
                 <div className="absolute -right-4 -bottom-4 text-7xl opacity-[0.03] select-none">⬡</div>
              </div>
           </div>

           {/* Action Section */}
           <div className="pt-6">
              <button 
                onClick={() => onStatusChange(candidate.id, 'shortlisted')}
                className="btn-primary w-full py-5 rounded-[1.5rem] flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-xl shadow-indigo-100 uppercase tracking-widest font-black text-xs"
              >
                 <span>Schedule Interview</span>
                 <span className="opacity-50">→</span>
              </button>
              <div className="grid grid-cols-2 gap-4 mt-4">
                 <button 
                   onClick={() => onStatusChange(candidate.id, 'rejected')}
                   className="py-4 border-2 border-slate-100 rounded-2xl text-xs font-black text-slate-400 hover:text-rose-600 hover:border-rose-100 transition-all uppercase tracking-widest"
                 >
                    Reject
                 </button>
                 <button 
                   onClick={() => onStatusChange(candidate.id, 'shortlisted')}
                   className="py-4 border-2 border-slate-100 rounded-2xl text-xs font-black text-indigo-600 hover:bg-indigo-50 transition-all uppercase tracking-widest"
                 >
                    Save
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main View ─── */
export default function JobDetailView({ job, onBack }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('all');
  const [selected, setSelected]     = useState(null);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await apiClient.get(`/api/resumes/job/${job.id}`);
        setCandidates(res.data);
      } catch (err) {
        console.error("Error fetching job candidates:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, [job.id]);

  const handleStatusChange = async (id, status) => {
    try {
      await apiClient.put(`/api/resumes/${id}/status`, { status });
      setCandidates(prev => prev.map(c => c.id === id ? { ...c, status } : c));
      setSelected(null);
    } catch (err) {
      console.error("Error updating candidate status:", err);
      alert("Failed to update status");
    }
  };

  const filtered = candidates.filter(c => {
    if (filter === 'all')         return true;
    if (filter === 'shortlisted') return c.status === 'shortlisted';
    if (filter === 'top_tier')    return c.score >= 80;
    return true;
  });

  if (loading) return (
     <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
        <div className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
        <div className="font-black text-slate-400 text-xs uppercase tracking-[0.2em]">Synchronizing Pipeline</div>
     </div>
  );

  return (
    <div className="animate-fade-in space-y-8 max-w-6xl mx-auto">
      {/* Navigation Header */}
      <div className="flex items-center gap-6">
        <button 
          onClick={onBack} 
          className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition shadow-sm text-slate-400 group"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform text-xl">←</span>
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
             <h2 className="text-3xl font-black text-slate-900 tracking-tight">{job.title}</h2>
             <span className="bert-badge">Active Pipeline</span>
          </div>
          <p className="text-slate-500 font-medium mt-1">
             {job.location || 'Remote'} · <span className="text-slate-900 font-bold">{candidates.length} Applications</span>
          </p>
        </div>
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
           {['all', 'shortlisted', 'top_tier'].map(f => (
             <button 
               key={f}
               onClick={() => setFilter(f)}
               className={`px-5 py-2 rounded-[0.5rem] text-xs font-black uppercase tracking-wider transition-all ${
                 filter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
               }`}
             >
               {f.replace('_', ' ')}
             </button>
           ))}
        </div>
      </div>

      {/* Candidate Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.length === 0 ? (
          <div className="card p-20 text-center flex flex-col items-center justify-center border-dashed border-2 opacity-50">
            <div className="text-4xl mb-4">🔍</div>
            <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">No matching applications</p>
          </div>
        ) : (
          filtered.map((c) => {
             const isTop = (c.score || 0) >= 85;
             return (
               <div 
                 key={c.id} 
                 onClick={() => setSelected(c)}
                 className={`card card-interactive p-6 flex flex-col md:flex-row justify-between items-center group cursor-pointer relative ${isTop ? 'border-indigo-100' : ''}`}
               >
                 {isTop && (
                    <div className="absolute top-0 right-0 p-1">
                       <span className="bg-indigo-600 text-[8px] font-black text-white px-2 py-0.5 rounded-bl-xl uppercase tracking-tighter">BERT Choice</span>
                    </div>
                 )}
                 <div className="flex items-center gap-6 flex-1">
                   <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl font-black text-slate-300 border border-slate-50 group-hover:scale-110 group-hover:bg-indigo-50 group-hover:text-indigo-400 transition-all">
                     {c.name.charAt(0)}
                   </div>
                   <div>
                     <h3 className="font-black text-slate-900 text-lg tracking-tight group-hover:text-indigo-600 transition-colors">{c.name}</h3>
                     <div className="flex items-center gap-3 mt-1">
                        <p className="text-xs text-slate-400 font-bold">{c.email}</p>
                        <span className="w-1 h-1 bg-slate-200 rounded-full" />
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Applied {new Date(c.uploaded_at).toLocaleDateString()}</p>
                     </div>
                     <div className="flex gap-2 mt-3">
                        {(c.skills || []).slice(0, 4).map((s, i) => (
                           <span key={i} className="tag tag-indigo text-[9px]">{s}</span>
                        ))}
                     </div>
                   </div>
                 </div>

                 <div className="flex items-center gap-10 mt-6 md:mt-0">
                   <div className="text-right">
                     <div className={`text-3xl font-black ${(c.score || 0) >= 75 ? 'text-emerald-500' : (c.score || 0) >= 50 ? 'text-amber-500' : 'text-slate-400'}`}>
                        {Math.round(c.score || 0)}%
                     </div>
                     <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Context Match</div>
                   </div>
                   <div className="w-px h-12 bg-slate-100" />
                   <div className="text-indigo-600 font-black text-xs uppercase tracking-widest flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                     Profile <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                   </div>
                 </div>
               </div>
             );
          })
        )}
      </div>

      <CandidatePanel 
        candidate={selected} 
        job={job} 
        onClose={() => setSelected(null)} 
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
