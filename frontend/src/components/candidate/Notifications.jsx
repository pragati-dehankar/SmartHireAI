import React, { useState } from 'react';

export default function Notifications() {
  const [notifications] = useState([]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">🔔 Notifications ({notifications.length})</h2>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg border border-gray-200">
            You don't have any new notifications.
          </div>
        ) : (
          notifications.map((notif) => (
            <div key={notif.id} className="border-l-4 border-indigo-600 bg-indigo-50 p-4 rounded-lg">
              <div className="flex gap-4">
                <div className="text-3xl">{notif.icon}</div>
                <div className="flex-1">
                  <div className="font-bold text-gray-900">{notif.title}</div>
                  <div className="text-sm text-gray-600 mt-1">{notif.text}</div>
                  <div className="text-xs text-gray-500 mt-2">{notif.date}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}