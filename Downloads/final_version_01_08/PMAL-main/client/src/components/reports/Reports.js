// client/src/components/reports/Reports.js
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Reports = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center bg-white p-12 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-green-600 mb-4">Generate Report</h1>
        <p className="text-gray-700 mb-2">This page will allow you to generate and download reports for the project.</p>
        <p className="text-gray-500 mb-6">Project ID: {projectId}</p>
        <button
          onClick={() => navigate(`/projects/${projectId}`)}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Back to Project
        </button>
      </div>
    </div>
  );
};

export default Reports;