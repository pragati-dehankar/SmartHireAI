import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const fetchApplications = async () => {
    try {
      const jobsRes = await apiClient.get('/api/jobs');
      const jobs = jobsRes.data;
      
      let allResumes = [];
      for (const job of jobs) {
        const resumesRes = await apiClient.get(`/api/resumes/job/${job.id}`);
        const resumesWithJobTitle = resumesRes.data.map(r => ({
          ...r,
          jobTitle: job.title,
          jobDescription: job.description
        }));
        allResumes = [...allResumes, ...resumesWithJobTitle];
      }
      
      allResumes.sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));
      setApplications(allResumes);
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleUpdateStatus = async (resumeId, status) => {
    try {
      await apiClient.put(`/api/resumes/${resumeId}/status`, { status });
      fetchApplications();
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status");
    }
  };

  const handleFetchInsights = async (candidate) => {
    // If we already have the analysis in the candidate object (from the initial fetch)
    if (candidate.ai_analysis) {
        setSelectedCandidate({
            ...candidate,
            ...candidate.ai_analysis,
            fileName: candidate.name
        });
        return;
    }

    try {
      const res = await apiClient.get(`/api/resumes/${candidate.id}`);
      // Priority 1: Use stored analysis if available
      if (res.data.ai_analysis) {
         setSelectedCandidate({
            ...res.data,
            ...res.data.ai_analysis,
            fileName: res.data.name
         });
      } else {
         // Priority 2: Re-calculate if missing (legacy support)
         const scoreRes = await apiClient.post(`/api/resumes/${candidate.id}/score`);
         setSelectedCandidate({
            ...res.data,
            ...scoreRes.data,
            fileName: res.data.name
         });
         // Refresh list to persist this new score locally
         fetchApplications();
      }
    } catch (err) {
      console.error("Error fetching insights:", err);
      alert("Could not load AI insights");
    }
  };

  const exportApplications = () => {
    const headers = ['Candidate', 'Position', 'Applied Date', 'Match Score', 'Status'];
    const rows = applications.map(app => [
      app.name,
      app.jobTitle,
      new Date(app.uploaded_at).toLocaleDateString(),
      `${app.score || 0}%`,
      app.status || 'New'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "smarthire_applications_export.csv");
    document.body.appendChild(link);
    link.click();
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-semibold">Loading applications...</div>;

  return (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto space-y-6">
      <div className="bg-white rounded-[1.5rem] shadow-sm p-8 border border-[#e5e7eb] relative overflow-hidden">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-[19px] font-extrabold text-[#111827] tracking-tight">Recent Applications</h2>
          <button 
            onClick={exportApplications}
            className="text-gray-500 hover:text-indigo-600 transition text-sm font-bold flex items-center gap-2"
          >
            📥 Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-100">
                <th className="px-5 py-4 text-[13px] font-extrabold text-[#111827] tracking-wide">Candidate</th>
                <th className="px-5 py-4 text-[13px] font-extrabold text-[#111827] tracking-wide">Position</th>
                <th className="px-5 py-4 text-[13px] font-extrabold text-[#111827] tracking-wide">Applied</th>
                <th className="px-5 py-4 text-[13px] font-extrabold text-[#111827] tracking-wide">Status</th>
                <th className="px-5 py-4 text-[13px] font-extrabold text-[#111827] tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center text-gray-500 font-medium">
                    <div className="text-4xl mb-3">📭</div>
                    No applications in the pipeline.
                  </td>
                </tr>
              ) : (
                applications.map((app, idx) => {
                  let statusText = app.status || 'Received';
                  // Map specific words to match dummy data exactly if possible
                  if (statusText === 'new') statusText = 'Received';
                  if (statusText === 'reviewed' || statusText === 'shortlisted') statusText = 'Qualified';
                  if (statusText === 'rejected') statusText = 'Rejected';

                  // Apply same exact UI colors
                  const isReceived = statusText.toLowerCase() === 'received';
                  const isQualified = statusText.toLowerCase() === 'qualified' || statusText.toLowerCase() === 'shortlisted';
                  const isInReview = statusText.toLowerCase() === 'in review' || statusText.toLowerCase() === 'pending';

                  let statusClasses = 'bg-gray-100 text-gray-700'; // Default
                  if (isReceived) statusClasses = 'bg-[#ede9fe] text-[#6d28d9]';
                  if (isQualified) statusClasses = 'bg-[#ccfbf1] text-[#0f766e]';
                  if (isInReview) statusClasses = 'bg-[#ffedd5] text-[#c2410c]';

                  // Determine applied string nicely
                  const uploadedDate = new Date(app.uploaded_at);
                  const now = new Date();
                  const diffHours = Math.round((now - uploadedDate) / 3600000);
                  let appliedTimeStr = `${diffHours} hours ago`;
                  if (diffHours === 0) appliedTimeStr = "Just now";
                  else if (diffHours > 24) appliedTimeStr = `${Math.round(diffHours / 24)} days ago`;

                  return (
                    <tr key={app.id} className="group hover:bg-gray-50/40 transition-colors">
                      <td className="px-5 py-5 font-bold text-[#111827] text-[14px]">
                        {app.name}
                      </td>
                      <td className="px-5 py-5 text-[#4b5563] text-[13px] font-medium">
                        {app.jobTitle}
                      </td>
                      <td className="px-5 py-5 text-[#4b5563] text-[13px] font-medium">
                        {appliedTimeStr}
                      </td>
                      <td className="px-5 py-5">
                        <span className={`px-4 py-1.5 rounded-full text-[12px] font-bold ${statusClasses} capitalize`}>
                          {statusText === 'shortlisted' ? 'Qualified' : statusText}
                        </span>
                      </td>
                      <td className="px-5 py-5 text-left">
                        <button 
                          onClick={() => handleFetchInsights(app)}
                          className="bg-white text-gray-800 px-5 py-2.5 rounded-xl text-[13px] font-bold hover:bg-gray-50 hover:shadow-md transition shadow-sm border border-[#e5e7eb]"
                        >
                          {isQualified ? 'View Profile' : 'Review'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl relative">
            <button 
              onClick={() => setSelectedCandidate(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"
            >
              ✕
            </button>
            
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
              <div className="text-xs font-black uppercase tracking-[0.2em] opacity-70 mb-2">Explainable AI (XAI) Dashboard</div>
              <h2 className="text-3xl font-black">{selectedCandidate.name}</h2>
              <div className="mt-4 flex items-center gap-6">
                <div>
                  <div className="text-2xl font-black">{selectedCandidate.scores?.matchScore || selectedCandidate.score}%</div>
                  <div className="text-[10px] font-bold uppercase opacity-70">Model Confidence</div>
                </div>
                <div className="w-px h-8 bg-white/20"></div>
                <div>
                   <div className="text-2xl font-black">{selectedCandidate.scores?.skillsMatch || '---'}%</div>
                   <div className="text-[10px] font-bold uppercase opacity-70">Skills Alignment</div>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Reasoning & Alignment</h3>
                <div className="space-y-3">
                  {selectedCandidate.explanation?.mainReasons?.map((reason, i) => (
                    <div key={i} className="flex gap-3 items-center p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                      <div className="text-xl">✨</div>
                      <div className="text-sm font-bold text-indigo-900">{reason}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xs font-black text-green-500 uppercase tracking-widest mb-4">Skill Strengths</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.explanation?.strengths?.map((s, i) => (
                      <span key={i} className="bg-green-50 text-green-700 px-3 py-1 rounded-lg text-xs font-bold border border-green-100">{s}</span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xs font-black text-red-500 uppercase tracking-widest mb-4">Critical Gaps</h3>
                  <div className="space-y-2">
                    {selectedCandidate.explanation?.gaps?.length > 0 ? (
                      selectedCandidate.explanation.gaps.map((g, i) => (
                        <div key={i} className="text-sm font-medium text-gray-700 flex gap-2">
                          <span className="text-red-500">⚠</span> {g}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-400 font-medium">No gaps detected.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* TECHNICAL AI LOG SECTION - "Printing something in this section" */}
              <div className="bg-[#0f172a] rounded-2xl p-6 text-indigo-300 font-mono text-[11px] border border-indigo-900/30">
                 <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4 border-b border-indigo-900/30 pb-2 flex justify-between">
                    <span>AI Execution Log (XAI)</span>
                    <span className="text-indigo-700">TRACE_{Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
                 </h3>
                 <div className="space-y-1.5 opacity-90">
                    <div>[SYS] Inhaling vector space for candidate {selectedCandidate.name}...</div>
                    <div>[BERT] Score: {selectedCandidate.scores?.matchScore}% | Neural Confidence: {selectedCandidate.scores?.confidence}%</div>
                    <div>[EXTRACT] Skills identified: {selectedCandidate.scores?.extractedSkills?.join(', ')}</div>
                    <div>[LOGIC] {selectedCandidate.explanation?.recommendation}</div>
                    <div className="pt-2 animate-pulse text-indigo-500">_ End of decision trace.</div>
                 </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Ranking Breakdown</h3>
                <div className="grid grid-cols-3 gap-4">
                   <div className="p-4 bg-gray-50 rounded-2xl text-center">
                      <div className="text-sm font-black text-gray-900">{selectedCandidate.scores?.skillsMatch}%</div>
                      <div className="text-[9px] text-gray-500 font-bold uppercase">Skills</div>
                   </div>
                   <div className="p-4 bg-gray-50 rounded-2xl text-center">
                      <div className="text-sm font-black text-gray-900">{selectedCandidate.scores?.experienceMatch}%</div>
                      <div className="text-[9px] text-gray-500 font-bold uppercase">Experience</div>
                   </div>
                   <div className="p-4 bg-gray-50 rounded-2xl text-center">
                      <div className="text-sm font-black text-gray-900">{selectedCandidate.scores?.confidence}%</div>
                      <div className="text-[9px] text-gray-500 font-bold uppercase">Confidence</div>
                   </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-gray-100 flex gap-4">
                 <button 
                   onClick={() => {
                     handleUpdateStatus(selectedCandidate.id, 'shortlisted');
                     setSelectedCandidate(null);
                   }}
                   className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition active:scale-95"
                 >
                    Shortlist Candidate
                 </button>
                 <button 
                   onClick={() => {
                     handleUpdateStatus(selectedCandidate.id, 'rejected');
                     setSelectedCandidate(null);
                   }}
                   className="flex-1 bg-rose-50 text-rose-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border border-rose-100 hover:bg-rose-100 transition active:scale-95"
                 >
                    Reject Application
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}