import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const ProjectDetail = () => {
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (id) {
      loadProject();
    }
  }, [id, isAuthenticated, navigate]);

  const loadProject = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await api.get(`/projects/${id}`);
      
      if (response.data.success) {
        setProject(response.data.data.project);
      } else {
        setError('Failed to load project');
      }
    } catch (err) {
      console.error('Error loading project:', err);
      setError(err.response?.data?.message || 'Failed to load project');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Not Yet Scored':
        return 'bg-gray-100 text-gray-700 border border-gray-300';
      case 'Quick Assessment Complete':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
      case 'Deep Assessment Complete':
        return 'bg-green-100 text-green-700 border border-green-300';
      case 'Assessment in Progress':
        return 'bg-blue-100 text-blue-700 border border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-300';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleStartAssessment = (type) => {
    navigate(`/assessments/${type}/${project._id}`);
  };

  const handleEditProject = () => {
    setShowEditModal(true);
  };

  const handleDeleteProject = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/projects/${project._id}`);
      setShowDeleteModal(false);
      navigate('/projects', { 
        state: { message: 'Project deleted successfully' }
      });
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Failed to delete project');
    }
  };

  const handleBack = () => {
    navigate('/projects');
  };

  const handleGenerateReport = () => {
    navigate(`/reports/project/${project._id}`);
  };

  const handleViewAnalytics = () => {
    navigate(`/analytics/project/${project._id}`);
  };

  const handleExportData = () => {
    console.log('Export data functionality to be implemented');
  };

  const calculateDaysRemaining = () => {
    if (!project?.endDate) return null;
    const today = new Date();
    const endDate = new Date(project.endDate);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl font-bold text-white">P</span>
          </div>
          <div className="text-gray-600">Loading project details...</div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl text-red-600">!</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error ? 'Error Loading Project' : 'Project Not Found'}
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "The project you're looking for doesn't exist or you don't have access to it."}
          </p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'team', label: 'Team' },
    { id: 'assessments', label: 'Assessments' }
  ];

  const daysRemaining = calculateDaysRemaining();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <span className="text-xl">←</span>
              </button>
              
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl">
                  P
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(project.priority)}`}>
                      {project.priority} Priority
                    </span>
                    <span className="text-sm text-gray-600">{project.phase} Phase</span>
                    {daysRemaining !== null && (
                      <span className={`text-sm font-medium ${daysRemaining < 30 ? 'text-red-600' : 'text-gray-600'}`}>
                        {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Overdue'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {project.status === 'Not Yet Scored' && (
                <button
                  onClick={() => handleStartAssessment('quick')}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Start Assessment
                </button>
              )}

              <button
                onClick={handleEditProject}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 transition-all duration-200"
              >
                Edit Project
              </button>

              <button
                onClick={handleDeleteProject}
                className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Project Progress</span>
              <span>{project.progress || 0}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${project.progress || 0}%` }}
              />
            </div>
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
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Project Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {project.description || 'No description provided.'}
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Assessment Status</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Quick Assessment */}
                  <div className="p-4 border border-gray-200 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">Quick Assessment</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        project.quickAssessment?.isCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {project.quickAssessment?.isCompleted ? 'Completed' : 'Not Started'}
                      </span>
                    </div>
                    
                    {project.quickAssessment?.isCompleted ? (
                      <div>
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {project.quickAssessment.score || 0}/5.0
                        </div>
                        {project.quickAssessment.completedAt && (
                          <div className="text-sm text-gray-600">
                            Completed on {new Date(project.quickAssessment.completedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <div className="text-2xl mb-2">📊</div>
                        <button
                          onClick={() => handleStartAssessment('quick')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                          Start Quick Assessment
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Deep Assessment */}
                  <div className="p-4 border border-gray-200 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">Deep Assessment</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        project.deepAssessment?.isCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {project.deepAssessment?.isCompleted ? 'Completed' : 'Not Started'}
                      </span>
                    </div>
                    
                    <div className="text-center py-4 text-gray-500">
                      <div className="text-2xl mb-2">🔍</div>
                      <p className="text-sm">Deep assessment coming soon</p>
                    </div>
                  </div>
                </div>
              </div>

              {project.tags && project.tags.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Project Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Project Details</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Start Date</span>
                    <div className="text-gray-900">
                      {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}
                    </div>
                  </div>
                  {project.endDate && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">End Date</span>
                      <div className="text-gray-900">{new Date(project.endDate).toLocaleDateString()}</div>
                    </div>
                  )}
                  {project.budget && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Budget</span>
                      <div className="text-gray-900">${project.budget.toLocaleString()}</div>
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium text-gray-500">Owner</span>
                    <div className="text-gray-900">
                      {project.owner ? 
                        `${project.owner.firstName} ${project.owner.lastName}` : 
                        'Unknown'
                      }
                    </div>
                  </div>
                  {project.manager && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Manager</span>
                      <div className="text-gray-900">
                        {`${project.manager.firstName} ${project.manager.lastName}`}
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium text-gray-500">Team Size</span>
                    <div className="text-gray-900">{project.team?.length || 0} members</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={handleViewAnalytics}
                    className="w-full p-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors duration-200 text-left"
                  >
                    View Analytics
                  </button>
                  <button 
                    onClick={handleGenerateReport}
                    className="w-full p-3 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors duration-200 text-left"
                  >
                    Generate Report
                  </button>
                  <button 
                    onClick={handleExportData}
                    className="w-full p-3 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors duration-200 text-left"
                  >
                    Export Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-gray-900">Team Members</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Owner */}
              {project.owner && (
                <div className="p-6 border-2 border-blue-200 bg-blue-50 rounded-xl">
                  <div className="mb-3">
                    <div className="font-semibold text-gray-900">
                      {`${project.owner.firstName} ${project.owner.lastName}`}
                    </div>
                    <div className="text-sm text-blue-600 font-medium">Project Owner</div>
                    <div className="text-xs text-gray-600">{project.owner.email}</div>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    Owner
                  </span>
                </div>
              )}

              {/* Manager */}
              {project.manager && (
                <div className="p-6 border-2 border-purple-200 bg-purple-50 rounded-xl">
                  <div className="mb-3">
                    <div className="font-semibold text-gray-900">
                      {`${project.manager.firstName} ${project.manager.lastName}`}
                    </div>
                    <div className="text-sm text-purple-600 font-medium">Project Manager</div>
                    <div className="text-xs text-gray-600">{project.manager.email}</div>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                    Manager
                  </span>
                </div>
              )}

              {/* Team Members */}
              {project.team && project.team.length > 0 && project.team.map((member, index) => (
                <div key={index} className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow duration-200">
                  <div className="mb-3">
                    <div className="font-semibold text-gray-900">
                      {member.user ? 
                        `${member.user.firstName} ${member.user.lastName}` : 
                        'Unknown Member'
                      }
                    </div>
                    <div className="text-sm text-gray-600">{member.role}</div>
                    {member.user?.email && (
                      <div className="text-xs text-gray-500">{member.user.email}</div>
                    )}
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    {member.role}
                  </span>
                </div>
              ))}

              {(!project.team || project.team.length === 0) && !project.manager && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  <p>No team members added yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'assessments' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Assessment History</h3>
              
              {project.assessmentHistory && project.assessmentHistory.length > 0 ? (
                <div className="space-y-4">
                  {project.assessmentHistory.map((assessment, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow duration-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-gray-900">Assessment</div>
                          <div className="text-sm text-gray-600">
                            {assessment.date ? new Date(assessment.date).toLocaleDateString() : 'Date not available'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-green-600">
                            {assessment.score || 'N/A'}/5.0
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📊</div>
                  <p>No assessments completed yet</p>
                  <button
                    onClick={() => handleStartAssessment('quick')}
                    className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
                  >
                    Start First Assessment
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-red-600">!</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete Project</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{project.name}"? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200"
                >
                  Delete Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal - Simplified */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Edit Project</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="text-center py-8 text-gray-500">
              <p>Project editing functionality will be implemented soon.</p>
              <button
                onClick={() => setShowEditModal(false)}
                className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;