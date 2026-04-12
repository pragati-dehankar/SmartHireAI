import React, { useState, useEffect } from 'react';
// import apiClient from '../../services/api';

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Future API Integration Point
  /*
  useEffect(() => {
    // Implement candidate resume fetch route here once backend supports it
  }, []);
  */

  if (loading) return <div className="p-8 text-center text-gray-500 font-semibold">Loading applications...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Applications ({applications.length})</h2>

      <div className="space-y-4">
        {applications.length === 0 ? (
          <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg border border-gray-200">
            No applications found. You haven't applied to any jobs yet!
          </div>
        ) : (
          applications.map((app) => (
            <div key={app.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-400 hover:shadow transition flex justify-between items-center">
              <div>
                <div className="font-bold text-gray-900">{app.jobTitle}</div>
                <div className="text-sm text-gray-600">Applied recently</div>
              </div>
              <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold text-sm capitalize">
                Under Review
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}