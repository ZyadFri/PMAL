// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { user: authUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notifications, setNotifications] = useState({});
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const tabs = [
    { id: 'general', label: 'General Information' },
    { id: 'security', label: 'Security & Privacy' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'preferences', label: 'Preferences' }
  ];

  // Redirect if not logged in, else fetch profile
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      loadProfile();
    }
  }, [isAuthenticated]);

  // Load user profile + notification settings
  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const [meRes, notifRes] = await Promise.all([
        api.get('/users/me'),
        api.get('/users/me/notifications')
      ]);
      setProfile(meRes.data.data.user);
      setNotifications(notifRes.data.data.preferences);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    if (section === 'profile') {
      setProfile(p => ({ ...p, [field]: value }));
    } else if (section === 'passwords') {
      setPasswords(p => ({ ...p, [field]: value }));
    } else if (section === 'notifications') {
      setNotifications(n => ({ ...n, [field]: value }));
    }
    if (errors[field]) {
      setErrors(e => ({ ...e, [field]: '' }));
    }
  };

  const validatePasswords = () => {
    const errs = {};
    if (!passwords.currentPassword) errs.currentPassword = 'Current password is required';
    if (!passwords.newPassword) errs.newPassword = 'New password is required';
    else if (passwords.newPassword.length < 6) errs.newPassword = 'At least 6 characters';
    if (passwords.newPassword !== passwords.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return !Object.keys(errs).length;
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      await api.put('/users/me', {
        firstName: profile.firstName,
        lastName: profile.lastName,
        username: profile.username,
        email: profile.email,
        company: profile.company,
        department: profile.department,
        phoneNumber: profile.phoneNumber,
        location: profile.location,
        bio: profile.bio,
        timezone: profile.timezone,
        language: profile.language
      });
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Save profile failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePasswords()) return;
    setIsLoading(true);
    try {
      await api.post('/users/me/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccessMessage('Password changed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Password change failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsLoading(true);
    try {
      await api.put('/users/me/notifications', notifications);
      setSuccessMessage('Notification preferences updated!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Notification update failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl mx-auto mb-6 animate-pulse shadow-2xl"></div>
            <div className="absolute inset-0 w-20 h-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl mx-auto blur-xl opacity-30 animate-pulse"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gradient-to-r from-gray-300 to-gray-200 rounded-full w-32 mx-auto animate-pulse"></div>
            <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full w-24 mx-auto animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Enhanced Header */}
      <div className="relative bg-white/70 backdrop-blur-xl border-b border-gray-200/50 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 via-purple-600/5 to-pink-500/5"></div>
        <div className="relative max-w-7xl mx-auto px-8 py-12">
          <div className="flex items-center space-x-8">
            <div className="relative group">
              <div className="w-32 h-32 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl flex items-center justify-center text-white text-5xl font-bold shadow-2xl transform group-hover:scale-105 transition-all duration-300">
                {profile.avatar || profile.firstName.charAt(0)}
              </div>
              <div className="absolute inset-0 w-32 h-32 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              <button
                onClick={() => {/* trigger file upload… */}}
                className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-gray-600 hover:text-indigo-600 hover:shadow-xl transform hover:scale-110 transition-all duration-300 border-4 border-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {profile.userRole}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-gray-700 font-medium text-lg">{profile.company} • {profile.department}</p>
                <div className="flex flex-wrap gap-6 text-gray-600">
                  <span className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span>{profile.email}</span>
                  </span>
                  <span className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>{profile.phoneNumber}</span>
                  </span>
                  <span className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    <span>{profile.location}</span>
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="px-8 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-2xl hover:from-red-600 hover:to-rose-700 transform hover:scale-105 hover:shadow-xl transition-all duration-300 font-semibold"
            >
              Sign Out
            </button>
          </div>
        </div>
        
        {successMessage && (
          <div className="absolute bottom-0 left-0 right-0 transform translate-y-full">
            <div className="max-w-7xl mx-auto px-8 py-4">
              <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border border-emerald-400/20">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="font-medium">{successMessage}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Tabs */}
      <div className="bg-white/50 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex space-x-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-8 py-6 font-semibold text-sm transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="relative z-10">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl"></div>
                )}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Content */}
      <div className="max-w-7xl mx-auto px-8 py-12 space-y-8">
        {activeTab === 'general' && (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-100/50 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
            <div className="relative">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-8">
                General Information
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {[
                  { label: 'First Name', field: 'firstName', type: 'text' },
                  { label: 'Last Name', field: 'lastName', type: 'text' },
                  { label: 'Username', field: 'username', type: 'text' },
                  { label: 'Email Address', field: 'email', type: 'email' },
                  { label: 'Company', field: 'company', type: 'text' },
                  { label: 'Department', field: 'department', type: 'text' },
                  { label: 'Phone Number', field: 'phoneNumber', type: 'tel' },
                  { label: 'Location', field: 'location', type: 'text' },
                ].map(({ label, field, type }) => (
                  <div key={field} className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">{label}</label>
                    <input
                      type={type}
                      value={profile[field] || ''}
                      onChange={e => handleInputChange('profile', field, e.target.value)}
                      className="w-full px-6 py-4 bg-white/50 border border-gray-300/50 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 backdrop-blur-sm group-hover:border-gray-400/50"
                    />
                  </div>
                ))}

                <div className="lg:col-span-2 group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Biography</label>
                  <textarea
                    value={profile.bio || ''}
                    onChange={e => handleInputChange('profile', 'bio', e.target.value)}
                    rows={4}
                    className="w-full px-6 py-4 bg-white/50 border border-gray-300/50 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 backdrop-blur-sm group-hover:border-gray-400/50 resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>

              <div className="flex justify-end mt-10">
                <button
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  className="px-12 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white rounded-2xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none font-semibold text-lg"
                >
                  {isLoading ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-8">
            {/* Change Password */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 p-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-red-100/50 to-transparent rounded-full -translate-y-32 -translate-x-32"></div>
              <div className="relative">
                <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-8">
                  Change Password
                </h3>
                <div className="max-w-md space-y-6">
                  {[
                    { label: 'Current Password', field: 'currentPassword' },
                    { label: 'New Password', field: 'newPassword' },
                    { label: 'Confirm New Password', field: 'confirmPassword' }
                  ].map(({ label, field }) => (
                    <div key={field} className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">{label}</label>
                      <input
                        type="password"
                        value={passwords[field]}
                        onChange={e => handleInputChange('passwords', field, e.target.value)}
                        className={`w-full px-6 py-4 bg-white/50 border rounded-2xl focus:outline-none focus:ring-4 transition-all duration-300 backdrop-blur-sm ${
                          errors[field]
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                            : 'border-gray-300/50 focus:border-indigo-500 focus:ring-indigo-100'
                        }`}
                      />
                      {errors[field] && (
                        <p className="text-red-500 text-sm mt-2 font-medium">{errors[field]}</p>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={handleChangePassword}
                    disabled={isLoading}
                    className="w-full px-8 py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-2xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none font-semibold text-lg mt-8"
                  >
                    {isLoading ? 'Changing Password...' : 'Change Password'}
                  </button>
                </div>
              </div>
            </div>

            {/* Security Info */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-green-100/50 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
              <div className="relative">
                <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-8">
                  Security Information
                </h3>
                <div className="space-y-6">
                  <InfoRow label="Last Login" value={new Date(profile.lastLogin).toLocaleString()} done />
                  <InfoRow label="Account Created" value={new Date(profile.joinDate).toLocaleDateString()} done />
                  <InfoRow
                    label="Two‑Factor Authentication"
                    value={profile.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    action={
                      !profile.twoFactorEnabled && (
                        <button className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-semibold">
                          Enable 2FA
                        </button>
                      )
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-100/50 to-transparent rounded-full -translate-y-32 -translate-x-32"></div>
            <div className="relative">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-8">
                Notification Preferences
              </h3>
              <div className="space-y-6">
                {Object.entries(notifications).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between p-6 bg-white/50 border border-gray-200/50 rounded-2xl backdrop-blur-sm hover:border-gray-300/50 transition-all duration-300">
                    <div className="space-y-1">
                      <div className="font-semibold text-gray-900 text-lg">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </div>
                      <div className="text-gray-600">
                        Receive updates and notifications for {key.toLowerCase()}
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={val}
                        onChange={e => handleInputChange('notifications', key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-8 bg-gray-200 peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-indigo-500 peer-checked:to-purple-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:after:translate-x-6 after:shadow-lg"></div>
                    </label>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-10">
                <button
                  onClick={handleSaveNotifications}
                  disabled={isLoading}
                  className="px-12 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none font-semibold text-lg"
                >
                  {isLoading ? 'Saving Preferences...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-100/50 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
            <div className="relative">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-8">
                Application Preferences
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <SelectRow
                  label="Timezone"
                  value={profile.timezone}
                  onChange={val => handleInputChange('profile', 'timezone', val)}
                  options={[
                    'PST','MST','CST','EST','UTC'
                  ]}
                />
                <SelectRow
                  label="Language"
                  value={profile.language}
                  onChange={val => handleInputChange('profile', 'language', val)}
                  options={[
                    'English','Spanish','French','German','Chinese'
                  ]}
                />
              </div>
              <div className="flex justify-end mt-10">
                <button
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  className="px-12 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white rounded-2xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none font-semibold text-lg"
                >
                  {isLoading ? 'Saving Preferences...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;


// ———————
// Enhanced Shared sub‐components

const InfoRow = ({ label, value, done, action }) => (
  <div className="flex justify-between items-center p-6 bg-white/50 border border-gray-200/50 rounded-2xl backdrop-blur-sm hover:border-gray-300/50 transition-all duration-300">
    <div className="space-y-1">
      <div className="font-semibold text-gray-900 text-lg">{label}</div>
      <div className="text-gray-600">{value}</div>
    </div>
    {done ? (
      <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>
    ) : action}
  </div>
);

const SelectRow = ({ label, value, onChange, options }) => (
  <div className="group">
    <label className="block text-sm font-semibold text-gray-700 mb-3">{label}</label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-6 py-4 bg-white/50 border border-gray-300/50 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 backdrop-blur-sm group-hover:border-gray-400/50 appearance-none cursor-pointer"
    >
      {options.map(opt => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);