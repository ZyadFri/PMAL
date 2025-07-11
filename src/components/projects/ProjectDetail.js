import React, { useState, useEffect } from 'react';

const ProjectDetail = () => {
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Mock project data
  const mockProject = {
    id: 1,
    name: 'E-Commerce Platform Redesign',
    description: 'Complete overhaul of the existing e-commerce platform with modern UI/UX design, improved performance, and enhanced user experience. This project aims to increase conversion rates by 25% and reduce bounce rates by 40%. The redesign will include a mobile-first approach, accessibility improvements, and integration with modern payment systems.',
    phase: 'Development',
    status: 'Quick Assessment Complete',
    priority: 'High',
    progress: 75,
    overallScore: 4.2,
    owner: {
      name: 'John Doe',
      username: 'john.doe',
      email: 'john.doe@company.com',
      avatar: '👨‍💼'
    },
    manager: {
      name: 'Sarah Johnson',
      username: 'sarah.johnson',
      email: 'sarah.johnson@company.com',
      avatar: '👩‍💼'
    },
    team: [
      { name: 'Mike Chen', role: 'Frontend Developer', avatar: '👨‍💻', status: 'active', email: 'mike.chen@company.com' },
      { name: 'Lisa Wang', role: 'UI/UX Designer', avatar: '👩‍🎨', status: 'active', email: 'lisa.wang@company.com' },
      { name: 'Alex Kim', role: 'Backend Developer', avatar: '👨‍🔒', status: 'active', email: 'alex.kim@company.com' },
      { name: 'Emily Davis', role: 'QA Engineer', avatar: '👩‍🔬', status: 'active', email: 'emily.davis@company.com' }
    ],
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    budget: 150000,
    tags: ['React', 'Node.js', 'PostgreSQL', 'AWS', 'Stripe', 'TypeScript'],
    quickAssessment: {
      completed: true,
      completedAt: '2024-02-15',
      score: 4.2,
      weakestCategory: 'Security & Compliance',
      duration: 45
    },
    deepAssessment: {
      completed: false,
      progress: 60,
      currentCategory: 'Development Practices',
      completedCategories: ['Project Management', 'Requirements Analysis', 'Architecture Design']
    },
    assessmentHistory: [
      {
        id: 1,
        type: 'Quick Assessment',
        date: '2024-02-15',
        score: 4.2,
        assessor: 'John Doe',
        status: 'completed'
      },
      {
        id: 2,
        type: 'Deep Assessment (Partial)',
        date: '2024-02-20',
        score: 4.1,
        assessor: 'Sarah Johnson',
        status: 'in-progress'
      }
    ],
    milestones: [
      { id: 1, name: 'Requirements Gathering', date: '2024-02-01', status: 'completed', description: 'Complete stakeholder interviews and requirement documentation' },
      { id: 2, name: 'UI/UX Design', date: '2024-03-01', status: 'completed', description: 'Finalize wireframes and visual designs' },
      { id: 3, name: 'Backend Development', date: '2024-04-15', status: 'in-progress', description: 'API development and database optimization' },
      { id: 4, name: 'Frontend Development', date: '2024-05-01', status: 'in-progress', description: 'React components and user interface implementation' },
      { id: 5, name: 'Testing & QA', date: '2024-05-30', status: 'pending', description: 'Comprehensive testing and quality assurance' },
      { id: 6, name: 'Deployment', date: '2024-06-30', status: 'pending', description: 'Production deployment and go-live' }
    ],
    risks: [
      { 
        id: 1, 
        title: 'Third-party API Dependencies', 
        level: 'medium', 
        status: 'monitoring',
        description: 'Payment gateway and shipping API reliability concerns',
        mitigation: 'Implement fallback systems and monitoring'
      },
      { 
        id: 2, 
        title: 'Database Migration Complexity', 
        level: 'high', 
        status: 'mitigating',
        description: 'Large dataset migration may cause extended downtime',
        mitigation: 'Phased migration approach with rollback plan'
      },
      { 
        id: 3, 
        title: 'User Adoption Resistance', 
        level: 'low', 
        status: 'monitoring',
        description: 'Users may resist new interface changes',
        mitigation: 'User training and gradual rollout strategy'
      }
    ],
    objectives: [
      'Increase conversion rates by 25%',
      'Reduce page load times by 50%',
      'Improve mobile user experience',
      'Implement modern payment systems',
      'Enhance accessibility compliance'
    ],
    createdAt: '2024-01-10',
    updatedAt: '2024-02-28'
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProject(mockProject);
      setIsLoading(false);
    }, 1000);
  }, []);

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

  const getRiskColor = (level) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-100 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getMilestoneColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleStartAssessment = (type) => {
    console.log(`Starting ${type} assessment`);
    // Navigate to assessment page
    window.location.href = `/assessments/${type}/${project.id}`;
  };

  const handleEditProject = () => {
    setShowEditModal(true);
  };

  const handleDeleteProject = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    console.log('Delete project');
    setShowDeleteModal(false);
    // Navigate back to projects
    window.location.href = '/projects';
  };

  const handleBack = () => {
    window.history.back();
  };

  const handleGenerateReport = () => {
    console.log('Generate report');
    // Navigate to reports page
    window.location.href = `/reports/project/${project.id}`;
  };

  const handleViewAnalytics = () => {
    console.log('View analytics');
    // Navigate to analytics page
    window.location.href = `/analytics/project/${project.id}`;
  };

  const handleExportData = () => {
    console.log('Export data');
    // Trigger data export
  };

  const calculateDaysRemaining = () => {
    if (!project.endDate) return null;
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
            <span className="text-2xl font-bold text-white">📁</span>
          </div>
          <div className="text-gray-600">Loading project details...</div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-6">The project you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'team', label: 'Team', icon: '👥' },
    { id: 'assessments', label: 'Assessments', icon: '📊' },
    { id: 'milestones', label: 'Milestones', icon: '🎯' },
    { id: 'risks', label: 'Risks', icon: '⚠️' }
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
                  📁
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
              
              {project.quickAssessment.completed && !project.deepAssessment.completed && (
                <button
                  onClick={() => handleStartAssessment('deep')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Deep Assessment
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
                🗑️
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Project Progress</span>
              <span>{project.progress}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${project.progress}%` }}
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
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Project Description</h3>
                <p className="text-gray-700 leading-relaxed mb-4">{project.description}</p>
                
                {project.objectives.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Objectives</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {project.objectives.map((objective, index) => (
                        <li key={index}>{objective}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Assessment Overview</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Quick Assessment */}
                  <div className="p-4 border border-gray-200 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">Quick Assessment</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        project.quickAssessment.completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {project.quickAssessment.completed ? 'Completed' : 'Not Started'}
                      </span>
                    </div>
                    
                    {project.quickAssessment.completed ? (
                      <div>
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {project.quickAssessment.score}/5.0
                        </div>
                        <div className="text-sm text-gray-600">
                          Completed on {new Date(project.quickAssessment.completedAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          Duration: {project.quickAssessment.duration} minutes
                        </div>
                        <div className="text-sm text-red-600 mt-1">
                          Weakest: {project.quickAssessment.weakestCategory}
                        </div>
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
                        project.deepAssessment.completed ? 'bg-green-100 text-green-700' : 
                        project.deepAssessment.progress > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {project.deepAssessment.completed ? 'Completed' : 
                         project.deepAssessment.progress > 0 ? 'In Progress' : 'Not Started'}
                      </span>
                    </div>
                    
                    {project.deepAssessment.progress > 0 ? (
                      <div>
                        <div className="text-lg font-bold text-blue-600 mb-1">
                          {project.deepAssessment.progress}% Complete
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          Current: {project.deepAssessment.currentCategory}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${project.deepAssessment.progress}%` }}
                          />
                        </div>
                        <button
                          onClick={() => handleStartAssessment('deep')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                          Continue Assessment
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <div className="text-2xl mb-2">🔍</div>
                        {project.quickAssessment.completed ? (
                          <button
                            onClick={() => handleStartAssessment('deep')}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                          >
                            Start Deep Assessment
                          </button>
                        ) : (
                          <p className="text-sm">Complete Quick Assessment first</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

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
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Project Details</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Start Date</span>
                    <div className="text-gray-900">{new Date(project.startDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">End Date</span>
                    <div className="text-gray-900">{new Date(project.endDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Budget</span>
                    <div className="text-gray-900">${project.budget.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Owner</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-lg">{project.owner.avatar}</span>
                      <span className="text-gray-900">{project.owner.name}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Manager</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-lg">{project.manager.avatar}</span>
                      <span className="text-gray-900">{project.manager.name}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Team Size</span>
                    <div className="text-gray-900">{project.team.length} members</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={handleViewAnalytics}
                    className="w-full p-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors duration-200 text-left flex items-center space-x-2"
                  >
                    <span>📊</span>
                    <span>View Analytics</span>
                  </button>
                  <button 
                    onClick={handleGenerateReport}
                    className="w-full p-3 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors duration-200 text-left flex items-center space-x-2"
                  >
                    <span>📋</span>
                    <span>Generate Report</span>
                  </button>
                  <button 
                    onClick={handleExportData}
                    className="w-full p-3 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors duration-200 text-left flex items-center space-x-2"
                  >
                    <span>📤</span>
                    <span>Export Data</span>
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
              <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200">
                Add Member
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Owner */}
              <div className="p-6 border-2 border-blue-200 bg-blue-50 rounded-xl">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="text-3xl">{project.owner.avatar}</div>
                  <div>
                    <div className="font-semibold text-gray-900">{project.owner.name}</div>
                    <div className="text-sm text-blue-600 font-medium">Project Owner</div>
                    <div className="text-xs text-gray-600">{project.owner.email}</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    Owner
                  </span>
                </div>
              </div>

              {/* Manager */}
              <div className="p-6 border-2 border-purple-200 bg-purple-50 rounded-xl">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="text-3xl">{project.manager.avatar}</div>
                  <div>
                    <div className="font-semibold text-gray-900">{project.manager.name}</div>
                    <div className="text-sm text-purple-600 font-medium">Project Manager</div>
                    <div className="text-xs text-gray-600">{project.manager.email}</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                    Manager
                  </span>
                </div>
              </div>

              {/* Team Members */}
              {project.team.map((member, index) => (
                <div key={index} className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="text-3xl">{member.avatar}</div>
                    <div>
                      <div className="font-semibold text-gray-900">{member.name}</div>
                      <div className="text-sm text-gray-600">{member.role}</div>
                      <div className="text-xs text-gray-500">{member.email}</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      member.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {member.status}
                    </span>
                    <button className="text-gray-400 hover:text-gray-600">⋯</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'assessments' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Assessment History</h3>
              
              <div className="space-y-4">
                {project.assessmentHistory.map((assessment) => (
                  <div key={assessment.id} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow duration-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-gray-900">{assessment.type}</div>
                        <div className="text-sm text-gray-600">
                          by {assessment.assessor} • {new Date(assessment.date).toLocaleDateString()}
                        </div>
                        <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                          assessment.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {assessment.status}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600">{assessment.score}/5.0</div>
                        <button className="text-sm text-blue-600 hover:text-blue-700 mt-1">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {project.assessmentHistory.length === 0 && (
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

        {activeTab === 'milestones' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-gray-900">Project Milestones</h3>
              <button className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200">
                Add Milestone
              </button>
            </div>
            
            <div className="space-y-4">
              {project.milestones.map((milestone, index) => (
                <div key={milestone.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow duration-200">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`w-4 h-4 rounded-full ${
                      milestone.status === 'completed' ? 'bg-green-500' :
                      milestone.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-300'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">{milestone.name}</div>
                        <div className="text-sm text-gray-600 mt-1">{milestone.description}</div>
                        <div className="text-xs text-gray-500 mt-2">
                          Due: {new Date(milestone.date).toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getMilestoneColor(milestone.status)}`}>
                        {milestone.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'risks' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-gray-900">Risk Management</h3>
              <button className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200">
                Add Risk
              </button>
            </div>
            
            <div className="space-y-4">
              {project.risks.map((risk) => (
                <div key={risk.id} className={`p-4 border rounded-xl ${getRiskColor(risk.level)}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{risk.title}</div>
                      <div className="text-sm text-gray-600 mt-1">{risk.description}</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskColor(risk.level)}`}>
                      {risk.level} risk
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <span className="ml-2 text-gray-900 capitalize">{risk.status}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Mitigation:</span>
                      <span className="ml-2 text-gray-900">{risk.mitigation}</span>
                    </div>
                  </div>
                </div>
              ))}

              {project.risks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">⚠️</div>
                  <p>No risks identified yet</p>
                  <p className="text-sm mt-1">Add risks to better manage your project</p>
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
                <span className="text-2xl">🗑️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete Project</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{project.name}"? This action cannot be undone and will remove all associated data.
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

      {/* Edit Project Modal */}
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
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  defaultValue={project.name}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Description
                </label>
                <textarea
                  defaultValue={project.description}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Phase
                  </label>
                  <select
                    defaultValue={project.phase}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Development">Development</option>
                    <option value="Testing">Testing</option>
                    <option value="Deployment">Deployment</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Priority
                  </label>
                  <select
                    defaultValue={project.priority}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    defaultValue={project.startDate}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    defaultValue={project.endDate}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Budget (USD)
                </label>
                <input
                  type="number"
                  defaultValue={project.budget}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    console.log('Save project changes');
                    setShowEditModal(false);
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;