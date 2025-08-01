import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AssessmentHistory = () => {
  const [assessments, setAssessments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory(pagination.currentPage);
  }, [pagination.currentPage]);

  const fetchHistory = async (page) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/assessments/history?page=${page}&limit=10`);
      if (response.data.success) {
        setAssessments(response.data.data.assessments);
        setPagination({
          currentPage: response.data.data.currentPage,
          totalPages: response.data.data.totalPages,
        });
      }
    } catch (error) {
      console.error("Failed to fetch assessment history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreGradient = (score) => {
    if (score >= 90) return 'from-emerald-500 to-green-600';
    if (score >= 80) return 'from-blue-500 to-indigo-600';
    if (score >= 70) return 'from-amber-500 to-orange-600';
    return 'from-red-500 to-rose-600';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl mx-auto mb-6 animate-pulse shadow-2xl"></div>
            <div className="absolute inset-0 w-20 h-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl mx-auto blur-xl opacity-30 animate-pulse"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gradient-to-r from-gray-300 to-gray-200 rounded-full w-48 mx-auto animate-pulse"></div>
            <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full w-32 mx-auto animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Header */}
      <div className="relative bg-white/70 backdrop-blur-xl border-b border-gray-200/50 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-indigo-600/5 to-purple-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-8 py-16">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              Assessment History
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Track your progress and review your completed assessments
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {assessments.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-100/50 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-indigo-100/50 to-transparent rounded-full translate-y-32 -translate-x-32"></div>
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Assessments Yet</h3>
              <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                You haven't completed any assessments yet. Start by exploring your projects and taking your first assessment.
              </p>
              <button 
                onClick={() => navigate('/projects')} 
                className="px-12 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 font-semibold text-lg"
              >
                Explore Projects
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-100/50 to-transparent rounded-full -translate-y-12 translate-x-12"></div>
                <div className="relative">
                  <div className="text-sm font-semibold text-gray-600 mb-2">Total Assessments</div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {assessments.length}
                  </div>
                </div>
              </div>
              
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-100/50 to-transparent rounded-full -translate-y-12 translate-x-12"></div>
                <div className="relative">
                  <div className="text-sm font-semibold text-gray-600 mb-2">Average Score</div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                    {assessments.length > 0 ? (assessments.reduce((sum, a) => sum + (a.overallScore || 0), 0) / assessments.length).toFixed(1) : '0'}
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-100/50 to-transparent rounded-full -translate-y-12 translate-x-12"></div>
                <div className="relative">
                  <div className="text-sm font-semibold text-gray-600 mb-2">Best Score</div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {assessments.length > 0 ? Math.max(...assessments.map(a => a.overallScore || 0)).toFixed(1) : '0'}
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Table */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50/50 to-blue-50/50 border-b border-gray-200/50">
                      <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Project</th>
                      <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Assessment Type</th>
                      <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Completion Date</th>
                      <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Score</th>
                      <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/50">
                    {assessments.map((assessment, index) => (
                      <tr key={assessment._id} className="hover:bg-white/50 transition-all duration-300 group">
                        <td className="px-8 py-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                            <span className="font-semibold text-gray-900 text-lg">{assessment.project?.name}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 font-medium capitalize">
                            {assessment.type}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-gray-600 font-medium">
                          {new Date(assessment.completedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center space-x-3">
                            <div className={`px-4 py-2 rounded-xl font-bold text-lg ${getScoreColor(assessment.overallScore)}`}>
                              {assessment.overallScore?.toFixed(1)}
                            </div>
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full bg-gradient-to-r ${getScoreGradient(assessment.overallScore)} transition-all duration-500`}
                                style={{ width: `${assessment.overallScore}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <button 
                            onClick={() => navigate(`/assessments/results/${assessment._id}`)}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-semibold"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Pagination */}
        {assessments.length > 0 && pagination.totalPages > 1 && (
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 p-6">
            <div className="flex justify-between items-center">
              <button 
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Previous</span>
              </button>
              
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">Page</span>
                <div className="flex items-center space-x-2">
                  {[...Array(pagination.totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`w-12 h-12 rounded-xl font-semibold transition-all duration-300 ${
                        pagination.currentPage === i + 1
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <span className="text-gray-600">of {pagination.totalPages}</span>
              </div>
              
              <button 
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold"
              >
                <span>Next</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentHistory;