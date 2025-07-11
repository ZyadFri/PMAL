import React from 'react';

const AdminPanel = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Admin Panel</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2">User Management</h3>
            <p className="text-gray-600">Manage users and permissions</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="text-4xl mb-4">❓</div>
            <h3 className="text-xl font-semibold mb-2">Questions</h3>
            <p className="text-gray-600">Manage assessment questions</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="text-4xl mb-4">📂</div>
            <h3 className="text-xl font-semibold mb-2">Categories</h3>
            <p className="text-gray-600">Manage question categories</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Analytics</h3>
            <p className="text-gray-600">System analytics and reports</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;