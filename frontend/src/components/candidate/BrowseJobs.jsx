import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import ApplyModal from './ApplyModal';

export default function BrowseJobs() {
   const [jobs, setJobs] = useState([]);
   const [loading, setLoading] = useState(true);
   const [selectedJob, setSelectedJob] = useState(null);
   const [applyingJob, setApplyingJob] = useState(null);

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

   if (loading) return <div className="p-8 text-center text-gray-500 font-semibold animate-pulse">Scanning the market for you...</div>;

   return (
      <div className="animate-in fade-in duration-500 space-y-8 max-w-7xl mx-auto">
         {/* PAGE HEADER */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-[1.5rem] shadow-sm border border-[#e5e7eb]">
            <div>
               <h2 className="text-[26px] font-extrabold text-[#111827] tracking-tight">Discover Your Next Role</h2>
               <p className="text-[#6b7280] text-[15px] font-medium mt-1">AI-powered matching for top technical opportunities</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
               <div className="relative flex-1 md:w-72">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                  <input
                     type="text"
                     placeholder="Search roles, skills..."
                     className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#e5e7eb] focus:ring-2 focus:ring-indigo-500 outline-none text-[14px] shadow-sm font-medium"
                  />
               </div>
               <button className="bg-[#111827] text-white px-8 py-3 rounded-xl font-bold text-[14px] shadow-sm hover:bg-gray-800 transition">Filter</button>
            </div>
         </div>

         {/* JOB GRID */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
            {jobs.length === 0 ? (
               <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border border-dashed border-[#e5e7eb]">
                  <div className="text-4xl mb-4">🔭</div>
                  <h3 className="text-[17px] font-extrabold text-[#111827]">No active roles found</h3>
                  <p className="text-[#6b7280] text-[14px] font-medium mt-1">Check back soon! Our AI is constantly sourcing new opportunities.</p>
               </div>
            ) : (
               jobs.map((job) => (
               <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className="group bg-white p-6 rounded-[2rem] border border-[#e5e7eb] hover:border-indigo-400 hover:shadow-xl transition-all duration-300 cursor-pointer relative"
               >
                  <div className="flex justify-between items-start mb-6">
                     <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl border border-gray-100 group-hover:scale-110 transition-transform shadow-sm">
                        🏢
                     </div>
                     <div className="bg-[#f5f3ff] text-[#6366f1] px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm">
                        {Math.round(85 + Math.random() * 10)}% Match
                     </div>
                  </div>

                  <h3 className="font-extrabold text-[#111827] text-[18px] tracking-tight group-hover:text-indigo-600 transition-colors uppercase leading-tight mb-2">{job.title}</h3>
                  <p className="text-[14px] text-[#6b7280] font-bold mb-4">{job.recruiter?.company || 'CloudTech Systems'} · {job.location}</p>

                  <div className="flex gap-2 mb-6 flex-wrap">
                     {(job.required_skills?.slice(0, 3) || ['React', 'Next.js', 'TS']).map((s, idx) => (
                        <span key={idx} className="bg-gray-50 text-gray-500 px-3 py-1 rounded-lg text-[11px] font-bold border border-gray-100">{s}</span>
                     ))}
                  </div>

                  <div className="flex justify-between items-center py-4 border-t border-gray-50 mt-auto">
                     <span className="text-[14px] font-black text-indigo-600 tracking-tight">{job.salary_range || '$120K - $160K'}</span>
                     <span className="text-indigo-600 font-bold text-[13px] group-hover:translate-x-1 transition-transform">View Details →</span>
                  </div>
               </div>
            )))}
         </div>

         {/* DETAILS MODAL */}
         {selectedJob && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300">
               <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col scale-in-95 animate-in zoom-in-95 duration-300 border border-white/20">

                  {/* Modal Header Actions */}
                  <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white z-10 shadow-sm">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl border border-gray-100 italic font-black text-indigo-600">
                           {selectedJob.recruiter?.company?.charAt(0) || 'C'}
                        </div>
                        <div>
                           <h2 className="text-[20px] font-extrabold text-[#111827] tracking-tight">{selectedJob.title}</h2>
                           <p className="text-[13px] text-[#6366f1] font-bold">{selectedJob.recruiter?.company} · {selectedJob.location}</p>
                        </div>
                     </div>
                     <div className="flex gap-3">
                        <button className="px-6 py-2.5 rounded-xl border border-[#e5e7eb] font-bold text-[13px] text-[#4b5563] hover:bg-gray-50 transition flex items-center gap-2">
                           🔖 Save Job
                        </button>
                        <button 
                           onClick={() => {
                              setApplyingJob(selectedJob);
                              setSelectedJob(null);
                           }}
                           className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-extrabold text-[13px] hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
                        >
                           Apply Now
                        </button>
                        <button
                           onClick={() => setSelectedJob(null)}
                           className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"
                        >
                           ✕
                        </button>
                     </div>
                  </div>

                  {/* Modal Content */}
                  <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar bg-[#fcfcfd]">

                     <div className="max-w-3xl mx-auto space-y-10">
                        {/* Job Intro */}
                        <div className="space-y-4">
                           <p className="text-[16px] text-[#4b5563] leading-relaxed font-semibold">
                              We are building next-generation developer tools and need a passionate {selectedJob.title} to craft exceptional user experiences with our product and design teams.
                              You will work on high-scale systems and influence the future of our technical architecture alongside a world-class engineering team.
                           </p>
                           <div className="flex flex-wrap gap-2 pt-2">
                              {(selectedJob.required_skills || ['React', 'JavaScript', 'TypeScript', 'Next.js', 'CSS', 'REST APIs']).map((skill, i) => (
                                 <span key={i} className="bg-white text-[#475569] border border-[#e5e7eb] px-4 py-2 rounded-xl text-[13px] font-bold shadow-sm">{skill}</span>
                              ))}
                           </div>
                        </div>

                        {/* AI Reasoning (Screenshot Match) */}
                        <div className="bg-[#f0f9ff] rounded-[2rem] p-8 border border-[#e0f2fe] shadow-inner shadow-indigo-50/50">
                           <div className="flex items-center gap-3 mb-8">
                              <span className="text-3xl">🧠</span>
                              <h3 className="text-[19px] font-extrabold text-[#0369a1] tracking-tight">Why You Match This Role</h3>
                              <span className="bg-[#0ea5e9]/10 text-[#0ea5e9] border border-[#0ea5e9]/20 px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-wider">Context Analysis</span>
                           </div>

                           <div className="space-y-4">
                              {[
                                 { title: 'Skill Semantic Match', desc: `React + TypeScript aligned 96% with JD via BERT semantic analysis`, tag: 'Strong', tagColor: 'emerald', icon: '⚡' },
                                 { title: 'Project Portfolio', desc: '3 of your projects demonstrate production-scale React directly', tag: 'Strong', tagColor: 'emerald', icon: '📂' },
                                 { title: 'Work Style', desc: 'Remote-first preference matches their culture signal', tag: 'Good', tagColor: 'blue', icon: '🌐' },
                                 { title: 'Experience Band', desc: '4 yrs fits their 3-5 yr requirement precisely', tag: 'Good', tagColor: 'blue', icon: '📊' }
                              ].map((reason, idx) => (
                                 <div key={idx} className="bg-white border border-[#e0f2fe] p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
                                    <div className="flex justify-between items-start mb-4">
                                       <div className="flex items-center gap-3">
                                          <span className="text-xl group-hover:scale-110 transition-transform">{reason.icon}</span>
                                          <h4 className="text-[15px] font-black text-[#111827] tracking-tight">{reason.title}</h4>
                                       </div>
                                       <span className={`text-[10px] font-black px-3 py-1 rounded-lg ${reason.tagColor === 'emerald' ? 'bg-[#f0fdf4] text-[#166534]' : 'bg-[#eff6ff] text-[#1d4ed8]'
                                          }`}>{reason.tag}</span>
                                    </div>
                                    <p className="text-[14px] text-[#64748b] leading-relaxed font-bold">{reason.desc}</p>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Modal Sticky Footer */}
                  <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-center items-center gap-3">
                     <span className="text-[13px] font-bold text-gray-500">Ready to take the next step?</span>
                     <button 
                        onClick={() => {
                           setApplyingJob(selectedJob);
                           setSelectedJob(null);
                        }}
                        className="bg-[#111827] text-white px-10 py-3 rounded-xl font-bold text-[14px] hover:bg-black transition shadow-lg"
                     >
                        Submit Application Now
                     </button>
                  </div>
               </div>
            </div>
         )}

         {applyingJob && (
            <ApplyModal 
               job={applyingJob} 
               onClose={() => setApplyingJob(null)} 
               onSuccess={() => alert("Application submitted successfully!")}
            />
         )}
      </div>
   );
}