import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const jobsRes = await apiClient.get('/api/jobs');
        const jobs = jobsRes.data;
        
        // Fetch resumes for every job
        let allResumes = [];
        for (const job of jobs) {
          const resumesRes = await apiClient.get(`/api/resumes/job/${job.id}`);
          const resumesWithJobTitle = resumesRes.data.map(r => ({
            ...r,
            jobTitle: job.title
          }));
          allResumes = [...allResumes, ...resumesWithJobTitle];
        }
        
        // Sort by uploaded date descending
        allResumes.sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));
        
        setApplications(allResumes);
      } catch (err) {
        console.error("Error fetching applications:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500 font-semibold">Loading applications...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Applications</h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Candidate</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Position</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Applied</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Match</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No applications found.</td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">{app.name}</td>
                  <td className="px-6 py-4 text-gray-600">{app.jobTitle}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{new Date(app.uploaded_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                      app.status === 'reviewed' || app.status === 'qualified'
                        ? 'bg-green-100 text-green-800'
                        : app.status === 'new' 
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {app.status || 'New'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-indigo-600">
                    {app.score ? `${app.score}%` : 'N/A'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}