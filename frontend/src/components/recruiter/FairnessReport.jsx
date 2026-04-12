import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';

export default function FairnessReport() {
  const [fairness, setFairness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFairness = async () => {
      try {
        const jobsRes = await apiClient.get('/api/jobs');
        if (jobsRes.data && jobsRes.data.length > 0) {
          const firstJobId = jobsRes.data[0].id;
          const fairnessRes = await apiClient.get(`/api/fairness/job/${firstJobId}`);
          setFairness(fairnessRes.data);
        } else {
          setFairness(null);
        }
      } catch (err) {
        console.error("Error fetching fairness data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFairness();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500 font-semibold">Analyzing algorithms...</div>;

  const data = fairness || {
    overallFairnessScore: null,
    genderBiasScore: null,
    educationBiasScore: null,
    ageBiasScore: null,
    summary: 'Insufficient data - Please upload resumes first.',
    alerts: []
  };

  const getMetricScoreStr = (score) => {
    if (score === undefined || score === null) return 'N/A';
    const val = typeof score === 'number' && score < 2 ? (1 - score) * 100 : score;
    return `${Math.round(val)}%`;
  };

  const getMetricProgressStr = (score) => {
    if (score === undefined || score === null) return '0%';
    const val = typeof score === 'number' && score < 2 ? (1 - score) * 100 : score;
    return `${Math.round(val)}%`;
  };

  return (
    <div className="space-y-6">
      {!fairness && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 font-semibold text-center">
          Fairness data is currently unavailable. No resumes have been scored for your jobs yet.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 shadow text-center">
          <div className="text-3xl mb-2">⚖️</div>
          <div className="text-3xl font-bold text-indigo-600">{getMetricScoreStr(data.overallFairnessScore)}</div>
          <div className="text-gray-600 text-sm">Overall Fairness</div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow text-center">
          <div className="text-3xl mb-2">🎓</div>
          <div className="text-3xl font-bold text-indigo-600">{getMetricScoreStr(data.educationBiasScore)}</div>
          <div className="text-gray-600 text-sm">Background Fairness</div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow text-center">
          <div className="text-3xl mb-2">✨</div>
          <div className="text-3xl font-bold text-indigo-600">{getMetricScoreStr(data.genderBiasScore)}</div>
          <div className="text-gray-600 text-sm">Gender Neutrality</div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow text-center">
          <div className="text-3xl mb-2">🔍</div>
          <div className="text-3xl font-bold text-indigo-600">{getMetricScoreStr(data.ageBiasScore)}</div>
          <div className="text-gray-600 text-sm">Age Neutrality</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Fairness Metrics Detail</h2>

        <div className="space-y-6">
          {[
            { name: 'Gender Neutrality', score: data.genderBiasScore, desc: 'BERT embeddings analyzed for gender neutrality.' },
            { name: 'Background Fairness', score: data.educationBiasScore, desc: 'Education anonymization impact.' },
            { name: 'Age Anonymization', score: data.ageBiasScore, desc: 'Checks for implicit age thresholds.' },
          ].map((metric, idx) => (
            <div key={idx} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-gray-900">{metric.name}</span>
                <span className="text-indigo-600 font-bold text-lg">{getMetricScoreStr(metric.score)}</span>
              </div>
              <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-gradient-to-r from-indigo-600 to-purple-600" style={{ width: getMetricProgressStr(metric.score) }}></div>
              </div>
              <p className="text-sm text-gray-600">{metric.desc}</p>
            </div>
          ))}
        </div>

        <div className={`mt-6 p-4 border rounded-lg ${!fairness ? 'bg-gray-50 border-gray-300' : data.alerts && data.alerts.length > 0 ? 'bg-orange-50 border-orange-300' : 'bg-green-50 border-green-300'}`}>
          <div className={`font-bold ${!fairness ? 'text-gray-600' : data.alerts && data.alerts.length > 0 ? 'text-orange-800' : 'text-green-800'}`}>
            {!fairness ? 'ℹ️ Analysis Pending' : data.alerts && data.alerts.length > 0 ? '⚠️ System Alerts' : '✓ No Algorithmic Bias Detected'}
          </div>
          <p className={`text-sm mt-2 ${!fairness ? 'text-gray-500' : data.alerts && data.alerts.length > 0 ? 'text-orange-700' : 'text-green-700'}`}>
            {data.summary}
          </p>
          {data.alerts && data.alerts.length > 0 && (
            <ul className="mt-2 list-disc list-inside text-sm text-orange-700">
              {data.alerts.map((alert, i) => <li key={i}>{alert}</li>)}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}