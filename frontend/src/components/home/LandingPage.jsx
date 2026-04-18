import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/* ─── Animated Counter ──────────────────────────────────── */
function Counter({ to, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef();
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const step = to / (duration / 16);
        const timer = setInterval(() => {
          start += step;
          if (start >= to) { setCount(to); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [to, duration]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ─── Neural Canvas Background ──────────────────────────── */
function NeuralCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animFrame;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const nodes = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(99,102,241,${0.12 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(99,102,241,0.25)';
        ctx.fill();
      });
      animFrame = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animFrame); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />;
}

/* ─── Feature Data ──────────────────────────────────────── */
const FEATURES = [
  {
    icon: '🤖', bert: true, color: 'indigo',
    title: 'AI Resume Screening',
    desc: 'BERT-powered NLP understands context & meaning — not just keywords.',
    tags: ['BERT', 'NLP', 'Semantic Search'],
  },
  {
    icon: '📊', bert: true, color: 'violet',
    title: 'Intelligent Candidate Ranking',
    desc: 'Automatic ranking with suitability scores based on skills & job relevance.',
    tags: ['Cosine Similarity', 'Scoring', 'Ranking'],
  },
  {
    icon: '⚖️', bert: true, color: 'cyan',
    title: 'Bias Detection & Fair Hiring',
    desc: 'Detects & reduces algorithmic bias for inclusive, fair recruitment.',
    tags: ['Fairness', 'Ethics', 'Inclusion'],
  },
  {
    icon: '🔍', bert: true, color: 'emerald',
    title: 'Explainable AI (XAI)',
    desc: 'Shows why a candidate is selected or rejected with full transparency.',
    tags: ['XAI', 'Transparency', 'Trust'],
  },
  {
    icon: '📂', bert: false, color: 'sky',
    title: 'Resume Parsing & Extraction',
    desc: 'Extracts skills, experience, education — converts resumes to structured data.',
    tags: ['NER', 'Parsing', 'Data'],
  },
  {
    icon: '👩‍💻', bert: false, color: 'violet',
    title: 'Web-Based Dashboard',
    desc: 'Upload resumes, view rankings, and track the entire hiring pipeline.',
    tags: ['React.js', 'Dashboard', 'UX'],
  },
  {
    icon: '🔐', bert: false, color: 'rose',
    title: 'Secure Role-Based Access',
    desc: 'Login system with role-based access control and data encryption.',
    tags: ['JWT', 'Auth', 'Encryption'],
  },
  {
    icon: '📈', bert: true, color: 'amber',
    title: 'Fairness Analytics & Reports',
    desc: 'Generate fairness metrics reports to monitor unbiased decisions.',
    tags: ['Analytics', 'Metrics', 'Reports'],
  },
  {
    icon: '⚙️', bert: false, color: 'slate',
    title: 'Full Stack Architecture',
    desc: 'React frontend, Node/Python backend, MySQL/MongoDB database.',
    tags: ['React', 'Python', 'MongoDB'],
  },
  {
    icon: '🏆', bert: true, color: 'indigo',
    title: 'Advanced AI Features',
    desc: 'Candidate comparison, activity logs, and one-click export results.',
    tags: ['Comparison', 'Logs', 'Export'],
  },
];

const COLOR_MAP = {
  indigo:  { bg: '#eef2ff', text: '#4338ca', ring: '#c7d2fe' },
  violet:  { bg: '#f5f3ff', text: '#6d28d9', ring: '#ddd6fe' },
  cyan:    { bg: '#ecfeff', text: '#0e7490', ring: '#a5f3fc' },
  emerald: { bg: '#ecfdf5', text: '#065f46', ring: '#6ee7b7' },
  sky:     { bg: '#f0f9ff', text: '#0369a1', ring: '#bae6fd' },
  rose:    { bg: '#fff1f2', text: '#be123c', ring: '#fecdd3' },
  amber:   { bg: '#fffbeb', text: '#92400e', ring: '#fde68a' },
  slate:   { bg: '#f8fafc', text: '#334155', ring: '#cbd5e1' },
};

/* ─── Landing Page ──────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [activeFeature, setActiveFeature] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'recruiter' ? '/recruiter' : '/candidate');
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ── Background ────────────────────────────────── */}
      <div className="fixed inset-0 hero-grid" style={{ background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 50%, #faf5ff 100%)' }} />
      <NeuralCanvas />

      {/* ── Topbar ────────────────────────────────────── */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-16 py-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg"
               style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            SH
          </div>
          <span className="font-black text-xl text-slate-900 tracking-tight">SmartHire <span className="gradient-text">AI</span></span>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <div className="bert-live-indicator">
            <div className="dot" />
            BERT Engine Active
          </div>
          <button onClick={() => navigate('/login?role=recruiter')}
            className="btn-primary text-sm px-5 py-2 rounded-xl">
            Launch Platform →
          </button>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-16 pt-16 pb-20 text-center">
        <div className="animate-fade-up">
          <span className="bert-badge mb-6 inline-block">BERT · NLP · Explainable AI</span>

          <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-none tracking-tight mb-6">
            Hire Smarter<br />
            <span className="gradient-text">with AI</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            SmartHire AI uses <strong className="text-indigo-700">BERT-powered NLP</strong> to screen resumes,
            rank candidates, detect bias, and explain every AI decision — all in one platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={() => navigate('/login?role=recruiter')}
              className="group flex items-center gap-3 text-white px-8 py-4 rounded-2xl font-bold text-base shadow-xl transition-all duration-300 hover:-translate-y-1"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 8px 30px rgba(99,102,241,0.4)' }}
            >
              <span className="text-xl">👩‍💼</span>
              Enter as Recruiter
              <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
            </button>
            <button
              onClick={() => navigate('/login?role=candidate')}
              className="group flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-base border-2 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              style={{ borderColor: '#c7d2fe', color: '#4338ca' }}
            >
              <span className="text-xl">👨‍💻</span>
              Enter as Candidate
              <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { label: 'Resumes Analyzed', value: 12800, suffix: '+' },
              { label: 'AI Decisions Made', value: 98, suffix: '%  Accurate' },
              { label: 'Bias Reduction', value: 94, suffix: '%' },
              { label: 'Time Saved', value: 73, suffix: '%' },
            ].map((s, i) => (
              <div key={i} className="glass rounded-2xl p-4 text-center" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="text-2xl font-black gradient-text">
                  <Counter to={s.value} suffix={s.suffix} />
                </div>
                <div className="text-xs font-semibold text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Simple Logic Explanation ──────────────────── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 mb-20 text-center">
         <div className="card p-10 bg-white/60 backdrop-blur-md border border-slate-100 shadow-2xl shadow-indigo-100/30 rounded-[2.5rem]">
            <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center justify-center gap-3 tracking-tight">
               <span>🧠</span> The Logic Behind SmartHire <span className="text-indigo-600">AI</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-10 text-left">
               <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-xl shadow-sm">🔍</div>
                  <h4 className="font-black text-slate-900 leading-tight">Beyond Keywords</h4>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                     Traditional tools search for words like "Python" or "React". Our AI understands <strong>meaning</strong>. 
                     If you describe a complex project, it knows you have the skills even if you don't list them as a buzzword.
                  </p>
               </div>
               <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-xl shadow-sm">⚖️</div>
                  <h4 className="font-black text-slate-900 leading-tight">Fairness First</h4>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                     The AI is designed to ignore your name, gender, or age. It focuses purely on your <strong>professional merit</strong> and <strong>context</strong>, 
                     ensuring everyone gets a fair shot based on their actual ability.
                  </p>
               </div>
            </div>
         </div>
      </section>

      {/* ── BERT Pipeline Visual ──────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-16 pb-20">
        <div className="rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0d1117, #0f172a, #1a1033)', border: '1px solid #21262d' }}>
          <div className="p-8 md:p-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                   style={{ background: 'linear-gradient(135deg, #0e7490, #06b6d4)' }}>🧠</div>
              <div>
                <div className="text-white font-black text-xl">BERT Processing Pipeline</div>
                <div className="text-slate-400 text-sm">How every resume is analyzed with deep semantic understanding</div>
              </div>
              <div className="ml-auto bert-live-indicator" style={{ background: 'rgba(6,182,212,0.1)', color: '#22d3ee', borderColor: 'rgba(6,182,212,0.3)' }}>
                <div className="dot" style={{ background: '#22d3ee' }} />
                Live Engine
              </div>
            </div>

            {/* Pipeline Steps */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { step: '01', icon: '📤', label: 'Resume Upload', desc: 'PDF/DOCX ingestion', color: '#6366f1' },
                { step: '02', icon: '🔍', label: 'NLP Parsing', desc: 'Skills & Entity extraction', color: '#8b5cf6' },
                { step: '03', icon: '⬡', label: 'BERT Embeddings', desc: '384-dim vectors', color: '#06b6d4' },
                { step: '04', icon: '📐', label: 'Cosine Similarity', desc: 'Job–resume matching', color: '#10b981' },
                { step: '05', icon: '📊', label: 'Score & Rank', desc: 'XAI explanation', color: '#f59e0b' },
              ].map((p, i) => (
                <div key={i} className="relative text-center p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {i < 4 && (
                    <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 text-slate-600 font-bold">→</div>
                  )}
                  <div className="text-xs font-black mb-2" style={{ color: p.color }}>{p.step}</div>
                  <div className="text-2xl mb-2">{p.icon}</div>
                  <div className="text-white font-bold text-sm mb-1">{p.label}</div>
                  <div className="text-slate-400 text-xs">{p.desc}</div>
                </div>
              ))}
            </div>

            {/* Live log */}
            <div className="terminal mt-8 h-32">
              <div className="t-info">[SYS] SmartHire AI BERT Engine v3.1 — Ready</div>
              <div className="t-success">[BERT] Loading sentence-transformers/all-MiniLM-L6-v2... <span className="t-white">COMPLETE</span></div>
              <div className="t-bert">[NER]  Extracting named entities from resume batch (14 files)...</div>
              <div className="t-success">[EMBED] Generating 384-dimension semantic vectors... <span className="t-white">OK</span></div>
              <div className="t-bert">[MATCH] Cosine similarity score: <span className="t-white">0.8742</span> — Rank #1 → Shortlisted</div>
              <div className="t-warn">[XAI]  Generating explanation: Skills matched 94% | Experience +3yr above threshold</div>
              <div className="terminal-cursor t-info">[BIAS]  Running fairness check...&nbsp;</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Grid ─────────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-16 pb-24">
        <div className="text-center mb-14">
          <span className="bert-badge mb-4 inline-block">All Features</span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Everything Powered by AI
          </h2>
          <p className="text-slate-500 text-lg mt-4 max-w-xl mx-auto">
            10 intelligent features working together to make hiring fair, fast, and transparent.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => {
            const cols = COLOR_MAP[f.color] || COLOR_MAP.indigo;
            return (
              <div
                key={i}
                className="feature-card cursor-pointer animate-fade-up"
                style={{ animationDelay: `${i * 0.06}s` }}
                onMouseEnter={() => setActiveFeature(i)}
                onMouseLeave={() => setActiveFeature(null)}
              >
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-transform duration-300"
                       style={{ background: cols.bg, border: `1px solid ${cols.ring}`, transform: activeFeature === i ? 'scale(1.1)' : 'scale(1)' }}>
                    {f.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 text-base leading-tight">{f.title}</h3>
                      {f.bert && <span className="bert-badge" style={{ fontSize: '9px', padding: '2px 7px' }}>BERT</span>}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-500 text-sm leading-relaxed mb-4">{f.desc}</p>

                {/* Tech Tags */}
                <div className="flex flex-wrap gap-2">
                  {f.tags.map((t, j) => (
                    <span key={j} className="tag" style={{ background: cols.bg, color: cols.text, border: `1px solid ${cols.ring}` }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Role Selection CTA ────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-16 pb-24">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recruiter */}
          <button
            onClick={() => navigate('/login?role=recruiter')}
            className="group text-left p-8 rounded-3xl transition-all duration-300 hover:-translate-y-2"
            style={{ background: 'linear-gradient(135deg, #4338ca, #6366f1)', boxShadow: '0 8px 32px rgba(99,102,241,0.35)' }}
          >
            <div className="text-4xl mb-5">👩‍💼</div>
            <h3 className="text-2xl font-black text-white mb-2">Recruiter Portal</h3>
            <p className="text-indigo-200 text-sm font-medium mb-6 leading-relaxed">
              Upload resumes, run BERT screening, view ranked candidates, detect bias, and export reports.
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {['AI Screening', 'Candidate Ranking', 'Bias Detection', 'XAI Reports'].map(t => (
                <span key={t} className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>{t}</span>
              ))}
            </div>
            <div className="flex items-center gap-2 text-white font-bold">
              Enter as Recruiter
              <span className="group-hover:translate-x-2 transition-transform inline-block">→</span>
            </div>
          </button>

          {/* Candidate */}
          <button
            onClick={() => navigate('/login?role=candidate')}
            className="group text-left p-8 rounded-3xl border-2 bg-white transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            style={{ borderColor: '#e0e7ff' }}
          >
            <div className="text-4xl mb-5">👨‍💻</div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Candidate Portal</h3>
            <p className="text-slate-500 text-sm font-medium mb-6 leading-relaxed">
              Browse jobs, upload your resume, get AI match scores, and track your application pipeline.
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {['Job Matching', 'AI Score', 'Resume Upload', 'Application Tracking'].map(t => (
                <span key={t} className="tag tag-brand">{t}</span>
              ))}
            </div>
            <div className="flex items-center gap-2 font-bold text-indigo-700">
              Enter as Candidate
              <span className="group-hover:translate-x-2 transition-transform inline-block">→</span>
            </div>
          </button>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────── */}
      <footer className="relative z-10 border-t py-8 text-center" style={{ borderColor: '#e2e8f0' }}>
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-xs"
               style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>SH</div>
          <span className="font-bold text-slate-700">SmartHire AI</span>
          <span className="bert-badge" style={{ fontSize: '9px' }}>BERT Powered</span>
        </div>
        <p className="text-slate-400 text-xs font-medium">
          Secure AI-Driven Recruitment Platform © 2026 — Built with React · Python · BERT · NLP
        </p>
      </footer>

      <style>{`
        @keyframes progressFill { from { width: 0; } }
      `}</style>
    </div>
  );
}
