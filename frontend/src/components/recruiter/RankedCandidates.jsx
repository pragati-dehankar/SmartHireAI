import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';

export default function RankedCandidates() {
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
          const resumesWithJobTitle = resumesRes.data.map(r => ({
            ...r,
            jobTitle: job.title
          }));
          allResumes = [...allResumes, ...resumesWithJobTitle];
        }
        
        // Sort by match score descending
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

  const getMedal = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return '🌟';
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-semibold">Loading ranked candidates...</div>;

  return (
    <div className="space-y-4">
      {candidates.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No candidates scored yet.</div>
      ) : (
        candidates.map((candidate, index) => (
          <div key={candidate.id} className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:border-indigo-400 hover:shadow-lg transition cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{getMedal(index)}</span>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{candidate.name}</h3>
                  <p className="text-sm text-gray-600">{candidate.jobTitle} • {candidate.email}</p>
                </div>
              </div>
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                {candidate.score ? Math.round(candidate.score) : 0}%
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {(candidate.skills || []).map((skill, idx) => (
                <span key={idx} className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-xs font-semibold">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}