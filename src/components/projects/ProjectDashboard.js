import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const ProjectDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    phase: 'all',
    priority: 'all'
  });
  const [view, setView] = useState('grid'); // 'grid' or 'list'
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
    averageScore: 0
  });

  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    loadUserProjects();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Apply filters when projects or filters change
    applyFilters();
  }, [filters, projects]);

  const loadUserProjects = async () => {
    try {
      setIsLoading(true);
      
      // Load projects from API
      const response = await api.get('/projects');
      const userProjects = response.data.data.projects || [];
      
      setProjects(userProjects);
      setFilteredProjects(userProjects);
      calculateStats(userProjects);
      
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
      setFilteredProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (projectList) => {
    const total = projectList.length;
    const inProgress = projectList.filter(p => 
      p.status === 'In Progress' || p.status === 'Assessment in Progress'
    ).length;
    const completed = projectList.filter(p => 
      p.status === 'Completed' || p.status === 'Deep Assessment Complete'
    ).length;
    
    const scoredProjects = projectList.filter(p => p.score);
    const averageScore = scoredProjects.length > 0 
      ? scoredProjects.reduce((acc, p) => acc + p.score, 0) / scoredProjects.length
      : 0;

    setStats({
      total,
      inProgress,
      completed,
      averageScore: averageScore.toFixed(1)
    });
  };

  const applyFilters = () => {
    let filtered = [...projects];

    if (filters.search) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(project => project.status === filters.status);
    }

    if (filters.phase !== 'all') {
      filtered = filtered.filter(project => project.phase === filters.phase);
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter(project => project.priority === filters.priority);
    }

    setFilteredProjects(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Not Started':
      case 'Not Yet Scored':
        return 'bg-gray-100 text-gray-700 border border-gray-300';
      case 'In Progress':
      case 'Assessment in Progress':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
      case 'Completed':
      case 'Deep Assessment Complete':
        return 'bg-green-100 text-green-700 border border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-300';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'border-l-red-500 bg-red-50';
      case 'Medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'Low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleCreateProject = () => {
    navigate('/projects/create');
  };

  const handleProjectAction = (action, projectId) => {
    switch (action) {
      case 'view':
        navigate(`/projects/${projectId}`);
        break;
      case 'assess':
      case 'continue':
        navigate(`/assessments/quick/${projectId}`);
        break;
      default:
        console.log(`Action: ${action} for project ${projectId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl font-bold text-white">P</span>
          </div>
          <div className="text-gray-600">Loading your projects...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">My Projects</h1>
              <p className="text-gray-600">Manage and track all your project assessments</p>
              {user && (
                <p className="text-sm text-blue-600 mt-1">
                  Welcome, {user.fullName || user.username}
                </p>
              )}
            </div>
            <button
              onClick={handleCreateProject}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              + New Project
            </button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-blue-100">Total Projects</div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-6 text-white">
              <div className="text-2xl font-bold">{stats.inProgress}</div>
              <div className="text-yellow-100">In Progress</div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white">
              <div className="text-2xl font-bold">{stats.completed}</div>
              <div className="text-green-100">Completed</div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
              <div className="text-2xl font-bold">{stats.averageScore}</div>
              <div className="text-purple-100">Avg Score</div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-4 pr-4 py-2 w-64 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>

              {/* Phase Filter */}
              <select
                value={filters.phase}
                onChange={(e) => handleFilterChange('phase', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Phases</option>
                <option value="Planning">Planning</option>
                <option value="Development">Development</option>
                <option value="Testing">Testing</option>
                <option value="Deployment">Deployment</option>
                <option value="Maintenance">Maintenance</option>
              </select>

              {/* Priority Filter */}
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setView('grid')}
                className={`px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                  view === 'grid' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setView('list')}
                className={`px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                  view === 'list' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl font-bold text-gray-400">P</span>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              {projects.length === 0 ? 'No projects yet' : 'No projects found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {projects.length === 0
                ? 'Get started by creating your first project assessment.'
                : 'Try adjusting your filters or search terms.'
              }
            </p>
            <button
              onClick={handleCreateProject}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-semibold"
            >
              {projects.length === 0 ? 'Create Your First Project' : 'Create New Project'}
            </button>
          </div>
        ) : (
          <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                className={`bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 p-6 ${getPriorityColor(project.priority)} border-l-4`}
              >
                {view === 'grid' ? (
                  // Grid View
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {project.name}
                        </h3>
                        <p className="text-sm text-blue-600 font-medium">{project.phase || 'Planning'}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status || 'Not Started'}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {project.description || 'No description provided.'}
                    </p>

                    {/* Progress Bar */}
                    {project.progress !== undefined && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Score */}
                    {project.score && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Assessment Score</span>
                          <div className="flex items-center space-x-1">
                            <span className="text-lg font-bold text-green-600">{project.score}</span>
                            <span className="text-sm text-gray-500">/5.0</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Meta Info */}
                    <div className="mb-4 text-xs text-gray-500 space-y-1">
                      {project.createdAt && (
                        <div>Created: {new Date(project.createdAt).toLocaleDateString()}</div>
                      )}
                      {project.dueDate && (
                        <div>Due: {new Date(project.dueDate).toLocaleDateString()}</div>
                      )}
                      {project.lastUpdated && (
                        <div>Updated: {project.lastUpdated}</div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleProjectAction('view', project._id)}
                        className="flex-1 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm font-medium"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleProjectAction('assess', project._id)}
                        className="flex-1 px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors duration-200 text-sm font-medium"
                      >
                        {project.score ? 'Update Assessment' : 'Start Assessment'}
                      </button>
                    </div>
                  </>
                ) : (
                  // List View
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {project.status || 'Not Started'}
                        </span>
                        <span className="text-sm text-blue-600 font-medium">{project.phase || 'Planning'}</span>
                        {project.score && (
                          <span className="text-sm font-bold text-green-600">{project.score}/5.0</span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        {project.description || 'No description provided.'}
                      </p>
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        {project.progress !== undefined && (
                          <span>Progress: {project.progress}%</span>
                        )}
                        {project.priority && (
                          <span>Priority: {project.priority}</span>
                        )}
                        {project.dueDate && (
                          <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
                        )}
                        {project.lastUpdated && (
                          <span>Updated: {project.lastUpdated}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleProjectAction('view', project._id)}
                        className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm font-medium"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleProjectAction('assess', project._id)}
                        className="px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors duration-200 text-sm font-medium"
                      >
                        {project.score ? 'Update' : 'Assess'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDashboard;