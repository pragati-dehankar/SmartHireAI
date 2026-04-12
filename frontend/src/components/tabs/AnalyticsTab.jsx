import React, { useState } from 'react';
import apiClient from '../../services/api';

export default function AnalyticsTab({ token, onResponse, onError }) {
  const [analyticsJobId, setAnalyticsJobId] = useState('1');

  const getJobAnalytics = async () => {
    if (!token) {
      onError('Please login first');
      return;
    }
    try {
      const res = await apiClient.get(`/api/analytics/job/${analyticsJobId}`);
      onResponse({
        status: res.status,
        statusText: res.statusText,
        data: res.data,
        endpoint: `/api/analytics/job/${analyticsJobId}`,
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error) {
      onError(error.response?.data?.error || error.message);
    }
  };

  const getSystemAnalytics = async () => {
    if (!token) {
      onError('Please login first');
      return;
    }
    try {
      const res = await apiClient.get('/api/analytics/system');
      onResponse({
        status: res.status,
        statusText: res.statusText,
        data: res.data,
        endpoint: '/api/analytics/system',
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error) {
      onError(error.response?.data?.error || error.message);
    }
  };

  const getFairness = async () => {
    if (!token) {
      onError('Please login first');
      return;
    }
    try {
      const res = await apiClient.get(`/api/fairness/job/${analyticsJobId}`);
      onResponse({
        status: res.status,
        statusText: res.statusText,
        data: res.data,
        endpoint: `/api/fairness/job/${analyticsJobId}`,
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error) {
      onError(error.response?.data?.error || error.message);
    }
  };

  return (
    <div className="section">
      <h2 className="text-2xl font-bold text-gray-800">📊 Analytics & Fairness</h2>

      <div className="form-group">
        <label className="font-semibold text-gray-700">Job ID</label>
        <input
          type="text"
          value={analyticsJobId}
          onChange={(e) => setAnalyticsJobId(e.target.value)}
          className="form-input"
        />
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={getJobAnalytics}
          className="btn btn-info w-full"
        >
          GET /api/analytics/job/:id
        </button>
        <button
          onClick={getSystemAnalytics}
          className="btn btn-info w-full"
        >
          GET /api/analytics/system
        </button>
        <button
          onClick={getFairness}
          className="btn btn-primary w-full"
        >
          ⚖️ GET /api/fairness/job/:id
        </button>
      </div>

      <div className="info-box">
        View job analytics, system statistics, and fairness metrics
      </div>
    </div>
  );
}