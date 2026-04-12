import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';

export default function BrowseJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await apiClient.get('/api/jobs');
        setJobs(res.data);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500 font-semibold">Loading available jobs...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 shadow text-center">
          <div className="text-3xl mb-2">💼</div>
          <div className="text-3xl font-bold text-indigo-600">0</div>
          <div className="text-gray-600 text-sm">Jobs Applied</div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow text-center">
          <div className="text-3xl mb-2">⭐</div>
          <div className="text-3xl font-bold text-indigo-600">0</div>
          <div className="text-gray-600 text-sm">Shortlisted</div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow text-center">
          <div className="text-3xl mb-2">📧</div>
          <div className="text-3xl font-bold text-indigo-600">0</div>
          <div className="text-gray-600 text-sm">New Messages</div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow text-center">
          <div className="text-3xl mb-2">📈</div>
          <div className="text-3xl font-bold text-indigo-600">N/A</div>
          <div className="text-gray-600 text-sm">Profile Complete</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">💼 Recommended Jobs</h2>

        <div className="space-y-4">
          {jobs.length === 0 ? (
            <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg border border-gray-200">
              No jobs currently available dynamically. Check back later!
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="border border-gray-200 rounded-lg p-5 hover:border-indigo-400 hover:shadow-lg transition cursor-pointer">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-600">{job.company || 'Company'} • {job.location || 'Location Not Specified'}</p>
                    <p className="text-sm text-gray-600 mt-1">{job.salary || ''}</p>
                  </div>
                  <div className="text-right">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                      -%
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap mb-4">
                  {(job.required_skills || []).map((skill, idx) => (
                    <span key={idx} className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-xs font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>

                <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-2 px-6 rounded-lg hover:shadow-lg transition">
                  Apply Now
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}