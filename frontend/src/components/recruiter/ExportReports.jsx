import React from 'react';

export default function ExportReports() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📥 Export & Reports</h2>

        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-gray-900 mb-4">📋 Candidate Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="border border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 p-4 rounded-lg transition text-left font-semibold">
                📄 Export Top Candidates (PDF)
              </button>
              <button className="border border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 p-4 rounded-lg transition text-left font-semibold">
                📊 Export Ranking Report (Excel)
              </button>
              <button className="border border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 p-4 rounded-lg transition text-left font-semibold">
                💼 Export All Candidate Data
              </button>
              <button className="border border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 p-4 rounded-lg transition text-left font-semibold">
                📈 Export Screening Analysis
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-4">⚖️ Fairness & Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="border border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 p-4 rounded-lg transition text-left font-semibold">
                ⚖️ Export Fairness Report
              </button>
              <button className="border border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 p-4 rounded-lg transition text-left font-semibold">
                ✨ Export Bias Analysis
              </button>
              <button className="border border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 p-4 rounded-lg transition text-left font-semibold">
                📊 Export Diversity Metrics
              </button>
              <button className="border border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 p-4 rounded-lg transition text-left font-semibold">
                🎯 Export Performance Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}