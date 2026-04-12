import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-6 border-t border-gray-800">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm">
          &copy; 2024 Smart Hire AI - Testing Frontend
        </p>
        <p className="text-sm">
          Backend: <span className="text-indigo-400">http://localhost:5000</span>
        </p>
        <p className="text-sm text-emerald-400 font-semibold mt-2">
          ✅ Testing all 18 API endpoints
        </p>
      </div>
    </footer>
  );
}