import React, { useState, useEffect } from 'react';
import { Users, Settings, BarChart3, FileText, Database, Activity, LogOut, Sparkles, TrendingUp, Zap } from 'lucide-react';
import UserManagement from './UserManagement';
import QuestionManagement from './QuestionManagement';
import CategoryManagement from './CategoryManagement';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    totalQuestions: 0,
    totalAssessments: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  
  const { user, logout } = useAuth(); 

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/stats');
        setStats(response.data); 
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'categories', label: 'Catégories', icon: Database },
    { id: 'questions', label: 'Questions', icon: FileText },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  const StatCard = ({ title, value, icon: Icon, gradient, bgPattern }) => (
    <div className={`relative overflow-hidden rounded-2xl shadow-2xl p-8 transform hover:scale-105 transition-all duration-500 hover:shadow-3xl ${gradient}`}>
      <div className={`absolute inset-0 opacity-10 ${bgPattern}`}></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm">
            <Icon className="h-8 w-8 text-white" />
          </div>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-white/80 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
        <div>
          <p className="text-white/80 text-sm font-medium mb-2">{title}</p>
          <p className="text-4xl font-bold text-white tracking-tight">{value || 0}</p>
          <div className="flex items-center mt-3 text-white/70">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span className="text-sm">+12% ce mois</span>
          </div>
        </div>
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-16 translate-x-16"></div>
    </div>
  );

  const renderTabContent = () => {
    const { totalUsers, totalProjects, totalQuestions, totalAssessments, recentActivity = [] } = stats;

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Hero Stats Section */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-3xl blur-3xl"></div>
              <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard 
                  title="Total Utilisateurs" 
                  value={totalUsers} 
                  icon={Users} 
                  gradient="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700"
                  bgPattern="bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.1),transparent_50%)]"
                />
                <StatCard 
                  title="Projets Actifs" 
                  value={totalProjects} 
                  icon={Activity} 
                  gradient="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700"
                  bgPattern="bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.1),transparent_50%)]"
                />
                <StatCard 
                  title="Questions" 
                  value={totalQuestions} 
                  icon={FileText} 
                  gradient="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700"
                  bgPattern="bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.1),transparent_50%)]"
                />
                <StatCard 
                  title="Évaluations" 
                  value={totalAssessments} 
                  icon={BarChart3} 
                  gradient="bg-gradient-to-br from-orange-500 via-red-500 to-pink-600"
                  bgPattern="bg-[radial-gradient(circle_at_80%_60%,rgba(255,255,255,0.1),transparent_50%)]"
                />
              </div>
            </div>

            {/* Activity Section */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-600/10 rounded-3xl blur-2xl"></div>
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20">
                <div className="px-8 py-6 border-b border-gray-200/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600">
                        <Sparkles className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                          Activité Récente
                        </h3>
                        <p className="text-gray-500">Dernières actions sur la plateforme</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Zap className="h-4 w-4" />
                      <span>En temps réel</span>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  {recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="group relative overflow-hidden">
                          <div className="flex items-center space-x-6 p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all duration-300">
                            <div className="flex-shrink-0">
                              <div className="relative">
                                <div className="w-4 h-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></div>
                                <div className="absolute inset-0 w-4 h-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full animate-ping opacity-75"></div>
                              </div>
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-900 font-medium mb-1">{activity.description}</p>
                              <p className="text-sm text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl">
                        <Activity className="w-full h-full text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-lg">Aucune activité récente</p>
                      <p className="text-sm text-gray-400 mt-1">Les nouvelles activités apparaîtront ici</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case 'users': return <UserManagement />;
      case 'categories': return <CategoryManagement />;
      case 'questions': return <QuestionManagement />;
      case 'settings':
        return (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-500 to-gray-700">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Paramètres Système
                </h3>
                <p className="text-gray-500">Configuration de la plateforme</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex justify-center items-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-blue-600 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '0.8s'}}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-3xl"></div>
        <div className="relative bg-white/10 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      Panneau d'Administration
                    </h1>
                    <p className="text-lg text-purple-200 mt-1">Gestion avancée de la plateforme PMAL</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="text-sm text-purple-200">Connecté en tant que</p>
                    <p className="font-bold text-white text-lg">{user?.fullName || 'Admin User'}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="group flex items-center space-x-3 px-6 py-3 bg-white/10 hover:bg-red-500/20 text-white hover:text-red-200 rounded-2xl backdrop-blur-sm border border-white/20 hover:border-red-300/50 transition-all duration-300"
                    title="Se déconnecter"
                  >
                    <LogOut className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                    <span className="font-medium">Déconnexion</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-white/5 rounded-3xl blur-xl"></div>
              <nav className="relative bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6 space-y-3">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-2">Navigation</h3>
                  <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                </div>
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group w-full flex items-center space-x-4 px-6 py-4 rounded-2xl text-left transition-all duration-300 transform hover:scale-105 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-2xl shadow-blue-500/25'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className={`p-2 rounded-xl transition-all duration-300 ${
                      activeTab === tab.id 
                        ? 'bg-white/20' 
                        : 'bg-white/5 group-hover:bg-white/10'
                    }`}>
                      <tab.icon className="h-6 w-6" />
                    </div>
                    <span className="font-semibold text-lg">{tab.label}</span>
                    {activeTab === tab.id && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl blur-2xl"></div>
              <div className="relative">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;