import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';

export default function AIScreening() {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, uploading, processing, complete
  const [results, setResults] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null); // For XAI Modal

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await apiClient.get('/api/jobs');
        setJobs(res.data);
        if (res.data.length > 0) setSelectedJobId(res.data[0].id);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const startWorkflow = async () => {
    if (!selectedJobId || files.length === 0) {
      alert("Please select a job and at least one resume file.");
      return;
    }

    setUploading(true);
    setStatus('uploading');
    setResults([]);

    const workflowResults = [];

    for (const file of files) {
      try {
        // Step 2: Upload
        const formData = new FormData();
        formData.append('resume', file);
        formData.append('jobID', selectedJobId);
        formData.append('candidateName', file.name.split('.')[0]); // Fallback name
        formData.append('candidateEmail', `automated_${Math.random().toString(36).slice(2, 7)}@example.com`); // Fallback

        const uploadRes = await apiClient.post('/api/resumes/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const resumeId = uploadRes.data.resumeId;

        // Step 3 & 4: Processing & AI Evaluation
        setStatus('processing');
        const scoreRes = await apiClient.post(`/api/resumes/${resumeId}/score`);
        
        workflowResults.push({
          fileName: file.name,
          ...scoreRes.data
        });
        
        // Update results incrementally
        setResults([...workflowResults]);
      } catch (err) {
        console.error(`Workflow error for ${file.name}:`, err);
        const errorMsg = err.response?.data?.error || "Process failed";
        workflowResults.push({
          fileName: file.name,
          error: errorMsg
        });
        setResults([...workflowResults]);
      }
    }

    setUploading(false);
    setStatus('complete');
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-semibold animate-pulse">Initializing AI Core...</div>;

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[2rem] shadow-xl p-8 border border-gray-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-indigo-200">
            🤖
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">AI Talent Engine</h2>
            <p className="text-gray-500 text-sm font-medium">BERT-powered semantic resume analysis</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <div className="p-6 bg-gray-50 rounded-[1.5rem] border border-gray-100">
              <label className="block text-sm font-bold text-gray-700 mb-3 ml-1 uppercase tracking-wider">1. Select Target Position</label>
              <select 
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition shadow-sm"
              >
                {jobs.map(job => (
                  <option key={job.id} value={job.id}>{job.title}</option>
                ))}
              </select>
            </div>

            <div 
              className={`relative border-2 border-dashed rounded-[1.5rem] p-10 text-center transition-all ${
                files.length > 0 ? 'bg-green-50 border-green-300' : 'bg-indigo-50/50 border-indigo-200 hover:border-indigo-400'
              }`}
            >
              <input 
                type="file" 
                multiple 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">
                {files.length > 0 ? '✔️' : '📄'}
              </div>
              <div className="font-black text-gray-900 mb-1">
                {files.length > 0 ? `${files.length} Resumes Selected` : 'Upload Resumes'}
              </div>
              <div className="text-gray-500 text-sm">Drop PDF, DOCX or TXT files here</div>
              {files.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                   {files.map((f, i) => (
                     <span key={i} className="text-[10px] bg-green-200 text-green-800 px-2 py-1 rounded-md font-bold">{f.name}</span>
                   ))}
                </div>
              )}
            </div>

            <button 
              onClick={startWorkflow}
              disabled={uploading || files.length === 0}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black px-8 py-5 rounded-2xl hover:shadow-2xl hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
            >
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {status === 'uploading' ? 'Uploading...' : 'AI Processing...'}
                </>
              ) : (
                <>🚀 Launch AI Evaluation</>
              )}
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-500 ml-1 uppercase tracking-widest">Workflow Status</h3>
            <div className="bg-gray-900 rounded-[2rem] p-8 text-white min-h-[400px] shadow-2xl relative overflow-hidden">
               {/* Terminal effect */}
               <div className="space-y-3 font-mono text-xs opacity-80">
                  <div className="text-indigo-400">--- SmartHire AI Core v3.1 ---</div>
                  <div>[SYS] Cluster connection: ACTIVE</div>
                  {status === 'idle' && <div>_ Awaiting input data...</div>}
                  {status === 'uploading' && <div className="text-yellow-400">» Step 2: Ingesting binary blobs...</div>}
                  {status === 'processing' && <div className="text-blue-400">» Step 3: BERT Sentence Embeddings generating...</div>}
                  {results.map((res, i) => (
                    <div key={i}>
                      <span className="text-green-500">[DONE]</span> {res.fileName} - 
                      {res.error ? (
                        <span className="text-red-400"> [{res.error}]</span>
                      ) : (
                        <span className="text-indigo-300"> AI Confidence: {res.scores?.confidence}% | Rank: {i+1}</span>
                      )}
                    </div>
                  ))}
                  {status === 'complete' && <div className="text-green-400 py-4 font-bold text-sm">✅ WORKFLOW COMPLETE. PIPELINE SUCCESSFUL.</div>}
               </div>
               {/* Background glowing circle */}
               <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-indigo-500/20 blur-[60px] rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Table Dashboard */}
      {results.length > 0 && (
        <div className="bg-white rounded-[2rem] shadow-xl p-8 border border-gray-100 overflow-hidden animate-in fade-in duration-1000">
          <div className="flex justify-between items-center mb-8 px-2">
            <h2 className="text-2xl font-black text-gray-900">Step 5: AI Candidate Ranking</h2>
            <div className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
              Live Ranking Active
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-gray-50">
                  <th className="px-4 py-4 text-sm font-black text-gray-400 uppercase tracking-widest">Rank</th>
                  <th className="px-4 py-4 text-sm font-black text-gray-400 uppercase tracking-widest">Candidate</th>
                  <th className="px-4 py-4 text-sm font-black text-gray-400 uppercase tracking-widest">Match Score</th>
                  <th className="px-4 py-4 text-sm font-black text-gray-400 uppercase tracking-widest">AI Insights</th>
                  <th className="px-4 py-4 text-sm font-black text-gray-400 uppercase tracking-widest">Alignment</th>
                </tr>
              </thead>
              <tbody>
                {[...results].sort((a, b) => (b.scores?.matchScore || 0) - (a.scores?.matchScore || 0)).map((res, i) => (
                  <tr key={i} className={`group hover:bg-indigo-50/50 transition-colors border-b border-gray-50 ${i === 0 && (res.scores?.matchScore > 80) ? 'bg-gradient-to-r from-emerald-50/30 to-transparent' : ''}`}>
                    <td className="px-4 py-6">
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                         i === 0 ? 'bg-yellow-400 text-yellow-900' :
                         i === 1 ? 'bg-gray-300 text-gray-700' :
                         i === 2 ? 'bg-orange-300 text-orange-900' :
                         'bg-gray-100 text-gray-400'
                       }`}>
                          {i + 1}
                       </div>
                    </td>
                    <td className="px-4 py-6">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-bold text-gray-900">{res.fileName.split('.')[0]}</div>
                          <div className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">{res.fileName.split('.').pop()} Profile</div>
                        </div>
                        {i === 0 && (res.scores?.matchScore > 80) && (
                          <span className="bg-yellow-100 text-yellow-700 text-[8px] font-black px-2 py-0.5 rounded-full uppercase border border-yellow-200 animate-pulse">
                            Top Choice
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-6">
                       <div className="flex items-center gap-3">
                          <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden w-24">
                             <div 
                               className={`h-full bg-gradient-to-r transition-all duration-1000 ${
                                 res.scores?.matchScore > 70 ? 'from-green-500 to-emerald-400' : 'from-indigo-500 to-purple-400'
                               }`}
                               style={{ width: `${res.scores?.matchScore || 0}%` }}
                             ></div>
                          </div>
                          <span className="font-black text-indigo-600 text-lg">{res.scores?.matchScore || 0}%</span>
                       </div>
                    </td>
                    <td className="px-4 py-6">
                       <div className="space-y-1">
                          {res.explanation?.mainReasons?.slice(0, 2).map((reason, j) => (
                            <div key={j} className="text-[10px] text-gray-600 font-medium">✨ {reason}</div>
                          ))}
                          <div className="flex flex-wrap gap-1 mt-1">
                            {res.scores?.extractedSkills?.slice(0, 3).map((s, j) => (
                              <span key={j} className="text-[9px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-bold">{s}</span>
                            ))}
                          </div>
                       </div>
                    </td>
                    <td className="px-4 py-6">
                       <div className="flex flex-col gap-1">
                          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded border ${
                            res.explanation?.recommendation?.includes('Highly') ? 'border-green-200 text-green-600 bg-green-50' : 
                            res.explanation?.recommendation?.includes('Recommended') ? 'border-blue-200 text-blue-600 bg-blue-50' :
                            'border-gray-200 text-gray-400 bg-gray-50'
                          }`}>
                              {res.explanation?.recommendation?.split(' - ')[0] || 'Analyzing...'}
                          </span>
                          <button 
                            onClick={() => setSelectedCandidate(res)}
                            className="text-[10px] text-indigo-600 font-bold hover:underline text-left"
                          >
                            View match reasoning →
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* XAI Explainability Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl relative">
            <button 
              onClick={() => setSelectedCandidate(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"
            >
              ✕
            </button>
            
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
              <div className="text-xs font-black uppercase tracking-[0.2em] opacity-70 mb-2">Explainable AI (XAI) Audit</div>
              <h2 className="text-3xl font-black">{selectedCandidate.fileName.split('.')[0]}</h2>
              <div className="mt-4 flex items-center gap-6">
                <div>
                  <div className="text-2xl font-black">{selectedCandidate.scores?.matchScore}%</div>
                  <div className="text-[10px] font-bold uppercase opacity-70">Overall Match</div>
                </div>
                <div className="w-px h-8 bg-white/20"></div>
                <div>
                  <div className="text-2xl font-black">{selectedCandidate.scores?.confidence}%</div>
                  <div className="text-[10px] font-bold uppercase opacity-70">AI Confidence</div>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
              {/* Key Reasons */}
              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Why this rank?</h3>
                <div className="space-y-3">
                  {selectedCandidate.explanation?.mainReasons?.map((reason, i) => (
                    <div key={i} className="flex gap-3 items-center p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                      <div className="text-xl">🎯</div>
                      <div className="text-sm font-bold text-indigo-900">{reason}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Strengths */}
                <div>
                  <h3 className="text-xs font-black text-green-500 uppercase tracking-widest mb-4">Top Strengths</h3>
                  <div className="space-y-2">
                    {selectedCandidate.explanation?.strengths?.map((s, i) => (
                      <div key={i} className="flex gap-2 items-center text-sm font-medium text-gray-700">
                        <div className="text-green-500">✓</div> {s}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Gaps */}
                <div>
                  <h3 className="text-xs font-black text-red-500 uppercase tracking-widest mb-4">Identified Gaps</h3>
                  <div className="space-y-2">
                    {selectedCandidate.explanation?.gaps?.length > 0 ? (
                      selectedCandidate.explanation.gaps.map((g, i) => (
                        <div key={i} className="flex gap-2 items-center text-sm font-medium text-gray-700">
                          <div className="text-red-500">!</div> {g}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-400 font-medium">No significant gaps detected.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Strategic Next Steps</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.explanation?.nextSteps?.map((step, i) => (
                    <div key={i} className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg shadow-sm">
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}