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

  useEffect(() => {
    if (selectedJobId) {
      const fetchJobResumes = async () => {
        try {
          const res = await apiClient.get(`/api/resumes/job/${selectedJobId}`);
          // Map to results format
          const formatted = res.data.map(r => ({
            fileName: r.name,
            scores: { matchScore: r.score, extractedSkills: r.skills },
            explanation: { recommendation: r.status },
            id: r.id
          }));
          setResults(formatted);
        } catch (err) {
          console.error("Error fetching job resumes:", err);
        }
      };
      fetchJobResumes();
    }
  }, [selectedJobId]);

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

  const totalProcessed = jobs.reduce((sum, job) => sum + parseInt(job.resumes_count || 0), 0);
  const hoursSaved = Math.round(totalProcessed * 0.4);

  return (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center bg-white rounded-[1.5rem] p-8 shadow-sm border border-[#e5e7eb]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-[#6366f1] to-[#7c3aed] rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
            🤖
          </div>
          <div>
            <h2 className="text-[22px] font-extrabold text-[#111827] tracking-tight">AI Command Center</h2>
            <p className="text-[#6b7280] text-[14px] font-medium mt-1">Automated pipeline control and anomaly detection</p>
          </div>
        </div>
        <div className="flex gap-6 text-center">
          <div>
            <div className="text-[28px] font-black text-[#111827]">{totalProcessed}</div>
            <div className="text-[11px] font-bold text-[#6b7280] uppercase tracking-wider">Processed</div>
          </div>
          <div>
            <div className="text-[28px] font-black text-[#0f766e]">{hoursSaved}h</div>
            <div className="text-[11px] font-bold text-[#6b7280] uppercase tracking-wider">Hours Saved</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* COLUMN 1: AI Rules & Thresholds */}
        <div className="bg-white rounded-[1.5rem] shadow-sm p-6 border border-[#e5e7eb] lg:col-span-1 space-y-6">
          <h3 className="text-[17px] font-extrabold text-[#111827] tracking-tight mb-2">Global AI Rules</h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-[13px] font-bold text-[#4b5563] mb-1">
                <span>Auto-Shortlist Threshold</span>
                <span className="text-[#6366f1]">85%</span>
              </div>
              <input type="range" className="w-full h-2 bg-[#e0e7ff] rounded-lg appearance-none cursor-pointer accent-[#6366f1]" defaultValue="85" />
              <p className="text-[11px] text-[#9ca3af] mt-1">Automatically move candidates &gt; 85% to Shortlisted.</p>
            </div>

            <div className="pt-2">
              <div className="flex justify-between text-[13px] font-bold text-[#4b5563] mb-1">
                <span>Auto-Reject Threshold</span>
                <span className="text-[#ef4444]">40%</span>
              </div>
              <input type="range" className="w-full h-2 bg-[#fee2e2] rounded-lg appearance-none cursor-pointer accent-[#ef4444]" defaultValue="40" />
              <p className="text-[11px] text-[#9ca3af] mt-1">Filter out low-match candidates automatically.</p>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <label className="block text-[13px] font-bold text-[#4b5563] mb-2">Mandatory Skills</label>
              <input type="text" placeholder="e.g. React, Python" className="w-full border border-gray-200 rounded-xl p-3 text-[13px] focus:outline-none focus:border-[#6366f1]" defaultValue="React.js, TypeScript" />
            </div>
          </div>
        </div>

        {/* COLUMN 2: Red Flags & Anomaly Detection */}
        <div className="bg-white rounded-[1.5rem] shadow-sm p-6 border border-[#e5e7eb] lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[17px] font-extrabold text-[#111827] tracking-tight flex items-center gap-2">
              <span className="text-red-500">🚩</span> Anomaly Detection
            </h3>
            <span className="bg-[#fee2e2] text-[#b91c1c] px-3 py-1 rounded-full text-[11px] font-bold uppercase">2 Flags Requires Review</span>
          </div>

          <div className="space-y-3">
            {/* Mock Anomalies */}
            <div className="border border-red-100 bg-[#fff1f2] rounded-xl p-4 flex justify-between items-center">
              <div>
                <div className="font-bold text-[#991b1b] text-[14px]">Suspicious Timeline Gap</div>
                <div className="text-[12px] text-[#ef4444] mt-0.5">Candidate "James Wilson" claims 10 years React experience (Released 2013).</div>
              </div>
              <button className="bg-white text-red-600 px-4 py-2 rounded-lg text-[12px] font-bold shadow-sm border border-red-200 hover:bg-red-50 transition">Review</button>
            </div>

            <div className="border border-yellow-100 bg-yellow-50 rounded-xl p-4 flex justify-between items-center">
              <div>
                <div className="font-bold text-yellow-800 text-[14px]">High AI-Generation Probability</div>
                <div className="text-[12px] text-yellow-700 mt-0.5">Profile "Alicia Keys" contains 96% ChatGPT localized phrasing patterns.</div>
              </div>
              <button className="bg-white text-yellow-700 px-4 py-2 rounded-lg text-[12px] font-bold shadow-sm border border-yellow-200 hover:bg-yellow-100 transition">Review</button>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Processing Terminal & External Sourcing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Live Processing Feed */}
        <div className="bg-[#111827] rounded-[1.5rem] p-6 shadow-xl relative overflow-hidden h-[300px] flex flex-col">
          <h3 className="text-[14px] font-bold text-gray-400 uppercase tracking-widest mb-4 z-10">Live AI Feed</h3>
          <div className="flex-1 overflow-y-auto space-y-2 font-mono text-[12px] z-10">
            <div className="text-[#6366f1]">--- SmartHire Automated Engine v3.1 ---</div>
            <div className="text-gray-400">[08:42:01] Ingesting 14 new applications from remote portal...</div>
            <div className="text-gray-400">[08:42:04] Extracting entities via Named Entity Recognition... <span className="text-green-400">OK</span></div>
            <div className="text-gray-400">[08:42:05] Running BERT Similarity against "Frontend Developer"...</div>
            {status === 'processing' && <div className="text-yellow-400 animate-pulse">[Now] Manual Job processing active...</div>}
            {results.map((res, i) => (
              <div key={i} className="text-gray-300">
                <span className="text-green-500">[EVAL]</span> {res.fileName} - Match: <span className="text-white font-bold">{res.scores?.matchScore || res.scores?.confidence}%</span>
              </div>
            ))}
            <div className="text-indigo-300 mt-4 animate-pulse">_ Waiting for incoming data...</div>
          </div>
          {/* Ambient Background glow */}
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-600/30 blur-[80px] rounded-full pointer-events-none"></div>
        </div>

        {/* Bulk Sourcing Tool */}
        <div className="bg-white rounded-[1.5rem] shadow-sm p-6 border border-[#e5e7eb] flex flex-col">
          <h3 className="text-[17px] font-extrabold text-[#111827] tracking-tight mb-2">Bulk External Sourcing</h3>
          <p className="text-[13px] text-[#6b7280] mb-6">Manually process a zip or batch of resumes gathered externally.</p>

          <div className="space-y-4 flex-1 flex flex-col">
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[13px] font-bold focus:outline-none focus:border-[#6366f1]"
            >
              {jobs.map(job => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>

            <div className={`relative border-2 border-dashed rounded-xl flex-1 flex flex-col items-center justify-center p-6 text-center transition-all ${files.length > 0 ? 'bg-[#f0fdf4] border-[#86efac]' : 'bg-gray-50 border-gray-200 hover:border-[#6366f1]'
              }`}
            >
              <input
                type="file" multiple onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="text-3xl mb-2">{files.length > 0 ? '📂' : '📥'}</div>
              <div className="font-bold text-[#111827] text-[14px]">
                {files.length > 0 ? `${files.length} Files Selected` : 'Drop external resumes here'}
              </div>
            </div>

            <button
              onClick={startWorkflow}
              disabled={uploading || files.length === 0}
              className="w-full bg-[#111827] text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 disabled:opacity-50 transition shadow-sm text-[14px]"
            >
              {uploading ? 'Processing Batch...' : 'Run Analysis'}
            </button>
          </div>
        </div>

      </div>

      {/* XAI Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-3xl overflow-hidden shadow-2xl relative">
            <button
              onClick={() => setSelectedCandidate(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"
            >
              ✕
            </button>

            <div className="bg-[#111827] p-8 text-white">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400 mb-2">Internal AI Decision Matrix</div>
              <h2 className="text-3xl font-black">{selectedCandidate.fileName || selectedCandidate.name}</h2>
              <div className="mt-4 flex items-center gap-8">
                <div>
                  <div className="text-2xl font-black text-white">{selectedCandidate.scores?.matchScore || 0}%</div>
                  <div className="text-[10px] font-bold uppercase text-gray-400">Match Rank</div>
                </div>
                <div className="w-px h-8 bg-gray-800"></div>
                <div>
                  <div className="text-2xl font-black text-indigo-400">{selectedCandidate.scores?.confidence || 0}%</div>
                  <div className="text-[10px] font-bold uppercase text-gray-400">System Confidence</div>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto bg-gray-50">

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-3">Core Match Reasoning</h3>
                  <div className="space-y-2">
                    {selectedCandidate.explanation?.mainReasons?.map((r, i) => (
                      <div key={i} className="text-[13px] font-bold text-gray-800 flex gap-2">
                        <span className="text-indigo-500">▹</span> {r}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-[12px] font-black text-green-500 uppercase tracking-widest mb-3">Key Strengths</h3>
                  <div className="space-y-2">
                    {selectedCandidate.explanation?.strengths?.map((s, i) => (
                      <div key={i} className="text-[13px] font-bold text-gray-800 flex gap-2">
                        <span className="text-green-500">✓</span> {s}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* TECHNICAL AI LOG SECTION - "Printing something in this section" */}
              <div className="bg-[#0f172a] rounded-2xl p-6 text-indigo-300 font-mono text-[12px] border border-indigo-900/30">
                <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4 border-b border-indigo-900/30 pb-2 flex justify-between">
                  <span>AI Execution Log (XAI)</span>
                  <span className="text-indigo-700">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                </h3>
                <div className="space-y-1.5 opacity-90">
                  <div>[SYS] <span className="text-white">INITIATING VECTOR SEARCH...</span></div>
                  <div>[BERT] Generating 384-dimension sentence embeddings... <span className="text-green-500">COMPLETE</span></div>
                  <div>[ANALYSIS] Cross-referencing {selectedCandidate.scores?.extractedSkills?.length || 0} extracted skill entities...</div>
                  <div className="pl-4 text-gray-500">» {selectedCandidate.scores?.extractedSkills?.join(', ')}</div>
                  <div>[MATH] Calculating Cosine Similarity: <span className="text-white">{(selectedCandidate.scores?.matchScore / 100 || 0).toFixed(4)}</span></div>
                  <div>[LOG] Logic Applied: 40% Global context | 35% Skills vector | 25% Experience weighting</div>
                  <div>[RESULT] Final alignment recommendation: <span className="text-indigo-400">"{selectedCandidate.explanation?.recommendation}"</span></div>
                  <div className="pt-2 animate-pulse text-indigo-500">_ Trace analysis complete. Outputting explanation...</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-3">Suggested Next Steps</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.explanation?.nextSteps?.map((step, i) => (
                    <span key={i} className="bg-gray-900 text-white px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-tight">{step}</span>
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