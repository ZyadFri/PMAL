import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [user] = useState({
    name: 'John Doe',
    role: 'Project Manager',
    avatar: '👨‍💼',
    company: 'TechCorp Inc.'
  });

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);
    
    // Simulate notifications
    setNotifications([
      { id: 1, type: 'success', message: 'Project assessment completed', time: '2 min ago' },
      { id: 2, type: 'info', message: 'New team member added', time: '1 hour ago' },
      { id: 3, type: 'warning', message: 'Assessment deadline approaching', time: '3 hours ago' }
    ]);
  }, []);

  const navItems = [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard', badge: null },
    { id: 'projects', icon: '📁', label: 'My Projects', badge: '12' },
    { id: 'assessments', icon: '📊', label: 'Assessments', badge: '3' },
    { id: 'history', icon: '📈', label: 'Score History', badge: null },
    { id: 'reports', icon: '📋', label: 'Reports', badge: null },
    { id: 'team', icon: '👥', label: 'Team Management', badge: '2' },
    { id: 'settings', icon: '⚙️', label: 'Settings', badge: null }
  ];

  const stats = [
    { 
      number: '12', 
      label: 'Total Projects', 
      icon: '📁', 
      change: '+2 this month',
      changeType: 'positive',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      number: '4', 
      label: 'In Progress', 
      icon: '⏳', 
      change: '+1 this week',
      changeType: 'positive',
      color: 'from-yellow-500 to-orange-500'
    },
    { 
      number: '8', 
      label: 'Completed', 
      icon: '✅', 
      change: '+3 this month',
      changeType: 'positive',
      color: 'from-green-500 to-emerald-500'
    },
    { 
      number: '4.2', 
      label: 'Average Score', 
      icon: '⭐', 
      change: '+0.3 improvement',
      changeType: 'positive',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const projects = [
    {
      id: 1,
      title: 'E-Commerce Platform',
      phase: 'Development',
      status: 'Assessment in Progress',
      statusType: 'in-progress',
      progress: 75,
      score: null,
      team: ['👩‍💻', '👨‍💼', '👩‍🎨'],
      dueDate: '2024-03-15',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Mobile Banking App',
      phase: 'Testing',
      status: 'Deep Assessment Complete',
      statusType: 'completed',
      score: '4.8/5.0',
      team: ['👨‍💻', '👩‍💼', '👨‍🔬'],
      lastUpdated: '2 days ago',
      priority: 'medium'
    },
    {
      id: 3,
      title: 'Data Analytics Dashboard',
      phase: 'Planning',
      status: 'Not Yet Scored',
      statusType: 'not-scored',
      team: ['👩‍💻', '👨‍📊'],
      created: '1 week ago',
      priority: 'low'
    }
  ];

  const quickActions = [
    { 
      icon: '➕', 
      title: 'Create Project', 
      desc: 'Start a new project assessment',
      color: 'from-blue-500 to-purple-500',
      action: 'create-project'
    },
    { 
      icon: '⚡', 
      title: 'Quick Assessment', 
      desc: 'Rapid project evaluation',
      color: 'from-yellow-500 to-orange-500',
      action: 'quick-assessment'
    },
    { 
      icon: '📊', 
      title: 'View Analytics', 
      desc: 'Project performance insights',
      color: 'from-green-500 to-emerald-500',
      action: 'analytics'
    },
    { 
      icon: '📄', 
      title: 'Generate Report', 
      desc: 'Export assessment reports',
      color: 'from-purple-500 to-pink-500',
      action: 'generate-report'
    }
  ];

  const recentActivity = [
    { 
      id: 1,
      action: 'completed assessment',
      project: 'Mobile Banking App',
      time: '2 hours ago',
      icon: '✅',
      color: 'text-green-400'
    },
    { 
      id: 2,
      action: 'started new project',
      project: 'E-Commerce Platform',
      time: '1 day ago',
      icon: '🚀',
      color: 'text-blue-400'
    },
    { 
      id: 3,
      action: 'team member joined',
      project: 'Data Analytics Dashboard',
      time: '2 days ago',
      icon: '👥',
      color: 'text-purple-400'
    }
  ];

  const getStatusStyle = (statusType) => {
    switch (statusType) {
      case 'not-scored':
        return 'bg-gray-100 text-gray-700 border border-gray-300';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
      case 'completed':
        return 'bg-green-100 text-green-700 border border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-300';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const handleNavigation = (item) => {
    setActiveNav(item);
    console.log(`Navigate to: ${item}`);
  };

  const handleAction = (action) => {
    console.log(`Execute action: ${action}`);
  };

  const handleLogout = () => {
    console.log('Logout');
  };

  if (isLoading) {
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
            <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center text-2xl">
              {user.avatar}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{user.name}</h3>
              <p className="text-sm text-blue-600 font-medium">{user.role}</p>
              <p className="text-xs text-gray-500">{user.company}</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeNav === item.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  activeNav === item.id
                    ? 'bg-white/20 text-white'
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 mt-8 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
          >
            <span className="text-lg">🚪</span>
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
                Welcome back, {user.name.split(' ')[0]}! 👋
              </h1>
              <p className="text-gray-600 mt-1">Here's what's happening with your projects today.</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200 relative"
                >
                  <span className="text-xl">🔔</span>
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    {notifications.map(notification => (
                      <div key={notification.id} className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                        <p className="text-sm text-gray-900">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                onClick={() => handleAction('create-project')}
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
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center text-white text-xl`}>
                    {stat.icon}
                  </div>
                  <div className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Projects Section */}
            <div className="xl:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Recent Projects</h2>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">View All</button>
                </div>
                
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className={`p-5 border-l-4 ${getPriorityColor(project.priority)} bg-gray-50 rounded-r-xl hover:shadow-md transition-shadow duration-200`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                          <p className="text-blue-600 text-sm font-medium">{project.phase} Phase</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(project.statusType)}`}>
                          {project.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="flex -space-x-1">
                            {project.team.map((member, idx) => (
                              <div key={idx} className="w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-white text-sm">
                                {member}
                              </div>
                            ))}
                          </div>
                          {project.score && (
                            <span className="text-green-600 font-semibold text-sm">Score: {project.score}</span>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <button className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm font-medium">
                            View Details
                          </button>
                          {project.statusType === 'not-scored' && (
                            <button className="px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors duration-200 text-sm font-medium">
                              Start Assessment
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {project.progress && (
                        <div className="mt-3">
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
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions & Activity */}
            <div className="space-y-8">
              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleAction(action.action)}
                      className={`p-4 rounded-xl bg-gradient-to-r ${action.color} text-white hover:shadow-lg transform hover:scale-105 transition-all duration-200`}
                    >
                      <div className="text-2xl mb-2">{action.icon}</div>
                      <div className="text-sm font-semibold">{action.title}</div>
                      <div className="text-xs opacity-90 mt-1">{action.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3">
                      <div className={`text-lg ${activity.color}`}>
                        {activity.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">You</span> {activity.action} for{' '}
                          <span className="font-medium text-blue-600">{activity.project}</span>
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;