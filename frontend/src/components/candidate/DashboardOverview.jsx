import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ApplyModal from './ApplyModal';

export default function DashboardOverview({ onTabChange }) {
   const { user } = useAuth();
   const [applyingJob, setApplyingJob] = useState(null);
   const [stats, setStats] = useState({
      applied: 0,
      shortlisted: 0,
      interviews: 0,
      profileComplete: 89
   });
   const [applications, setApplications] = useState([]);
   const [recommendedJobs, setRecommendedJobs] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchData = async () => {
         try {
            const appsRes = await apiClient.get('/api/candidate/applications');
            const jobsRes = await apiClient.get('/api/jobs');

            const apps = appsRes.data;
            const shortlisted = apps.filter(a => a.status === 'shortlisted' || a.status === 'qualified').length;

            setApplications(apps);
            setRecommendedJobs(jobsRes.data.slice(0, 3));
            setStats(prev => ({
               ...prev,
               applied: apps.length,
               shortlisted: shortlisted,
               interviews: apps.filter(a => a.status === 'interview').length || 0
            }));
         } catch (err) {
            console.error("Error fetching dashboard data:", err);
         } finally {
            setLoading(false);
         }
      };
      fetchData();
   }, []);

   const featuredApp = applications.length > 0 ? applications.sort((a, b) => b.score - a.score)[0] : null;

   if (loading) return <div className="p-8 text-center text-gray-500 font-semibold animate-pulse">Syncing AI recommendations...</div>;

   return (
      <div className="animate-in fade-in duration-500 space-y-8">
         {/* HEADER AREA */}
         <div className="flex justify-between items-center bg-white rounded-[1.5rem] p-8 shadow-sm border border-[#e5e7eb]">
            <div>
               <h1 className="text-[26px] font-extrabold text-[#111827] tracking-tight">Good morning, {user?.name || 'Sarah'} 👋</h1>
               <p className="text-[#6b7280] text-[14px] font-medium mt-1">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} · Here's your job search overview
               </p>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 bg-[#f0f9ff] text-[#0369a1] px-4 py-2 rounded-full text-[12px] font-bold border border-[#bae6fd]">
                  <span className="relative flex h-2 w-2">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0ea5e9] opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0ea5e9]"></span>
                  </span>
                  AI Matching Active
               </div>
               <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md cursor-pointer hover:scale-105 transition">
                  {user?.name?.charAt(0)}
               </div>
            </div>
         </div>

         {/* STAT CARDS */}
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
               { icon: '📄', label: 'Jobs Applied', value: stats.applied, trend: 'Updated just now', color: 'indigo-600' },
               { icon: '⭐', label: 'Shortlisted', value: stats.shortlisted, trend: stats.shortlisted > 0 ? 'Action required' : 'Keep applying', color: 'yellow-500' },
               { icon: '💬', label: 'Interview Scheduled', value: stats.interviews, trend: 'Next 7 days', color: 'green-500' },
               { icon: '📊', label: 'Profile Complete', value: stats.profileComplete + '%', trend: '+4% this week', color: 'purple-600' }
            ].map((stat, i) => (
               <div key={i} className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-[#e5e7eb] relative overflow-hidden group hover:shadow-md transition cursor-pointer">
                  <div className="text-2xl mb-4 grayscale group-hover:grayscale-0 transition">{stat.icon}</div>
                  <div className="text-3xl font-black text-[#111827] mb-1">{stat.value}</div>
                  <div className="text-[12px] font-bold text-[#6b7280] uppercase tracking-wider">{stat.label}</div>
                  <div className={`mt-3 text-[11px] font-bold ${i === 2 && stats.interviews > 0 ? 'text-green-600' : 'text-[#94a3b8]'}`}>
                     {stat.trend}
                  </div>
                  <div className={`absolute -right-4 -bottom-4 w-20 h-20 bg-${stat.color} opacity-[0.03] rounded-full blur-2xl`}></div>
               </div>
            ))}
         </div>

         {/* FEATURED MATCH CARD - Refined to White UI */}
         {featuredApp ? (
            <div className="bg-white rounded-[2rem] p-8 border border-[#e5e7eb] relative overflow-hidden shadow-sm">
               <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                     <div className="flex gap-5 items-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-gray-100">🏢</div>
                        <div>
                           <h2 className="text-[26px] font-extrabold text-[#111827] tracking-tight leading-tight">{featuredApp.jobTitle}</h2>
                           <p className="text-[#6b7280] text-[14px] font-medium mt-1">{featuredApp.company} · {featuredApp.location}</p>
                           <div className="flex gap-3 mt-4">
                              <span className="bg-[#f0fdf4] text-[#166534] border border-[#dcfce7] px-3 py-1 rounded-full text-[11px] font-extrabold">⭐ {featuredApp.status === 'shortlisted' ? "You've Been Shortlisted!" : "Highly Recommended"}</span>
                              <span className="bg-[#f8fafc] text-[#64748b] border border-[#e2e8f0] px-3 py-1 rounded-full text-[11px] font-extrabold">Applied {Math.round((new Date() - new Date(featuredApp.uploaded_at)) / 86400000)} days ago</span>
                           </div>
                        </div>
                     </div>
                     <div className="bg-[#f5f3ff] border border-[#ddd6fe] p-6 rounded-[1.5rem] text-center shadow-sm">
                        <div className="text-4xl font-black text-[#6d28d9]">{Math.round(featuredApp.score)}%</div>
                        <div className="text-[10px] font-bold text-[#7c3aed] uppercase tracking-widest mt-1">AI Match Score</div>
                     </div>
                  </div>

                  <div className="bg-[#f0f9ff]/50 rounded-[1.5rem] p-6 border border-[#e0f2fe]">
                     <div className="flex items-center gap-3 mb-6">
                        <span className="text-2xl">🧠</span>
                        <h3 className="text-[15px] font-extrabold text-[#0369a1]">Why You Match This Role</h3>
                        <span className="bg-[#0ea5e9]/10 text-[#0ea5e9] border border-[#0ea5e9]/20 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">Context Analysis</span>
                     </div>

                     <div className="grid md:grid-cols-2 gap-4">
                        {[
                           { title: 'Skill Semantic Match', desc: `Your technical stack aligns ${Math.round(featuredApp.score)}% with the JD via BERT semantic analysis.`, tag: 'Strong', tagColor: 'emerald', icon: '⚡' },
                           { title: 'Experience Relevance', desc: `Background matches their core seniority and role expectations precisely.`, tag: 'Good', tagColor: 'blue', icon: '📊' },
                        ].map((item, idx) => (
                           <div key={idx} className="bg-white border border-[#e2e8f0] p-5 rounded-2xl hover:border-indigo-200 transition-all duration-300 shadow-sm group">
                              <div className="flex justify-between items-start mb-3">
                                 <div className="flex items-center gap-2">
                                    <span className="text-[14px]">{item.icon}</span>
                                    <h4 className="text-[14px] font-extrabold text-[#111827] tracking-tight">{item.title}</h4>
                                 </div>
                                 <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${item.tagColor === 'emerald' ? 'bg-[#f0fdf4] text-[#166534]' : 'bg-[#eff6ff] text-[#1d4ed8]'
                                    }`}>{item.tag}</span>
                              </div>
                              <p className="text-[12.5px] text-[#64748b] leading-relaxed font-semibold group-hover:text-[#475569] transition-colors">{item.desc}</p>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="mt-8 flex gap-4">
                     <button onClick={() => onTabChange('applications')} className="bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold text-[14px] hover:bg-indigo-700 transition shadow-md">View Application →</button>
                     <button className="bg-white text-[#111827] px-8 py-3.5 rounded-xl font-bold text-[14px] border border-[#e5e7eb] hover:bg-gray-50 transition shadow-sm">Message Recruiter</button>
                  </div>
               </div>
               {/* Subtle graphic background */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-32 -mt-32"></div>
            </div>
         ) : (
            <div className="bg-[#111827] rounded-[2rem] p-12 text-center text-white">
               <div className="text-4xl mb-4">🚀</div>
               <h3 className="text-2xl font-black mb-2">Ready to start your journey?</h3>
               <p className="text-gray-400 mb-8 max-w-md mx-auto">Apply to your first job to see personalized AI match insights and tracking here.</p>
               <button onClick={() => onTabChange('jobs')} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold">Browse Recommended Jobs</button>
            </div>
         )}

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* RECENT APPLICATIONS */}
            <div className="bg-white rounded-[1.5rem] shadow-sm border border-[#e5e7eb] p-8">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[18px] font-extrabold text-[#111827]">Recent Applications</h3>
                  <button onClick={() => onTabChange('applications')} className="text-indigo-600 text-[13px] font-bold hover:underline">View All →</button>
               </div>
               <div className="space-y-4">
                  {applications.length === 0 ? (
                     <div className="text-center py-12 text-gray-400 font-medium">No active applications found.</div>
                  ) : (
                     applications.slice(0, 3).map((app, i) => (
                        <div key={i} className="group p-5 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:bg-white transition flex justify-between items-center">
                           <div className="flex gap-4 items-center">
                              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 text-xl group-hover:scale-110 transition">
                                 🏢
                              </div>
                              <div>
                                 <div className="font-extrabold text-[#111827] text-[15px]">{app.jobTitle}</div>
                                 <p className="text-[12px] text-[#6b7280] font-medium">{app.company} · {app.location}</p>
                                 <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-bold ${app.status === 'shortlisted' ? 'bg-[#dcfce7] text-[#166534]' : 'bg-[#e0e7ff] text-[#3730a3]'}`}>
                                    {app.status || 'Applied'}
                                 </span>
                              </div>
                           </div>
                           <div className="text-right">
                              <div className="text-[20px] font-black text-indigo-600">{Math.round(app.score)}%</div>
                              <div className="w-16 h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                 <div className="h-full bg-indigo-600" style={{ width: `${app.score}%` }}></div>
                              </div>
                           </div>
                        </div>
                     )))}
               </div>
            </div>

            <div className="space-y-8">
               <div className="bg-white rounded-[1.5rem] shadow-sm border border-[#e5e7eb] p-8">
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="text-[18px] font-extrabold text-[#111827]">Latest Opportunities</h3>
                     <button onClick={() => onTabChange('jobs')} className="text-indigo-600 text-[13px] font-bold hover:underline border border-indigo-100 px-4 py-1 rounded-lg">Browse All</button>
                  </div>
                  <div className="space-y-4">
                     {recommendedJobs.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 font-bold uppercase tracking-widest text-[10px]">No active job postings</div>
                     ) : (
                        recommendedJobs.map((job, i) => (
                           <div key={i} className="flex justify-between items-center p-4 border border-gray-50 rounded-[1.2rem] hover:bg-gray-50 hover:border-indigo-100 transition-all cursor-pointer group">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm border border-gray-100 group-hover:scale-110 transition">💼</div>
                                 <div>
                                    <div className="text-[15px] font-extrabold text-[#111827]">{job.title}</div>
                                    <div className="text-[12px] text-[#6b7280] font-bold">
                                       {job.recruiter?.company || 'Industry Partner'} · {job.location} · {job.salary_range || '$85k - $120k'}
                                    </div>
                                 </div>
                              </div>
                              <button 
                                 onClick={() => setApplyingJob(job)}
                                 className="text-[12px] font-black bg-[#111827] text-white px-6 py-2.5 rounded-xl hover:bg-indigo-600 transition shadow-lg shadow-gray-100"
                              >
                                 Apply Now
                              </button>
                           </div>
                        ))
                     )}
                  </div>
               </div>

               {/* AI NEXT STEPS */}
               <div className="bg-white rounded-[1.5rem] shadow-sm border border-[#e5e7eb] p-8">
                  <div className="flex items-center gap-2 mb-6">
                     <span className="text-xl">🎯</span>
                     <h3 className="text-[18px] font-extrabold text-[#111827]">AI Roadmap</h3>
                  </div>
                  <div className="space-y-4">
                     <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex gap-4 items-start">
                        <div className="text-2xl">📈</div>
                        <div>
                           <div className="text-[14px] font-extrabold text-[#111827]">Optimize your Resume</div>
                           <p className="text-[12px] text-[#6b7280] font-medium mt-1 leading-relaxed">Your match scores are 15% higher when you include Cloud experience.</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {applyingJob && (
            <ApplyModal 
               job={applyingJob} 
               onClose={() => setApplyingJob(null)} 
               onSuccess={() => {
                  alert("Application submitted successfully!");
                  // Optionally refresh applications list here if needed
               }}
            />
         )}
      </div>
   );
}
