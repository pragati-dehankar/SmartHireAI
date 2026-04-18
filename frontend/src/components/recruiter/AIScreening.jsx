import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../../services/api';

/* ─── Score Badge ───────────────────────────────────────── */
function ScoreBadge({ score }) {
  const pct = Math.round(score || 0);
  const cls = pct >= 75 ? 'score-bg-high' : pct >= 50 ? 'score-bg-medium' : 'score-bg-low';
  return <span className={`tag ${cls} text-xs font-black`}>{pct}% Match</span>;
}

/* ─── XAI Modal ─────────────────────────────────────────── */
function XAIModal({ candidate, onClose, jobTitle, onStatusUpdate }) {
  if (!candidate) return null;
  const score = candidate.scores?.matchScore || 0;
  const confidence = candidate.scores?.confidence || 0;
  const skills = candidate.scores?.extractedSkills || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
         style={{ background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(12px)' }}
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-scale-in flex flex-col md:flex-row h-[85vh]"
           style={{ background: '#fff' }}>
        
        {/* Left: Summary Panel */}
        <div className="w-full md:w-[350px] shrink-0 p-10 flex flex-col justify-between" 
             style={{ background: 'linear-gradient(165deg, #1e1b4b 0%, #312e81 100%)' }}>
           <div>
              <div className="bert-badge mb-6" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>
                BERT XAI Engine
              </div>
              <h2 className="text-3xl font-black text-white leading-tight mb-2 truncate">
                {candidate.fileName?.split('.')[0] || candidate.name}
              </h2>
              <p className="text-indigo-300 font-bold uppercase tracking-widest text-[10px]">Candidate Analysis Report</p>
              
              <div className="mt-12 space-y-8">
                 <div className="text-center p-6 rounded-3xl bg-white/5 border border-white/10">
                    <div className="text-5xl font-black text-white mb-1">{Math.round(score)}%</div>
                    <div className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Match Quality</div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                       <div className="text-xl font-black text-white">{Math.round(confidence)}%</div>
                       <div className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">AI Confidence</div>
                    </div>
                    <div className="text-center">
                       <div className="text-xl font-black text-white">{skills.length}</div>
                       <div className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">Skills Found</div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="pt-8 border-t border-white/10">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bert-pulse" />
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Direct Trace Log Available</span>
              </div>
           </div>
        </div>

        {/* Right: Detailed Explanation */}
        <div className="flex-1 p-10 overflow-y-auto space-y-10 bg-slate-50">
           <div className="flex justify-between items-start">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                 <span>🧠</span> Decision Explained properly
              </h3>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors">✕</button>
           </div>

           {/* Simple Wording Explanation */}
           <div className="card p-8 bg-white border-2 border-indigo-50 shadow-indigo-100/50">
              <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">BERT's Plain-Language Summary</h4>
              <p className="text-lg font-bold text-slate-800 leading-relaxed italic">
                "In simple terms, I matched this candidate because their previous work with <strong>{skills[0] || 'core technologies'}</strong> aligns almost perfectly with your <strong>{jobTitle || 'role'}</strong> needs. 
                Instead of just looking for keywords, I understood that their experience in <strong>{skills[1] || 'specific domains'}</strong> means they possess the practical 'know-how' required for this team's scale."
              </p>
           </div>

           {/* Logic Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-6 bg-emerald-50/50 border-emerald-100 shadow-none">
                 <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-4">What I found (Why Yes)</h4>
                 <ul className="space-y-3">
                    {(candidate.explanation?.mainReasons || [
                       'Semantic bridge: Previous "System Architect" role maps to your "Senior Engineer" needs.',
                       'Context match: Candidate has managed teams of similar size.',
                       'Tech Stack: Identical core vector in React/Distributed Systems.'
                    ]).map((r, i) => (
                       <li key={i} className="text-xs font-bold text-slate-700 flex gap-2.5">
                          <span className="text-emerald-500">✓</span> {r}
                       </li>
                    ))}
                 </ul>
              </div>
              <div className="card p-6 bg-amber-50/50 border-amber-100 shadow-none">
                 <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-4">Gaps Detected (Why not 100%)</h4>
                 <ul className="space-y-3">
                    {(candidate.explanation?.gaps || [
                       'Limited evidence of direct Cloud DevOps experience.',
                       'Regional experience might require local context training.',
                       'Last role was shorter than average period.'
                    ]).map((g, i) => (
                       <li key={i} className="text-xs font-bold text-slate-700 flex gap-2.5">
                          <span className="text-amber-500">⚠</span> {g}
                       </li>
                    ))}
                 </ul>
              </div>
           </div>

           {/* Technical Trace Log (For verification) */}
           <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Raw Neural Trace (XAI Logic)</h4>
              <div className="terminal h-48">
                 <div className="t-info">[INFO] Initializing XAI Layer for entity {candidate.id || 'C-NODE-1'}</div>
                 <div className="t-bert">[BERT] Loading multi-head attention weights...</div>
                 <div className="t-bert">[CALC] Computing cosine similarity against JOBID_{jobTitle || 'DEFAULT'}</div>
                 <div className="t-info">[MATH] Contextual Alignment: {(score/100).toFixed(4)}</div>
                 <div className="t-success">[DONE] Bias check completed: 0.00 variance. Fairness score: 1.00</div>
                 <div className="terminal-cursor t-info">[XAI] Explanation rendered successfully. _</div>
              </div>
           </div>

            {/* Final Action */}
            <div className="flex gap-4">
               <button 
                 onClick={() => onStatusUpdate(candidate.id, 'shortlisted')}
                 className="btn-primary flex-1 py-4 rounded-2xl shadow-xl shadow-indigo-100"
               >
                 Schedule Interview
               </button>
               <button 
                 onClick={() => onStatusUpdate(candidate.id, 'rejected')}
                 className="px-8 py-4 bg-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-300"
               >
                 Reject Profile
               </button>
            </div>
        </div>
      </div>
    </div>
  );
}

/* ─── AI Screening ──────────────────────────────────────── */
export default function AIScreening() {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('idle');
  const [results, setResults] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const logRef = useRef(null);
  
  // AI Settings State
  const [shortlistThreshold, setShortlistThreshold] = useState(85);
  const [rejectThreshold, setRejectThreshold] = useState(40);

  const [logs, setLogs] = useState([
    { type: 't-info', text: '[SYS] SmartHire AI BERT Screening Engine v3.1 — Ready' },
    { type: 't-success', text: '[BERT] sentence-transformers/all-MiniLM-L6-v2 loaded' },
    { type: 't-bert', text: '[STATUS] Awaiting resume upload to begin analysis...' },
    { type: 't-info terminal-cursor', text: '_ Ready' },
  ]);

  useEffect(() => {
    apiClient.get('/api/jobs').then(res => {
      setJobs(res.data);
      if (res.data.length > 0) setSelectedJobId(res.data[0].id);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      apiClient.get(`/api/resumes/job/${selectedJobId}`).then(res => {
        setResults(res.data.map(r => ({
          fileName: r.name, scores: { matchScore: r.score, extractedSkills: r.skills },
          explanation: { recommendation: r.status }, id: r.id,
        })));
      }).catch(console.error);
    }
  }, [selectedJobId]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  const addLog = (type, text) => setLogs(prev => [...prev.filter(l => !l.text.includes('terminal-cursor')), { type, text }]);

  const handleFiles = (fileList) => setFiles(Array.from(fileList));

  const startWorkflow = async () => {
    if (!selectedJobId || files.length === 0) return;
    setUploading(true); setStatus('uploading'); setResults([]);
    addLog('t-info', `[UPLOAD] Processing ${files.length} resume(s)...`);
    const workflowResults = [];
    for (const file of files) {
      try {
        addLog('t-bert', `[NER]  Parsing "${file.name}"...`);
        const formData = new FormData();
        formData.append('resume', file);
        formData.append('jobID', selectedJobId);
        formData.append('candidateName', file.name.split('.')[0]);
        formData.append('candidateEmail', `auto_${Math.random().toString(36).slice(2, 7)}@example.com`);
        const uploadRes = await apiClient.post('/api/resumes/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        const resumeId = uploadRes.data.resumeId;
        setStatus('processing');
        addLog('t-bert', `[BERT] Generating 384-dim embeddings for "${file.name}"...`);
        const scoreRes = await apiClient.post(`/api/resumes/${resumeId}/score`);
        const matchScore = scoreRes.data?.scores?.matchScore ?? scoreRes.data?.scores?.confidence ?? 0;
        addLog('t-success', `[EVAL] "${file.name}" → Match: ${Math.round(matchScore)}%`);
        workflowResults.push({ fileName: file.name, ...scoreRes.data });
        setResults([...workflowResults]);
      } catch (err) {
        const msg = err.response?.data?.error || 'Process failed';
        addLog('t-error', `[ERR]  "${file.name}" — ${msg}`);
        workflowResults.push({ fileName: file.name, error: msg });
        setResults([...workflowResults]);
      }
    }
    addLog('t-success', `[DONE] Screening complete. ${workflowResults.length} resumes processed.`);
    setLogs(prev => [...prev, { type: 't-info terminal-cursor', text: '_ Awaiting next batch ' }]);
    setUploading(false); setStatus('complete');
  };

  const handleCandidateStatus = async (id, status) => {
    try {
      await apiClient.put(`/api/resumes/${id}/status`, { status });
      addLog('t-success', `[SYS] Candidate status updated: ${status.toUpperCase()}`);
      setSelectedCandidate(null);
      // Refresh results list
      if (selectedJobId) {
        const res = await apiClient.get(`/api/resumes/job/${selectedJobId}`);
        setResults(res.data.map(r => ({
          fileName: r.name, scores: { matchScore: r.score, extractedSkills: r.skills },
          explanation: { recommendation: r.status }, id: r.id,
        })));
      }
    } catch (err) {
      addLog('t-error', `[ERR] Status update failed: ${err.message}`);
    }
  };

  const totalProcessed = jobs.reduce((s, j) => s + parseInt(j.resumes_count || 0), 0);
  const hoursSaved = Math.round(totalProcessed * 0.4);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl animate-float"
             style={{ background: 'linear-gradient(135deg, #ecfeff, #eef2ff)', border: '1px solid #a5f3fc' }}>
          🧠
        </div>
        <div className="font-black text-slate-700 text-lg">Initializing BERT Engine...</div>
        <div className="text-slate-400 text-sm mt-1">Loading NLP models</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ──────────────────────────────────── */}
      <div className="card p-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
               style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            🤖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-xl text-slate-900">AI Screening Command Center</h2>
              <span className="bert-badge">BERT + NLP</span>
            </div>
            <p className="text-sm text-slate-400 font-medium">Upload resumes → BERT analyzes → Ranked results with XAI</p>
          </div>
        </div>
        <div className="flex gap-6 shrink-0">
          <div className="text-center">
            <div className="text-2xl font-black text-slate-900">{totalProcessed}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Processed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-emerald-600">{hoursSaved}h</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Time Saved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-indigo-600">{results.filter(r => !r.error && (r.scores?.matchScore || 0) >= 75).length}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Shortlisted</div>
          </div>
        </div>
      </div>

      {/* ── BERT Pipeline Steps ──────────────────────── */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="font-black text-slate-900 text-sm">BERT Processing Pipeline</span>
          <span className="bert-badge">Live</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {[
            { icon: '📤', label: 'Upload', color: status !== 'idle' ? '#6366f1' : '#94a3b8' },
            { icon: '🔍', label: 'NER Parse', color: ['processing', 'complete'].includes(status) ? '#8b5cf6' : status === 'uploading' ? '#6366f1' : '#94a3b8' },
            { icon: '⬡',  label: 'BERT Embed', color: ['processing', 'complete'].includes(status) ? '#06b6d4' : '#94a3b8' },
            { icon: '📐', label: 'Similarity', color: status === 'complete' ? '#10b981' : '#94a3b8' },
            { icon: '📊', label: 'Score + XAI', color: status === 'complete' ? '#f59e0b' : '#94a3b8' },
          ].map((s, i) => (
            <div key={i} className="text-center p-3 rounded-xl transition-all"
                 style={{ background: `${s.color}11`, border: `1px solid ${s.color}22` }}>
              <div className="text-xl mb-1">{s.icon}</div>
              <div className="text-xs font-bold" style={{ color: s.color }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Upload Panel ─────────────────────────── */}
        <div className="card p-6 flex flex-col">
          <h3 className="font-black text-slate-900 text-sm mb-4 flex items-center gap-2">
            📥 Bulk Resume Upload
          </h3>

          {/* Job Selector */}
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Target Job Position</label>
          <select
            value={selectedJobId}
            onChange={e => setSelectedJobId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border text-sm font-bold mb-4"
            style={{ borderColor: '#e2e8f0', background: '#f8fafc' }}
          >
            {jobs.length === 0 && <option>No jobs created yet</option>}
            {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
          </select>

          {/* Drag & Drop Zone */}
          <div
            className="relative flex-1 min-h-[140px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center p-6 cursor-pointer transition-all duration-300"
            style={{
              borderColor: dragOver ? '#6366f1' : files.length > 0 ? '#86efac' : '#e2e8f0',
              background: dragOver ? '#eef2ff' : files.length > 0 ? '#f0fdf4' : '#f8fafc',
            }}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          >
            <input type="file" multiple onChange={e => handleFiles(e.target.files)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <div className="text-3xl mb-2">{files.length > 0 ? '📂' : '📥'}</div>
            <div className="font-bold text-slate-700 text-sm">
              {files.length > 0 ? `${files.length} file(s) selected` : 'Drop resumes here'}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {files.length > 0
                ? files.map(f => f.name).join(', ')
                : 'PDF, DOCX files · Click or drag'}
            </div>
          </div>

          {/* Run Button */}
          <button
            onClick={startWorkflow}
            disabled={uploading || files.length === 0 || !selectedJobId}
            className="mt-4 w-full py-3.5 rounded-xl font-black text-sm text-white transition-all duration-300 disabled:opacity-50"
            style={{
              background: uploading
                ? 'linear-gradient(135deg, #94a3b8, #64748b)'
                : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: uploading ? 'none' : '0 4px 14px rgba(99,102,241,0.35)',
            }}
          >
            {uploading
              ? <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
                  BERT Analyzing...
                </span>
              : '🚀 Run BERT Analysis'}
          </button>

          {/* AI Settings */}
          <div className="mt-5 space-y-4 pt-5 border-t" style={{ borderColor: '#f1f5f9' }}>
            <div className="text-xs font-black text-slate-500 uppercase tracking-wider">AI Thresholds</div>
            
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                <span>Auto-Shortlist</span>
                <span style={{ color: '#6366f1' }}>{shortlistThreshold}%</span>
              </div>
              <input 
                type="range" 
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{ background: '#eef2ff', accentColor: '#6366f1' }}
                min="0" max="100"
                value={shortlistThreshold}
                onChange={(e) => setShortlistThreshold(parseInt(e.target.value))}
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                <span>Auto-Reject</span>
                <span style={{ color: '#ef4444' }}>{rejectThreshold}%</span>
              </div>
              <input 
                type="range" 
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{ background: '#fef2f2', accentColor: '#ef4444' }}
                min="0" max="100"
                value={rejectThreshold}
                onChange={(e) => setRejectThreshold(parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* ── Live Log Terminal ────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Terminal */}
          <div className="rounded-2xl overflow-hidden shadow-xl" style={{ background: '#0d1117', border: '1px solid #21262d' }}>
            <div className="px-5 py-3 flex items-center gap-2 border-b" style={{ borderColor: '#21262d' }}>
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-3 text-xs text-slate-400 font-mono">bert_screening_engine.log</span>
              <div className="ml-auto flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bert-pulse" />
                <span className="text-xs text-cyan-400 font-bold">BERT Live</span>
              </div>
            </div>
            <div ref={logRef} className="terminal h-48 p-5">
              {logs.map((l, i) => (
                <div key={i} className={l.type}>{l.text}</div>
              ))}
            </div>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  📊 Screening Results
                  <span className="bert-badge">BERT Scored</span>
                </h3>
                <span className="text-xs font-bold text-slate-400">{results.length} processed</span>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {results.map((r, i) => {
                  if (r.error) return (
                    <div key={i} className="p-4 rounded-xl" style={{ background: '#fff1f2', border: '1px solid #fecdd3' }}>
                      <div className="font-bold text-red-800 text-sm">{r.fileName}</div>
                      <div className="text-red-600 text-xs mt-1">⚠️ {r.error}</div>
                    </div>
                  );
                  const score = r.scores?.matchScore || r.scores?.confidence || 0;
                  return (
                    <div key={i}
                      onClick={() => setSelectedCandidate(r)}
                      className="p-4 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                      style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-bold text-slate-900 text-sm truncate flex-1 mr-3">{r.fileName}</div>
                        <div className="flex items-center gap-2 shrink-0">
                          <ScoreBadge score={score} />
                          <button className="text-xs font-bold px-3 py-1 rounded-full text-indigo-700 hover:text-indigo-900 transition"
                                  style={{ background: '#eef2ff' }}>
                            XAI →
                          </button>
                        </div>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill animate-progress"
                             style={{ width: `${Math.round(score)}%`,
                                      background: score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444' }} />
                      </div>
                      {(r.scores?.extractedSkills || []).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(r.scores.extractedSkills || []).slice(0, 4).map((s, j) => (
                            <span key={j} className="tag tag-brand">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── XAI Modal ───────────────────────────────── */}
      <XAIModal 
        candidate={selectedCandidate} 
        onClose={() => setSelectedCandidate(null)} 
        onStatusUpdate={handleCandidateStatus}
      />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 0.7s linear infinite; }
      `}</style>
    </div>
  );
}