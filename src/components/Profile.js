import React, { useState, useEffect } from 'react';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState({
    firstName: 'John',
    lastName: 'Doe',
    username: 'john.doe',
    email: 'john.doe@company.com',
    userRole: 'Project Manager',
    company: 'TechCorp Inc.',
    department: 'Engineering',
    phoneNumber: '+1 (555) 123-4567',
    avatar: '👨‍💼',
    joinDate: '2023-01-15',
    lastLogin: '2024-02-28T10:30:00Z',
    profileImage: null,
    bio: 'Experienced project manager with a passion for delivering high-quality software solutions.',
    location: 'San Francisco, CA',
    timezone: 'PST',
    language: 'English'
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    projectUpdates: true,
    assessmentReminders: true,
    teamNotifications: true,
    weeklyReports: false,
    securityAlerts: true
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (section, field, value) => {
    if (section === 'user') {
      setUser(prev => ({ ...prev, [field]: value }));
    } else if (section === 'passwords') {
      setPasswords(prev => ({ ...prev, [field]: value }));
    } else if (section === 'notifications') {
      setNotifications(prev => ({ ...prev, [field]: value }));
    }

    // Clear errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validatePasswords = () => {
    const newErrors = {};

    if (!passwords.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!passwords.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwords.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Profile update failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePasswords()) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccessMessage('Password changed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Password change failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setSuccessMessage('Notification preferences updated!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Notification update failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: '👤' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' }
  ];

  const stats = [
    { label: 'Projects Created', value: '12', icon: '📁', color: 'from-blue-500 to-blue-600' },
    { label: 'Assessments Completed', value: '28', icon: '📊', color: 'from-green-500 to-green-600' },
    { label: 'Average Score', value: '4.2', icon: '⭐', color: 'from-yellow-500 to-yellow-600' },
    { label: 'Days Active', value: '423', icon: '📅', color: 'from-purple-500 to-purple-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-4xl shadow-lg">
                {user.avatar}
              </div>
              <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors duration-200">
                📷
              </button>
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{user.firstName} {user.lastName}</h1>
              <p className="text-lg text-blue-600 font-medium">{user.userRole}</p>
              <p className="text-gray-600">{user.company} • {user.department}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span>📧 {user.email}</span>
                <span>📞 {user.phoneNumber}</span>
                <span>📍 {user.location}</span>
              </div>
            </div>

            {successMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl">
                {successMessage}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center text-white text-xl`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'general' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">General Information</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={user.firstName}
                  onChange={(e) => handleInputChange('user', 'firstName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={user.lastName}
                  onChange={(e) => handleInputChange('user', 'lastName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={user.username}
                  onChange={(e) => handleInputChange('user', 'username', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user.email}
                  onChange={(e) => handleInputChange('user', 'email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  value={user.company}
                  onChange={(e) => handleInputChange('user', 'company', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  value={user.department}
                  onChange={(e) => handleInputChange('user', 'department', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={user.phoneNumber}
                  onChange={(e) => handleInputChange('user', 'phoneNumber', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={user.location}
                  onChange={(e) => handleInputChange('user', 'location', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Bio
                </label>
                <textarea
                  value={user.bio}
                  onChange={(e) => handleInputChange('user', 'bio', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={handleSaveProfile}
                disabled={isLoading}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Change Password</h3>
              
              <div className="max-w-md space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwords.currentPassword}
                    onChange={(e) => handleInputChange('passwords', 'currentPassword', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl text-gray-900 focus:outline-none focus:ring-2 transition-all duration-300 ${
                      errors.currentPassword ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                  />
                  {errors.currentPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) => handleInputChange('passwords', 'newPassword', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl text-gray-900 focus:outline-none focus:ring-2 transition-all duration-300 ${
                      errors.newPassword ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                  />
                  {errors.newPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) => handleInputChange('passwords', 'confirmPassword', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl text-gray-900 focus:outline-none focus:ring-2 transition-all duration-300 ${
                      errors.confirmPassword ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                <button
                  onClick={handleChangePassword}
                  disabled={isLoading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? 'Changing Password...' : 'Change Password'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Security Information</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <div>
                    <div className="font-medium text-gray-900">Last Login</div>
                    <div className="text-sm text-gray-600">{new Date(user.lastLogin).toLocaleString()}</div>
                  </div>
                  <span className="text-green-600">✓</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <div>
                    <div className="font-medium text-gray-900">Account Created</div>
                    <div className="text-sm text-gray-600">{new Date(user.joinDate).toLocaleDateString()}</div>
                  </div>
                  <span className="text-green-600">✓</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <div>
                    <div className="font-medium text-gray-900">Two-Factor Authentication</div>
                    <div className="text-sm text-gray-600">Not enabled</div>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                    Enable
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Notification Preferences</h3>
            
            <div className="space-y-6">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                  <div>
                    <div className="font-medium text-gray-900">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </div>
                    <div className="text-sm text-gray-600">
                      {key === 'emailNotifications' && 'Receive email notifications for important updates'}
                      {key === 'projectUpdates' && 'Get notified when projects are updated'}
                      {key === 'assessmentReminders' && 'Reminders for pending assessments'}
                      {key === 'teamNotifications' && 'Updates about team activities'}
                      {key === 'weeklyReports' && 'Weekly summary reports via email'}
                      {key === 'securityAlerts' && 'Important security and account alerts'}
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => handleInputChange('notifications', key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={handleSaveNotifications}
                disabled={isLoading}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Application Preferences</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Timezone
                </label>
                <select
                  value={user.timezone}
                  onChange={(e) => handleInputChange('user', 'timezone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                >
                  <option value="PST">Pacific Standard Time (PST)</option>
                  <option value="EST">Eastern Standard Time (EST)</option>
                  <option value="CST">Central Standard Time (CST)</option>
                  <option value="MST">Mountain Standard Time (MST)</option>
                  <option value="UTC">Coordinated Universal Time (UTC)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Language
                </label>
                <select
                  value={user.language}
                  onChange={(e) => handleInputChange('user', 'language', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Chinese">Chinese</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={handleSaveProfile}
                disabled={isLoading}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;