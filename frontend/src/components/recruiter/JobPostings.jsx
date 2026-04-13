import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import JobDetailView from './JobDetailView';

export default function JobPostings() {
  const [showModal, setShowModal] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  
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
    return <div className="p-8 text-center text-gray-500 font-semibold uppercase tracking-widest text-[11px] animate-pulse">Synchronizing your dashboard...</div>;
  }

  if (selectedJob) {
    return <JobDetailView job={selectedJob} onBack={() => setSelectedJob(null)} />;
  }

  return (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="bg-white rounded-[1.5rem] shadow-sm p-8 border border-[#e5e7eb] relative overflow-hidden">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-[19px] font-extrabold text-[#111827] tracking-tight">Manage Job Postings</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-[#6366f1] to-[#7c3aed] text-white font-bold px-6 py-2.5 rounded-[0.7rem] hover:shadow-lg transition-transform hover:scale-[1.02]"
          >
            + Create Job Posting
          </button>
        </div>

        <div className="space-y-4">
          {jobs.length === 0 ? (
            <div className="text-center text-gray-500 py-8 font-bold">No jobs created yet. Click "+ Create Job Posting" to get started.</div>
          ) : (
            jobs.map((job) => {
              const diffTime = Math.abs(new Date() - new Date(job.created_at));
              const daysAgo = Math.floor(diffTime / (1000 * 60 * 60 * 24));
              const applicantsCount = job.resumes_count || 0;
              const qualifiedCount = job.qualified_count || 0;
              const inProgressCount = job.in_progress_count || 0;
              const locationStr = job.location || 'Remote';
              const salaryStr = job.salary_range || 'Salary not provided';

              return (
              <div 
                key={job.id} 
                onClick={() => setSelectedJob(job)}
                className="border border-[#e5e7eb] rounded-2xl p-6 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer bg-white group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-[#111827] group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                    <p className="text-[13px] text-[#6b7280] mt-1.5 mb-4 font-medium">
                      Posted {daysAgo === 0 ? 'today' : `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`} | {locationStr} | {salaryStr}
                    </p>
                  </div>
                  <div className="text-gray-300 font-bold group-hover:text-indigo-600 transition-colors">View Pipeline →</div>
                </div>
                <div className="flex gap-4 flex-wrap">
                  <span className="bg-[#ccfbf1] text-[#0f766e] px-4 py-1.5 rounded-full text-[12px] font-bold">
                    {applicantsCount} Applicants
                  </span>
                  <span className="bg-[#ede9fe] text-[#6d28d9] px-4 py-1.5 rounded-full text-[12px] font-bold">
                    {qualifiedCount} Qualified
                  </span>
                  <span className="bg-[#ffedd5] text-[#c2410c] px-4 py-1.5 rounded-full text-[12px] font-bold">
                    {inProgressCount} In Progress
                  </span>
                </div>
              </div>
            )})
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