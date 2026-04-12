import React, { useState } from 'react';
import apiClient from '../../services/api';

export default function ResumesTab({ token, onResponse, onError }) {
  const [resumeJobId, setResumeJobId] = useState('1');
  const [candidateName, setCandidateName] = useState('John Developer');
  const [candidateEmail, setCandidateEmail] = useState('john@example.com');
  const [resumeId, setResumeId] = useState('1');

  const uploadResume = async () => {
    if (!token) {
      onError('Please login first');
      return;
    }

    const formData = new FormData();
    const resumeContent = `John Developer
Senior Python Engineer

SKILLS:
Python, Django, FastAPI, PostgreSQL, MongoDB, REST APIs, GraphQL, Docker, Kubernetes, AWS

EXPERIENCE:
5+ years as Python Developer at Tech Company
- Built scalable REST APIs
- Managed databases and migrations
- Led team of developers
- Deployed to AWS and Docker

EDUCATION:
Bachelor of Science in Computer Science`;

    formData.append('resume', new Blob([resumeContent], { type: 'text/plain' }), 'resume.txt');
    formData.append('jobID', resumeJobId);
    formData.append('candidateName', candidateName);
    formData.append('candidateEmail', candidateEmail);

    try {
      const res = await apiClient.post('/api/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.resumeId) {
        setResumeId(res.data.resumeId);
      }
      onResponse({
        status: res.status,
        statusText: res.statusText,
        data: res.data,
        endpoint: '/api/resumes/upload',
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error) {
      onError(error.response?.data?.error || error.message);
    }
  };

  const scoreResume = async () => {
    if (!token) {
      onError('Please login first');
      return;
    }
    try {
      const res = await apiClient.post(`/api/resumes/${resumeId}/score`, {});
      onResponse({
        status: res.status,
        statusText: res.statusText,
        data: res.data,
        endpoint: `/api/resumes/${resumeId}/score`,
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error) {
      onError(error.response?.data?.error || error.message);
    }
  };

  const listResumes = async () => {
    if (!token) {
      onError('Please login first');
      return;
    }
    try {
      const res = await apiClient.get(`/api/resumes/job/${resumeJobId}`);
      onResponse({
        status: res.status,
        statusText: res.statusText,
        data: res.data,
        endpoint: `/api/resumes/job/${resumeJobId}`,
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error) {
      onError(error.response?.data?.error || error.message);
    }
  };

  return (
    <div className="section">
      <h2 className="text-2xl font-bold text-gray-800">📄 Resume Management</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="font-semibold text-gray-700">Job ID</label>
          <input
            type="text"
            value={resumeJobId}
            onChange={(e) => setResumeJobId(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="font-semibold text-gray-700">Resume ID</label>
          <input
            type="text"
            value={resumeId}
            onChange={(e) => setResumeId(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="font-semibold text-gray-700">Candidate Name</label>
          <input
            type="text"
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="font-semibold text-gray-700">Candidate Email</label>
          <input
            type="email"
            value={candidateEmail}
            onChange={(e) => setCandidateEmail(e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={uploadResume} className="btn btn-success flex-1">
          POST /api/resumes/upload
        </button>
        <button onClick={listResumes} className="btn btn-info flex-1">
          GET /api/resumes/job/:id
        </button>
      </div>

      <button
        onClick={scoreResume}
        className="btn btn-warning w-full"
      >
        🧠 POST /api/resumes/:id/score (BERT AI)
      </button>

      <div className="info-box">
        Upload resume first, then score with BERT AI to test the model
      </div>
    </div>
  );
}