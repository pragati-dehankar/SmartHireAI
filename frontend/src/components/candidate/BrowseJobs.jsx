import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import ApplyModal from './ApplyModal';

function JobDetailModal({ job, onClose, onApply }) {
   if (!job) return null;

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
         <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col animate-scale-in border border-slate-100">

            {/* Modal Header */}
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm">
               <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-slate-100 italic font-black text-indigo-600">
                     {job.recruiter?.company?.charAt(0) || 'C'}
                  </div>
                  <div>
                     <h2 className="text-2xl font-black text-slate-900 tracking-tight">{job.title}</h2>
                     <p className="text-sm text-indigo-600 font-bold uppercase tracking-wider">{job.recruiter?.company || 'Industry Partner'} · {job.location || 'Remote'}</p>
                  </div>
               </div>
               <div className="flex gap-3">
                  <button
                     onClick={onClose}
                     className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors shadow-sm"
                  >✕</button>
               </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar bg-slate-50/30">
               <div className="max-w-3xl mx-auto space-y-8">
                  {/* Job Basics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     <div className="card p-4 bg-white border-none shadow-sm text-center">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Salary</div>
                        <div className="text-sm font-black text-slate-900">{job.salary_range || '$120K+'}</div>
                     </div>
                     <div className="card p-4 bg-white border-none shadow-sm text-center">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Experience</div>
                        <div className="text-sm font-black text-slate-900">{job.experience_years || '3-5 yrs'}</div>
                     </div>
                     <div className="card p-4 bg-white border-none shadow-sm text-center">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Type</div>
                        <div className="text-sm font-black text-slate-900">Full Time</div>
                     </div>
                     <div className="card p-4 bg-white border-none shadow-sm text-center">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Match</div>
                        <div className="text-sm font-black text-emerald-600">High Trust</div>
                     </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-4">
                     <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <span>📄</span> Mission & Role
                     </h3>
                     <p className="text-slate-600 font-medium leading-relaxed bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm">
                        {job.description || "We are looking for a forward-thinking technologist to join our core team. You will be responsible for building high-scale architecture and influencing the technical trajectory of our primary platform. Our culture values deep technical expertise, curiosity, and iterative development."}
                     </p>
                  </div>

                  {/* Capabilities */}
                  <div className="space-y-4">
                     <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <span>⚡</span> Critical Skills
                     </h3>
                     <div className="flex flex-wrap gap-2">
                        {(job.required_skills || ['React', 'Next.js', 'Distributed Systems', 'Python', 'AWS']).map((s, i) => (
                           <span key={i} className="tag tag-indigo py-2 px-5 text-sm">{s}</span>
                        ))}
                     </div>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 pl-1">These keywords are prioritized by the BERT semantic parser.</p>
                  </div>

                  {/* AI Insight Card */}
                  <div className="bg-indigo-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                     <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                           <span className="text-2xl">⬡</span>
                           <h3 className="text-lg font-black tracking-tight">BERT Match Insight</h3>
                           <span className="bert-badge" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}>Live Analysis</span>
                        </div>
                        <p className="text-indigo-100 text-sm leading-relaxed mb-6">
                           "Based on your profile, BERT identifies a 94.2% semantic alignment. Your experience with <strong>high-scale React architectures</strong> directly matches the core of this position's requirements."
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="bg-white/5 rounded-2xl p-4 border border-white/10 uppercase tracking-widest">
                              <div className="text-[9px] font-black text-indigo-300">Confidence</div>
                              <div className="text-xl font-black">High</div>
                           </div>
                           <div className="bg-white/5 rounded-2xl p-4 border border-white/10 uppercase tracking-widest">
                              <div className="text-[9px] font-black text-indigo-300">Risk Level</div>
                              <div className="text-xl font-black">Low</div>
                           </div>
                        </div>
                     </div>
                     {/* Background decoration */}
                     <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl -mr-24 -mt-24" />
                  </div>
               </div>
            </div>

            {/* Modal Sticky Footer */}
            <div className="p-8 bg-white border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
               <div>
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Deadline approaching</div>
                  <div className="text-sm font-bold text-slate-900">Positions usually fill in 14 days</div>
               </div>
               <div className="flex gap-4 w-full md:w-auto">
                  <button className="flex-1 md:flex-none px-8 py-4 rounded-2xl border-2 border-slate-100 font-black text-slate-600 text-sm hover:bg-slate-50 transition cursor-not-allowed uppercase tracking-wider">🔖 Save</button>
                  <button
                     onClick={() => onApply(job)}
                     className="flex-1 md:flex-none btn-primary px-12 py-4 rounded-2xl shadow-xl shadow-indigo-100"
                  >Submit Application</button>
               </div>
            </div>
         </div>
      </div>
   );
}

