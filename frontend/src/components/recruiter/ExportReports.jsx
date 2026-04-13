import React, { useState } from 'react';
import apiClient from '../../services/api';

export default function ExportReports() {
  const [exporting, setExporting] = useState(false);

  const exportCSV = async (type) => {
    setExporting(true);
    try {
      const jobsRes = await apiClient.get('/api/jobs');
      const jobs = jobsRes.data;
      
      let csvContent = "data:text/csv;charset=utf-8,";
      let fileName = "report.csv";

      if (type === 'candidates') {
        csvContent += "Candidate,Position,Score,Status,Skills\n";
        fileName = "smarthire_candidate_ranking.csv";
        for (const job of jobs) {
           const res = await apiClient.get(`/api/resumes/job/${job.id}`);
           res.data.forEach(c => {
             csvContent += `${c.name},${job.title},${c.score}%,${c.status},"${c.skills.join('|')}"\n`;
           });
        }
      } else if (type === 'fairness') {
        csvContent += "Job Title,Overall Fairness,Gender Bias,Education Bias,Age Bias\n";
        fileName = "smarthire_fairness_audit.csv";
        for (const job of jobs) {
           try {
             const res = await apiClient.get(`/api/fairness/job/${job.id}`);
             csvContent += `${job.title},${res.data.overallFairnessScore}%,${res.data.genderBiasScore},${res.data.educationBiasScore},${res.data.ageBiasScore}\n`;
           } catch {
             csvContent += `${job.title},N/A,N/A,N/A,N/A\n`;
           }
        }
      }

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Export failed. Please ensure resumes are scored.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white rounded-[2rem] shadow-xl p-10 border border-gray-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-32 -mt-32"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-xl shadow-indigo-200">
              📥
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Intelligence Export</h2>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">Generate structured hiring reports</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Candidate Reports */}
            <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 px-1">Talent Distribution</h3>
              <div className="space-y-4">
                <button 
                  disabled={exporting}
                  onClick={() => exportCSV('candidates')}
                  className="w-full group bg-white border border-gray-200 p-6 rounded-2xl flex items-center justify-between hover:border-indigo-600 hover:shadow-xl hover:shadow-indigo-100 transition-all text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📄</div>
                    <div>
                      <div className="font-black text-gray-900">Ranked Top Candidates</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Export CSV with BERT scores</div>
                    </div>
                  </div>
                  <div className="text-indigo-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">→</div>
                </button>

                <button 
                  disabled={exporting}
                  className="w-full group bg-white border border-gray-200 p-6 rounded-2xl flex items-center justify-between opacity-50 cursor-not-allowed text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-2xl">📊</div>
                    <div>
                      <div className="font-black text-gray-900">Hiring Pipeline Analysis</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Visual PDF - Premium Only</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Fairness Reports */}
            <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 px-1">Compliance & Audit</h3>
              <div className="space-y-4">
                <button 
                  disabled={exporting}
                  onClick={() => exportCSV('fairness')}
                  className="w-full group bg-white border border-gray-200 p-6 rounded-2xl flex items-center justify-between hover:border-emerald-600 hover:shadow-xl hover:shadow-emerald-100 transition-all text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">⚖️</div>
                    <div>
                      <div className="font-black text-gray-900">Algorithmic Fairness Audit</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Bias metrics & diversity report</div>
                    </div>
                  </div>
                  <div className="text-emerald-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">→</div>
                </button>

                <button 
                  disabled={exporting}
                  className="w-full group bg-white border border-gray-200 p-6 rounded-2xl flex items-center justify-between opacity-50 cursor-not-allowed text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-2xl">✨</div>
                    <div>
                      <div className="font-black text-gray-900">XAI Summary Report</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Explainable AI log archive</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-indigo-900 rounded-[1.5rem] flex items-center justify-between text-white">
             <div>
                <div className="font-black text-lg">System Health: Optimal</div>
                <div className="text-xs opacity-70 font-medium">All database records are ready for generation.</div>
             </div>
             <div className="flex gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                <div className="text-[10px] font-black uppercase tracking-widest">Live Sync</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}