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
      // NOTE: The API response for projects is different from the admin panel.
      // It seems to be response.data.projects based on other files, let's adjust for safety.
      const userProjects = response.data.projects || response.data.data?.projects || [];
      
      setProjects(userProjects);
      // setFilteredProjects is now handled by the useEffect for filters
      
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

   const calculateStats = (projectList) => {
    const total = projectList.length;

    // A project is ONLY 'completed' if its status is literally 'Completed'.
    const completed = projectList.filter(p => 
        p.status.toLowerCase() === 'completed'
    ).length;

    // 'In Progress' is everything else that is not 'Completed' and not an initial state.
    const inProgress = projectList.filter(p => {
        const statusLower = p.status.toLowerCase();
        return statusLower !== 'completed' && statusLower !== 'planning' && statusLower !== 'not started';
    }).length;
    
    const scoredProjects = projectList.filter(p => p.quickAssessment?.score > 0 || p.deepAssessment?.score > 0);
    const averageScore = scoredProjects.length > 0 
      ? scoredProjects.reduce((acc, p) => acc + (p.quickAssessment?.score || p.deepAssessment?.score || 0), 0) / scoredProjects.length
      : 0;

    setStats({
      total,
      inProgress,
      completed,
      averageScore: averageScore.toFixed(1)
    });
  };
   // In your ProjectDashboard.jsx file

