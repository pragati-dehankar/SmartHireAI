import React, { useState } from 'react';
import apiClient from '../../services/api';

/* ─── Export Card ───────────────────────────────────────── */
function ExportCard({ icon, title, desc, tag, color, onClick, disabled, locked }) {
  const colors = {
    indigo:  { bg: '#eef2ff', border: '#c7d2fe', text: '#4338ca', hover: '#6366f1' },
    emerald: { bg: '#ecfdf5', border: '#6ee7b7', text: '#065f46', hover: '#10b981' },
    violet:  { bg: '#f5f3ff', border: '#ddd6fe', text: '#6d28d9', hover: '#8b5cf6' },
    amber:   { bg: '#fffbeb', border: '#fde68a', text: '#92400e', hover: '#f59e0b' },
    cyan:    { bg: '#ecfeff', border: '#a5f3fc', text: '#0e7490', hover: '#06b6d4' },
  };
  const c = colors[color] || colors.indigo;

  return (
    <button
      onClick={onClick}
      disabled={disabled || locked}
      className="group w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden"
      style={{
        background: 'white',
        borderColor: '#f1f5f9',
        opacity: locked ? 0.55 : 1,
        cursor: locked ? 'not-allowed' : 'pointer',
      }}
      onMouseEnter={e => { if (!locked) e.currentTarget.style.borderColor = c.border; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#f1f5f9'; }}
    >
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-transform duration-300 group-hover:scale-110"
             style={{ background: c.bg, border: `1px solid ${c.border}` }}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-bold text-slate-900 text-sm">{title}</span>
            {tag && !locked && <span className="bert-badge" style={{ fontSize: '8px', padding: '1px 5px' }}>{tag}</span>}
            {locked && <span className="tag tag-amber">Premium</span>}
          </div>
          <p className="text-xs text-slate-400 font-medium">{desc}</p>
        </div>
        {!locked && (
          <div className="text-slate-300 group-hover:translate-x-1 group-hover:text-slate-600 transition-all font-bold text-lg shrink-0">
            →
          </div>
        )}
      </div>
    </button>
  );
}

/* ─── Export Reports ────────────────────────────────────── */
export default function ExportReports() {
  const [exporting, setExporting]   = useState(null);
  const [exported, setExported]     = useState([]);

  const exportCSV = async (type) => {
    setExporting(type);
    try {
      const jobsRes = await apiClient.get('/api/jobs');
      const jobs = jobsRes.data;

      let csvContent = 'data:text/csv;charset=utf-8,';
      let fileName   = 'report.csv';

      if (type === 'candidates') {
        csvContent += 'Candidate,Position,BERT Score,Status,Skills\n';
        fileName    = 'smarthire_candidate_ranking.csv';
        for (const job of jobs) {
          const res = await apiClient.get(`/api/resumes/job/${job.id}`);
          res.data.forEach(c => {
            csvContent += `${c.name},${job.title},${c.score}%,${c.status},"${(c.skills || []).join('|')}"\n`;
          });
        }
      } else if (type === 'fairness') {
        csvContent += 'Job Title,Overall Fairness,Gender Bias,Education Bias,Age Bias\n';
        fileName    = 'smarthire_fairness_audit.csv';
        for (const job of jobs) {
          try {
            const res = await apiClient.get(`/api/fairness/job/${job.id}`);
            csvContent += `${job.title},${res.data.overallFairnessScore}%,${res.data.genderBiasScore},${res.data.educationBiasScore},${res.data.ageBiasScore}\n`;
          } catch {
            csvContent += `${job.title},N/A,N/A,N/A,N/A\n`;
          }
        }
      } else if (type === 'jobs') {
        csvContent += 'Job Title,Applicants,Qualified,Posted Date\n';
        fileName    = 'smarthire_job_summary.csv';
        jobs.forEach(j => {
          csvContent += `${j.title},${j.resumes_count || 0},${j.qualified_count || 0},${j.created_at || ''}\n`;
        });
      }

      const link = document.createElement('a');
      link.setAttribute('href', encodeURI(csvContent));
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setExported(prev => [...prev, type]);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Ensure resumes are scored.');
    } finally {
      setExporting(null);
    }
  };

  const EXPORT_GROUPS = [
    {
      title: 'Talent & Rankings',
      icon: '🏆',
      items: [
        { id: 'candidates', icon: '📄', title: 'Ranked Candidates',        desc: 'BERT scores, status, skills — CSV format',    color: 'indigo', tag: 'BERT' },
        { id: 'jobs',       icon: '💼', title: 'Job Posting Summary',      desc: 'All jobs with applicant counts — CSV',        color: 'violet' },
        { id: 'pipeline',   icon: '📊', title: 'Hiring Pipeline PDF',      desc: 'Visual report with charts — Premium',         color: 'violet', locked: true },
      ],
    },
    {
      title: 'Compliance & Fairness',
      icon: '⚖️',
      items: [
        { id: 'fairness', icon: '⚖️', title: 'Algorithmic Fairness Audit', desc: 'Bias metrics per job — CSV format', color: 'emerald', tag: 'BERT' },
        { id: 'xai',      icon: '🔍', title: 'XAI Decision Log',           desc: 'Explainability report — Premium',  color: 'cyan',    locked: true },
        { id: 'activity', icon: '📋', title: 'Activity Log Export',        desc: 'Recruiter actions timeline — Premium', color: 'amber', locked: true },
      ],
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="card p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
               style={{ background: 'linear-gradient(135deg, #ecfdf5, #f0fdf4)', border: '1px solid #6ee7b7' }}>📥</div>
          <div>
            <h2 className="font-black text-xl text-slate-900">Export & Reports</h2>
            <p className="text-sm text-slate-400 font-medium">Download structured hiring data and AI audit reports</p>
          </div>
        </div>
        {exported.length > 0 && (
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
            ✅ {exported.length} export(s) completed
          </div>
        )}
      </div>

      {/* Export Groups */}
      <div className="grid md:grid-cols-2 gap-6">
        {EXPORT_GROUPS.map((group, gi) => (
          <div key={gi} className="card p-6">
            <h3 className="font-black text-slate-700 text-sm mb-4 flex items-center gap-2">
              <span>{group.icon}</span> {group.title}
            </h3>
            <div className="space-y-3">
              {group.items.map((item) => (
                <ExportCard
                  key={item.id}
                  {...item}
                  disabled={exporting === item.id}
                  onClick={() => !item.locked && exportCSV(item.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Exporting Status */}
      {exporting && (
        <div className="card p-5 flex items-center gap-4"
             style={{ background: 'linear-gradient(135deg, #f0f9ff, #f5f3ff)', border: '1px solid #c7d2fe' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl animate-spin-slow"
               style={{ background: '#eef2ff' }}>⬡</div>
          <div className="flex-1">
            <div className="font-black text-slate-900 text-sm">Generating Export...</div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Fetching data from BERT scoring engine</div>
          </div>
          <div className="w-5 h-5 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      )}

      {/* System Status */}
      <div className="rounded-2xl p-5 flex items-center justify-between"
           style={{ background: '#0d1117', border: '1px solid #21262d' }}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
               style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)' }}>🟢</div>
          <div>
            <div className="text-white font-black text-sm">System Status: All Systems Operational</div>
            <div className="text-slate-400 text-xs font-medium">Database connected · BERT engine active · All records ready</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bert-pulse" />
          <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Live Sync</span>
        </div>
      </div>
    </div>
  );
}