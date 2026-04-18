import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import JobDetailView from './JobDetailView';

export default function JobPostings() {
  const [showModal, setShowModal] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    required_skills: '',
    experience_years: '',
    location: '',
    salary_range: ''
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await apiClient.get('/api/jobs');
        setJobs(res.data);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const skillsArray = newJob.required_skills.split(',').map(s => s.trim()).filter(s => s);
      const res = await apiClient.post('/api/jobs', {
        ...newJob,
        required_skills: skillsArray
      });
      setJobs([res.data.job, ...jobs]);
      setShowModal(false);
      setNewJob({ title: '', description: '', required_skills: '', experience_years: '', location: '', salary_range: '' });
    } catch (err) {
      console.error("Error creating job:", err);
      alert(err.response?.data?.error || "Error creating job");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center h-[60vh] flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin mb-4" />
        <div className="font-black text-slate-700 text-lg uppercase tracking-widest">Synchronizing Jobs...</div>
      </div>
    );
  }

  if (selectedJob) {
    return <JobDetailView job={selectedJob} onBack={() => setSelectedJob(null)} />;
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 p-1">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Job Postings</h2>
            <div className="bert-live-indicator">
              <div className="dot" /> BERT Engine Active
            </div>
          </div>
          <p className="text-slate-500 font-medium mt-1">Manage, monitor, and scale your technical hiring pipeline.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2 group"
          style={{ padding: '14px 28px' }}
        >
          <span className="text-xl group-hover:rotate-90 transition-transform duration-300">+</span>
          Create New Position
        </button>
      </div>

      {/* ── Jobs Grid ── */}
      <div className="grid grid-cols-1 gap-6">
        {jobs.length === 0 ? (
          <div className="card p-20 text-center flex flex-col items-center justify-center border-dashed border-2">
            <div className="text-6xl mb-6">📂</div>
            <h3 className="text-xl font-black text-slate-900 mb-2">No active job postings</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium">Your hiring pipeline is empty. Create your first job posting to start receiving AI-analyzed candidates.</p>
            <button
               onClick={() => setShowModal(true)}
               className="text-indigo-600 font-bold hover:underline"
            >
               Get started by creating a job posting →
            </button>
          </div>
        ) : (
          jobs.map((job) => {
            const applicantsCount = job.resumes_count || 0;
            const qualifiedCount = job.qualified_count || 0;
            const inProgressCount = job.in_progress_count || 0;

            return (
              <div 
                key={job.id} 
                onClick={() => setSelectedJob(job)}
                className="card card-interactive p-8 group flex flex-col md:flex-row justify-between gap-6"
              >
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                         <span className="text-sm font-bold text-slate-400 flex items-center gap-1.5">
                            📍 {job.location || 'Remote'}
                         </span>
                         <span className="w-1 h-1 bg-slate-200 rounded-full" />
                         <span className="text-sm font-bold text-slate-400 flex items-center gap-1.5">
                            💰 {job.salary_range || 'Competitive'}
                         </span>
                      </div>
                    </div>
                    <div className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] group-hover:text-indigo-400 transition-colors">
                      View Insights →
                    </div>
                  </div>
                  
                  <div className="flex gap-4 flex-wrap mt-6">
                    <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-indigo-50 border border-indigo-100">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                      <span className="text-xs font-black text-indigo-700 uppercase tracking-wider">{applicantsCount} Applicants</span>
                    </div>
                    <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-100">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <span className="text-xs font-black text-emerald-700 uppercase tracking-wider">{qualifiedCount} Qualified</span>
                    </div>
                    <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-100">
                      <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                      <span className="text-xs font-black text-amber-700 uppercase tracking-wider">{inProgressCount} Ready for Interview</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between items-end gap-4 border-l pl-8 border-slate-50 md:min-w-[140px]">
                   <div className="text-right">
                      <div className="text-2xl font-black text-slate-900">{Math.round((qualifiedCount / (applicantsCount || 1)) * 100)}%</div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Quality Score</div>
                   </div>
                   <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full animate-progress" style={{ width: `${(qualifiedCount / (applicantsCount || 1)) * 100}%` }} />
                   </div>
                   <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Updated {new Date(job.created_at).toLocaleDateString()}
                   </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Create Job Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in shadow-2xl">
          <div className="bg-white rounded-[2.5rem] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scale-in">
            {/* Header */}
            <div className="p-8 pb-4 border-b border-slate-50 bg-slate-50/50">
               <div className="flex justify-between items-start mb-2">
                 <div>
                   <span className="bert-badge mb-3 inline-block">Post New Role</span>
                   <h2 className="text-3xl font-black text-slate-900 tracking-tight">Define Opportunity</h2>
                 </div>
                 <button 
                   onClick={() => setShowModal(false)}
                   className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors shadow-sm"
                 >✕</button>
               </div>
               <p className="text-slate-500 font-medium">Define the core requirements for BERT to analyze potential candidates.</p>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto p-8 pt-6">
              <form onSubmit={handleCreateJob} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.15em] mb-2.5">Position Title</label>
                  <input
                    type="text"
                    required
                    className="w-full border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold focus:border-indigo-600 focus:outline-none transition-all"
                    value={newJob.title}
                    onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                    placeholder="e.g. Senior Software Engineer"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.15em] mb-2.5">Location</label>
                    <input
                      type="text"
                      className="w-full border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold focus:border-indigo-600 focus:outline-none transition-all"
                      value={newJob.location}
                      onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                      placeholder="e.g. Remote, New York"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.15em] mb-2.5">Experience Range</label>
                    <input
                      type="text"
                      className="w-full border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold focus:border-indigo-600 focus:outline-none transition-all"
                      value={newJob.experience_years}
                      onChange={(e) => setNewJob({...newJob, experience_years: e.target.value})}
                      placeholder="e.g. 5+ years"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.15em] mb-2.5">Salary Expectation</label>
                  <input
                    type="text"
                    className="w-full border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold focus:border-indigo-600 focus:outline-none transition-all"
                    value={newJob.salary_range}
                    onChange={(e) => setNewJob({...newJob, salary_range: e.target.value})}
                    placeholder="e.g. $140,000 - $180,000"
                  />
                </div>

                <div>
                   <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.15em] mb-2.5">Required Expertise (Keywords)</label>
                   <input
                     type="text"
                     className="w-full border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold focus:border-indigo-600 focus:outline-none transition-all"
                     value={newJob.required_skills}
                     onChange={(e) => setNewJob({...newJob, required_skills: e.target.value})}
                     placeholder="React, Node.js, Python, AWS (comma separated)"
                   />
                   <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-wide">BERT will use these for dense vector comparison.</p>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.15em] mb-2.5">Role Description & Narrative</label>
                  <textarea
                    required
                    rows="4"
                    className="w-full border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold focus:border-indigo-600 focus:outline-none transition-all resize-none"
                    value={newJob.description}
                    onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                    placeholder="Describe the role, impact, and technical ecosystem..."
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-8 py-4 text-slate-400 font-black text-sm hover:text-slate-900 transition-colors uppercase tracking-widest"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="btn-primary rounded-2xl px-12 py-4 shadow-xl"
                  >
                    {creating ? (
                      <span className="flex items-center gap-2">
                         <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                         Finalizing...
                      </span>
                    ) : 'Publish Position'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}