import React, { useState } from 'react';
import apiClient from '../../services/api';

export default function JobsTab({ token, onResponse, onError }) {
  const [jobTitle, setJobTitle] = useState('Senior Python Developer');
  const [jobDescription, setJobDescription] = useState('We are looking for a Senior Python developer with 5+ years experience');
  const [requiredSkills, setRequiredSkills] = useState('Python,Django,REST APIs,PostgreSQL');
  const [jobId, setJobId] = useState('1');

  const createJob = async () => {
    if (!token) {
      onError('Please login first');
      return;
    }
    try {
      const res = await apiClient.post('/api/jobs', {
        title: jobTitle,
        description: jobDescription,
        required_skills: requiredSkills.split(',').map(s => s.trim())
      });
      onResponse({
        status: res.status,
        statusText: res.statusText,
        data: res.data,
        endpoint: '/api/jobs',
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error) {
      onError(error.response?.data?.error || error.message);
    }
  };

  const listJobs = async () => {
    if (!token) {
      onError('Please login first');
      return;
    }
    try {
      const res = await apiClient.get('/api/jobs');
      onResponse({
        status: res.status,
        statusText: res.statusText,
        data: res.data,
        endpoint: '/api/jobs',
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error) {
      onError(error.response?.data?.error || error.message);
    }
  };

  const getJob = async () => {
    if (!token) {
      onError('Please login first');
      return;
    }
    try {
      const res = await apiClient.get(`/api/jobs/${jobId}`);
      onResponse({
        status: res.status,
        statusText: res.statusText,
        data: res.data,
        endpoint: `/api/jobs/${jobId}`,
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error) {
      onError(error.response?.data?.error || error.message);
    }
  };

  return (
    <div className="section">
      <h2 className="text-2xl font-bold text-gray-800">💼 Job Management</h2>

      <div className="form-group">
        <label className="font-semibold text-gray-700">Job Title</label>
        <input
          type="text"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label className="font-semibold text-gray-700">Job Description</label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          className="form-input resize-none h-24"
        />
      </div>

      <div className="form-group">
        <label className="font-semibold text-gray-700">Required Skills</label>
        <input
          type="text"
          value={requiredSkills}
          onChange={(e) => setRequiredSkills(e.target.value)}
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label className="font-semibold text-gray-700">Job ID (for get)</label>
        <input
          type="text"
          value={jobId}
          onChange={(e) => setJobId(e.target.value)}
          className="form-input"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={createJob} className="btn btn-success flex-1">
          POST /api/jobs
        </button>
        <button onClick={listJobs} className="btn btn-info flex-1">
          GET /api/jobs
        </button>
        <button onClick={getJob} className="btn btn-info flex-1">
          GET /api/jobs/:id
        </button>
      </div>

      <div className="info-box">
        Create a job, then list or get details
      </div>
    </div>
  );
}