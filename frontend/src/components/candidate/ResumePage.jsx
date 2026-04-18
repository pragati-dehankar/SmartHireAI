import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ResumePage() {
   const { user } = useAuth();
   const [resumes, setResumes] = useState([]);
   const [jobs, setJobs] = useState([]);
   const [selectedJobId, setSelectedJobId] = useState('');
   const [loading, setLoading] = useState(true);
   const [uploading, setUploading] = useState(false);
   const [parseResults, setParseResults] = useState({
      identity: 0, stack: 0, vector: 0, projects: 0
   });

   useEffect(() => {
      const fetchData = async () => {
         try {
            const [appsRes, jobsRes] = await Promise.all([
               apiClient.get('/api/candidate/applications'),
               apiClient.get('/api/jobs')
            ]);
            setResumes(appsRes.data);
            setJobs(jobsRes.data);
            if (jobsRes.data.length > 0) {
               setSelectedJobId(jobsRes.data[0].id.toString());
            }
         } catch (err) {
            console.error("Error fetching data:", err);
         } finally {
            setLoading(false);
         }
      };
      fetchData();
   }, []);

   const handleFileUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      if (!selectedJobId) {
         alert("Please select a target job for BERT analysis first.");
         return;
      }

      setUploading(true);
      setParseResults({ identity: 0, stack: 0, vector: 0, projects: 0 });

      const formData = new FormData();
      formData.append('resume', file);
      formData.append('candidateName', user?.name || 'Anonymous Candidate');
      formData.append('candidateEmail', user?.email || '');
      formData.append('jobID', selectedJobId);

      try {
         await apiClient.post('/api/resumes/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
         });

         // Visualize BERT Pipeline
         setTimeout(() => setParseResults(prev => ({ ...prev, identity: 100 })), 600);
         setTimeout(() => setParseResults(prev => ({ ...prev, stack: 100 })), 1200);
         setTimeout(() => setParseResults(prev => ({ ...prev, vector: 100 })), 1800);
         setTimeout(() => setParseResults(prev => ({ ...prev, projects: 100 })), 2400);

         const res = await apiClient.get('/api/candidate/applications');
         setResumes(res.data);
      } catch (err) {
         console.error("Upload error:", err);
         const errorMsg = err.response?.data?.error || "Upload failed. Please ensure the document format is valid.";
         alert(errorMsg);
      } finally {
         setTimeout(() => setUploading(false), 3000);
      }
   };

   const handleDelete = async (id) => {
      if (!window.confirm("Are you sure you want to delete this resume?")) return;
      try {
         await apiClient.delete(`/api/resumes/${id}`);
         setResumes(resumes.filter(r => r.id !== id));
      } catch (err) {
         console.error("Delete error:", err);
      }
   };

   if (loading) return (
      <div className="p-20 text-center flex flex-col items-center justify-center space-y-6">
         <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
         <div className="font-bold text-slate-400 text-xs uppercase tracking-[0.2em] animate-pulse">Synchronizing Data...</div>
      </div>
   );

   return (
      <div className="animate-fade-in space-y-8 max-w-6xl mx-auto pb-12 pt-4 px-4 sm:px-0">
         {/* View Header */}
         <div className="card p-8 relative overflow-hidden bg-white group hover:shadow-2xl transition-all duration-500">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10 text-center md:text-left">
               <div>
                  <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
                    <span className="bert-badge">BERT Powered</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none">
                     Resume <span className="gradient-text">Management</span>
                  </h2>
                  <p className="text-slate-500 font-medium mt-3 text-lg max-w-xl">
                     Upload and manage your documents for AI-powered semantic matching.
                  </p>
               </div>
               <div className="flex items-center gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-100 transition-transform group-hover:scale-105 duration-300">
                  <div className="text-right">
                     <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Resumes</div>
                     <div className="text-3xl font-black text-slate-900 leading-none">{resumes.length}</div>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl text-indigo-600 border border-slate-50">
                     📄
                  </div>
               </div>
            </div>
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/40 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-50/40 rounded-full blur-3xl -ml-24 -mb-24 pointer-events-none" />
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-8">
            {/* Left: Upload & List */}
            <div className="space-y-8">
               <div className="card p-6 bg-white border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                     <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Target Job for Analysis</label>
                     <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">REQUIRED FOR BERT</span>
                  </div>
                  <select 
                     value={selectedJobId}
                     onChange={(e) => setSelectedJobId(e.target.value)}
                     className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-indigo-600 outline-none text-sm font-bold transition-all"
                  >
                     <option value="" disabled>Select a job role...</option>
                     {jobs.map(job => (
                        <option key={job.id} value={job.id}>{job.title} at {job.recruiter?.company || 'Industry Partner'}</option>
                     ))}
                  </select>
               </div>

               <div className="card p-4 bg-slate-50/50 border-dashed border-2 border-indigo-200 transition-colors hover:border-indigo-400">
                  <label className="block text-center p-12 cursor-pointer group rounded-[2rem] transition-all hover:bg-white bg-white/40">
                     <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx" />
                     <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-4xl text-white mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300">
                        {uploading ? '⏳' : '📥'}
                     </div>
                     <h4 className="text-2xl font-black text-slate-900 tracking-tight">
                        {uploading ? 'AI is processing...' : 'Upload New Resume'}
                     </h4>
                     <p className="text-sm text-slate-500 font-medium mt-2">
                        PDF or DOCX supported for deep semantic analysis
                     </p>
                     {!uploading && (
                       <div className="mt-6 inline-flex items-center gap-2 text-indigo-600 font-bold text-sm bg-indigo-50 px-5 py-2 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          Browse Files <span>→</span>
                       </div>
                     )}
                  </label>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center justify-between pl-2">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Your Portfolio</h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter bg-slate-100 px-2 py-0.5 rounded-md">
                      {resumes.length} Document{resumes.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {resumes.length === 0 ? (
                     <div className="card p-16 text-center text-slate-300 font-bold border-slate-100 shadow-none bg-slate-50/30">
                        <div className="text-4xl mb-4 opacity-50">📂</div>
                        No resumes uploaded yet.
                     </div>
                  ) : (
                     resumes.map((r, idx) => (
                        <div key={r.id} className="card card-interactive p-6 flex justify-between items-center group bg-white">
                           <div className="flex gap-5 items-center">
                              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-xl text-slate-400 font-black border border-slate-100 group-hover:text-indigo-600 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all duration-300">
                                 {r.jobTitle?.charAt(0) || 'R'}
                              </div>
                              <div>
                                 <h5 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">
                                    {r.jobTitle} - BERT Score: {Math.round(r.score)}%
                                 </h5>
                                 <div className="flex items-center gap-3 mt-1.5">
                                   <span className="tag tag-gray">Applied {new Date(r.uploaded_at).toLocaleDateString()}</span>
                                   <span className={`tag ${r.score >= 80 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'tag-bert'}`}>
                                      {r.score >= 80 ? 'Top Match' : 'AI Scored'}
                                   </span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex gap-3">
                              <button className="w-11 h-11 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 flex items-center justify-center transition-all border border-transparent hover:border-indigo-100 shadow-sm">
                                ⬇
                              </button>
                              <button onClick={() => handleDelete(r.id)} className="w-11 h-11 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-all border border-transparent hover:border-rose-100 shadow-sm">
                                🗑
                              </button>
                           </div>
                        </div>
                     ))
                  )}
               </div>
            </div>

            {/* Right: Analysis Pipeline */}
            <div className="space-y-6">
              <div className={`card p-8 space-y-8 transition-all duration-500 sticky top-8 ${uploading ? 'opacity-100 scale-100 border-indigo-200 shadow-xl' : 'opacity-60 scale-95 grayscale-[0.2]'}`}>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <span className="text-2xl">🤖</span>
                       <div>
                          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest italic">AI Processing Status</h3>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">Real-time BERT Pipeline</p>
                       </div>
                    </div>
                    {uploading && <div className="bert-live-indicator"><div className="dot" /></div>}
                 </div>

                 <div className="space-y-8">
                    {[
                       { label: 'Contextual Ingestion', key: 'identity', desc: 'Parsing document structure' },
                       { label: 'Skill Extraction', key: 'stack', desc: 'Detecting professional entities' },
                       { label: 'Semantic Analysis', key: 'vector', desc: 'Generating BERT embeddings' },
                       { label: 'Suitability Scoring', key: 'projects', desc: 'Matching with job requirements' }
                    ].map((bar, idx) => (
                       <div key={idx} className="space-y-3">
                          <div className="flex justify-between items-end">
                             <div>
                                <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{bar.label}</div>
                                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">{bar.desc}</div>
                             </div>
                             <span className={`text-[10px] font-black uppercase tracking-widest transition-opacity duration-300 ${parseResults[bar.key] === 100 ? 'text-emerald-600 opacity-100' : 'opacity-40 text-slate-400'}`}>
                               {parseResults[bar.key] === 100 ? 'Complete ✓' : 'Pending...'}
                             </span>
                          </div>
                          <div className="progress-bar">
                             <div
                                className={`progress-fill ${idx % 2 === 0 ? 'progress-fill-bert' : ''} transition-all duration-1000 ease-out`}
                                style={{ width: `${parseResults[bar.key]}%` }}
                             />
                          </div>
                       </div>
                    ))}
                 </div>

                 {/* Terminal Log */}
                 <div className="terminal h-40 mt-4 custom-scrollbar">
                    <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
                       <div className="w-2 h-2 rounded-full bg-rose-500/50" />
                       <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                       <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                       <span className="ml-1 font-bold text-[9px] opacity-40 uppercase tracking-widest">Analysis Kernel v4.0</span>
                    </div>
                    <div className="space-y-1 opacity-90 text-[10px]">
                      <div className="t-info">[SYS] Initializing BERT transformer layers...</div>
                      <div className="t-white">[SCAN] Detecting professional entities in buffer...</div>
                      {parseResults.identity === 100 && <div className="t-success">[DONE] Contextual structure successfully parsed.</div>}
                      {parseResults.stack === 100 && <div className="t-bert">[BERT] Skill signals extracted and classified.</div>}
                      {parseResults.vector === 100 && <div className="t-success">[DONE] Semantic vector space mapping complete.</div>}
                      {uploading && <div className="terminal-cursor t-info">[POLL] Synchronizing with cloud nodes...</div>}
                    </div>
                 </div>
              </div>
            </div>
         </div>
      </div>
   );
}