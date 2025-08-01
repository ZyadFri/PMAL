// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    inProgress: 0,
    completed: 0,
    averageScore: 0,
  });
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, isAdmin } = useAuth();

  // Redirect to login if needed, then load real data
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      loadUserData();
    }
  }, [isAuthenticated]);

  // Fetch all projects, compute stats
 const loadUserData = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/projects');
      const userProjects = res.data.data.projects;

      // --- START OF FIX ---
      
      const total = userProjects.length;

      // A project is ONLY 'completed' if its final status is exactly "Completed".
      // You can add more final statuses here if you have them, e.g., ['completed', 'archived']
      const completed = userProjects.filter(p => 
        p.status.toLowerCase() === 'completed'
      ).length;
      
      // 'In Progress' is everything else that is not in a final state.
      const inProgress = userProjects.filter(p => 
        p.status.toLowerCase() !== 'completed' && p.status.toLowerCase() !== 'planning' // We exclude 'planning' from 'in progress'
      ).length;

      // Average score should be based on projects that actually have a score
      const projectsWithScores = userProjects.filter(p => p.quickAssessment && p.quickAssessment.score > 0);
      const avg = projectsWithScores.reduce((sum, p) => sum + (p.quickAssessment.score || 0), 0) / (projectsWithScores.length || 1);

      // --- END OF FIX ---

      setProjects(userProjects);
      setStats({
        totalProjects: total,
        inProgress,
        completed,
        averageScore: projectsWithScores.length > 0 ? avg : 0,
      });
    } catch (err) {
      console.error('Error loading projects:', err);
    } finally {
      setIsLoading(false);
    }
};


  const displayUser = user
    ? {
        name: user.fullName || `${user.firstName} ${user.lastName}`.trim(),
        role: user.userRole || 'Employee',
        company: user.company || 'PMAL User',
        email: user.email,
      }
    : null;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'projects', label: 'My Projects' },
    { id: 'assessments', label: 'Assessments History' },
   // { id: 'history', label: 'Score History' },
   // { id: 'reports', label: 'Reports' },
    { id: 'settings', label: 'Settings' },
  ];
  if (isAdmin()) navItems.push({ id: 'admin', label: 'Admin Panel' });

  const handleNavigation = (id) => {
    setActiveNav(id);
    switch (id) {
      case 'dashboard': navigate('/dashboard'); break;
      case 'projects': navigate('/projects'); break;
      case 'assessments': navigate('/assessments/history'); break;
      case 'reports': navigate('/reports'); break;
      case 'settings': navigate('/profile'); break;
      case 'admin': navigate('/admin'); break;
      default: break;
    }
  };
  const handleLogout = () => logout();

  if (isLoading || !displayUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center animate-pulse">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl">P</span>
          </div>
          <p className="text-gray-600">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="w-72 h-screen fixed left-0 top-0 bg-white shadow-2xl border-r border-gray-200 z-50">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">P</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">PMAL</h1>
              <p className="text-xs text-gray-500">Project Assessment</p>
            </div>
          </div>
        </div>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-xl font-semibold">{displayUser.name.charAt(0)}</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 truncate">{displayUser.name}</h3>
              <p className="text-blue-600 text-sm font-medium">{displayUser.role}</p>
              <p className="text-gray-500 text-xs truncate">{displayUser.company}</p>
              {isAdmin() && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">Admin</span>
              )}
            </div>
          </div>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={`w-full text-left px-4 py-3 rounded-xl transition ${
                activeNav === item.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 mt-8 text-red-600 hover:bg-red-50 rounded-xl transition"
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-72">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6 shadow-sm flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {displayUser.name.split(' ')[0]}!</h1>
            <p className="text-gray-600">Here's what's happening with your projects today.</p>
            <p className="text-sm text-blue-600 mt-1">Logged in as: {displayUser.email}</p>
          </div>
          <button
            onClick={() => navigate('/projects/create')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition"
          >
            + New Project
          </button>
        </header>

        <main className="p-8 space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <StatCard label="Total Projects" value={stats.totalProjects} color="from-blue-500 to-blue-600" />
            <StatCard label="In Progress"    value={stats.inProgress}    color="from-yellow-500 to-yellow-600" />
            <StatCard label="Completed"      value={stats.completed}      color="from-green-500 to-green-600" />
            <StatCard
              label="Avg Score"
              value={stats.averageScore > 0 ? stats.averageScore.toFixed(1) : '0.0'}
              color="from-purple-500 to-purple-600"
            />
          </div>

          {/* Your Projects */}
          <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
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
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(proj => (
                  <ProjectCard key={proj._id} project={proj} navigate={navigate} />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;


// ————————————————
// Helper sub‐components:

const StatCard = ({ label, value, color }) => (
  <div className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white shadow-lg`}>
    <div className="text-4xl font-bold">{value}</div>
    <div className="mt-1 text-gray-200">{label}</div>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-12 text-gray-500">
    <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
      <span className="text-3xl">📁</span>
    </div>
    <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
    <p className="mb-6">Get started by creating your first project assessment.</p>
    <button
      onClick={() => window.location.href = '/projects/create'}
      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition"
    >
      Create Your First Project
    </button>
  </div>
);

const ProjectCard = ({ project, navigate }) => {
  const isComplete = project.status.toLowerCase().includes('completed');
  return (
    <div className="bg-gray-50 rounded-2xl p-6 shadow-md border-l-4 border-blue-500 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{project.name || project.title}</h3>
          <p className="text-sm text-blue-600 mt-1">{project.phase}</p>
        </div>
        <span
          className={`px-3 py-1 text-xs font-medium rounded-full ${
            isComplete
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {project.status}
        </span>
      </div>
      <div className="flex justify-between items-center">
        {project.score != null && (
          <span className="text-green-600 font-semibold">Score: {project.score.toFixed(1)}</span>
        )}
        <div className="space-x-2">
          <button
            onClick={() => navigate(`/projects/${project._id}`)}
            className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
          >
            View
          </button>
          {!isComplete && (
            <button
              onClick={() => navigate(`/assessments/quick/${project._id}`)}
              className="px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition"
            >
              Start
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
