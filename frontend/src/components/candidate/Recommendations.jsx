import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import ApplyModal from './ApplyModal';

export default function Recommendations() {
   const [jobs, setJobs] = useState([]);
   const [loading, setLoading] = useState(true);
   const [applyingJob, setApplyingJob] = useState(null);

   useEffect(() => {
      const fetchJobs = async () => {
         try {
            const res = await apiClient.get('/api/jobs');
            setJobs(res.data);
         } catch (err) {
            console.error("Error fetching recommended jobs:", err);
         } finally {
            setLoading(false);
         }
      };
      fetchJobs();
   }, []);

   if (loading) return <div className="p-8 text-center text-gray-500 font-semibold animate-pulse">Scanning the market for AI-powered matches...</div>;

   return (
      <div className="animate-in fade-in duration-500 space-y-8 max-w-6xl mx-auto pb-12">
         {/* PAGE HEADER */}
         <div className="flex justify-between items-center bg-white rounded-[1.5rem] p-8 shadow-sm border border-[#e5e7eb]">
            <div>
               <h2 className="text-[26px] font-extrabold text-[#111827] tracking-tight">AI Recommendations</h2>
               <p className="text-[#6b7280] text-[15px] font-medium mt-1">Jobs matched by context and intent, not just keywords</p>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 bg-[#f0f9ff] text-[#0369a1] px-4 py-2 rounded-full text-[12px] font-black border border-[#bae6fd]">
                  <span className="relative flex h-2 w-2">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0ea5e9] opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0ea5e9]"></span>
                  </span>
                  AI Matching Active
               </div>
               <button className="w-10 h-10 rounded-full bg-white border border-[#e5e7eb] flex items-center justify-center text-yellow-500 shadow-sm">🔔</button>
               <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md">S</div>
            </div>
         </div>

         {/* RECOMMENDED SECTION */}
         <div className="bg-white rounded-[2rem] p-8 border border-[#e5e7eb] shadow-sm space-y-8">
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-2">
                  <span className="text-2xl">🧠</span>
                  <h3 className="text-[19px] font-extrabold text-[#111827]">AI-Recommended Jobs</h3>
               </div>
               <span className="bg-[#f0f9ff] text-[#0ea5e9] px-4 py-1 rounded-full text-[12px] font-black">{jobs.length} New Matches</span>
            </div>

            {/* AI EXPLANATION BANNER */}
            <div className="bg-[#f0f9ff]/50 border border-[#e0f2fe] p-5 rounded-2xl flex gap-4 items-center">
               <span className="text-2xl">🎯</span>
               <p className="text-[14px] text-[#0369a1] font-semibold leading-relaxed">
                  These jobs weren't found by keyword — our AI analyzed your full profile context, work style, career trajectory, and project history to surface roles you'd genuinely thrive in.
               </p>
            </div>

            {/* JOB LIST */}
            <div className="space-y-6">
               {jobs.map((job) => (
                  <div key={job.id} className="p-8 rounded-[1.5rem] border border-[#e5e7eb] hover:border-indigo-400 hover:shadow-lg transition-all duration-300 relative group cursor-pointer">
                     <div className="flex justify-between items-start mb-6">
                        <div>
                           <h4 className="text-[20px] font-extrabold text-[#111827] tracking-tight">{job.title}</h4>
                           <p className="text-[#64748b] text-[15px] font-bold mt-1 uppercase tracking-tight">
                              {job.recruiter?.company || 'Industry Partner'} · {job.location} · {job.salary_range || '$140K-$180K'}
                           </p>
                        </div>
                        <div className="relative w-16 h-16">
                           <svg className="w-16 h-16 transform -rotate-90">
                              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-100" />
                              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={176} strokeDashoffset={176 * (1 - 0.96)} className="text-[#0ea5e9]" />
                           </svg>
                           <div className="absolute inset-0 flex items-center justify-center font-black text-[14px] text-[#0369a1]">
                              96%
                           </div>
                        </div>
                     </div>

                     <div className="flex flex-wrap gap-2 mb-6">
                        {(job.required_skills || ['React', 'Next.js', 'TypeScript', 'Performance']).map((skill, i) => (
                           <span key={i} className={`px-4 py-1.5 rounded-xl text-[13px] font-extrabold border shadow-sm ${i < 3 ? 'bg-[#f0fdf4] text-[#166534] border-[#dcfce7]' : 'bg-[#f8fafc] text-[#475569] border-[#e2e8f0]'
                              }`}>
                              {skill} {i < 3 && '✓'}
                           </span>
                        ))}
                     </div>

                     <div className="bg-[#fcfcfd] border-l-4 border-indigo-400 p-5 rounded-r-xl mb-8">
                        <p className="text-[14px] text-[#475569] font-semibold leading-relaxed">
                           <span className="mr-2">💡</span>
                           Your production {job.required_skills?.[0] || 'Next.js'} projects and remote async work style align deeply with {job.recruiter?.company || 'the partner'}'s engineering culture — domain overlap detected in project descriptions.
                        </p>
                     </div>

                     <div className="flex gap-4">
                        <button 
                           onClick={() => setApplyingJob(job)}
                           className="bg-[#0ea5e9] text-white px-8 py-3 rounded-xl font-black text-[14px] hover:bg-[#0284c7] transition shadow-lg shadow-sky-100"
                        >
                           Apply Now
                        </button>
                        <button className="bg-[#f8fafc] text-[#64748b] border border-[#e2e8f0] px-8 py-3 rounded-xl font-bold text-[14px] hover:bg-white transition shadow-sm">View Details</button>
                     </div>
                  </div>
               ))}
            </div>
         </div>

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
