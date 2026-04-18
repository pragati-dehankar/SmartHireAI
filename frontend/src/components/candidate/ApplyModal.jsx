import React, { useState } from 'react';
import apiClient from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ApplyModal({ job, onClose, onSuccess }) {
    const { user } = useAuth();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [step, setStep] = useState(0); // 0: select, 1: upload, 2: bert, 3: success
    const [error, setError] = useState('');

    const handleApply = async (e) => {
        if (e) e.preventDefault();
        if (!file) return;

        setUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('resume', file);
        formData.append('jobID', job.id);

        // Pass actual user data if logged in
        if (user) {
            formData.append('candidateName', user.name);
            formData.append('candidateEmail', user.email);
        }

        try {
            // STEP 1: Upload
            setStep(1);
            const res = await apiClient.post('/api/resumes/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const resumeId = res.data.resumeId;

            // STEP 2: BERT Scoring
            setStep(2);
            await apiClient.post(`/api/resumes/${resumeId}/score`);

            // STEP 3: Success
            setStep(3);
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 2000);
        } catch (err) {
            console.error("Application error:", err);
            setError(err.response?.data?.error || "Neural processing failed. Please verify file format.");
            setStep(0);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in shadow-2xl">
            <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl relative animate-scale-in border border-slate-100">
                {/* Header Strip */}
                <div className="h-1.5 w-full bg-slate-50 relative overflow-hidden">
                    {(step > 0 && step < 3) && (
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 animate-progress" style={{ width: step === 1 ? '40%' : '80%' }} />
                    )}
                </div>

                <div className="p-10">
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <span className="bert-badge mb-3 inline-block">Direct Application</span>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Apply for {job.title}</h2>
                            <p className="text-slate-500 font-medium">{job.recruiter?.company || 'Industry Partner Ltd.'}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors shadow-sm"
                        >✕</button>
                    </div>

                    {step === 3 ? (
                        <div className="py-10 text-center space-y-4 animate-fade-up">
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-4xl mx-auto shadow-sm border border-emerald-100 mb-6">✅</div>
                            <h3 className="text-2xl font-black text-slate-900">Application Transmitted!</h3>
                            <p className="text-slate-500 font-medium">BERT has processed your resume. Recruiter has been notified.</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {error && <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider text-center">{error}</div>}

                            {/* Upload Zone */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Resume / CV</label>
                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">BERT Analyzed</span>
                                </div>
                                <div className="relative group">
                                    <input
                                        id="resume-dropzone"
                                        type="file"
                                        accept=".pdf,.docx,.txt"
                                        disabled={uploading}
                                        onChange={(e) => setFile(e.target.files[0])}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="resume-dropzone"
                                        className={`flex flex-col items-center justify-center w-full h-44 px-4 transition-all duration-300 border-2 border-dashed rounded-[2rem] appearance-none cursor-pointer group shadow-inner ${file ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-100 bg-slate-50/50 hover:border-indigo-400 hover:bg-white'
                                            }`}
                                    >
                                        {file ? (
                                            <div className="text-center animate-fade-up">
                                                <div className="text-3xl mb-2">📄</div>
                                                <div className="text-sm font-black text-slate-900 mb-1">{file.name}</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Click to change file</div>
                                            </div>
                                        ) : (
                                            <div className="text-center text-slate-400">
                                                <div className="text-4xl mb-4 opacity-50 transition-transform group-hover:scale-110">📥</div>
                                                <div className="text-sm font-black group-hover:text-indigo-600 transition-colors">Drop resume or browse</div>
                                                <div className="text-[10px] font-bold mt-2 uppercase tracking-[0.15em]">PDF, DOCX supported</div>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>

                            {/* Status Messaging */}
                            {uploading && (
                                <div className="space-y-4 py-4 animate-fade-in">
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                                        <div className="flex-1">
                                            <div className="text-xs font-black text-slate-900 uppercase tracking-widest">
                                                {step === 1 ? 'Transmitting Data...' : 'BERT Semantic Analysis...'}
                                            </div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                {step === 1 ? 'Uploading to secure pipeline' : 'Mapping skill vectors & context'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 flex gap-4">
                                <button
                                    onClick={onClose}
                                    disabled={uploading}
                                    className="flex-1 py-4 border-2 border-slate-100 rounded-2xl font-black text-slate-400 text-xs uppercase tracking-widest hover:bg-slate-50 transition"
                                >Close</button>
                                <button
                                    onClick={handleApply}
                                    disabled={uploading || !file}
                                    className="flex-[2] btn-primary rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 py-4"
                                >
                                    {uploading ? 'Processing Neurons...' : 'Finalize Application'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Security Strip */}
                <div className="bg-slate-50 p-6 flex items-center justify-between border-t border-slate-100">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Post-quantum encrypted</span>
                    </div>
                    <div className="flex gap-4">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-indigo-400 cursor-pointer">Privacy Policy</span>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-indigo-400 cursor-pointer">AI terms</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
