import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/api';

export default function ProfilePage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', location: '', job_title: '', github_url: '', portfolio_url: '', skills: ['React', 'TypeScript', 'Next.js', 'Node.js', 'CSS']
  });
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
       try {
          const res = await apiClient.get('/api/candidate/profile');
          setFormData(prev => ({ ...prev, ...res.data }));
       } catch (err) {
          console.error("Error fetching profile", err);
          if (user) {
             setFormData(prev => ({ ...prev, name: user.name, email: user.email }));
          }
       } finally {
          setLoading(false);
       }
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
       await apiClient.post('/api/candidate/profile', formData);
       alert('Profile updated successfully!');
    } catch (err) {
       console.error("Save error:", err);
    } finally {
       setSaving(false);
    }
  };

  const addSkill = (e) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      if (!formData.skills.includes(newSkill.trim())) {
        setFormData({ ...formData, skills: [...formData.skills, newSkill.trim()] });
      }
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-semibold animate-pulse">Syncing your profile data...</div>;

  return (
    <div className="animate-in fade-in duration-500 space-y-8 max-w-7xl mx-auto pb-12">
      {/* PAGE HEADER */}
      <div className="flex justify-between items-center bg-white rounded-[1.5rem] p-8 shadow-sm border border-[#e5e7eb]">
         <div>
            <h2 className="text-[26px] font-extrabold text-[#111827] tracking-tight leading-none">My Profile</h2>
            <p className="text-[#6b7280] text-[15px] font-medium mt-2">Manage your personal and professional information</p>
         </div>
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#f0f9ff] text-[#0369a1] px-4 py-2 rounded-full text-[12px] font-black border border-[#bae6fd]">
               <span className="w-2 h-2 bg-[#0ea5e9] rounded-full animate-pulse"></span>
               AI Matching Active
            </div>
            <button className="w-10 h-10 rounded-full bg-white border border-[#e5e7eb] flex items-center justify-center text-yellow-500 shadow-sm">🔔</button>
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md">
               {formData.name?.charAt(0) || 'U'}
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: PROFILE INFO */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-[#e5e7eb] relative">
              <div className="flex justify-between items-center mb-12">
                 <div className="flex items-center gap-6">
                    <div className="relative">
                       <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-indigo-100 rotate-3 transition-transform hover:rotate-0">
                          {formData.name?.charAt(0) || 'S'}
                       </div>
                       <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-black border-4 border-white rounded-xl flex items-center justify-center text-[12px]">✨</div>
                    </div>
                    <div>
                       <h3 className="text-[32px] font-black text-[#111827] tracking-tighter leading-none">{formData.name || 'Full Name'}</h3>
                       <p className="text-[#64748b] text-[15px] font-bold mt-2 uppercase tracking-wide">
                          {formData.job_title || 'Design Your Future'} · {formData.location || 'Everywhere'}
                       </p>
                    </div>
                 </div>
                 <button 
                   onClick={handleSave} 
                   className="bg-[#0ea5e9] text-white px-10 py-4 rounded-2xl font-black text-[15px] hover:bg-[#0284c7] transition hover:scale-105 active:scale-95 shadow-xl shadow-sky-100 disabled:opacity-50"
                   disabled={saving}
                 >
                    {saving ? 'Saving...' : 'Save Profile'}
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {[
                   { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Sarah Johnson' },
                   { label: 'Email Address', key: 'email', type: 'email', placeholder: 'sarah@example.com', disabled: true },
                   { label: 'Phone Number', key: 'phone', type: 'text', placeholder: '+1 (555) 123-4567' },
                   { label: 'Active Location', key: 'location', type: 'text', placeholder: 'San Francisco, CA' },
                   { label: 'Current Job Title', key: 'job_title', type: 'text', placeholder: 'Senior Frontend Developer' },
                   { label: 'GitHub Handle', key: 'github_url', type: 'text', placeholder: 'github.com/username' },
                   { label: 'Portfolio Website', key: 'portfolio_url', type: 'text', placeholder: 'https://mysite.com' }
                 ].map((field, idx) => (
                   <div key={field.key} className={`space-y-3 ${field.key === 'name' ? 'md:col-span-2' : ''}`}>
                      <label className="text-[12px] font-black text-[#1e293b] uppercase tracking-widest pl-1">{field.label}</label>
                      <input 
                        type={field.type}
                        value={formData[field.key] || ''}
                        disabled={field.disabled}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        className={`w-full ${field.disabled ? 'bg-gray-50 text-gray-400 italic' : 'bg-[#fcfcfd]'} border border-[#e5e7eb] rounded-2xl px-6 py-4 text-[15px] font-bold text-[#1e293b] focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all shadow-sm`}
                        placeholder={field.placeholder}
                      />
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* RIGHT COLUMN: SKILLS & STRENGTH */}
        <div className="lg:col-span-1 space-y-8">
           {/* SKILLS CARD */}
           <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-[#e5e7eb] space-y-6">
              <div className="flex justify-between items-center">
                 <h4 className="text-[18px] font-black text-[#111827] tracking-tight">Technical Arsenal</h4>
                 <div className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase">Verified</div>
              </div>
              <div className="flex flex-wrap gap-2">
                 {formData.skills.map((skill, idx) => (
                   <span key={idx} className="group bg-[#f8fafc] text-[#475569] border border-[#e5e7eb] px-4 py-2 rounded-xl text-[13px] font-bold shadow-sm hover:border-pink-300 hover:text-pink-600 transition-colors flex items-center gap-2">
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                   </span>
                 ))}
              </div>
              <div className="pt-4 border-t border-gray-50">
                 <input 
                   type="text" 
                   value={newSkill}
                   onChange={(e) => setNewSkill(e.target.value)}
                   onKeyDown={addSkill}
                   placeholder="Type a skill and press Enter"
                   className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl px-6 py-4 text-[14px] font-bold outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all border-dashed"
                 />
              </div>
           </div>

           {/* CONTEXT STRENGTH CARD */}
           <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-[#e5e7eb] space-y-10">
              <h4 className="text-[18px] font-black text-[#111827] tracking-tight">Context Profile Strength</h4>
              <div className="space-y-8">
                 {[
                   { label: 'Skill Keywords', val: 95, color: 'from-indigo-500 to-indigo-600' },
                   { label: 'Project Descriptions', val: 88, color: 'from-sky-500 to-sky-600' },
                   { label: 'Role History', val: 92, color: 'from-purple-500 to-purple-600' },
                   { label: 'Portfolio / GitHub', val: 40, color: 'from-orange-500 to-amber-500' },
                   { label: 'About Me Bio', val: 70, color: 'from-emerald-500 to-teal-500' }
                 ].map((stat, idx) => (
                   <div key={idx} className="space-y-3">
                      <div className="flex justify-between items-center">
                         <span className="text-[13px] font-bold text-[#64748b]">{stat.label}</span>
                         <span className={`text-[14px] font-black ${stat.val < 50 ? 'text-orange-600' : 'text-indigo-600'}`}>{stat.val}%</span>
                      </div>
                      <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner border border-white">
                         <div 
                           className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-[1500ms] shadow-lg`} 
                           style={{ width: `${stat.val}%` }}
                         ></div>
                      </div>
                   </div>
                 ))}
              </div>
              
              <div className="bg-[#f0f9ff]/50 p-5 rounded-2xl border border-indigo-50">
                 <p className="text-[12px] text-indigo-700 font-bold leading-relaxed italic">
                    💡 "Candidates with a Portfolio link are 5x more likely to be shortlisted for Lead roles."
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}