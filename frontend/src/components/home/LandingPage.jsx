import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'recruiter') {
        navigate('/recruiter');
      } else {
        navigate('/candidate');
      }
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="relative min-h-screen bg-[#112240] flex items-center justify-center p-6 font-sans overflow-hidden">
      {/* Background mountains/texture (subtle overlay) */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center mix-blend-overlay"></div>
      
      {/* Animated Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Logo Section */}
        <div className="w-32 h-32 mb-8 relative">
          <div className="absolute inset-0 bg-white/10 rounded-full border-4 border-white/20 backdrop-blur-md animate-spin-slow"></div>
          <div className="absolute inset-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl border-2 border-white/30">
             <div className="text-4xl font-black text-white tracking-widest">SH</div>
          </div>
        </div>

        {/* Title Section */}
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-gray-300 text-xl font-bold tracking-[0.2em] uppercase">SmartHire AI</h2>
          <h1 className="text-3xl md:text-4xl font-black text-orange-500 tracking-tight leading-none px-4">
            RECRUITMENT EXCELLENCE <br /> PLATFORM
          </h1>
          <p className="text-gray-400 text-sm font-medium tracking-wide mt-4 opacity-80">
            Intelligent BERT-Powered Hiring System
          </p>
        </div>

        {/* Divider with Icon */}
        <div className="w-full flex items-center gap-4 mb-10">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/20"></div>
          <div className="text-gray-400 text-xl">
             <span>🧠</span>
          </div>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/20"></div>
        </div>

        {/* Feature Badges */}
        <div className="flex gap-3 mb-12">
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2 backdrop-blur-md">
            <span className="text-orange-500 text-xs">⚡</span>
            <span className="text-[10px] font-bold text-gray-200 uppercase tracking-wider">BERT Scored</span>
          </div>
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2 backdrop-blur-md">
            <span className="text-orange-500 text-xs">✔</span>
            <span className="text-[10px] font-bold text-gray-200 uppercase tracking-wider">Bias Free</span>
          </div>
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2 backdrop-blur-md">
            <span className="text-orange-500 text-xs">📊</span>
            <span className="text-[10px] font-bold text-gray-200 uppercase tracking-wider">Analytics</span>
          </div>
        </div>

        {/* Role Cards */}
        <div className="w-full space-y-4">
          {/* Candidate Card */}
          <button 
            onClick={() => navigate('/login?role=candidate')}
            className="w-full group relative flex items-center bg-white rounded-3xl p-5 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/20 text-left"
          >
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mr-4 group-hover:bg-indigo-100 transition-colors">
              <span className="text-3xl">👨💻</span>
            </div>
            <div className="flex-1">
              <h3 className="text-indigo-900 font-bold text-lg">Enter as Candidate</h3>
              <p className="text-gray-500 text-xs font-medium">Apply & track your job applications</p>
            </div>
            <div className="text-indigo-400 font-bold text-xl transition-transform group-hover:translate-x-1">
              →
            </div>
          </button>

          {/* Recruiter Card */}
          <button 
            onClick={() => navigate('/login?role=recruiter')}
            className="w-full group relative flex items-center bg-blue-600 rounded-3xl p-5 border border-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/20 text-left"
          >
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mr-4 group-hover:bg-white/20 transition-colors">
              <span className="text-3xl">👩💼</span>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg">Enter as Recruiter</h3>
              <p className="text-blue-100/70 text-xs font-medium">Manage jobs & rank applications</p>
            </div>
            <div className="text-white/50 font-bold text-xl transition-transform group-hover:translate-x-1">
              →
            </div>
          </button>
        </div>

        {/* Footer info */}
        <p className="mt-12 text-gray-500 text-[10px] font-bold tracking-widest uppercase opacity-60">
          Secure AI-Driven Recruitment &copy; 2026
        </p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 15s linear infinite;
        }
      `}} />
    </div>
  );
};

export default LandingPage;
