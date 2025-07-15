import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    inProgress: 0,
    completed: 0,
    averageScore: 0
  });
  const navigate = useNavigate();
  
  // Get real user data from AuthContext
  const { user, isAuthenticated, logout, isAdmin } = useAuth();

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Load user's actual data
    loadUserData();
  }, [isAuthenticated, navigate]);

  const loadUserData = async () => {
    try {
      // TODO: Replace with actual API calls to your backend
      // const userProjects = await api.get('/projects/user');
      // const userStats = await api.get('/stats/user');
      
      // For now, set empty data
      setProjects([]);
      setStats({
        totalProjects: 0,
        inProgress: 0,
        completed: 0,
        averageScore: 0
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading user data:', error);
      setIsLoading(false);
    }
  };

  // Display real user info or defaults
  const displayUser = user ? {
    name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
    role: user.userRole || 'Employee',
    company: user.company || 'PMAL User',
    email: user.email
  } : null;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'projects', label: 'My Projects' },
    { id: 'assessments', label: 'Assessments' },
    { id: 'history', label: 'Score History' },
    { id: 'reports', label: 'Reports' },
    { id: 'settings', label: 'Settings' }
  ];

  // Add admin navigation if user is admin
  if (isAdmin()) {
    navItems.push({ id: 'admin', label: 'Admin Panel' });
  }

  const handleNavigation = (item) => {
    setActiveNav(item);
    
    // Navigate to actual routes
    switch (item) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'projects':
        navigate('/projects');
        break;
      case 'assessments':
        navigate('/assessments/history');
        break;
      case 'reports':
        navigate('/reports');
        break;
      case 'settings':
        navigate('/profile');
        break;
      case 'admin':
        navigate('/admin');
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Show loading if still initializing or no user data
  if (isLoading || !displayUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl font-bold text-white">P</span>
          </div>
          <div className="text-gray-600">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-72 bg-white shadow-2xl border-r border-gray-200 z-50">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-xl font-bold text-white">P</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PMAL
              </h1>
              <p className="text-xs text-gray-500">Project Assessment</p>
            </div>
          </div>
        </div>
        
        {/* User Info */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <span className="text-xl font-semibold text-blue-600">
                {displayUser.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 truncate">{displayUser.name}</h3>
              <p className="text-sm text-blue-600 font-medium">{displayUser.role}</p>
              <p className="text-xs text-gray-500 truncate">{displayUser.company}</p>
              {isAdmin() && (
                <span className="inline-block px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full mt-1">
                  Admin
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                activeNav === item.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 mt-8 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
          >
            <span className="font-medium">Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-72 min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {displayUser.name.split(' ')[0]}!
              </h1>
              <p className="text-gray-600 mt-1">Here's what's happening with your projects today.</p>
              <p className="text-sm text-blue-600 mt-1">Logged in as: {displayUser.email}</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/projects/create')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                + New Project
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalProjects}</div>
              <div className="text-gray-600 font-medium">Total Projects</div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.inProgress}</div>
              <div className="text-gray-600 font-medium">In Progress</div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.completed}</div>
              <div className="text-gray-600 font-medium">Completed</div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.averageScore > 0 ? stats.averageScore.toFixed(1) : '0.0'}
              </div>
              <div className="text-gray-600 font-medium">Average Score</div>
            </div>
          </div>

          {/* Projects Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Projects</h2>
              <button 
                onClick={() => navigate('/projects')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                View All
              </button>
            </div>
            
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📁</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-600 mb-6">
                  Get started by creating your first project assessment.
                </p>
                <button
                  onClick={() => navigate('/projects/create')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Create Your First Project
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-5 bg-gray-50 rounded-xl hover:shadow-md transition-shadow duration-200 border-l-4 border-blue-500"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                        <p className="text-blue-600 text-sm font-medium">{project.phase} Phase</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {project.status}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        {project.score && (
                          <span className="text-green-600 font-semibold text-sm">
                            Score: {project.score}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => navigate(`/projects/${project.id}`)}
                          className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm font-medium"
                        >
                          View Details
                        </button>
                        {!project.score && (
                          <button 
                            onClick={() => navigate(`/assessments/quick/${project.id}`)}
                            className="px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors duration-200 text-sm font-medium"
                          >
                            Start Assessment
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;