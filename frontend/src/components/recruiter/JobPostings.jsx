import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';

export default function JobPostings() {
  const [showModal, setShowModal] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    required_skills: '',
    experience_years: '',
    location: '',
    salary_range: ''
  });
  const [creating, setCreating] = useState(false);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const skillsArray = newJob.required_skills.split(',').map(s => s.trim()).filter(s => s);
      const res = await apiClient.post('/api/jobs', {
        ...newJob,
        required_skills: skillsArray
      });
      setJobs([res.data.job, ...jobs]);
      setShowModal(false);
      setNewJob({ title: '', description: '', required_skills: '', experience_years: '', location: '', salary_range: '' });
    } catch (err) {
      console.error("Error creating job:", err);
      alert(err.response?.data?.error || "Error creating job");
    } finally {
      setCreating(false);
    }
  };

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

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-semibold">Loading your jobs...</div>;
  }

  const activeJobs = jobs.filter(j => j.status === 'open').length;
  const totalApplicants = jobs.reduce((sum, job) => sum + parseInt(job.resumes_count || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 shadow text-center">
          <div className="text-3xl mb-2">💼</div>
          <div className="text-3xl font-bold text-indigo-600">{activeJobs}</div>
          <div className="text-gray-600 text-sm">Active Jobs</div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow text-center">
          <div className="text-3xl mb-2">📄</div>
          <div className="text-3xl font-bold text-indigo-600">{totalApplicants}</div>
          <div className="text-gray-600 text-sm">Applicants</div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow text-center">
          <div className="text-3xl mb-2">⭐</div>
          <div className="text-3xl font-bold text-indigo-600">-</div>
          <div className="text-gray-600 text-sm">Top Candidates</div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow text-center">
          <div className="text-3xl mb-2">🎯</div>
          <div className="text-3xl font-bold text-indigo-600">-</div>
          <div className="text-gray-600 text-sm">In Interview</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Job Postings</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold px-6 py-2 rounded-lg hover:shadow-lg transition"
          >
            + Create Job
          </button>
        </div>

        <div className="space-y-4">
          {jobs.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No jobs created yet. Click "+ Create Job" to get started.</div>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-400 hover:shadow transition cursor-pointer">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-600">{job.location || 'Location Not Specified'}</p>
                    <p className="text-xs text-gray-400 mt-1">Posted {new Date(job.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {job.resumes_count || 0} Applicants
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold capitalize">
                    Status: {job.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 border-b pb-2">Create New Job</h2>
            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={newJob.title}
                  onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                  placeholder="e.g. Senior Software Engineer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  required
                  rows="4"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={newJob.description}
                  onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                  placeholder="Job responsibilities and requirements..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills (comma separated)</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={newJob.required_skills}
                  onChange={(e) => setNewJob({...newJob, required_skills: e.target.value})}
                  placeholder="e.g. React, Node.js, Python"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience Required</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={newJob.experience_years}
                    onChange={(e) => setNewJob({...newJob, experience_years: e.target.value})}
                    placeholder="e.g. 3-5 years"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={newJob.location}
                    onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                    placeholder="e.g. Remote, New York"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={newJob.salary_range}
                  onChange={(e) => setNewJob({...newJob, salary_range: e.target.value})}
                  placeholder="e.g. $100k - $120k"
                />
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}