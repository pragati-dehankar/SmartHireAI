import React, { useState } from 'react';
import apiClient from '../../services/api';

export default function AuthTab({ onResponse, onError, onTokenUpdate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');

  const register = async () => {
    if (!email || !password || !name) {
      onError('Email, password, and name are required');
      return;
    }
    try {
      const res = await apiClient.post('/api/auth/register', {
        email,
        password,
        name,
        company
      });
      if (res.data.token) {
        onTokenUpdate(res.data.token);
      }
      onResponse({
        status: res.status,
        statusText: res.statusText,
        data: res.data,
        endpoint: '/api/auth/register',
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error) {
      onError(error.response?.data?.error || error.message);
    }
  };

  const login = async () => {
    if (!email || !password) {
      onError('Email and password are required');
      return;
    }
    try {
      const res = await apiClient.post('/api/auth/login', {
        email,
        password
      });
      if (res.data.token) {
        onTokenUpdate(res.data.token);
      }
      onResponse({
        status: res.status,
        statusText: res.statusText,
        data: res.data,
        endpoint: '/api/auth/login',
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error) {
      onError(error.response?.data?.error || error.message);
    }
  };

  const getProfile = async () => {
    try {
      const res = await apiClient.get('/api/auth/profile');
      onResponse({
        status: res.status,
        statusText: res.statusText,
        data: res.data,
        endpoint: '/api/auth/profile',
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error) {
      onError(error.response?.data?.error || error.message);
    }
  };

  return (
    <div className="section">
      <h2 className="text-2xl font-bold text-gray-800">🔐 Authentication</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="font-semibold text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="test@example.com"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="font-semibold text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password123"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="font-semibold text-gray-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="font-semibold text-gray-700">Company</label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Tech Corp"
            className="form-input"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={register}
          className="btn btn-success flex-1"
        >
          POST /api/auth/register
        </button>
        <button
          onClick={login}
          className="btn btn-success flex-1"
        >
          POST /api/auth/login
        </button>
        <button
          onClick={getProfile}
          className="btn btn-info flex-1"
        >
          GET /api/auth/profile
        </button>
      </div>

      <div className="info-box">
        Register with new email, then Login to get token
      </div>
    </div>
  );
}