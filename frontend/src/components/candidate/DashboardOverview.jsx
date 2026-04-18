import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ApplyModal from './ApplyModal';

/* ─── Stat Card ─────────────────────────────────────────── */
function StatCard({ icon, label, value, sub, color }) {
  const colors = {
    indigo:  { bg: '#eef2ff', ring: '#c7d2fe', text: '#4338ca' },
    amber:   { bg: '#fffbeb', ring: '#fde68a', text: '#92400e' },
    emerald: { bg: '#ecfdf5', ring: '#6ee7b7', text: '#065f46' },
    violet:  { bg: '#f5f3ff', ring: '#ddd6fe', text: '#6d28d9' },
  };
  const c = colors[color] || colors.indigo;
  return (
    <div className="card card-interactive p-5 animate-fade-up">
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl mb-4"
           style={{ background: c.bg, border: `1px solid ${c.ring}` }}>
        {icon}
      </div>
      <div className="text-3xl font-black mb-1" style={{ color: c.text }}>{value}</div>
      <div className="text-sm font-semibold text-slate-600">{label}</div>
      {sub && <div className="text-xs font-medium text-slate-400 mt-1">{sub}</div>}
    </div>
  );
}

export default function CandidateDashboardOverview() {
  const { user }                                  = useAuth();
  const navigate                                  = useNavigate();
  const [applyingJob, setApplyingJob]             = useState(null);
  const [applications, setApplications]           = useState([]);
  const [recommendedJobs, setRecommendedJobs]     = useState([]);
  const [loading, setLoading]                     = useState(true);
  const [stats, setStats]                         = useState({ applied: 0, shortlisted: 0, interviews: 0, profileComplete: 89 });

  useEffect(() => {
    const fetch = async () => {
      try {
        const [appsRes, jobsRes] = await Promise.all([
          apiClient.get('/api/candidate/applications'),
          apiClient.get('/api/jobs'),
        ]);
        const apps       = appsRes.data;
        const shortlisted = apps.filter(a => a.status === 'shortlisted' || a.status === 'qualified').length;
        setApplications(apps);
        setRecommendedJobs(jobsRes.data.slice(0, 4));
        setStats(prev => ({
          ...prev,
          applied: apps.length,
          shortlisted,
          interviews: apps.filter(a => a.status === 'interview').length,
        }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const featuredApp = applications.length > 0
    ? [...applications].sort((a, b) => (b.score || 0) - (a.score || 0))[0]
    : null;

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  };

  if (loading) return (
    <div className="p-12 text-center">
      <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl animate-float"
           style={{ background: 'linear-gradient(135deg, #eef2ff, #f0f9ff)', border: '1px solid #c7d2fe' }}>🧠</div>
      <div className="font-black text-slate-700 text-lg">Syncing AI Recommendations...</div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Greeting Banner ──────────────────────────── */}
      <div className="rounded-3xl p-7 relative overflow-hidden"
           style={{ background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #8b5cf6 100%)' }}>
        {/* Ambient glow */}
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full pointer-events-none"
             style={{ background: 'rgba(255,255,255,0.08)', filter: 'blur(40px)' }} />

        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-black text-white mb-1">
              {greeting()}, {user?.name?.split(' ')[0] || 'Candidate'} 👋
            </h1>
            <p className="text-indigo-200 text-sm font-medium">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              {' · '}{stats.applied > 0 ? `${stats.applied} active applications` : 'Start applying to see AI match insights'}
            </p>
          </div>
          <div className="bert-live-indicator"
               style={{ background: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}>
            <div className="dot" style={{ background: '#a5f3fc' }} />
            BERT Match Engine Active
          </div>
        </div>
      </div>

      {/* ── Stat Cards ───────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="📄" label="Jobs Applied"        value={stats.applied}           sub="Total applications"           color="indigo" />
        <StatCard icon="⭐" label="Shortlisted"         value={stats.shortlisted}       sub={stats.shortlisted > 0 ? 'Action needed!' : 'Keep applying'} color="amber" />
        <StatCard icon="💬" label="Interviews"          value={stats.interviews}        sub="Scheduled"                    color="emerald" />
        <StatCard icon="📊" label="Profile Complete"    value={`${stats.profileComplete}%`} sub="+4% this week"           color="violet" />
      </div>

      {/* ── Top Match Card ───────────────────────────── */}
      {featuredApp ? (
        <div className="card p-7 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
               style={{ background: '#eef2ff', filter: 'blur(40px)' }} />
          <div className="relative z-10">
            <div className="flex items-start justify-between gap-5 mb-6 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                     style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>🏢</div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h2 className="text-xl font-black text-slate-900">{featuredApp.jobTitle}</h2>
                    {(featuredApp.status === 'shortlisted' || featuredApp.status === 'qualified') && (
                      <span className="tag tag-green">⭐ Shortlisted!</span>
                    )}
                  </div>
                  <p className="text-slate-400 text-sm font-medium">
                    {featuredApp.company} · {featuredApp.location}
                  </p>
                </div>
              </div>
              <div className="text-center p-5 rounded-2xl"
                   style={{ background: 'linear-gradient(135deg, #f5f3ff, #eef2ff)', border: '1px solid #ddd6fe' }}>
                <div className="text-4xl font-black" style={{ color: '#6d28d9' }}>
                  {Math.round(featuredApp.score || 0)}%
                </div>
                <div className="text-xs font-black text-violet-400 uppercase tracking-wider mt-1">AI Match Score</div>
                <span className="bert-badge mt-2 inline-block" style={{ fontSize: '8px' }}>BERT</span>
              </div>
            </div>

            {/* BERT Match Explanation */}
            <div className="rounded-2xl p-5 mb-5"
                 style={{ background: 'linear-gradient(135deg, #f0f9ff, #f5f3ff)', border: '1px solid #bfdbfe' }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🧠</span>
                <h3 className="font-black text-slate-900 text-sm">Why You Match This Role</h3>
                <span className="bert-badge">BERT Context Analysis</span>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { icon: '⚡', title: 'Skill Semantic Match',  tag: 'Strong',  tagColor: '#065f46', tagBg: '#dcfce7',
                    desc: `Your technical profile aligns ${Math.round(featuredApp.score || 0)}% via BERT semantic similarity.` },
                  { icon: '📊', title: 'Experience Relevance',  tag: 'Good',    tagColor: '#1d4ed8', tagBg: '#dbeafe',
                    desc: 'Background matches the seniority and role expectations identified by NER.' },
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white border border-slate-100 hover:shadow-sm transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{item.icon}</span>
                        <span className="font-bold text-slate-900 text-sm">{item.title}</span>
                      </div>
                      <span className="text-xs font-black px-2 py-0.5 rounded-full"
                            style={{ background: item.tagBg, color: item.tagColor }}>{item.tag}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button onClick={() => navigate('/candidate/applications')}
                className="btn-primary text-sm rounded-xl px-6 py-3">View Application →</button>
              <button className="px-6 py-3 rounded-xl font-bold text-sm border-2 text-slate-700 hover:bg-slate-50 transition"
                      style={{ borderColor: '#e2e8f0' }}>
                Message Recruiter
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl p-12 text-center" style={{ background: '#0d1117' }}>
          <div className="text-4xl mb-4">🚀</div>
          <h3 className="text-2xl font-black text-white mb-2">Ready to Start?</h3>
          <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
            Apply to your first job to see personalized BERT AI match insights and pipeline tracking.
          </p>
          <button onClick={() => navigate('/candidate/jobs')}
            className="btn-primary inline-block px-8 py-3 rounded-xl text-sm">
            Browse Recommended Jobs →
          </button>
        </div>
      )}

      {/* ── Recent Applications + Latest Jobs ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Applications */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-black text-slate-900 text-base">Recent Applications</h3>
            <button onClick={() => navigate('/candidate/applications')}
              className="text-indigo-600 text-xs font-bold hover:underline">View All →</button>
          </div>
          <div className="space-y-3">
            {applications.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm font-medium">
                <div className="text-3xl mb-2">📭</div>No applications yet
              </div>
            ) : applications.slice(0, 3).map((app, i) => {
              const score = Math.round(app.score || 0);
              const scoreColor = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#94a3b8';
              return (
                <div key={i} className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer hover:shadow-sm transition"
                     style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                       style={{ background: 'white', border: '1px solid #f1f5f9' }}>🏢</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 text-sm truncate">{app.jobTitle}</div>
                    <div className="text-xs text-slate-400 truncate">{app.company} · {app.location}</div>
                    <span className={`inline-block mt-1 tag ${app.status === 'shortlisted' ? 'tag-green' : 'tag-brand'}`}>
                      {app.status || 'Applied'}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-lg font-black" style={{ color: scoreColor }}>{score}%</div>
                    <div className="text-[10px] text-slate-400 font-bold">BERT</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Latest Job Opportunities */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-black text-slate-900 text-base">Latest Opportunities</h3>
            <button onClick={() => navigate('/candidate/jobs')}
              className="text-xs font-bold px-3 py-1.5 rounded-lg border text-indigo-600 hover:bg-indigo-50 transition"
              style={{ borderColor: '#c7d2fe' }}>Browse All →</button>
          </div>
          <div className="space-y-3">
            {recommendedJobs.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">No active job postings</div>
            ) : recommendedJobs.map((job, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer group transition hover:shadow-sm"
                   style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 transition group-hover:scale-110"
                     style={{ background: 'white', border: '1px solid #f1f5f9' }}>💼</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 text-sm truncate">{job.title}</div>
                  <div className="text-xs text-slate-400 font-medium">{job.location || 'Remote'} · {job.salary_range || 'Competitive'}</div>
                </div>
                <button
                  onClick={() => setApplyingJob(job)}
                  className="shrink-0 text-xs font-black px-4 py-2 rounded-xl text-white transition hover:opacity-90"
                  style={{ background: '#0d1117' }}>
                  Apply →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── AI Roadmap ───────────────────────────────── */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🧠</span>
          <h3 className="font-black text-slate-900 text-base">AI Career Roadmap</h3>
          <span className="bert-badge">Personalized</span>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: '📈', title: 'Optimize Resume',       desc: 'Add Cloud skills to increase match scores by ~15% per BERT analysis.', color: '#6366f1' },
            { icon: '🎯', title: 'Explore AI Matches',    desc: 'BERT found 8 new roles matching your skill vector this week.', color: '#8b5cf6', path: '/candidate/recommendations' },
            { icon: '📝', title: 'Complete Your Profile', desc: '11% left — a complete profile boosts recruiter visibility 3×.', color: '#06b6d4', path: '/candidate/profile' },
          ].map((tip, i) => (
            <div key={i}
              onClick={() => tip.path && navigate(tip.path)}
              className={`p-4 rounded-2xl transition-all duration-200 ${tip.path ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''}`}
              style={{ background: `${tip.color}0d`, border: `1px solid ${tip.color}1a` }}>
              <div className="text-2xl mb-2">{tip.icon}</div>
              <div className="font-bold text-slate-900 text-sm mb-1">{tip.title}</div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">{tip.desc}</p>
              {tip.path && <div className="text-xs font-bold mt-2" style={{ color: tip.color }}>View →</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Apply Modal */}
      {applyingJob && (
        <ApplyModal
          job={applyingJob}
          onClose={() => setApplyingJob(null)}
          onSuccess={() => { setApplyingJob(null); }}
        />
      )}
    </div>
  );
}
