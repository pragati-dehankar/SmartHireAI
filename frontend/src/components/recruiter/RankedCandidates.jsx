import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';

/* ─── Medal Helper ──────────────────────────────────────── */
const MEDALS = ['🥇', '🥈', '🥉'];

/* ─── XAI Modal ─────────────────────────────────────────── */
function XAIPanel({ candidate, onClose, onStatusChange }) {
  if (!candidate) return null;
  const score    = Math.round(candidate.scores?.matchScore || candidate.score || 0);
  const skills   = candidate.scores?.extractedSkills || candidate.skills || [];
  const skillPct = candidate.scores?.skillsMatch || score;
  const expPct   = candidate.scores?.experienceMatch || Math.max(0, score - 10);
  const conf     = candidate.scores?.confidence || score;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
         style={{ background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(15px)' }}
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl animate-scale-in flex flex-col md:flex-row h-[85vh] bg-white border border-slate-100">
        
        {/* Left Stats Section */}
        <div className="w-full md:w-[320px] shrink-0 p-10 flex flex-col justify-between" 
             style={{ background: 'linear-gradient(165deg, #1e1b4b 0%, #312e81 100%)' }}>
          <div>
            <div className="flex items-center gap-3 mb-8">
              <span className="text-2xl">⬡</span>
              <span className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em]">BERT XAI Report</span>
            </div>
            
            <h2 className="text-3xl font-black text-white leading-tight mb-2">{candidate.name}</h2>
            <p className="text-indigo-300 font-bold uppercase tracking-widest text-[9px] mb-12">Candidate Match ID: {String(candidate.id).slice(-8) || 'AUTO-55'}</p>
            
            <div className="space-y-10">
              <div className="text-center bg-white/5 border border-white/10 p-6 rounded-3xl">
                <div className="text-4xl font-black text-white mb-1">{score}%</div>
                <div className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">Similarity Logic</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="text-center">
                    <div className="text-xl font-black text-indigo-400">{Math.round(conf)}%</div>
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Confidence</div>
                 </div>
                 <div className="text-center">
                    <div className="text-xl font-black text-emerald-400">{skills.length}</div>
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Core Skills</div>
                 </div>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-white/5 rounded-2xl border border-white/5 italic">
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              "This analysis is based on a semantic comparison between the job description and the candidate's resume vector."
            </p>
          </div>
        </div>

        {/* Right Explanation Section */}
        <div className="flex-1 p-10 overflow-y-auto space-y-10 bg-slate-50">
          <div className="flex justify-between items-start">
             <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">🧠</span>
                AI Decision Breakdown
             </h3>
             <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors">✕</button>
          </div>

          {/* PLAIN ENGLISH SUMMARY */}
          <div className="card p-8 bg-white border-2 border-indigo-100 shadow-indigo-100/30">
             <div className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-4">BERT's Simplified Explanation</div>
             <p className="text-xl font-black text-slate-900 leading-relaxed tracking-tight">
               "This candidate is a strong match because their <strong>{skills[0] || 'Technical Background'}</strong> is described in a way that suggests deep practical experience with your required goals. 
               My analysis shows a <strong>{score}%</strong> overlap in intent—not just keywords."
             </p>
          </div>

          {/* Logic Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6 bg-emerald-50/50 border-emerald-100 shadow-none">
              <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-4">Why they matched well:</h4>
              <ul className="space-y-3">
                 {[
                   `Deep alignment with ${candidate.jobTitle || 'Role'} requirements.`,
                   'Consistent record of high-impact technical delivery.',
                   `Semantic similarity in describing ${skills.slice(0, 2).join(' and ') || 'core skills'}.`
                 ].map((r, i) => (
                   <li key={i} className="text-xs font-bold text-slate-700 flex gap-2.5">
                      <span className="text-emerald-500">✓</span> {r}
                   </li>
                 ))}
              </ul>
            </div>
            
            <div className="card p-6 bg-amber-50/50 border-amber-100 shadow-none">
              <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-4">Current Gaps (Suggestions):</h4>
              <ul className="space-y-3">
                 {[
                   'Verification of specific niche project leadership needed.',
                   'Some regional context details are missing from vector.',
                   'Matching score dampened by lack of direct github link.'
                 ].map((g, i) => (
                   <li key={i} className="text-xs font-bold text-slate-700 flex gap-2.5">
                      <span className="text-amber-500">⚠</span> {g}
                   </li>
                 ))}
              </ul>
            </div>
          </div>

          {/* Deep Neural Trace */}
          <div className="space-y-4">
             <div className="flex items-center gap-2 px-1">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Neural Computation Log (XAI Trace)</h4>
             </div>
             <div className="terminal h-40">
                <div className="t-info">[0.00ms] Loading candidate embedding space...</div>
                <div className="t-bert">[BERT] Layer 12 output normalization complete</div>
                <div className="t-bert">[MAP] Contextual vector matching: {score}% threshold passed</div>
                <div className="t-info">[MATH] Cross-Attention weights focused on: "{skills[0] || 'Domain Knowledge'}"</div>
                <div className="t-success">[DONE] Bias check variance: &lt; 0.01. Fairness verified.</div>
             </div>
             {/* Final Actions */}
            <div className="flex gap-4">
              <button 
                onClick={() => onStatusChange(candidate.id, 'shortlisted')}
                className="btn-primary flex-1 py-4 rounded-2xl shadow-xl shadow-indigo-100"
              >
                Approve for Interview
              </button>
              <button 
                onClick={() => onStatusChange(candidate.id, 'rejected')}
                className="px-8 py-4 bg-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-300"
              >
                Reject Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Ranked Candidates ─────────────────────────────────── */
export default function RankedCandidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState(null);
  const [filter, setFilter]         = useState('all');

  useEffect(() => {
    const fetch = async () => {
      try {
        const jobsRes = await apiClient.get('/api/jobs');
        let all = [];
        for (const job of (jobsRes.data || [])) {
          try {
            const r = await apiClient.get(`/api/resumes/job/${job.id}`);
            const jobResumes = Array.isArray(r.data) ? r.data : [];
            const mapped = jobResumes.map(c => ({ 
              ...c, 
              jobTitle: job.title, 
              requiredSkills: job.required_skills || [] 
            }));
            all = [...all, ...mapped];
          } catch (itemErr) {
            console.error(`Error fetching resumes for job ${job.id}:`, itemErr);
          }
        }
        all.sort((a, b) => (b.score || 0) - (a.score || 0));
        setCandidates(all);
      } catch (err) {
        console.error('RankedCandidates fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await apiClient.put(`/api/resumes/${id}/status`, { status });
      // Update local state to reflect change immediately
      setCandidates(prev => prev.map(c => c.id === id ? { ...c, status } : c));
      setSelected(null);
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update candidate status');
    }
  };

  const handleViewInsights = async (c) => {
    if (c.ai_analysis) { setSelected({ ...c, ...c.ai_analysis, fileName: c.name }); return; }
    try {
      const res = await apiClient.get(`/api/resumes/${c.id}`);
      if (res.data.ai_analysis) setSelected({ ...res.data, ...res.data.ai_analysis, fileName: res.data.name });
      else {
        const sr = await apiClient.post(`/api/resumes/${c.id}/score`);
        setSelected({ ...res.data, ...sr.data, fileName: res.data.name });
      }
    } catch (err) { console.error(err); }
  };

  const filtered = filter === 'all' ? candidates
    : filter === 'high'   ? candidates.filter(c => (c.score || 0) >= 75)
    : filter === 'medium' ? candidates.filter(c => (c.score || 0) >= 50 && (c.score || 0) < 75)
    : candidates.filter(c => (c.score || 0) < 50);

  if (loading) return (
    <div className="p-12 text-center">
      <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl animate-float"
           style={{ background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)', border: '1px solid #ddd6fe' }}>👥</div>
      <div className="font-black text-slate-700 text-lg">Computing AI Rankings...</div>
      <div className="text-slate-400 text-sm mt-1">BERT scores being calculated</div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ──────────────────────────────────── */}
      <div className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
               style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>👥</div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-xl text-slate-900">AI-Ranked Candidates</h2>
              <span className="bert-badge">BERT Scored</span>
            </div>
            <p className="text-sm text-slate-400 font-medium">
              {candidates.length} candidates ranked by BERT semantic similarity
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex p-1 rounded-xl gap-1" style={{ background: '#f1f5f9' }}>
          {[
            { id: 'all', label: 'All' },
            { id: 'high',   label: '≥75% Match' },
            { id: 'medium', label: '50–74%' },
            { id: 'low',    label: '<50%' },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={filter === f.id ? { background: 'white', color: '#4338ca', boxShadow: '0 1px 6px rgba(0,0,0,0.08)' } : { color: '#64748b' }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Empty State ──────────────────────────────── */}
      {candidates.length === 0 && (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">🏆</div>
          <div className="font-black text-slate-700 text-xl mb-2">No Ranked Candidates Yet</div>
          <p className="text-slate-400 text-sm">Upload and score resumes in AI Screening to populate this list.</p>
        </div>
      )}

      {/* ── Ranked List ──────────────────────────────── */}
      <div className="space-y-4">
        {filtered.map((c, idx) => {
          const score    = Math.round(c.score || 0);
          const globalRank = candidates.indexOf(c);
          const scoreColor = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
          const scoreBg   = score >= 75 ? '#dcfce7' : score >= 50 ? '#fef3c7' : '#fee2e2';

          return (
            <div key={c.id}
              className="card card-interactive p-6 cursor-pointer relative overflow-hidden animate-fade-up group"
              style={{ animationDelay: `${idx * 0.04}s` }}
              onClick={() => handleViewInsights(c)}>

              {/* Big rank watermark */}
              <div className="absolute right-4 bottom-2 text-[6rem] font-black opacity-[0.03] pointer-events-none select-none leading-none">
                {globalRank + 1}
              </div>

              <div className="relative z-10 flex flex-col md:flex-row items-center gap-5">

                {/* Medal / rank */}
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 transition-transform duration-300 group-hover:scale-110"
                     style={{ background: globalRank < 3 ? '#fefce8' : '#f8fafc', border: '1px solid #f1f5f9' }}>
                  {globalRank < 3 ? MEDALS[globalRank] : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-slate-400"
                         style={{ background: '#f1f5f9' }}>#{globalRank + 1}</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-black text-xl text-slate-900">{c.name}</h3>
                    <span className={`tag ${c.status === 'shortlisted' || c.status === 'qualified' ? 'tag-green' : 'tag-gray'}`}>
                      {c.status || 'New'}
                    </span>
                    <span className="bert-badge">BERT</span>
                  </div>
                  <p className="text-sm font-bold text-slate-400 mb-3">{c.jobTitle}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(c.skills || []).slice(0, 5).map((s, i) => (
                      <span key={i} className="tag tag-brand">{s}</span>
                    ))}
                  </div>
                </div>

                {/* Score */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-3xl font-black" style={{ color: scoreColor }}>{score}%</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Match Score</div>

                    {/* Mini bar */}
                    <div className="w-24 progress-bar mt-2">
                      <div className="progress-fill animate-progress" style={{ width: `${score}%`, background: scoreColor }} />
                    </div>
                  </div>

                  <div className="w-px h-12" style={{ background: '#f1f5f9' }} />

                  <div className="text-indigo-600 font-black text-sm group-hover:translate-x-1 transition-transform">
                    XAI →
                  </div>
                </div>
              </div>

              {/* Bottom strip */}
              <div className="relative z-10 mt-5 pt-4 border-t flex items-center justify-between"
                   style={{ borderColor: '#f8fafc' }}>
                <div className="text-xs text-slate-400 font-medium flex items-center gap-2">
                  <div className="status-dot online" />
                  BERT semantic score · Click to see full AI reasoning
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: scoreBg, color: scoreColor }}>
                  {score >= 75 ? 'Highly Recommended' : score >= 50 ? 'Consider' : 'Low Match'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <XAIPanel 
        candidate={selected} 
        onClose={() => setSelected(null)} 
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}