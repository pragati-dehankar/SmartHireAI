import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';

export default function ResumePage() {
   const [resumes, setResumes] = useState([]);
   const [loading, setLoading] = useState(true);
   const [uploading, setUploading] = useState(false);
   const [parseResults, setParseResults] = useState({
      name: 0, skills: 0, projects: 0, history: 0
   });

   useEffect(() => {
      const fetchResumes = async () => {
         try {
            const res = await apiClient.get('/api/candidate/applications');
            setResumes(res.data);
         } catch (err) {
            console.error("Error fetching resumes:", err);
         } finally {
            setLoading(false);
         }
      };
      fetchResumes();
   }, []);

   const handleFileUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      setUploading(true);
      setParseResults({ name: 0, skills: 0, projects: 0, history: 0 });

      const formData = new FormData();
      formData.append('resume', file);
      formData.append('candidateName', 'User'); // In real app, get from Profile
      formData.append('candidateEmail', 'user@example.com');
      formData.append('jobId', '1'); // Default/General Job ID

      try {
         await apiClient.post('/api/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
         });

         // Simulate BERT Analysis Animation
         setTimeout(() => setParseResults(prev => ({ ...prev, name: 100 })), 500);
         setTimeout(() => setParseResults(prev => ({ ...prev, skills: 100 })), 1000);
         setTimeout(() => setParseResults(prev => ({ ...prev, projects: 100 })), 1500);
         setTimeout(() => setParseResults(prev => ({ ...prev, history: 100 })), 2000);

         // Refresh list
         const res = await apiClient.get('/api/candidate/applications');
         setResumes(res.data);
         alert("Resume uploaded and analyzed by BERT successfully!");
      } catch (err) {
         console.error("Upload error:", err);
         alert("Upload failed. Ensure backend is running.");
      } finally {
         setUploading(false);
      }
   };

   const handleDelete = async (id) => {
      if (!window.confirm("Are you sure?")) return;
      try {
         await apiClient.delete(`/api/resumes/${id}`);
         setResumes(resumes.filter(r => r.id !== id));
      } catch (err) {
         console.error("Delete error:", err);
      }
   };

   if (loading) return <div className="p-8 text-center text-gray-500 font-semibold animate-pulse">Scanning your document vault...</div>;

   return (
      <div className="animate-in fade-in duration-500 space-y-8 max-w-6xl mx-auto pb-12">
         {/* HEADER */}
         <div className="flex justify-between items-center bg-white rounded-[1.5rem] p-8 shadow-sm border border-[#e5e7eb]">
            <div>
               <h2 className="text-[26px] font-extrabold text-[#111827] tracking-tight">Resume</h2>
               <p className="text-[#6b7280] text-[15px] font-medium mt-1">Upload and manage your resume documents</p>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 bg-[#f0f9ff] text-[#0369a1] px-4 py-2 rounded-full text-[12px] font-black border border-[#bae6fd]">
                  AI Matching Active
               </div>
               <button className="w-10 h-10 rounded-full bg-white border border-[#e5e7eb] flex items-center justify-center text-yellow-500 shadow-sm relative">🔔</button>
               <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md">S</div>
            </div>
         </div>

         {/* UPLOAD SECTION */}
         <div className="bg-white rounded-[2rem] p-8 border border-[#e5e7eb] shadow-sm space-y-6">
            <div className="flex items-center gap-3">
               <span className="text-xl">📄</span>
               <h3 className="text-[17px] font-extrabold text-[#111827]">Resume Management</h3>
            </div>

            <label className="block border-2 border-dashed border-indigo-100 rounded-[2rem] p-16 text-center bg-[#fcfcfd] hover:bg-white hover:border-indigo-400 transition-all cursor-pointer group">
               <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx" />
               <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  {uploading ? '⏳' : '📄'}
               </div>
               <h4 className="text-[18px] font-extrabold text-[#111827]">{uploading ? 'Analyzing Resume...' : 'Upload New Resume'}</h4>
               <p className="text-[#94a3b8] text-[13px] font-bold mt-2 uppercase tracking-wide">PDF, DOC, DOCX · Max 5MB · Click or drag & drop</p>
            </label>

            {/* UPLOADED LIST */}
            <div className="pt-8 space-y-4">
               <h4 className="text-[14px] font-black text-[#64748b] uppercase tracking-widest pl-2 mb-6">Uploaded Resumes ({resumes.length})</h4>
               {resumes.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-2xl text-gray-400 font-bold border border-dashed">No resumes uploaded yet.</div>
               ) : (
                  resumes.map((r, idx) => (
                     <div key={r.id} className="bg-white p-6 rounded-[1.5rem] border border-[#e5e7eb] flex justify-between items-center group hover:shadow-md transition-shadow">
                        <div className="flex gap-6 items-center">
                           <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-xl border border-gray-100 italic font-black text-indigo-600">
                              {r.jobTitle?.charAt(0) || 'R'}
                           </div>
                           <div>
                              <h5 className="text-[15px] font-extrabold text-[#111827]">{r.jobTitle || 'Resume'}_Document.pdf</h5>
                              <p className="text-[12px] text-[#94a3b8] font-bold mt-1">
                                 Uploaded {Math.round((new Date() - new Date(r.uploaded_at)) / 86400000)} days ago · 245 KB
                              </p>
                              <div className="flex gap-2 mt-3">
                                 <span className="bg-[#f0fdf4] text-[#166534] border border-[#dcfce7] px-3 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                    ✓ {idx === 0 ? 'Primary' : 'Active'}
                                 </span>
                              </div>
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <button className="bg-[#f8fafc] text-[#64748b] px-6 py-2.5 rounded-xl text-[13px] font-black border border-[#e2e8f0] hover:bg-white transition flex items-center gap-2 shadow-sm">
                              ⬇ Download
                           </button>
                           <button
                              onClick={() => handleDelete(r.id)}
                              className="w-11 h-11 bg-white border border-[#fee2e2] rounded-xl flex items-center justify-center text-red-500 hover:bg-red-50 transition shadow-sm"
                           >
                              🗑
                           </button>
                        </div>
                     </div>
                  ))
               )}
            </div>
         </div>

         {/* AI PARSE RESULTS SECTION (Dynamic) */}
         <div className="bg-white rounded-[2rem] p-10 border border-[#e5e7eb] shadow-sm space-y-10">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <span className="text-xl">🤖</span>
                  <h3 className="text-[17px] font-extrabold text-[#111827]">AI Parse Results</h3>
               </div>
               {parseResults.name === 100 && (
                  <span className="text-[11px] font-black text-[#10b981] bg-[#ecfdf5] px-4 py-1.5 rounded-full uppercase tracking-widest border border-[#d1fae5]">Analysis Complete</span>
               )}
            </div>

            <div className="space-y-8">
               {[
                  { label: 'Name Extracted', key: 'name', color: 'from-indigo-500 to-indigo-600' },
                  { label: 'Skills Detected', key: 'skills', color: 'from-sky-500 to-sky-600' },
                  { label: 'Projects Indexed', key: 'projects', color: 'from-purple-500 to-purple-600' },
                  { label: 'Work History Parsed', key: 'history', color: 'from-indigo-500 to-indigo-600' }
               ].map((bar, idx) => (
                  <div key={idx} className="space-y-3">
                     <div className="flex justify-between items-center">
                        <span className="text-[13px] font-extrabold text-[#64748b]">{bar.label}</span>
                        <span className={`transition-opacity duration-500 ${parseResults[bar.key] === 100 ? 'opacity-100 text-[#10b981]' : 'opacity-20 text-[#94a3b8]'}`}>✓</span>
                     </div>
                     <div className="h-2 bg-gray-50 rounded-full overflow-hidden shadow-inner border border-gray-50">
                        <div
                           className={`h-full bg-gradient-to-r ${bar.color} rounded-full shadow-lg transition-all duration-[800ms]`}
                           style={{ width: `${parseResults[bar.key]}%` }}
                        ></div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
   );
}