import React from 'react';

export default function Header({ token, onLogout }) {
  return (
    <header className="bg-gradient-primary text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-1">🧠 Smart Hire AI</h1>
            <p className="text-indigo-100">Backend Testing Frontend</p>
          </div>

          <div className="flex items-center gap-4">
            {token ? (
              <>
                <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full">
                  <span className="text-sm font-semibold">✅ Logged In</span>
                </div>
                <button
                  onClick={onLogout}
                  className="btn btn-warning"
                >
                  Logout
                </button>
              </>
            ) : (
              <p className="text-indigo-100">Login to test protected endpoints</p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}