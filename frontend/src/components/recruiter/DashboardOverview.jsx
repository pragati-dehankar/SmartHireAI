import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';

export default function DashboardOverview() {
  const [jobs, setJobs] = useState([]);
  const [topCandidates, setTopCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const jobsRes = await apiClient.get('/api/jobs');
        setJobs(jobsRes.data);

        let allResumes = [];
        for (const job of jobsRes.data) {
          const resumesRes = await apiClient.get(`/api/resumes/job/${job.id}`);
          const resumesWithJobInfo = resumesRes.data.map(r => ({
            ...r,
            jobTitle: job.title
          }));
          allResumes = [...allResumes, ...resumesWithJobInfo];
        }

        allResumes.sort((a, b) => (b.score || 0) - (a.score || 0));
        setTopCandidates(allResumes.slice(0, 3));
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-semibold animate-pulse">Loading dashboard...</div>;
  }

  const activeJobs = jobs.filter(j => j.status === 'open').length;
  const totalApplicants = jobs.reduce((sum, job) => sum + parseInt(job.resumes_count || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top Value Cards from Previous Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-[1.5rem] p-6 border border-[#e5e7eb] shadow-sm text-center">
          <div className="text-3xl mb-2">💼</div>
          <div className="text-3xl font-bold text-indigo-600">{activeJobs}</div>
          <div className="text-gray-600 text-sm">Active Jobs</div>
        </div>
        <div className="bg-white rounded-[1.5rem] p-6 border border-[#e5e7eb] shadow-sm text-center">
          <div className="text-3xl mb-2">📄</div>
          <div className="text-3xl font-bold text-indigo-600">{totalApplicants}</div>
          <div className="text-gray-600 text-sm">Applicants</div>
        </div>
        <div className="bg-white rounded-[1.5rem] p-6 border border-[#e5e7eb] shadow-sm text-center">
          <div className="text-3xl mb-2">⭐</div>
          <div className="text-3xl font-bold text-indigo-600">-</div>
          <div className="text-gray-600 text-sm">Top Candidates</div>
        </div>
        <div className="bg-white rounded-[1.5rem] p-6 border border-[#e5e7eb] shadow-sm text-center">
          <div className="text-3xl mb-2">🎯</div>
          <div className="text-3xl font-bold text-indigo-600">-</div>
          <div className="text-gray-600 text-sm">In Interview</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Job Postings Column */}
      <div className="bg-white rounded-[1.5rem] p-6 border border-[#e5e7eb] shadow-sm">
        <h2 className="text-[17px] font-extrabold text-[#111827] mb-5 flex items-center gap-2 tracking-tight">
          <span className="text-xl">📋</span> Recent Job Postings
        </h2>
        <div className="space-y-3">
          {jobs.length === 0 ? (
            <div className="text-gray-500 text-center py-4">No jobs posted yet.</div>
          ) : (
            jobs.slice(0, 3).map((job) => {
              const diffTime = Math.abs(new Date() - new Date(job.created_at));
              const daysAgo = Math.floor(diffTime / (1000 * 60 * 60 * 24));
              const applicantsCount = job.resumes_count || 0;
              const qualifiedCount = job.qualified_count || 0; // Fallback to 0 if not tracked
              
              return (
              <div key={job.id} className="border border-[#e5e7eb] rounded-2xl p-5 hover:border-[#cbd5e1] transition-colors cursor-pointer shadow-sm">
                <h3 className="font-bold text-[#111827]">{job.title}</h3>
                <p className="text-[13px] text-[#6b7280] mt-1 mb-4">
                  Posted {daysAgo === 0 ? 'today' : `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`} • {(job.required_skills || []).join(', ')}
                </p>
                <div className="flex gap-3">
                  <span className="bg-[#ccfbf1] text-[#0f766e] px-3 py-1 rounded-full text-[12px] font-bold">
                    {applicantsCount} applicants
                  </span>
                  <span className="bg-[#ede9fe] text-[#6d28d9] px-3 py-1 rounded-full text-[12px] font-bold">
                    {qualifiedCount} qualified
                  </span>
                </div>
              </div>
            )})
          )}
        </div>
      </div>

      {/* Top Candidates Column */}
      <div className="bg-white rounded-[1.5rem] p-6 border border-[#e5e7eb] shadow-sm">
        <h2 className="text-[17px] font-extrabold text-[#111827] mb-5 flex items-center gap-2 tracking-tight">
          <span className="text-xl">🏆</span> Top Candidates
        </h2>
        <div className="space-y-3">
          {topCandidates.length === 0 ? (
            <div className="text-gray-500 text-center py-4">No candidates evaluated yet.</div>
          ) : (
            topCandidates.map((candidate) => {
              const displayScore = Math.round(candidate.score || 0);

              return (
              <div key={candidate.id} className="border border-[#e5e7eb] rounded-2xl p-5 hover:border-[#cbd5e1] transition-colors cursor-pointer shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-[#111827]">{candidate.name}</h3>
                    <p className="text-[13px] text-[#6b7280] mt-1 mb-4">{candidate.jobTitle}</p>
                    <div className="flex flex-wrap gap-2">
                       {(candidate.skills || []).slice(0, 3).map((skill, idx) => (
                         <span key={idx} className="bg-[#ede9fe] text-[#6d28d9] px-2.5 py-1 rounded-md text-[11px] font-semibold">
                           {skill}
                         </span>
                       ))}
                    </div>
                  </div>
                  <div className="w-[42px] h-[42px] mt-1 rounded-full bg-[#6366f1] flex items-center justify-center text-white font-bold text-[15px] shrink-0">
                    {displayScore}%
                  </div>
                </div>
              </div>
            )})
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
