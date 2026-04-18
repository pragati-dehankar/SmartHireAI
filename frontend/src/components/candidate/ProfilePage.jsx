import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/api';

export default function ProfilePage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', location: '', job_title: '', github_url: '', portfolio_url: '', skills: ['React', 'TypeScript', 'Next.js', 'Node.js', 'Tailwind'],
    visible: true
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
    if (!formData.name || formData.name.length < 2) {
       alert('Neural identity requires a valid name (min 2 chars).');
       return;
    }
    if (!formData.phone || formData.phone.length < 5) {
       alert('Contact signal (phone) is required for recruiter uplink.');
       return;
    }

    setSaving(true);
    try {
       await apiClient.post('/api/candidate/profile', formData);
       alert('Profile synchronized successfully!');
    } catch (err) {
       console.error("Save error:", err);
       alert('Sync failure: ' + (err.response?.data?.error || 'Unknown network interference'));
    } finally {
       setSaving(false);
    }
  };

  const addSkill = (e) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      e.preventDefault();
      if (!formData.skills.includes(newSkill.trim())) {
        setFormData({ ...formData, skills: [...formData.skills, newSkill.trim()] });
      }
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  if (loading) return (
     <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
        <div className="font-black text-slate-400 text-xs uppercase tracking-[0.2em]">Accessing Profile Nodes</div>
     </div>
  );

  return (
    <div className="animate-fade-in space-y-8 max-w-6xl mx-auto pb-12">
      {/* View Header */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[2rem] shadow-sm border border-slate-50 gap-6">
         <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Identity & Profile</h2>
            <p className="text-slate-500 font-medium mt-1">Manage how recruiters and the BERT engine perceive your professional identity.</p>
         </div>
         <button 
           onClick={handleSave} 
           disabled={saving}
           className="btn-primary rounded-2xl px-12 py-4 shadow-xl"
         >
            {saving ? 'Synchronizing...' : 'Save Profile Changes'}
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Core Identity Details */}
        <div className="lg:col-span-2 space-y-8">
           <div className="card p-10 relative overflow-hidden">
              <div className="flex items-center gap-8 mb-12">
                 <div className="relative group">
                    <div className="w-28 h-28 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white text-5xl font-black shadow-2xl transition-transform group-hover:rotate-6">
                       {formData.name?.charAt(0) || 'U'}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-900 border-4 border-white rounded-2xl flex items-center justify-center text-xl shadow-lg">✨</div>
                 </div>
                 <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">{formData.name || 'Set Name'}</h3>
                    <div className="flex items-center gap-3 mt-1">
                       <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">{formData.job_title || 'Expert Candidate'}</span>
                       <span className="w-1 h-1 bg-slate-200 rounded-full" />
                       <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{formData.location || 'Global Target'}</span>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {[
                   { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Identity name for BERT parsing' },
                   { label: 'Primary Email', key: 'email', type: 'email', placeholder: 'Locked as login identifier', disabled: true },
                   { label: 'Neural Contact', key: 'phone', type: 'text', placeholder: '+1 (555) 000-0000' },
                   { label: 'Current Base', key: 'location', type: 'text', placeholder: 'City, Country' },
                   { label: 'Primary Role', key: 'job_title', type: 'text', placeholder: 'Senior Frontend Architect' },
                   { label: 'GitHub Ecosystem', key: 'github_url', type: 'text', placeholder: 'github.com/yourhandle' },
                   { label: 'Digital Portfolio', key: 'portfolio_url', type: 'text', placeholder: 'yourname.dev' }
                 ].map((field) => (
                   <div key={field.key} className={field.key === 'name' ? 'md:col-span-2' : ''}>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2.5 pl-1">{field.label}</label>
                      <input 
                        type={field.type}
                        value={formData[field.key] || ''}
                        disabled={field.disabled}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        className={`w-full px-5 py-4 rounded-2xl border-2 text-sm font-bold transition-all ${
                           field.disabled ? 'bg-slate-50 border-slate-50 text-slate-300' : 'bg-white border-slate-50 focus:border-indigo-600 focus:outline-none'
                        }`}
                        placeholder={field.placeholder}
                      />
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Sidebar: Skills & AI Status */}
        <div className="space-y-8">
           {/* Technical Arsenal */}
           <div className="card p-8">
              <div className="flex justify-between items-center mb-8">
                 <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Stack Inventory</h4>
                 <div className="bert-live-indicator"><div className="dot" /> Verified</div>
              </div>
              <div className="flex flex-wrap gap-2">
                 {formData.skills.map((skill, idx) => (
                    <span key={idx} className="tag tag-indigo py-2 px-4 text-xs group flex items-center gap-2">
                       {skill}
                       <button onClick={() => removeSkill(skill)} className="opacity-40 hover:opacity-100 transition-opacity">✕</button>
                    </span>
                 ))}
              </div>
              <div className="mt-8 pt-6 border-t border-slate-50">
                 <input 
                   type="text" 
                   value={newSkill}
                   onChange={(e) => setNewSkill(e.target.value)}
                   onKeyDown={addSkill}
                   placeholder="Add neural skill signal..."
                   className="w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl px-5 py-3 text-xs font-bold outline-none focus:bg-white focus:border-indigo-600 focus:border-solid transition-all"
                 />
              </div>
           </div>

           {/* Profile Performance */}
           <div className="card p-8 space-y-10">
              <div className="flex justify-between items-center">
                 <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Profile Visibility</h4>
                 <button 
                   onClick={() => setFormData(prev => ({ ...prev, visible: !prev.visible }))}
                   className={`w-12 h-6 rounded-full transition-all relative ${formData.visible ? 'bg-indigo-600' : 'bg-slate-200'}`}
                 >
                   <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.visible ? 'right-1' : 'left-1'}`} />
                 </button>
              </div>
              
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Signal Integrity</h4>
              <div className="space-y-8">
                 {[
                   { label: 'Semantic Keywords', val: 92, color: 'indigo' },
                   { label: 'Experience Depth', val: 85, color: 'violet' },
                   { label: 'Contact Stability', val: 100, color: 'emerald' },
                   { label: 'Social Velocity', val: 45, color: 'amber' }
                 ].map((stat, idx) => (
                   <div key={idx} className="space-y-2.5">
                      <div className="flex justify-between items-center">
                         <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{stat.label}</span>
                         <span className={`text-xs font-black text-${stat.color}-600`}>{stat.val}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden flex border border-slate-50 p-0.5">
                         <div 
                           className={`h-full bg-${stat.color}-600 rounded-full transition-all duration-[2000ms] shadow-inner`} 
                           style={{ width: `${stat.val}%` }}
                         />
                      </div>
                   </div>
                 ))}
              </div>
              
              <div className="bg-indigo-50 p-6 rounded-[1.5rem] border border-indigo-100">
                 <p className="text-[11px] text-indigo-700 font-bold leading-relaxed italic">
                    💡 "Profiles with verified GitHub handles show a 40% higher shortlist probability in the current node."
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}