import React from 'react';
import apiClient from '../../services/api';

export default function HealthCheck({ onResponse, onError }) {
  const testHealth = async () => {
    try {
      const res = await apiClient.get('/api/health');
      onResponse({
        status: res.status,
        statusText: res.statusText,
        data: res.data,
        endpoint: '/api/health',
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error) {
      onError(error.message);
    }
  };

  return (
    <div className="section">
      <h2 className="text-2xl font-bold text-gray-800">🏥 Health Check</h2>
      <p className="text-gray-600">
        Test if backend is running and all features are enabled
      </p>
      <button
        onClick={testHealth}
        className="btn btn-primary w-full sm:w-auto"
      >
        GET /api/health
      </button>
    </div>
  );
}