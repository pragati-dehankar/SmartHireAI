import React, { useState } from 'react';

export default function ResumePage() {
  const [resumes] = useState([]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">📄 Resume Management</h2>

      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
        <div className="font-bold text-indigo-900">ℹ️ Resume Upload Guide:</div>
        <div className="text-sm text-indigo-800 mt-2">
          <div>✓ Our AI extracts your skills automatically</div>
          <div>✓ Identifies your experience level</div>
          <div>✓ Matches you with relevant jobs</div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="font-bold text-gray-900 mb-4">Your Resumes ({resumes.length})</div>

        <div className="space-y-3">
          {resumes.length === 0 ? (
            <div className="text-center text-gray-500 py-4">No resumes uploaded yet. Upload one to start applying!</div>
          ) : (
            resumes.map(r => (
              <div key={r.id} className="bg-white border border-gray-300 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <div className="font-bold text-gray-900">{r.name}</div>
                  <div className="text-sm text-gray-600">Uploaded recently</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="border-2 border-dashed border-indigo-400 rounded-lg p-12 text-center bg-indigo-50 cursor-pointer hover:bg-indigo-100 transition">
        <div className="text-5xl mb-3">📄</div>
        <div className="font-bold text-gray-900 mb-1">Upload New Resume</div>
        <div className="text-sm text-gray-600">Drop PDF/DOC here or click to browse</div>
      </div>
    </div>
  );
}