import React from 'react';

export default function ResponseDisplay({ response, error, loading }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-full flex flex-col">
      <h3 className="text-xl font-bold text-gray-800 mb-4">📡 Response</h3>

      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-3">⏳</div>
            <p className="text-indigo-600 font-semibold">Loading...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="error-box mb-4">
          ❌ {error}
        </div>
      )}

      {response && (
        <div className="flex-1 flex flex-col gap-3 overflow-auto">
          <div className="bg-gray-100 rounded p-4 flex flex-wrap gap-3 items-center">
            <span className={`px-3 py-1 rounded font-bold text-sm ${
              response.status < 400
                ? 'bg-emerald-200 text-emerald-800'
                : 'bg-red-200 text-red-800'
            }`}>
              {response.status} {response.statusText}
            </span>
            <span className="text-indigo-600 font-semibold text-sm">
              {response.endpoint}
            </span>
            <span className="text-gray-600 text-xs ml-auto">
              {response.timestamp}
            </span>
          </div>

          <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-auto flex-1 font-mono">
            {JSON.stringify(response.data, null, 2)}
          </pre>
        </div>
      )}

      {!loading && !error && !response && (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <p className="text-center italic">
            Click a button to test an endpoint
          </p>
        </div>
      )}
    </div>
  );
}