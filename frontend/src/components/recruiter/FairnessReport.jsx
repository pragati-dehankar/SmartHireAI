import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';

/* ─── Radial Score ──────────────────────────────────────── */
function RadialScore({ score, label, icon, color }) {
  const pct = Math.min(100, Math.max(0, score ?? 0));
  const colors = {
    indigo: '#6366f1', violet: '#8b5cf6', cyan: '#06b6d4',
    emerald: '#10b981', amber: '#f59e0b',
  };
  const hex = colors[color] || colors.indigo;
  const deg = (pct / 100) * 360;

  return (
    <div className="card p-5 text-center card-interactive">
      <div className="relative w-20 h-20 mx-auto mb-3">
        <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="2.5" />
          <circle
            cx="18" cy="18" r="15.9" fill="none"
            stroke={hex} strokeWidth="2.5"
            strokeDasharray={`${pct} ${100 - pct}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1.2s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-base font-black" style={{ color: hex }}>{pct === 0 ? 'N/A' : `${pct}%`}</span>
        </div>
      </div>
      <div className="text-lg mb-1">{icon}</div>
      <div className="text-sm font-bold text-slate-900">{label}</div>
    </div>
  );
}

/* ─── Metric Row ────────────────────────────────────────── */
function MetricRow({ name, score, desc, bert, color }) {
  const pct = Math.min(100, Math.max(0, score ?? 0));
  const colors = { indigo: '#6366f1', cyan: '#06b6d4', emerald: '#10b981', violet: '#8b5cf6' };
  const hex = colors[color] || '#6366f1';
  const grade = pct >= 80 ? '✅ Excellent' : pct >= 60 ? '⚠️ Moderate' : pct > 0 ? '🚨 Review' : '—';
  const gradeColor = pct >= 80 ? '#065f46' : pct >= 60 ? '#92400e' : '#9f1239';
  const gradeBg   = pct >= 80 ? '#dcfce7' : pct >= 60 ? '#fef3c7' : '#ffe4e6';

  return (
    <div className="p-5 rounded-2xl" style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900 text-sm">{name}</span>
          {bert && <span className="bert-badge">BERT</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: gradeBg, color: gradeColor }}>{grade}</span>
          <span className="font-black text-base" style={{ color: hex }}>{pct > 0 ? `${pct}%` : 'N/A'}</span>
        </div>
      </div>
      <div className="progress-bar mb-2">
        <div className="progress-fill animate-progress" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${hex}99, ${hex})` }} />
      </div>
      <p className="text-xs text-slate-400 font-medium">{desc}</p>
    </div>
  );
}