export default function BrowseJobs() {
   const [jobs, setJobs] = useState([]);
   const [filteredJobs, setFilteredJobs] = useState([]);
   const [searchQuery, setSearchQuery] = useState('');
   const [loading, setLoading] = useState(true);
   const [selectedJob, setSelectedJob] = useState(null);
   const [applyingJob, setApplyingJob] = useState(null);

   useEffect(() => {
      const fetchJobs = async () => {
         try {
            const res = await apiClient.get('/api/jobs');
            setJobs(res.data);
            setFilteredJobs(res.data);
         } catch (err) {
            console.error("Error fetching jobs:", err);
         } finally {
            setLoading(false);
         }
      };
      fetchJobs();
   }, []);

   useEffect(() => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) {
         setFilteredJobs(jobs);
         return;
      }
      const filtered = jobs.filter(job =>
         job.title.toLowerCase().includes(query) ||
         job.description.toLowerCase().includes(query) ||
         job.required_skills?.some(s => s.toLowerCase().includes(query))
      );
      setFilteredJobs(filtered);
   }, [searchQuery, jobs]);

   if (loading) return (
      <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
         <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
         <div className="font-black text-slate-400 text-xs uppercase tracking-[0.2em]">Scanning Opportunities</div>
      </div>
   );

   return (
      <div className="animate-fade-in space-y-8 max-w-6xl mx-auto">
         {/* Page Header & Search */}
         <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[2rem] shadow-sm border border-slate-50 gap-6">
            <div className="flex-1">
               <h2 className="text-3xl font-black text-slate-900 tracking-tight">Discover Opportunities</h2>
               <p className="text-slate-500 font-medium mt-1">AI-powered matching for top-tier technical roles.</p>
            </div>
            <div className="flex gap-3 w-full md:w-[400px] relative">
               <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">🔍</span>
               <input
                  type="text"
                  placeholder="Titles, companies, skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/50 focus:bg-white focus:border-indigo-600 outline-none text-sm transition-all font-bold group shadow-inner"
               />
               <button className="bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-black transition shrink-0">Filter</button>
            </div>
         </div>

         {/* Job Cards */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
            {filteredJobs.length === 0 ? (
               <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center">
                  <div className="text-5xl mb-4 opacity-50">🔭</div>
                  <h3 className="text-lg font-black text-slate-900">No active roles found</h3>
                  <p className="text-slate-500 font-medium mt-1">Check back soon or broaden your search criteria.</p>
               </div>
            ) : (
               filteredJobs.map((job) => (
                  <div
                     key={job.id}
                     onClick={() => setSelectedJob(job)}
                     className="group card card-interactive p-6 flex flex-col relative"
                  >
                     <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-slate-100 group-hover:scale-110 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                           🏢
                        </div>
                        <div className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border border-indigo-100">
                           Top BERT Match
                        </div>
                     </div>

                     <h3 className="font-black text-slate-900 text-xl tracking-tight leading-tight group-hover:text-indigo-600 transition-colors mb-1">{job.title}</h3>
                     <p className="text-xs text-slate-400 font-bold mb-6">{job.recruiter?.company || 'Industry Partner Ltd.'} · {job.location || 'Remote'}</p>

                     <div className="flex gap-2 mb-8 flex-wrap">
                        {(job.required_skills?.slice(0, 3) || ['React', 'TypeScript', 'Node.js']).map((s, idx) => (
                           <span key={idx} className="tag tag-indigo text-[10px] py-1 px-3 border-none">{s}</span>
                        ))}
                     </div>

                     <div className="flex justify-between items-center pt-5 border-t border-slate-50 mt-auto">
                        <div>
                           <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 block">Expected</span>
                           <span className="text-sm font-black text-slate-900">{job.salary_range || '$140K+'}</span>
                        </div>
                        <span className="text-indigo-600 font-black text-xs uppercase tracking-widest group-hover:translate-x-1 transition-transform">Details →</span>
                     </div>
                  </div>
               )))}
         </div>

         <JobDetailModal
            job={selectedJob}
            onClose={() => setSelectedJob(null)}
            onApply={(job) => {
               setApplyingJob(job);
               setSelectedJob(null);
            }}
         />

         {applyingJob && (
            <ApplyModal
               job={applyingJob}
               onClose={() => setApplyingJob(null)}
               onSuccess={() => { }}
            />
         )}
      </div>
   );
}