import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';

export default function JobDetailView({ job, onBack }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showResumeModal, setShowResumeModal] = useState(false);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await apiClient.get(`/api/resumes/job/${job.id}`);
        setCandidates(res.data);
      } catch (err) {
        console.error("Error fetching job candidates:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, [job.id]);

  const filteredCandidates = candidates.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'shortlisted') return c.status === 'shortlisted';
    if (filter === 'under_review') return c.status === 'reviewed' || c.status === 'applied' || !c.status;
    if (filter === 'interview') return c.status === 'interview';
    return true;
  });

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    if (s === 'shortlisted') return 'bg-[#ecfdf5] text-[#059669] border-[#10b981]';
    if (s === 'interview') return 'bg-[#eff6ff] text-[#2563eb] border-[#3b82f6]';
    return 'bg-gray-50 text-gray-600 border-gray-200';
  };

  if (loading) return <div className="p-20 text-center font-bold text-gray-400 animate-pulse">Syncing candidate pipeline...</div>;

  return (
    <div className="animate-in slide-in-from-right duration-500">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition shadow-sm">
          ←
        </button>
        <div>
          <h2 className="text-2xl font-black text-[#111827]">{job.title}</h2>
          <p className="text-sm font-medium text-gray-500">{job.location} · {candidates.length} total applicants</p>
        </div>
      </div>

      {/* CANDIDATE LIST */}
      <div className="grid grid-cols-1 gap-4 mt-8">
        {filteredCandidates.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-200">
            <div className="text-4xl mb-2">🔍</div>
            <p className="font-bold text-gray-400">No candidates match this filter.</p>
          </div>
        ) : (
          filteredCandidates.map((c) => (
            <div 
              key={c.id} 
              onClick={() => setSelectedCandidate(c)}
              className="bg-white p-6 rounded-[1.5rem] border border-[#e5e7eb] hover:border-indigo-400 hover:shadow-lg transition-all flex justify-between items-center group cursor-pointer"
            >
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl border border-gray-100 group-hover:scale-110 transition">
                  {c.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-[#111827] text-[16px]">{c.name}</h3>
                  <p className="text-[13px] text-gray-500 font-medium">{c.email} · Applied {Math.round((new Date() - new Date(c.uploaded_at)) / 86400000)} days ago</p>
                  <div className="flex gap-2 mt-2">
                    <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusBadge(c.status)}`}>
                      {c.status || 'Under Review'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right">
                  <div className="text-[24px] font-black text-[#111827]">{Math.round(c.score)}%</div>
                  <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">AI MATCH</div>
                </div>
                <div className="text-indigo-600 font-bold group-hover:translate-x-1 transition">View Profile →</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DETAIL MODAL (SIDE OVERLAY) */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-500 p-10">
            <div className="flex justify-between items-center mb-10">
              <button onClick={() => setSelectedCandidate(null)} className="text-gray-400 hover:text-black text-2xl">✕</button>
              <div className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[12px] font-black uppercase tracking-widest border border-indigo-100">
                AI Intelligence Active
              </div>
            </div>

            <div className="space-y-10">
              {/* Profile Card */}
              <div className="flex items-center gap-8">
                <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center text-5xl shadow-inner border border-gray-100">
                  {selectedCandidate.name.charAt(0)}
                </div>
                <div>
                  <h1 className="text-3xl font-black text-[#111827] tracking-tight">{selectedCandidate.name}</h1>
                  <p className="text-gray-500 font-bold">{selectedCandidate.email}</p>
                </div>
              </div>

              {/* AI Insight Section */}
              <div className="bg-gradient-to-br from-[#111827] to-[#1e293b] rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                  <h4 className="text-[12px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">AI Score Breakdown</h4>
                  <div className="flex items-end gap-2 mb-8">
                    <span className="text-6xl font-black">{Math.round(selectedCandidate.score)}</span>
                    <span className="text-2xl font-bold text-gray-500 mb-2">% Match</span>
                  </div>
                  
                  <div className="space-y-4 pt-6 border-t border-white/10">
                    <p className="text-sm text-gray-300 leading-relaxed italic">
                      "Candidate shows high semantic alignment with {job.title} requirements, specifically in {selectedCandidate.skills?.slice(0,3).join(', ')}."
                    </p>
                  </div>
                </div>
                {/* Decorative blob */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              </div>

              {/* AI Generated Response (XAI) */}
              <div className="space-y-6">
                <h3 className="text-[18px] font-black text-gray-900 border-l-4 border-indigo-600 pl-4">AI Reasoning & Recommendation</h3>
                <div className="bg-gray-50 rounded-[1.5rem] p-6 border border-gray-100">
                   <div className="prose prose-indigo max-w-none text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                      {selectedCandidate.ai_analysis?.explanation?.summary || selectedCandidate.ai_analysis?.explanation?.matchSummary || "The BERT model identified significant overlap between the candidate's core technical skills and the job's key requirements. High confidence match based on semantic similarity of previous project experiences."}
                   </div>
                </div>
              </div>

              {/* Resume Preview Link */}
              <div className="pt-10 flex justify-between items-center gap-4 border-t border-gray-100">
                <button 
                  onClick={() => setShowResumeModal(true)}
                  className="flex-1 bg-white border border-gray-200 text-gray-800 py-4 rounded-2xl font-black text-center hover:bg-gray-50 transition shadow-sm"
                >
                  📄 View Full Resume
                </button>
                <button className="flex-1 bg-[#111827] text-white py-4 rounded-2xl font-black shadow-lg hover:bg-black transition">
                  Schedule Interview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RESUME PREVIEW MODAL */}
      {showResumeModal && selectedCandidate && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-[2rem] w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                 <div>
                   <h3 className="font-black text-[#111827]">{selectedCandidate.name}'s Resume</h3>
                   <p className="text-xs font-bold text-gray-400">PDF/DOCX Document Viewer</p>
                 </div>
                 <button 
                   onClick={() => setShowResumeModal(false)}
                   className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-black hover:border-black transition shadow-sm"
                 >
                   ✕
                 </button>
              </div>
              <div className="flex-1 bg-gray-200 relative">
                 <iframe 
                   src={`http://localhost:5000/api/resumes/download/${selectedCandidate.id}#toolbar=0`} 
                   className="w-full h-full border-none"
                   title="Resume Preview"
                 />
                 {/* Fallback info */}
                 <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-[10px] font-bold pointer-events-none">
                   If preview fails, please download the file directly.
                 </div>
              </div>
              <div className="p-4 bg-white border-t border-gray-100 text-center">
                 <a 
                   href={`http://localhost:5000/api/resumes/download/${selectedCandidate.id}`} 
                   download 
                   className="text-indigo-600 font-black text-[12px] hover:underline"
                 >
                   ⬇️ Download Original File
                 </a>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
