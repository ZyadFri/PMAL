import React, { useState, useEffect } from 'react';
import { useParams, useNavigate , useLocation  } from 'react-router-dom';
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
const location = useLocation();
 useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (id) {
      loadProject();
    }

    // Add an event listener to refetch data when the window/tab is focused
    window.addEventListener('focus', loadProject);

    // Cleanup function to remove the listener when the component unmounts
    return () => {
      window.removeEventListener('focus', loadProject);
    };
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
        return 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 border border-slate-200 shadow-sm';
      case 'Quick Assessment Complete':
        return 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border border-amber-200 shadow-sm';
      case 'Deep Assessment Complete':
        return 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200 shadow-sm';
      case 'Assessment in Progress':
        return 'bg-gradient-to-r from-sky-50 to-blue-50 text-sky-700 border border-sky-200 shadow-sm';
      default:
        return 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 border border-slate-200 shadow-sm';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-rose-700 bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200';
      case 'Medium': return 'text-orange-700 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200';
      case 'Low': return 'text-emerald-700 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200';
      default: return 'text-slate-700 bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200';
    }
  };

  const handleStartAssessment = (type) => {
    navigate(`/assessments/${type}/${project._id}`);
  };

  // Check if Quick Assessment is completed
 const isQuickAssessmentCompleted = () => {
  return project?.quickAssessment?.score > 0;
};
  // Check if Deep Assessment can be started
  const canStartDeepAssessment = () => {
    return isQuickAssessmentCompleted() && !project?.deepAssessment?.isCompleted;
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

const handleGenerateReport = async () => {
  try {
    // Show loading state if you have one
    console.log('Generating report...');

    // CRUCIAL: Set responseType to 'blob' to handle file downloads
    const response = await api.get(`/projects/${project._id}/report`, {
      responseType: 'blob',
    });

    // Create a URL for the blob
    const url = window.URL.createObjectURL(new Blob([response.data]));

    // Create a temporary link to trigger the download
    const link = document.createElement('a');
    link.href = url;
    const filename = `PMAL-Report-${project.name.replace(/\s/g, '_')}.pdf`;
    link.setAttribute('download', filename);

    // Append to the document, click, and then remove
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);

  } catch (err) {
    console.error('Error generating report:', err);
    alert('Could not generate the report. Please ensure a Quick Assessment has been completed.');
  } finally {
    // Hide loading state
  }
};

  const handleViewAnalytics = () => {
    navigate(`/analytics/project/${project._id}`);
  };

 const handleExportData = () => {
  // For now, just show a confirmation.
  // Later, this would trigger an API call to a backend endpoint.
  alert(`Exporting data for project: ${project.name}`);
  console.log(`Triggered export for project ID: ${project._id}`);
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
            <span className="text-3xl font-bold text-white">P</span>
          </div>
          <div className="text-slate-600 text-lg font-medium">Loading project details...</div>
          <div className="mt-4 w-48 h-2 bg-gradient-to-r from-violet-200 to-purple-200 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-3xl shadow-2xl p-12 max-w-md mx-4 border border-rose-100">
          <div className="w-28 h-28 bg-gradient-to-br from-rose-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
            <span className="text-4xl text-rose-600 font-bold">!</span>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent mb-3">
            {error ? 'Error Loading Project' : 'Project Not Found'}
          </h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            {error || "The project you're looking for doesn't exist or you don't have access to it."}
          </p>
          <button
            onClick={handleBack}
            className="px-8 py-4 bg-gradient-to-r from-rose-500 to-red-500 text-white font-semibold rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 transform"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
   // { id: 'team', label: 'Team' },
    { id: 'assessments', label: 'Assessments' }
  ];

  const daysRemaining = calculateDaysRemaining();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={handleBack}
                className="p-3 hover:bg-gradient-to-r hover:from-indigo-100 hover:to-purple-100 rounded-2xl transition-all duration-300 group"
              >
                <span className="text-2xl text-slate-600 group-hover:text-indigo-600 transition-colors duration-300">←</span>
              </button>
              
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 rounded-3xl flex items-center justify-center text-white text-3xl font-bold shadow-2xl">
                  P
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">{project.name}</h1>
                  <div className="flex items-center space-x-4 mt-3">
                    <span className={`px-4 py-2 rounded-2xl text-sm font-semibold ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                    <span className={`px-4 py-2 rounded-2xl text-sm font-semibold ${getPriorityColor(project.priority)}`}>
                      {project.priority} Priority
                    </span>
                    <span className="px-4 py-2 bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 rounded-2xl text-sm font-semibold border border-slate-200">
                      {project.phase} Phase
                    </span>
                    {daysRemaining !== null && (
                      <span className={`px-4 py-2 rounded-2xl text-sm font-semibold ${
                        daysRemaining < 30 
                          ? 'bg-gradient-to-r from-rose-100 to-red-100 text-rose-700 border border-rose-200' 
                          : 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 border border-slate-200'
                      }`}>
                        {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Overdue'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {project.status === 'Not Yet Scored' && (
                <button
                  onClick={() => handleStartAssessment('quick')}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white font-bold rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 transform"
                >
                  Start Assessment
                </button>
              )}

              {/* Deep Assessment Button - Show if Quick Assessment is completed */}
              {canStartDeepAssessment() && (
                <button
                  onClick={() => handleStartAssessment('deep')}
                  className="px-8 py-4 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 text-white font-bold rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 transform"
                >
                  Start Deep Assessment
                </button>
              )}

              <button
                onClick={handleDeleteProject}
                className="p-4 text-rose-600 hover:bg-gradient-to-r hover:from-rose-50 hover:to-red-50 rounded-2xl transition-all duration-300 border-2 border-transparent hover:border-rose-200"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-8">
            <div className="flex justify-between text-sm font-semibold text-slate-600 mb-3">
              <span>Project Progress</span>
              <span>{project.progress || 0}% Complete</span>
            </div>
            <div className="w-full bg-gradient-to-r from-slate-200 to-gray-200 rounded-full h-4 shadow-inner">
              <div 
                className="bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 h-4 rounded-full transition-all duration-500 shadow-lg"
                style={{ width: `${project.progress || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex space-x-12">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-6 px-4 border-b-3 font-bold text-sm transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'border-violet-500 text-violet-600 bg-gradient-to-t from-violet-50 to-transparent'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:bg-gradient-to-t hover:from-slate-50 hover:to-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 hover:shadow-3xl transition-all duration-500">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-6">Project Description</h3>
                <p className="text-slate-700 leading-relaxed text-lg">
                  {project.description || 'No description provided.'}
                </p>
              </div>

              <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 hover:shadow-3xl transition-all duration-500">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-8">Assessment Status</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Quick Assessment */}
                 <div className="p-6 border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300">
  <div className="flex items-center justify-between mb-4">
    <h4 className="text-xl font-bold text-slate-800">Quick Assessment</h4>
    <span className={`px-4 py-2 rounded-2xl text-xs font-bold ${
      isQuickAssessmentCompleted() ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200' : 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 border border-slate-200'
    }`}>
      {isQuickAssessmentCompleted() ? 'Completed' : 'Not Started'}
    </span>
  </div>
  
  {isQuickAssessmentCompleted() ? (
    <div>
      <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">
        {project.quickAssessment.score?.toFixed(2) || '0.00'}/3.0
      </div>
      {project.quickAssessment.completedAt && (
        <div className="text-sm text-slate-600 font-medium">
          Completed on {new Date(project.quickAssessment.completedAt).toLocaleDateString()}
        </div>
      )}
    </div>
  ) : (
    <div className="text-center py-6 text-slate-500">
      <div className="text-4xl mb-4">📊</div>
      <button
        onClick={() => handleStartAssessment('quick')}
        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-300 transform"
      >
        Start Quick Assessment
      </button>
    </div>
  )}
</div>

                  {/* Deep Assessment - FIXED VERSION */}
                  <div className="p-6 border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xl font-bold text-slate-800">Deep Assessment</h4>
                      <span className={`px-4 py-2 rounded-2xl text-xs font-bold ${
                        project.deepAssessment?.isCompleted ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200' : 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 border border-slate-200'
                      }`}>
                        {project.deepAssessment?.isCompleted ? 'Completed' : 'Not Started'}
                      </span>
                    </div>
                    
                    {project.deepAssessment?.isCompleted ? (
                      <div>
                        <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">
                          {project.deepAssessment.score?.toFixed(2) || '0.00'}/5.0
                        </div>
                        {project.deepAssessment.completedAt && (
                          <div className="text-sm text-slate-600 font-medium">
                            Completed on {new Date(project.deepAssessment.completedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <div className="text-4xl mb-4">🔍</div>
                        {isQuickAssessmentCompleted() ? (
                          <button
                            onClick={() => handleStartAssessment('deep')}
                            className="px-6 py-3 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 text-white font-semibold rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-300 transform"
                          >
                            Start Deep Assessment
                          </button>
                        ) : (
                          <div className="text-slate-500">
                            <p className="text-sm mb-3 font-medium">Complete Quick Assessment first</p>
                            <div className="px-4 py-2 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 rounded-2xl text-xs font-bold border border-amber-200">
                              Locked
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {project.tags && project.tags.length > 0 && (
                <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 hover:shadow-3xl transition-all duration-500">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-6">Project Tags</h3>
                  <div className="flex flex-wrap gap-3">
                    {project.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-5 py-3 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-2xl text-sm font-bold border border-blue-200 hover:shadow-lg transition-all duration-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 hover:shadow-3xl transition-all duration-500">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-6">Project Details</h3>
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Start Date</span>
                    <div className="text-slate-800 font-semibold text-lg mt-1">
                      {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}
                    </div>
                  </div>
                  {project.endDate && (
                    <div className="border-b border-slate-100 pb-4">
                      <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">End Date</span>
                      <div className="text-slate-800 font-semibold text-lg mt-1">{new Date(project.endDate).toLocaleDateString()}</div>
                    </div>
                  )}
                  {project.budget && (
                    <div className="border-b border-slate-100 pb-4">
                      <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Budget</span>
                      <div className="text-slate-800 font-semibold text-lg mt-1">${project.budget.toLocaleString()}</div>
                    </div>
                  )}
                  <div className="border-b border-slate-100 pb-4">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Owner</span>
                    <div className="text-slate-800 font-semibold text-lg mt-1">
                      {project.owner ? 
                        `${project.owner.firstName} ${project.owner.lastName}` : 
                        'Unknown'
                      }
                    </div>
                  </div>
                  {project.manager && (
                    <div className="border-b border-slate-100 pb-4">
                      <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Manager</span>
                      <div className="text-slate-800 font-semibold text-lg mt-1">
                        {`${project.manager.firstName} ${project.manager.lastName}`}
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Team Size</span>
                    <div className="text-slate-800 font-semibold text-lg mt-1">{project.team?.length || 0} members</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 hover:shadow-3xl transition-all duration-500">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-6">Quick Actions</h3>
                <div className="space-y-4">
                  <button 
                    onClick={handleViewAnalytics}
                    className="w-full p-4 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-semibold rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-300 transform border border-blue-200"
                  >
                    View Analytics
                  </button>
                  <button 
                    onClick={handleGenerateReport}
                    className="w-full p-4 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 font-semibold rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-300 transform border border-emerald-200"
                  >
                    Generate Report
                  </button>
                  <button 
                    onClick={handleExportData}
                    className="w-full p-4 bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 font-semibold rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-300 transform border border-violet-200"
                  >
                    Export Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 hover:shadow-3xl transition-all duration-500">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Team Members</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Owner */}
              {project.owner && (
                <div className="p-8 border-3 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="mb-4">
                    <div className="font-bold text-slate-900 text-lg">
                      {`${project.owner.firstName} ${project.owner.lastName}`}
                    </div>
                    <div className="text-sm text-blue-600 font-bold">Project Owner</div>
                    <div className="text-xs text-slate-600 mt-1">{project.owner.email}</div>
                  </div>
                  <span className="px-4 py-2 rounded-2xl text-xs font-bold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200">
                    Owner
                  </span>
                </div>
              )}

              {/* Manager */}
              {project.manager && (
                <div className="p-8 border-3 border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="mb-4">
                    <div className="font-bold text-slate-900 text-lg">
                      {`${project.manager.firstName} ${project.manager.lastName}`}
                    </div>
                    <div className="text-sm text-purple-600 font-bold">Project Manager</div>
                    <div className="text-xs text-slate-600 mt-1">{project.manager.email}</div>
                  </div>
                  <span className="px-4 py-2 rounded-2xl text-xs font-bold bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 border border-purple-200">
                    Manager
                  </span>
                </div>
              )}

              {/* Team Members */}
              {project.team && project.team.length > 0 && project.team.map((member, index) => (
                <div key={index} className="p-8 border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="mb-4">
                    <div className="font-bold text-slate-900 text-lg">
                      {member.user ? 
                        `${member.user.firstName} ${member.user.lastName}` : 
                        'Unknown Member'
                      }
                    </div>
                    <div className="text-sm text-slate-600 font-semibold">{member.role}</div>
                    {member.user?.email && (
                      <div className="text-xs text-slate-500 mt-1">{member.user.email}</div>
                    )}
                  </div>
                  <span className="px-4 py-2 rounded-2xl text-xs font-bold bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200">
                    {member.role}
                  </span>
                </div>
              ))}

              {(!project.team || project.team.length === 0) && !project.manager && (
                <div className="col-span-full text-center py-12 text-slate-500">
                  <div className="text-6xl mb-4">👥</div>
                  <p className="text-lg font-semibold">No team members added yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'assessments' && (
          <div className="space-y-8">
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 hover:shadow-3xl transition-all duration-500">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-8">Assessment History</h3>
              
              {project.assessmentHistory && project.assessmentHistory.length > 0 ? (
                <div className="space-y-6">
                  {project.assessmentHistory.map((assessment, index) => (
                    <div key={index} className="p-6 border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-bold text-slate-900 text-xl">Assessment</div>
                          <div className="text-sm text-slate-600 font-semibold mt-1">
                            {assessment.date ? new Date(assessment.date).toLocaleDateString() : 'Date not available'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                            {assessment.score || 'N/A'}/5.0
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-slate-500">
                  <div className="text-8xl mb-6">📊</div>
                  <p className="text-xl font-semibold mb-6">No assessments completed yet</p>
                  <button
                    onClick={() => handleStartAssessment('quick')}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 transform"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-10 max-w-lg mx-4 shadow-3xl border border-white/20">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-rose-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl text-rose-600 font-bold">!</span>
              </div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent mb-3">Delete Project</h3>
              <p className="text-slate-600 mb-8 text-lg leading-relaxed">
                Are you sure you want to delete "<span className="font-semibold text-slate-800">{project.name}</span>"? This action cannot be undone.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-6 py-4 border-2 border-slate-300 text-slate-700 font-semibold rounded-2xl hover:bg-slate-50 hover:border-slate-400 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-rose-500 to-red-500 text-white font-semibold rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 transform"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-3xl border border-white/20">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Edit Project</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 text-3xl font-bold transition-colors duration-300"
              >
                ×
              </button>
            </div>
            
            <div className="text-center py-12 text-slate-500">
              <div className="text-6xl mb-6">🚧</div>
              <p className="text-xl font-semibold mb-6">Project editing functionality will be implemented soon.</p>
              <button
                onClick={() => setShowEditModal(false)}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 transform"
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