import React, { useState } from 'react';
import apiClient from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ApplyModal({ job, onClose, onSuccess }) {
    const { user } = useAuth();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState('');

    const handleApply = async (e) => {
        e.preventDefault();
        if (!file) {
            alert("Please select a resume file first.");
            return;
        }

        setUploading(true);
        setStatus('Uploading resume...');
        
        const formData = new FormData();
        formData.append('resume', file);
        formData.append('jobID', job.id);

        try {
            // 1. Upload
            const res = await apiClient.post('/api/resumes/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const resumeId = res.data.resumeId;

            // 2. Score with BERT
            setStatus('AI analyzing your resume with BERT...');
            await apiClient.post(`/api/resumes/${resumeId}/score`);

            setStatus('Success! Application submitted.');
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1500);
        } catch (err) {
            console.error("Application error:", err);
            alert(err.response?.data?.error || "Failed to submit application. Please try again.");
            setStatus('');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl relative p-10 space-y-8 scale-in-95 animate-in zoom-in-95 duration-300">
                <div className="text-center">
                    <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-sm border border-indigo-100">
                        📄
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Apply for {job.title}</h2>
                    <p className="text-gray-500 text-sm font-medium mt-2">{job.recruiter?.company || 'Industry Partner'}</p>
                </div>

                <form onSubmit={handleApply} className="space-y-6">
                    <div className="space-y-3">
                        <label className="text-sm font-black text-gray-700 uppercase tracking-widest pl-1">Resume Document</label>
                        <div className="relative">
                            <input 
                                type="file" 
                                accept=".pdf,.docx,.txt"
                                onChange={(e) => setFile(e.target.files[0])}
                                className="hidden" 
                                id="apply-resume-upload"
                            />
                            <label 
                                htmlFor="apply-resume-upload"
                                className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-gray-50 border-2 border-gray-200 border-dashed rounded-3xl appearance-none cursor-pointer hover:border-indigo-400 hover:bg-white active:bg-gray-100 focus:outline-none"
                            >
                                {file ? (
                                    <span className="text-indigo-600 font-bold flex items-center gap-2">
                                        <span className="text-xl">✅</span> {file.name}
                                    </span>
                                ) : (
                                    <span className="flex items-center space-x-2 text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <span className="font-bold">Select PDF or DOCX</span>
                                    </span>
                                )}
                            </label>
                        </div>
                    </div>

                    <div className="pt-4 space-y-4">
                        <button 
                            type="submit"
                            disabled={uploading || !file}
                            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-[15px] hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {uploading ? (
                                <>
                                    <span className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    Processing...
                                </>
                            ) : 'Submit Application'}
                        </button>
                        
                        {status && (
                            <p className="text-center text-xs font-bold text-indigo-500 animate-pulse uppercase tracking-wider">{status}</p>
                        )}
                        
                        <button 
                            type="button"
                            onClick={onClose}
                            className="w-full bg-white text-gray-400 py-3 rounded-2xl font-bold text-[13px] hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </form>

                {/* AI Badge */}
                <div className="absolute top-4 right-4 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-indigo-100">
                    BERT AI Protected
                </div>
            </div>
        </div>
    );
}
