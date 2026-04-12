import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/api';

export default function ProfilePage() {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    jobTitle: '',
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient.get('/api/candidate/profile');
        setFormData({
          name: res.data.name || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          location: res.data.location || '',
          jobTitle: res.data.jobTitle || '',
        });
      } catch (err) {
        console.error("Error fetching profile, falling back to auth user", err);
        if (user) {
          setFormData(prev => ({
            ...prev,
            name: user.name || '',
            email: user.email || '',
          }));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.post('/api/candidate/profile', formData);
      alert('Profile saved successfully!');
    } catch (err) {
      console.error("Error saving profile", err);
      alert('Error saving profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-semibold">Loading profile...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Profile</h2>

      <div className="mb-6">
        <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-600 to-purple-600" style={{ width: formData.phone && formData.location && formData.jobTitle ? '100%' : '35%' }}></div>
        </div>
        <div className="text-sm text-gray-600 mt-2">
          Profile Completion: {formData.phone && formData.location && formData.jobTitle ? '100%' : '35%'}
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4 mb-6">
        <div className="font-bold text-indigo-900">✓ Completed Sections:</div>
        <div className="text-sm text-indigo-800 mt-2">
          {formData.phone && formData.location && formData.jobTitle 
            ? '✓ Basic Setup • ✓ Contact Info • ✓ Target Job'
            : '✓ Basic Setup • (Pending Contact Info & Target Job)'}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Email (Cannot be changed)</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            disabled
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 (555) 000-0000"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="San Francisco, CA"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Target Job Title</label>
          <input
            type="text"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleChange}
            placeholder="e.g. Senior Frontend Developer"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
          />
        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}