// --- REPLACE your old applyFilters function with this one ---

  const applyFilters = () => {
    let filtered = [...projects];

    if (filters.search) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // --- START OF FILTERING FIX ---
    if (filters.status !== 'all') {
      const filterLower = filters.status.toLowerCase();

      filtered = filtered.filter(p => {
        const statusLower = p.status.toLowerCase();

        // If filtering for "Completed", it must be an EXACT match.
        if (filterLower === 'completed') {
          return statusLower === 'completed';
        }
        
        // If filtering for "In Progress", it can be any active state that is NOT final.
        if (filterLower === 'in progress') {
          return statusLower !== 'completed' && statusLower !== 'planning' && statusLower !== 'not started';
        }
        
        // For other statuses like "Not Started", use an exact match.
        return statusLower === filterLower;
      });
    }
    // --- END OF FILTERING FIX ---

    if (filters.phase !== 'all') {
      filtered = filtered.filter(project => project.phase === filters.phase);
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter(project => project.priority === filters.priority);
    }

    setFilteredProjects(filtered);
    
    // The stat calculation is already correct and should remain.
    if (projects.length > 0) {
      calculateStats(projects);
    }
  };

  const getStatusColor = (status) => {
    if (status?.includes('In Progress')) return 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200 shadow-sm';
    if (status?.includes('Complete')) return 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200 shadow-sm';
    return 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 border border-slate-200 shadow-sm';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'border-l-rose-500 bg-gradient-to-r from-rose-50 to-pink-50 shadow-rose-100';
      case 'Medium': return 'border-l-amber-500 bg-gradient-to-r from-amber-50 to-orange-50 shadow-amber-100';
      case 'Low': return 'border-l-emerald-500 bg-gradient-to-r from-emerald-50 to-green-50 shadow-emerald-100';
      default: return 'border-l-slate-500 bg-gradient-to-r from-slate-50 to-gray-50 shadow-slate-100';
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl animate-pulse">
              <span className="text-3xl font-bold text-white">P</span>
            </div>
            <div className="absolute -inset-1 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl blur opacity-30 animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="text-xl font-semibold text-slate-700">Loading your projects...</div>
            <div className="text-slate-500">Preparing your workspace</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="flex justify-between items-center mb-8">
            <div className="space-y-2">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                My Projects
              </h1>
              <p className="text-xl text-slate-600">Manage and track all your project assessments</p>
              {user && (
                <p className="text-lg text-indigo-600 font-medium">
                  Welcome back, {user.fullName || user.username}
                </p>
              )}
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-8 py-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white font-bold rounded-2xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                Back to Dashboard
              </button>
              <button
                onClick={handleCreateProject}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold rounded-2xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                New Project
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="text-4xl font-bold mb-2">{stats.total}</div>
              <div className="text-blue-100 text-lg font-medium">Total Projects</div>
              <div className="mt-4 h-1 bg-blue-400 rounded-full opacity-50"></div>
            </div>
            
            <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-3xl p-8 text-white shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="text-4xl font-bold mb-2">{stats.inProgress}</div>
              <div className="text-amber-100 text-lg font-medium">In Progress</div>
              <div className="mt-4 h-1 bg-amber-400 rounded-full opacity-50"></div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 rounded-3xl p-8 text-white shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="text-4xl font-bold mb-2">{stats.completed}</div>
              <div className="text-emerald-100 text-lg font-medium">Completed</div>
              <div className="mt-4 h-1 bg-emerald-400 rounded-full opacity-50"></div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-3xl p-8 text-white shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="text-4xl font-bold mb-2">{stats.averageScore}</div>
              <div className="text-purple-100 text-lg font-medium">Average Score</div>
              <div className="mt-4 h-1 bg-purple-400 rounded-full opacity-50"></div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
            <div className="flex flex-wrap items-center gap-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-6 pr-6 py-4 w-80 text-lg border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500 bg-white/80 backdrop-blur-sm shadow-lg transition-all duration-300"
                />
              </div>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-6 py-4 text-lg border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500 bg-white/80 backdrop-blur-sm shadow-lg transition-all duration-300"
              >
                <option value="all">All Status</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              <select
                value={filters.phase}
                onChange={(e) => handleFilterChange('phase', e.target.value)}
                className="px-6 py-4 text-lg border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500 bg-white/80 backdrop-blur-sm shadow-lg transition-all duration-300"
              >
                <option value="all">All Phases</option>
                <option value="Planning">Planning</option>
                <option value="Development">Development</option>
              </select>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="px-6 py-4 text-lg border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500 bg-white/80 backdrop-blur-sm shadow-lg transition-all duration-300"
              >
                <option value="all">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="flex items-center space-x-1 bg-gradient-to-r from-slate-100 to-slate-200 rounded-2xl p-2 shadow-lg">
              <button 
                onClick={() => setView('grid')} 
                className={`px-6 py-3 rounded-xl text-lg font-bold transition-all duration-300 ${ 
                  view === 'grid' 
                    ? 'bg-white text-indigo-600 shadow-lg transform scale-105' 
                    : 'text-slate-600 hover:text-slate-800' 
                }`}
              >
                Grid
              </button>
              <button 
                onClick={() => setView('list')} 
                className={`px-6 py-3 rounded-xl text-lg font-bold transition-all duration-300 ${ 
                  view === 'list' 
                    ? 'bg-white text-indigo-600 shadow-lg transform scale-105' 
                    : 'text-slate-600 hover:text-slate-800' 
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-24">
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto shadow-xl">
                <span className="text-5xl font-bold text-slate-400">P</span>
              </div>
              <div className="absolute -inset-2 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full blur opacity-30"></div>
            </div>
            <h3 className="text-4xl font-bold text-slate-800 mb-4">
              {projects.length === 0 ? 'No projects yet' : 'No projects found'}
            </h3>
            <p className="text-xl text-slate-600 mb-10 max-w-md mx-auto">
              {projects.length === 0 
                ? 'Get started by creating your first project assessment and bring your ideas to life.' 
                : 'Try adjusting your filters or search terms to find what you\'re looking for.'}
            </p>
            <button 
              onClick={handleCreateProject} 
              className="px-10 py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-xl font-bold rounded-2xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              {projects.length === 0 ? 'Create Your First Project' : 'Create New Project'}
            </button>
          </div>
        ) : (
          <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8' : 'space-y-6'}>
            {filteredProjects.map((project) => (
              <div 
                key={project._id} 
                className={`bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-slate-100 hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 p-8 ${getPriorityColor(project.priority)} border-l-8`}
              >
                {view === 'grid' ? (
                  <>
                    <div className="flex items-start justify-between mb-6">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-slate-800 leading-tight">{project.name}</h3>
                        <p className="text-lg text-indigo-600 font-semibold">{project.phase || 'Planning'}</p>
                      </div>
                      <span className={`px-4 py-2 rounded-2xl text-sm font-bold ${getStatusColor(project.status)}`}>
                        {project.status || 'Not Started'}
                      </span>
                    </div>
                    <p className="text-slate-600 text-lg mb-6 line-clamp-3 leading-relaxed">
                      {project.description || 'No description provided.'}
                    </p>
                    {project.progress !== undefined && (
                      <div className="mb-8">
                        <div className="flex justify-between text-lg text-slate-700 mb-3 font-medium">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3 shadow-inner">
                          <div 
                            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-3 rounded-full shadow-lg transition-all duration-1000" 
                            style={{ width: `${project.progress}%` }} 
                          />
                        </div>
                      </div>
                    )}
                    <div className="flex space-x-4">
                      <button 
                        onClick={() => handleProjectAction('view', project._id)} 
                        className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-2xl hover:from-blue-200 hover:to-indigo-200 text-lg font-bold transform hover:scale-105 transition-all duration-300 shadow-lg"
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => handleProjectAction('assess', project._id)} 
                        className="flex-1 px-6 py-4 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 rounded-2xl hover:from-emerald-200 hover:to-green-200 text-lg font-bold transform hover:scale-105 transition-all duration-300 shadow-lg"
                      >
                        {project.score ? 'Update Assessment' : 'Start Assessment'}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-slate-800">{project.name}</h3>
                      <p className="text-slate-600 text-lg">{project.description || 'No description provided.'}</p>
                    </div>
                    <div className="flex items-center space-x-4 ml-8">
                      <button 
                        onClick={() => handleProjectAction('view', project._id)} 
                        className="px-6 py-3 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-xl hover:from-blue-200 hover:to-indigo-200 font-bold transform hover:scale-105 transition-all duration-300"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => handleProjectAction('assess', project._id)} 
                        className="px-6 py-3 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 rounded-xl hover:from-emerald-200 hover:to-green-200 font-bold transform hover:scale-105 transition-all duration-300"
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