import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';

/* ─── Score Bar Cell ────────────────────────────────────── */
function ScoreCell({ val, isTop }) {
  if (!val && val !== 0) return <td className="px-5 py-5 text-center text-slate-300 font-bold">—</td>;
  const pct = Math.round(val);
  const color = pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <td className="px-5 py-5 text-center">
      <div className="flex flex-col items-center gap-2">
        <span className="text-xl font-black" style={{ color }}>{pct}%</span>
        <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: '#f1f5f9' }}>
          <div className="h-full rounded-full animate-progress" style={{ width: `${pct}%`, background: color }} />
        </div>
        {isTop && <span className="bert-badge" style={{ fontSize: '8px', padding: '1px 5px' }}>Top Pick</span>}
      </div>
    </td>
  );
}

/* ─── Candidate Comparison ──────────────────────────────── */
export default function Comparison() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading]       = useState(true);

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
        setCandidates(all.slice(0, 3));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return (
    <div className="p-12 text-center">
      <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl animate-float"
           style={{ background: 'linear-gradient(135deg, #f0f9ff, #eef2ff)', border: '1px solid #c7d2fe' }}>⚖️</div>
      <div className="font-black text-slate-700 text-lg">Building Comparison Matrix...</div>
    </div>
  );

  if (candidates.length === 0) return (
    <div className="card p-16 text-center">
      <div className="text-5xl mb-4">⚖️</div>
      <h2 className="font-black text-slate-900 text-xl mb-2">Comparison Matrix Empty</h2>
      <p className="text-slate-400 text-sm max-w-xs mx-auto">Score at least one candidate to enable side-by-side evaluation.</p>
    </div>
  );

  const slots = [...candidates, null, null, null].slice(0, 3);
  const COL_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4'];

  const ROWS = [
    {
      key: 'bert',
      label: 'BERT Match Score',
      bert: true,
      render: (c, i) => <ScoreCell val={c?.score} isTop={i === 0} />,
    },
    {
      key: 'exp',
      label: 'Experience',
      render: (c) => (
        <td className="px-5 py-5 text-center font-bold text-slate-700">
          {c ? `${c.experience_years || '—'} yrs` : '—'}
        </td>
      ),
    },
    {
      key: 'skills',
      label: 'Top Skills',
      render: (c) => (
        <td className="px-5 py-5 text-center">
          {c ? (
            <div className="flex flex-wrap justify-center gap-1.5">
              {(c.skills || []).slice(0, 3).map((s, i) => (
                <span key={i} className="tag tag-brand">{s}</span>
              ))}
              {!c.skills?.length && <span className="text-slate-300 text-sm">—</span>}
            </div>
          ) : '—'}
        </td>
      ),
    },
    {
      key: 'status',
      label: 'Hiring Status',
      render: (c) => (
        <td className="px-5 py-5 text-center">
          {c ? (
            <span className={`tag ${c.status === 'shortlisted' || c.status === 'qualified' ? 'tag-green' : 'tag-gray'}`}>
              {c.status === 'shortlisted' ? 'Qualified' : c.status || 'New'}
            </span>
          ) : '—'}
        </td>
      ),
    },
    {
      key: 'job',
      label: 'Applied For',
      render: (c) => (
        <td className="px-5 py-5 text-center text-sm font-medium text-slate-500">
          {c?.jobTitle || '—'}
        </td>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="card p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
               style={{ background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)', border: '1px solid #c7d2fe' }}>⚖️</div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-xl text-slate-900">Candidate Comparison</h2>
              <span className="bert-badge">BERT Scores</span>
            </div>
            <p className="text-sm text-slate-400 font-medium">Head-to-head BERT semantic alignment — top 3 candidates</p>
          </div>
        </div>
        <button onClick={() => window.print()}
          className="px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:shadow-md"
          style={{ background: '#0d1117', color: 'white' }}>
          🖨️ Print Matrix
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">

            {/* Candidate Headers */}
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th className="px-6 py-5 text-sm font-black text-slate-500 w-[200px] border-b" style={{ borderColor: '#f1f5f9' }}>
                  Criteria
                </th>
                {slots.map((c, i) => (
                  <th key={i} className="px-5 py-5 text-center border-b" style={{ borderColor: '#f1f5f9', minWidth: '200px' }}>
                    {c ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm shadow"
                             style={{ background: COL_COLORS[i] }}>
                          {c.name?.charAt(0) || '#'}
                        </div>
                        <div className="font-black text-slate-900 text-sm truncate max-w-[160px]">{c.name}</div>
                        <div className="text-xs font-bold truncate max-w-[160px]" style={{ color: COL_COLORS[i] }}>
                          {c.jobTitle}
                        </div>
                        {i === 0 && (
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                                style={{ background: '#fef3c7', color: '#92400e' }}>🥇 Top Ranked</span>
                        )}
                      </div>
                    ) : (
                      <div className="text-slate-300 italic text-sm font-bold">Empty Slot</div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Rows */}
            <tbody>
              {ROWS.map((row, ri) => (
                <tr key={row.key} className="transition-colors hover:bg-slate-50/70"
                    style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td className="px-6 py-5 border-b" style={{ borderColor: '#f8fafc' }}>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{row.label}</span>
                      {row.bert && <span className="bert-badge">BERT</span>}
                    </div>
                  </td>
                  {slots.map((c, ci) => (
                    <React.Fragment key={ci}>
                      {row.render(c, ci)}
                    </React.Fragment>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer note */}
        <div className="px-6 py-4 flex items-center gap-3" style={{ background: '#fafbfd', borderTop: '1px solid #f1f5f9' }}>
          <div className="bert-live-indicator">
            <div className="dot" /> BERT Engine
          </div>
          <span className="text-xs text-slate-400 font-medium">
            All scores computed via BERT cosine similarity · 384-dim sentence embeddings
          </span>
        </div>
      </div>
    </div>
  );
}