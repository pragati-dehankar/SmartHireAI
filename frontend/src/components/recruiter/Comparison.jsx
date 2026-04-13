import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';

export default function Comparison() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const jobsRes = await apiClient.get('/api/jobs');
        const jobs = jobsRes.data;
        
        let allResumes = [];
        for (const job of jobs) {
          const resumesRes = await apiClient.get(`/api/resumes/job/${job.id}`);
          const resumesWithJobInfo = resumesRes.data.map(r => ({
            ...r,
            jobTitle: job.title,
            requiredSkills: job.required_skills || []
          }));
          allResumes = [...allResumes, ...resumesWithJobInfo];
        }
        
        allResumes.sort((a, b) => (b.score || 0) - (a.score || 0));
        setCandidates(allResumes.slice(0, 3)); // Top 3
      } catch (err) {
        console.error("Error fetching comparison data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCandidates();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500 font-semibold animate-pulse">Calculating competitive matrix...</div>;

  if (candidates.length === 0) {
    return (
      <div className="bg-white rounded-[2rem] shadow-xl p-12 text-center border border-gray-100">
        <div className="text-5xl mb-4">⚖️</div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Comparison Matrix Empty</h2>
        <p className="text-gray-500 max-w-xs mx-auto">Score at least one candidate to enable side-by-side technical evaluation.</p>
      </div>
    );
  }

  const displayCandidates = [...candidates, null, null, null].slice(0, 3);

  return (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto space-y-6">
      <div className="bg-white rounded-[1.5rem] shadow-sm p-8 border border-[#e5e7eb] relative overflow-hidden">
        
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-md">⚖️</div>
             <div>
                <h2 className="text-[20px] font-extrabold text-[#111827] tracking-tight">Technical Comparison</h2>
                <p className="text-[#6b7280] text-[13px] font-medium">Head-to-head BERT semantic alignment</p>
             </div>
          </div>
          <button 
            onClick={() => window.print()}
            className="bg-[#111827] text-white px-6 py-2.5 rounded-xl font-bold text-[13px] hover:bg-gray-800 transition shadow-sm"
          >
            Print Matrix
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-x-4">
            <thead>
              <tr>
                <th className="px-5 py-4 text-[13px] font-extrabold text-[#111827] tracking-wide w-1/4">Model Criteria</th>
                {displayCandidates.map((c, i) => (
                  <th key={i} className="px-5 py-4 text-center min-w-[220px]">
                    {c ? (
                       <div className="space-y-2">
                          <div className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center font-bold text-white shadow-sm ${i === 0 ? 'bg-indigo-600' : 'bg-gray-400'}`}>
                             {i + 1}
                          </div>
                          <div className="font-extrabold text-[#111827] text-[15px] truncate max-w-[180px] mx-auto">{c.name}</div>
                          <div className="text-[11px] text-[#6366f1] font-bold uppercase tracking-wider">{c.jobTitle}</div>
                       </div>
                    ) : (
                       <div className="text-gray-300 italic text-[13px] font-bold">Empty Slot</div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-gray-50/30 rounded-2xl">
              <tr className="hover:bg-white transition-colors">
                <td className="px-6 py-6 font-extrabold text-[#111827] text-[14px]">BERT Match Score</td>
                {displayCandidates.map((c, i) => (
                  <td key={i} className="px-6 py-6 text-center">
                    {c ? (
                       <div className="flex flex-col items-center gap-2">
                          <span className="text-[22px] font-black text-indigo-600">{Math.round(c.score || 0)}%</span>
                          <div className="w-28 h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                             <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${c.score}%` }}></div>
                          </div>
                       </div>
                    ) : '-'}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-white transition-colors">
                <td className="px-6 py-6 font-extrabold text-[#111827] text-[14px]">Experience Alignment</td>
                {displayCandidates.map((c, i) => (
                  <td key={i} className="px-6 py-6 text-center text-[#4b5563] text-[14px] font-bold">
                    {c ? `${c.experience_years || '0'} Years` : '-'}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-white transition-colors">
                <td className="px-6 py-6 font-extrabold text-[#111827] text-[14px]">Identified Strengths</td>
                {displayCandidates.map((c, i) => (
                  <td key={i} className="px-6 py-6 text-center">
                    {c ? (
                       <div className="flex flex-wrap justify-center gap-1.5">
                          {c.skills?.slice(0, 3).map((s, idx) => (
                            <span key={idx} className="bg-[#ccfbf1] text-[#0f766e] px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase">{s}</span>
                          ))}
                       </div>
                    ) : '-'}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-white transition-colors">
                <td className="px-6 py-6 font-extrabold text-[#111827] text-[14px]">Hiring Status</td>
                {displayCandidates.map((c, i) => (
                  <td key={i} className="px-6 py-6 text-center">
                    {c ? (
                       <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                         c.status === 'qualified' || c.status === 'shortlisted' ? 'bg-[#ede9fe] text-[#6d28d9]' : 'bg-gray-100 text-gray-500'
                       }`}>
                         {c.status === 'shortlisted' ? 'Qualified' : (c.status || 'New')}
                       </span>
                    ) : '-'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}