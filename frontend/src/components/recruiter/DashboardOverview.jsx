import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';

/* ─── Stat Card ─────────────────────────────────────────── */
function StatCard({ icon, label, value, color, bert, trend }) {
  const colors = {
    indigo: { bg: '#eef2ff', text: '#4338ca', ring: '#c7d2fe', icon_bg: '#6366f1' },
    violet: { bg: '#f5f3ff', text: '#6d28d9', ring: '#ddd6fe', icon_bg: '#8b5cf6' },
    emerald:{ bg: '#ecfdf5', text: '#065f46', ring: '#6ee7b7', icon_bg: '#10b981' },
    amber:  { bg: '#fffbeb', text: '#92400e', ring: '#fde68a', icon_bg: '#f59e0b' },
    cyan:   { bg: '#ecfeff', text: '#0e7490', ring: '#a5f3fc', icon_bg: '#06b6d4' },
  };
  const c = colors[color] || colors.indigo;
  return (
    <div className="card card-interactive p-5 animate-fade-up">
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-sm"
             style={{ background: c.bg, border: `1px solid ${c.ring}` }}>
          {icon}
        </div>
        {bert && <span className="bert-badge">BERT</span>}
        {trend && (
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <div className="text-3xl font-black mb-1" style={{ color: c.text }}>{value}</div>
      <div className="text-sm font-semibold text-slate-500">{label}</div>
    </div>
  );
}

/* ─── Mini Score Bar ────────────────────────────────────── */
function ScoreBar({ score }) {
  const pct = Math.min(100, Math.max(0, score || 0));
  const color = pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 progress-bar">
        <div className="progress-fill animate-progress" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-bold tabular-nums" style={{ color, minWidth: '32px', textAlign: 'right' }}>{pct}%</span>
    </div>
  );
}

/* ─── Dashboard Overview ────────────────────────────────── */
export default function DashboardOverview() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({ activeJobs: 0, totalApplicants: 0, qualifiedCandidates: 0, inInterview: 0 });
  const [topCandidates, setTopCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [jobsRes, statsRes] = await Promise.all([
          apiClient.get('/api/jobs'),
          apiClient.get('/api/jobs/stats'),
        ]);
        setJobs(jobsRes.data);
        setStats(statsRes.data);

        let allResumes = [];
        const jobsToFetch = jobsRes.data.slice(0, 5);
        for (const job of jobsToFetch) {
          const resumesRes = await apiClient.get(`/api/resumes/job/${job.id}`);
          allResumes = [...allResumes, ...resumesRes.data.map(r => ({ ...r, jobTitle: job.title }))];
        }
        allResumes.sort((a, b) => (b.score || 0) - (a.score || 0));
        setTopCandidates(allResumes.slice(0, 5));
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-5 h-28">
              <div className="skeleton h-4 w-24 mb-3" />
              <div className="skeleton h-8 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── BERT Status Strip ────────────────────────── */}
      <div className="rounded-2xl p-4 flex items-center gap-4 animate-fade-up"
           style={{ background: 'linear-gradient(135deg, #ecfeff, #f0f9ff)', border: '1px solid #a5f3fc' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
             style={{ background: 'linear-gradient(135deg, #0e7490, #06b6d4)' }}>🧠</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-black text-cyan-900 text-sm">BERT Engine Status</span>
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bert-pulse" />
            <span className="text-xs font-bold text-cyan-600">Online</span>
          </div>
          <p className="text-xs text-cyan-600 font-medium mt-0.5">
            Sentence-transformers model loaded · 384-dim embeddings · Cosine similarity scoring active
          </p>
        </div>
        <div className="hidden md:flex items-center gap-6 text-right shrink-0">
          <div>
            <div className="text-lg font-black text-cyan-900">{stats.totalApplicants || 0}</div>
            <div className="text-[10px] font-bold text-cyan-500 uppercase tracking-wider">Analyzed</div>
          </div>
          <div>
            <div className="text-lg font-black text-cyan-900">~{Math.round((stats.totalApplicants || 0) * 0.4)}h</div>
            <div className="text-[10px] font-bold text-cyan-500 uppercase tracking-wider">Time Saved</div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ───────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="💼" label="Active Jobs"         value={stats.activeJobs}          color="indigo" trend="+2 this week" />
        <StatCard icon="📄" label="Total Applicants"    value={stats.totalApplicants}      color="violet" bert />
        <StatCard icon="⭐" label="Qualified (AI)"      value={stats.qualifiedCandidates}  color="emerald" bert />
        <StatCard icon="🎯" label="In Interview"        value={stats.inInterview}          color="amber" />
      </div>

      {/* ── Main Columns ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Job Postings */}
        <div className="card p-6 animate-fade-up stagger-2">
          <h2 className="text-base font-extrabold text-slate-900 mb-5 flex items-center gap-2">
            <span className="text-lg">📋</span> Recent Job Postings
            <span className="ml-auto text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: '#eef2ff', color: '#4338ca' }}>
              {jobs.length} total
            </span>
          </h2>
          <div className="space-y-3">
            {jobs.length === 0 ? (
              <div className="text-center py-8 text-slate-400 font-medium text-sm">
                <div className="text-3xl mb-2">📭</div>
                No jobs posted yet
              </div>
            ) : jobs.slice(0, 4).map((job) => {
              const diffTime = Math.abs(new Date() - new Date(job.created_at));
              const daysAgo = Math.floor(diffTime / (1000 * 60 * 60 * 24));
              return (
                <div 
                  key={job.id} 
                  onClick={() => navigate('/recruiter/jobs')}
                  className="p-4 rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-white"
                  style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-sm truncate">{job.title}</h3>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        {daysAgo === 0 ? 'Posted today' : `${daysAgo}d ago`}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-3 shrink-0">
                      <span className="tag tag-green">{job.resumes_count || 0} applied</span>
                      <span className="tag tag-brand">{job.qualified_count || 0} AI picks</span>
                    </div>
                  </div>
                  {(job.required_skills || []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {(job.required_skills || []).slice(0, 4).map((s, i) => (
                        <span key={i} className="tag tag-gray">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Top AI-Ranked Candidates */}
        <div className="card p-6 animate-fade-up stagger-3">
          <h2 className="text-base font-extrabold text-slate-900 mb-5 flex items-center gap-2">
            <span className="text-lg">🏆</span> Top AI-Ranked Candidates
            <span className="bert-badge ml-auto">BERT</span>
          </h2>
          <div className="space-y-3">
            {topCandidates.length === 0 ? (
              <div className="text-center py-8 text-slate-400 font-medium text-sm">
                <div className="text-3xl mb-2">🤖</div>
                No candidates evaluated yet.<br/>
                <span className="text-xs">Upload resumes in AI Screening to get started.</span>
              </div>
            ) : topCandidates.map((c, idx) => {
              const score = Math.round(c.score || 0);
              return (
                <div 
                  key={c.id} 
                  onClick={() => navigate('/recruiter/candidates')}
                  className="p-4 rounded-2xl transition-all duration-200 hover:shadow-md cursor-pointer hover:bg-white"
                  style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {/* Rank Badge */}
                    <div className="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0"
                         style={idx === 0 ? { background: '#fef3c7', color: '#92400e' } :
                                idx === 1 ? { background: '#f1f5f9', color: '#475569' } :
                                            { background: '#fff7ed', color: '#9a3412' }}>
                      #{idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900 text-sm">{c.name}</div>
                      <div className="text-xs text-slate-400">{c.jobTitle}</div>
                    </div>
                    <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-black text-xs border-2"
                         style={score >= 75 ? { background: '#f0fdf4', color: '#15803d', borderColor: '#86efac' } :
                                score >= 50 ? { background: '#fefce8', color: '#854d0e', borderColor: '#fde047' } :
                                             { background: '#fef2f2', color: '#991b1b', borderColor: '#fca5a5' }}>
                      {score}%
                    </div>
                  </div>
                  <ScoreBar score={score} />
                  {(c.skills || []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(c.skills || []).slice(0, 3).map((s, i) => (
                        <span key={i} className="tag tag-brand">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── AI Feature Quick Access ───────────────────── */}
      <div className="card p-6 animate-fade-up stagger-4">
        <h2 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
          <span className="text-lg">⚡</span> AI Feature Quick Access
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: '🤖', label: 'Run AI Screening',   sub: 'BERT resume analysis',    tab: 'screening', bert: true, color: '#6366f1' },
            { icon: '👥', label: 'View Rankings',       sub: 'Candidate suitability',   tab: 'candidates', bert: true, color: '#8b5cf6' },
            { icon: '⚖️', label: 'Bias Report',         sub: 'Fairness metrics',        tab: 'fairness', bert: true, color: '#06b6d4' },
            { icon: '📥', label: 'Export Reports',      sub: 'Download data',           tab: 'export', bert: false, color: '#10b981' },
          ].map((item, i) => (
            <div key={i} 
                 onClick={() => navigate(`/recruiter/${item.tab}`)}
                 className="p-4 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                 style={{ background: `${item.color}0d`, border: `1px solid ${item.color}20` }}>
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="font-bold text-slate-900 text-sm">{item.label}</span>
                {item.bert && <span className="bert-badge" style={{ fontSize: '8px', padding: '1px 5px' }}>BERT</span>}
              </div>
              <div className="text-xs text-slate-400">{item.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