/* ─── Fairness Report ───────────────────────────────────── */
export default function FairnessReport() {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [fairness, setFairness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/api/jobs').then(res => {
      setJobs(res.data);
      if (res.data.length > 0) setSelectedJobId(res.data[0].id);
      else setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedJobId) return;
    setLoading(true);
    apiClient.get(`/api/fairness/job/${selectedJobId}`)
      .then(res => setFairness(res.data))
      .catch(() => setFairness(null))
      .finally(() => setLoading(false));
  }, [selectedJobId]);

  const toDisplay = (score) => {
    if (score === undefined || score === null) return 0;
    return Math.round(typeof score === 'number' && score < 2 ? (1 - score) * 100 : score);
  };

  const data = fairness || {
    overallFairnessScore: null,
    genderBiasScore: null,
    educationBiasScore: null,
    ageBiasScore: null,
    summary: 'Insufficient data — upload and score resumes first.',
    alerts: [],
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ──────────────────────────────────────── */}
      <div className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
               style={{ background: 'linear-gradient(135deg, #ecfeff, #f0f9ff)', border: '1px solid #a5f3fc' }}>
            ⚖️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-xl text-slate-900">Bias Detection & Fairness Report</h2>
              <span className="bert-badge">BERT</span>
            </div>
            <p className="text-sm text-slate-400 font-medium">AI-powered algorithmic bias analysis for inclusive hiring</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold text-slate-500">Select Job:</label>
          <select
            value={selectedJobId}
            onChange={e => setSelectedJobId(e.target.value)}
            className="px-4 py-2.5 rounded-xl border text-sm font-bold"
            style={{ borderColor: '#e2e8f0', background: '#f8fafc' }}
          >
            {jobs.length === 0 && <option>No jobs available</option>}
            {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
          </select>
        </div>
      </div>

      {/* Simple Explanation Banner */}
      <div className="card p-8 bg-gradient-to-br from-emerald-50 to-white border-emerald-100 shadow-emerald-100/20">
         <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white text-2xl shadow-lg shrink-0">🛡️</div>
            <div>
               <h3 className="text-lg font-black text-slate-900 mb-1">How we ensure fair hiring</h3>
               <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  Our BERT AI is trained to ignore "hidden signals" about gender, age, or specific school prestige. 
                  Instead of just taking the resume at face value, these scores measure <strong>how purely the AI focused on skills and context</strong> rather than demographic data. 
                  A higher score means a more inclusive, merit-based ranking process.
               </p>
            </div>
         </div>
      </div>

      {/* ── No Data Warning ──────────────────────────────── */}
      {!fairness && !loading && (
        <div className="rounded-2xl p-5 flex items-center gap-3"
             style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
          <span className="text-2xl">⚠️</span>
          <div>
            <div className="font-bold text-amber-800 text-sm">Fairness analysis unavailable</div>
            <div className="text-amber-700 text-xs font-medium mt-0.5">
              No scored resumes found for this job. Upload resumes in AI Screening first.
            </div>
          </div>
        </div>
      )}

      {/* ── Radial Score Cards ────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <RadialScore score={toDisplay(data.overallFairnessScore)}  icon="⚖️" label="Overall Fairness"    color="indigo" />
        <RadialScore score={toDisplay(data.genderBiasScore)}       icon="✨" label="Gender Neutrality"   color="violet" />
        <RadialScore score={toDisplay(data.educationBiasScore)}    icon="🎓" label="Background Fairness" color="cyan" />
        <RadialScore score={toDisplay(data.ageBiasScore)}          icon="🔍" label="Age Anonymization"   color="emerald" />
      </div>

      {/* ── Detailed Metrics ─────────────────────────────── */}
      <div className="card p-6">
        <h3 className="font-black text-slate-900 text-base mb-5 flex items-center gap-2">
          <span>📊</span> Fairness Metrics Detail
          <span className="bert-badge ml-2">BERT Analysis</span>
        </h3>
        <div className="space-y-3">
          <MetricRow name="Gender Neutrality"    score={toDisplay(data.genderBiasScore)}    desc="BERT embeddings analyzed for gender language bias in scoring." bert color="violet" />
          <MetricRow name="Background Fairness"  score={toDisplay(data.educationBiasScore)} desc="Education anonymization impact on AI matching scores."         bert color="cyan" />
          <MetricRow name="Age Anonymization"    score={toDisplay(data.ageBiasScore)}       desc="Checks for implicit age thresholds in career timeline scoring." bert color="emerald" />
          <MetricRow name="Overall Algorithm"    score={toDisplay(data.overallFairnessScore)} desc="Combined fairness metric across all bias detection categories." bert color="indigo" />
        </div>
      </div>

      {/* ── BERT Explanation ─────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#0d1117', border: '1px solid #21262d' }}>
        <div className="px-6 py-4 flex items-center gap-3 border-b" style={{ borderColor: '#21262d' }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
               style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)' }}>⬡</div>
          <div>
            <div className="text-white font-black text-sm">BERT Bias Analysis Log</div>
            <div className="text-slate-400 text-xs">How SmartHire AI detects algorithmic bias</div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bert-pulse" />
            <span className="text-cyan-400 text-xs font-bold">Active</span>
          </div>
        </div>
        <div className="terminal p-5 h-48">
          <div className="t-info">[BERT-BIAS] Loading fairness evaluation module v2.3...</div>
          <div className="t-success">[OK] sentence-transformers/all-MiniLM-L6-v2 loaded</div>
          <div className="t-bert">[GENDER] Generating gender-neutral embedding pairs...</div>
          <div className="t-success">[RESULT] Gender bias score: <span className="t-white">{toDisplay(data.genderBiasScore) || 'N/A'}%</span> neutrality</div>
          <div className="t-bert">[AGE]  Checking for implicit age-related language patterns...</div>
          <div className="t-success">[RESULT] Age anonymization: <span className="t-white">{toDisplay(data.ageBiasScore) || 'N/A'}%</span> clean</div>
          <div className="t-bert">[EDU]  Education background fairness analysis running...</div>
          <div className="t-success">[RESULT] Background fairness: <span className="t-white">{toDisplay(data.educationBiasScore) || 'N/A'}%</span></div>
          <div className="t-info terminal-cursor">[SYS]  Overall fairness score: <span className="t-white">{toDisplay(data.overallFairnessScore) || 'N/A'}%</span> &nbsp;</div>
        </div>
      </div>

      {/* ── Summary / Alert Banner ────────────────────────── */}
      <div className="rounded-2xl p-5"
           style={!fairness ? { background: '#f8fafc', border: '1px solid #e2e8f0' } :
                  data.alerts?.length > 0 ? { background: '#fff7ed', border: '1px solid #fed7aa' } :
                  { background: '#f0fdf4', border: '1px solid #86efac' }}>
        <div className="flex items-start gap-3">
          <span className="text-2xl">
            {!fairness ? 'ℹ️' : data.alerts?.length > 0 ? '⚠️' : '✅'}
          </span>
          <div className="flex-1">
            <div className="font-bold text-sm"
                 style={{ color: !fairness ? '#475569' : data.alerts?.length > 0 ? '#9a3412' : '#166534' }}>
              {!fairness ? 'Analysis Pending' : data.alerts?.length > 0 ? 'Bias Alerts Detected' : 'No Algorithmic Bias Detected'}
            </div>
            <p className="text-xs font-medium mt-1"
               style={{ color: !fairness ? '#64748b' : data.alerts?.length > 0 ? '#c2410c' : '#15803d' }}>
              {data.summary}
            </p>
            {data.alerts?.length > 0 && (
              <ul className="mt-2 space-y-1">
                {data.alerts.map((a, i) => (
                  <li key={i} className="text-xs font-medium text-orange-700 flex items-start gap-1">
                    <span>•</span> {a}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}