import React, { useState, useEffect } from 'react';

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
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock data
  const mockProjects = [
    {
      id: 1,
      name: 'E-Commerce Platform Redesign',
      description: 'Complete overhaul of the existing e-commerce platform with modern UI/UX',
      phase: 'Development',
      status: 'Quick Assessment Complete',
      priority: 'High',
      progress: 75,
      score: 4.2,
      team: [
        { name: 'Sarah Johnson', role: 'PM', avatar: '👩‍💼' },
        { name: 'Mike Chen', role: 'Dev', avatar: '👨‍💻' },
        { name: 'Lisa Wang', role: 'Designer', avatar: '👩‍🎨' }
      ],
      dueDate: '2024-03-15',
      createdAt: '2024-01-10',
      lastUpdated: '2 hours ago',
      tags: ['React', 'Node.js', 'PostgreSQL']
    },
    {
      id: 2,
      name: 'Mobile Banking Application',
      description: 'Secure mobile banking app with biometric authentication',
      phase: 'Testing',
      status: 'Deep Assessment Complete',
      priority: 'High',
      progress: 90,
      score: 4.8,
      team: [
        { name: 'John Doe', role: 'PM', avatar: '👨‍💼' },
        { name: 'Emily Davis', role: 'Dev', avatar: '👩‍💻' },
        { name: 'Alex Kim', role: 'Security', avatar: '👨‍🔒' }
      ],
      dueDate: '2024-02-28',
      createdAt: '2023-11-15',
      lastUpdated: '1 day ago',
      tags: ['React Native', 'Spring Boot', 'MongoDB']
    },
    {
      id: 3,
      name: 'Data Analytics Dashboard',
      description: 'Real-time analytics dashboard for business intelligence',
      phase: 'Planning',
      status: 'Not Yet Scored',
      priority: 'Medium',
      progress: 25,
      score: null,
      team: [
        { name: 'David Brown', role: 'PM', avatar: '👨‍📊' },
        { name: 'Rachel Green', role: 'Analyst', avatar: '👩‍💻' }
      ],
      dueDate: '2024-04-30',
      createdAt: '2024-01-20',
      lastUpdated: '3 days ago',
      tags: ['Vue.js', 'Python', 'Elasticsearch']
    },
    {
      id: 4,
      name: 'AI Customer Support Bot',
      description: 'Intelligent chatbot for automated customer support',
      phase: 'Development',
      status: 'Assessment in Progress',
      priority: 'Medium',
      progress: 60,
      score: 3.9,
      team: [
        { name: 'Sam Wilson', role: 'PM', avatar: '👨‍🤖' },
        { name: 'Anna Martinez', role: 'AI Engineer', avatar: '👩‍🔬' },
        { name: 'Chris Lee', role: 'Backend Dev', avatar: '👨‍💻' }
      ],
      dueDate: '2024-05-15',
      createdAt: '2023-12-01',
      lastUpdated: '5 hours ago',
      tags: ['Python', 'TensorFlow', 'FastAPI']
    },
    {
      id: 5,
      name: 'Cloud Migration Project',
      description: 'Migration of legacy systems to cloud infrastructure',
      phase: 'Deployment',
      status: 'Quick Assessment Complete',
      priority: 'Low',
      progress: 85,
      score: 4.1,
      team: [
        { name: 'Tom Anderson', role: 'DevOps', avatar: '👨‍💼' },
        { name: 'Maria Garcia', role: 'Cloud Architect', avatar: '👩‍💻' }
      ],
      dueDate: '2024-03-01',
      createdAt: '2023-10-15',
      lastUpdated: '1 week ago',
      tags: ['AWS', 'Docker', 'Kubernetes']
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProjects(mockProjects);
      setFilteredProjects(mockProjects);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = projects;

    if (filters.search) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()))
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
  }, [filters, projects]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Not Yet Scored':
        return 'bg-gray-100 text-gray-700 border border-gray-300';
      case 'Assessment in Progress':
      case 'Quick Assessment Complete':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
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

  const getPhaseIcon = (phase) => {
    switch (phase) {
      case 'Planning': return '📋';
      case 'Development': return '⚡';
      case 'Testing': return '🧪';
      case 'Deployment': return '🚀';
      case 'Maintenance': return '🔧';
      default: return '📁';
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleCreateProject = () => {
    setShowCreateModal(true);
  };

  const handleProjectAction = (action, projectId) => {
    console.log(`Action: ${action} for project ${projectId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl font-bold text-white">📁</span>
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
            </div>
            <button
              onClick={handleCreateProject}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
            >
              <span className="text-xl">➕</span>
              <span>New Project</span>
            </button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{projects.length}</div>
                  <div className="text-blue-100">Total Projects</div>
                </div>
                <div className="text-3xl opacity-80">📁</div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {projects.filter(p => p.status.includes('Progress')).length}
                  </div>
                  <div className="text-yellow-100">In Progress</div>
                </div>
                <div className="text-3xl opacity-80">⏳</div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {projects.filter(p => p.status === 'Deep Assessment Complete').length}
                  </div>
                  <div className="text-green-100">Completed</div>
                </div>
                <div className="text-3xl opacity-80">✅</div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {projects.filter(p => p.score).length > 0 
                      ? (projects.filter(p => p.score).reduce((acc, p) => acc + p.score, 0) / projects.filter(p => p.score).length).toFixed(1)
                      : '0.0'}
                  </div>
                  <div className="text-purple-100">Avg Score</div>
                </div>
                <div className="text-3xl opacity-80">⭐</div>
              </div>
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
                  className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              </div>

              {/* Status Filter */}
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="Not Yet Scored">Not Yet Scored</option>
                <option value="Assessment in Progress">In Progress</option>
                <option value="Quick Assessment Complete">Quick Complete</option>
                <option value="Deep Assessment Complete">Deep Complete</option>
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
                className={`p-2 rounded-lg transition-all duration-200 ${
                  view === 'grid' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="text-lg">⊞</span>
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  view === 'list' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="text-lg">☰</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600 mb-6">
              {filters.search || filters.status !== 'all' || filters.phase !== 'all' || filters.priority !== 'all'
                ? 'Try adjusting your filters or search terms'
                : 'Get started by creating your first project'}
            </p>
            <button
              onClick={handleCreateProject}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
            >
              Create Project
            </button>
          </div>
        ) : (
          <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className={`bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ${
                  view === 'list' ? 'p-6' : 'p-6'
                } ${getPriorityColor(project.priority)} border-l-4`}
              >
                {view === 'grid' ? (
                  // Grid View
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{getPhaseIcon(project.phase)}</div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                            {project.name}
                          </h3>
                          <p className="text-sm text-blue-600 font-medium">{project.phase} Phase</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>

                    {/* Progress Bar */}
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

                    {/* Tags */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {project.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                        {project.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md">
                            +{project.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Team */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex -space-x-2">
                        {project.team.slice(0, 3).map((member, index) => (
                          <div
                            key={index}
                            className="w-8 h-8 bg-white rounded-full border-2 border-white flex items-center justify-center text-sm shadow-sm"
                            title={`${member.name} - ${member.role}`}
                          >
                            {member.avatar}
                          </div>
                        ))}
                        {project.team.length > 3 && (
                          <div className="w-8 h-8 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center text-xs text-gray-600">
                            +{project.team.length - 3}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{project.lastUpdated}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleProjectAction('view', project.id)}
                        className="flex-1 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm font-medium"
                      >
                        View Details
                      </button>
                      {project.status === 'Not Yet Scored' ? (
                        <button
                          onClick={() => handleProjectAction('assess', project.id)}
                          className="flex-1 px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors duration-200 text-sm font-medium"
                        >
                          Start Assessment
                        </button>
                      ) : (
                        <button
                          onClick={() => handleProjectAction('continue', project.id)}
                          className="flex-1 px-4 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors duration-200 text-sm font-medium"
                        >
                          Continue
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  // List View
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="text-2xl">{getPhaseIcon(project.phase)}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                            {project.status}
                          </span>
                          <span className="text-sm text-blue-600 font-medium">{project.phase}</span>
                          {project.score && (
                            <span className="text-sm font-bold text-green-600">{project.score}/5.0</span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{project.description}</p>
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <span>Progress: {project.progress}%</span>
                          <span>Team: {project.team.length} members</span>
                          <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
                          <span>Updated: {project.lastUpdated}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex -space-x-1">
                        {project.team.slice(0, 3).map((member, index) => (
                          <div
                            key={index}
                            className="w-8 h-8 bg-white rounded-full border-2 border-white flex items-center justify-center text-sm"
                            title={`${member.name} - ${member.role}`}
                          >
                            {member.avatar}
                          </div>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleProjectAction('view', project.id)}
                          className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm font-medium"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleProjectAction('assess', project.id)}
                          className="px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors duration-200 text-sm font-medium"
                        >
                          {project.status === 'Not Yet Scored' ? 'Start' : 'Continue'}
                        </button>
                      </div>
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