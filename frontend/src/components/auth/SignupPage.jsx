import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('recruiter');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    if (roleParam === 'recruiter' || roleParam === 'candidate') {
      setRole(roleParam);
    }
  }, [location]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Pass signup data up, our backend will capture `role` and ensure it gets returned
    const { success, user } = await signup(name, email, password, role, company);
    
    if (success && user) {
      if (user.role === 'recruiter') {
        navigate('/recruiter');
      } else {
        navigate('/candidate');
      }
    } else {
      alert('Signup failed. Please try again or use a different email.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#112240] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-md relative overflow-hidden">
        {/* Role identifier bar */}
        <div className={`absolute top-0 left-0 right-0 h-2 ${role === 'recruiter' ? 'bg-blue-600' : 'bg-indigo-600'}`}></div>
        
        <button 
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1 text-sm font-bold"
        >
          ← Home
        </button>

        <div className="text-center mb-8 pt-4">
          <div className="text-4xl mb-4">
            {role === 'recruiter' ? '👤' : '👤'}
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-1">
            {role === 'recruiter' ? 'Register as Recruiter' : 'Register as Candidate'}
          </h1>
          <p className="text-gray-500 text-sm font-medium">Create your {role} account</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="hidden">
            <label className="block text-sm font-semibold text-gray-800 mb-2">I am a:</label>
            <div className="flex gap-4 mb-4">
              <input type="radio" value="recruiter" checked={role === 'recruiter'} onChange={(e) => setRole(e.target.value)} />
              <input type="radio" value="candidate" checked={role === 'candidate'} onChange={(e) => setRole(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-indigo-600 transition bg-gray-50"
              placeholder="Full Name"
              required
            />
          </div>

          {role === 'recruiter' && (
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Company</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-600 transition bg-gray-50"
                placeholder="Company Name"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-indigo-600 transition bg-gray-50"
              placeholder="email@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-indigo-600 transition bg-gray-50"
              placeholder="Create password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${role === 'recruiter' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-black py-4 rounded-xl shadow-lg transform active:scale-95 transition disabled:opacity-50 mt-4`}
          >
            {loading ? 'Creating Account...' : `Join as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{' '}
          <a onClick={() => navigate(`/login?role=${role}`)} className="text-indigo-600 font-bold cursor-pointer hover:underline">
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
}