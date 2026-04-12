export const API_ENDPOINTS = {
  HEALTH: '/api/health',
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  PROFILE: '/api/auth/profile',
  JOBS: '/api/jobs',
  RESUMES: '/api/resumes',
  ANALYTICS: '/api/analytics',
  FAIRNESS: '/api/fairness',
};

export const TABS = [
  { id: 'health', label: 'Health Check', icon: '🏥' },
  { id: 'auth', label: 'Authentication', icon: '🔐' },
  { id: 'jobs', label: 'Jobs', icon: '💼' },
  { id: 'resumes', label: 'Resumes', icon: '📄' },
  { id: 'analytics', label: 'Analytics', icon: '📊' },
];