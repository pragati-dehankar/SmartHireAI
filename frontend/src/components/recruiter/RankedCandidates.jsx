import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';

export default function RankedCandidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const jobsRes = await apiClient.get('/api/jobs');
        const jobs = jobsRes.data;
        
        let allResumes = [];
        for (const job of jobs) {
          const resumesRes = await apiClient.get(`/api/resumes/job/${job.id}`);
          const resumesWithJobTitle = resumesRes.data.map(r => ({
            ...r,
            jobTitle: job.title
          }));
          allResumes = [...allResumes, ...resumesWithJobTitle];
        }
        
        allResumes.sort((a, b) => (b.score || 0) - (a.score || 0));
        setCandidates(allResumes);
      } catch (err) {
        console.error("Error fetching ranked candidates:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCandidates();
  }, []);

  const handleFetchInsights = async (candidate) => {
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
      if (res.data.ai_analysis) {
         setSelectedCandidate({
            ...res.data,
            ...res.data.ai_analysis,
            fileName: res.data.name
         });
      } else {
         const scoreRes = await apiClient.post(`/api/resumes/${candidate.id}/score`);
         setSelectedCandidate({
            ...res.data,
            ...scoreRes.data,
            fileName: res.data.name
         });
      }
    } catch (err) {
      console.error("Error fetching insights:", err);
    }
  };

  const getMedal = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return '🌟';
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-semibold">Loading ranked candidates...</div>;

  return (
    <div className="space-y-6">
      {candidates.length === 0 ? (
        <div className="text-center text-gray-500 py-12 bg-white rounded-3xl shadow-sm border border-dashed border-gray-300">
           <div className="text-4xl mb-4">🏆</div>
           No candidates have completed the AI ranking process.
        </div>
      ) : (
        candidates.map((candidate, index) => (
          <div 
             key={candidate.id} 
             onClick={() => handleFetchInsights(candidate)}
             className="bg-white rounded-[2rem] shadow-xl p-8 border border-gray-100 hover:border-indigo-400 hover:shadow-2xl transition duration-500 cursor-pointer group relative overflow-hidden"
          >
            {/* Background number */}
            <div className="absolute top-[-20px] right-[-10px] text-[8rem] font-black text-gray-50 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
               {index + 1}
            </div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gray-50 rounded-[1.5rem] flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform duration-500">
                   {getMedal(index)}
                </div>
                <div>
                  <h3 className="font-black text-2xl text-gray-900 tracking-tight">{candidate.name}</h3>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{candidate.jobTitle}</p>
                  <div className="flex gap-2 mt-2">
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${
                      candidate.status === 'qualified' || candidate.status === 'shortlisted' ? 'border-green-200 text-green-600 bg-green-50' : 'border-gray-200 text-gray-400'
                    }`}>
                      {candidate.status || 'New'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                 <div className="text-right">
                    <div className="text-4xl font-black text-indigo-600 tracking-tighter">
                       {candidate.score ? Math.round(candidate.score) : 0}%
                    </div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Match Strength</div>
                 </div>
                 <div className="h-12 w-px bg-gray-100 hidden md:block"></div>
                 <div className="flex flex-wrap gap-1 max-w-[200px] justify-end">
                    {(candidate.skills || []).slice(0, 5).map((skill, idx) => (
                      <span key={idx} className="bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-indigo-100">
                        {skill}
                      </span>
                    ))}
                 </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
               <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Ready for Interview
               </div>
               <div className="text-indigo-600 font-black text-xs group-hover:translate-x-1 transition-transform">
                  View full AI reasoning →
               </div>
            </div>
          </div>
        ))
      )}

      {/* XAI Modal (Same as in Applications) */}
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}