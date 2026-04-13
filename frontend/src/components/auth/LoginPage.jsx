import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NeuralBackground from '../home/NeuralBackground';

export default function LoginPage() {
  const [email, setEmail] = useState('demo@techcorp.com');
  const [password, setPassword] = useState('demo123');
  const [loading, setLoading] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [roleMode, setRoleMode] = useState('recruiter');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    if (roleParam === 'recruiter' || roleParam === 'candidate') {
      setRoleMode(roleParam);
    }
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { success, user } = await login(email, password);
    
    if (success && user) {
      if (user.role !== roleMode) {
        alert(`Access Denied: You are trying to log into the ${roleMode} portal with your ${user.role} account.`);
        logout(); // Discard the invalid session
      } else {
        navigate(user.role === 'recruiter' ? '/recruiter' : '/candidate');
        return;
      }
    } else {
      alert('Login failed. Please check your credentials.');
    }
    setLoading(false);
  };

  const quickAccessDemo = async () => {
    setLoading(true);
    const { success, user } = await login('demo@techcorp.com', 'demo123');
    if (success && user) {
      if (user.role !== roleMode) {
        alert(`Access Denied: This quick access is for a ${user.role} account, but you are in the ${roleMode} portal.`);
        logout();
      } else {
        navigate(user.role === 'recruiter' ? '/recruiter' : '/candidate');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      <NeuralBackground />
      
      <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl p-8 w-full max-w-md relative z-10 border border-gray-100">
        {/* Role identifier bar */}
        <div className={`absolute top-0 left-0 right-0 h-2 ${roleMode === 'recruiter' ? 'bg-blue-600' : 'bg-indigo-600'}`}></div>
        
        <button 
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1 text-sm font-bold"
        >
          ← Home
        </button>
        
        <div className="text-center mb-8 pt-4">
          <div className={`text-4xl mb-4`}>
            {roleMode === 'recruiter' ? '👤' : '👤'}
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-1">
            {roleMode === 'recruiter' ? 'Recruiter Login' : 'Candidate Login'}
          </h1>
          <p className="text-gray-500 text-sm font-medium tracking-tight">
            Sign in to your {roleMode} portal
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 transition"
              placeholder="demo@techcorp.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 transition"
              placeholder="Enter your password"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full ${roleMode === 'recruiter' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-bold py-4 rounded-xl shadow-lg transform active:scale-95 transition disabled:opacity-50`}
            >
              {loading ? 'Authenticating...' : `Enter as ${roleMode.charAt(0).toUpperCase() + roleMode.slice(1)}`}
            </button>
          </div>
        </form>

        {roleMode === 'recruiter' && (
          <div className="mt-6 pt-6 border-t border-gray-100 font-sans">
            <button
              onClick={quickAccessDemo}
              disabled={loading}
              className="w-full bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition disabled:opacity-50"
            >
              ✅ Quick Access (Demo Recruiter)
            </button>
          </div>
        )}

        <div className="text-center mt-6 text-sm text-gray-600">
          Don't have an account?{' '}
          <button 
            onClick={() => navigate(`/signup?role=${roleMode}`)} 
            className="text-indigo-600 font-bold hover:underline transition-all"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}