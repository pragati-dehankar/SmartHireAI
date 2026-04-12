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
          allResumes = [...allResumes, ...resumesRes.data];
        }
        
        allResumes.sort((a, b) => (b.score || 0) - (a.score || 0));
        setCandidates(allResumes.slice(0, 3)); // Top 3
      } catch (err) {
        console.error("Error fetching ranked candidates:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCandidates();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500 font-semibold">Loading comparison data...</div>;

  if (candidates.length === 0) {
    return <div className="p-8 text-center text-gray-500 font-semibold bg-white rounded-lg shadow">No candidates available for comparison. Please upload and score resumes.</div>;
  }

  // Ensure we have exactly 3 columns defined, pad with empty forms if necessary
  const displayCandidates = [...candidates, null, null, null].slice(0, 3);

  return (
    <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">⚖️ Candidate Comparison</h2>

      <table className="w-full min-w-max">
        <thead className="bg-gray-50 border-b-2 border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Criteria</th>
            {displayCandidates.map((c, i) => (
              <th key={i} className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                {c ? c.name : '---'}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-200">
            <td className="px-6 py-4 font-bold text-gray-900">Overall Match</td>
            {displayCandidates.map((c, i) => (
              <td key={i} className="px-6 py-4 text-center">
                {c ? <span className="text-green-600 font-bold text-lg">{Math.round(c.score || 0)}%</span> : '-'}
              </td>
            ))}
          </tr>
          <tr className="border-b border-gray-200 hover:bg-gray-50">
            <td className="px-6 py-4 text-gray-900">Experience Years</td>
            {displayCandidates.map((c, i) => (
              <td key={i} className="px-6 py-4 text-center text-gray-600">
                {c ? `${c.experience_years || 'Unknown'} years` : '-'}
              </td>
            ))}
          </tr>
          <tr className="border-b border-gray-200 hover:bg-gray-50">
            <td className="px-6 py-4 text-gray-900">Resume Status</td>
            {displayCandidates.map((c, i) => (
              <td key={i} className="px-6 py-4 text-center text-gray-600 capitalize">
                {c ? c.status : '-'}
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      <div className="mt-6 text-center">
        <button className="bg-gray-200 text-gray-900 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition" disabled={candidates.length === 0}>
          Export Comparison Report
        </button>
      </div>
    </div>
  );
}