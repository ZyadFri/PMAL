import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Edit3, Trash2, Plus, Eye, Ban, CheckCircle, 
  Download, Crown, Shield, Briefcase, Mail, Calendar,
  Filter, RefreshCw, Star, Activity, BarChart2
} from 'lucide-react';
import api from '../../services/api';

// --- START: NEW MODAL COMPONENT ---
// This is the second modal for showing the details of a single assessment.
const AssessmentDetailModal = ({ assessment, onClose }) => {
  if (!assessment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Assessment Details</h3>
            <p className="text-gray-600">Project: {assessment.project?.name}</p>
          </div>
          <button 
            onClick={onClose} 
            className="px-6 py-3 bg-gray-500 text-white rounded-2xl hover:bg-gray-600 transition font-medium"
          >
            Close
          </button>
        </div>

        <div className="space-y-6">
          {assessment.answers?.length > 0 ? assessment.answers.map((answer, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p className="font-semibold text-gray-900 mb-3">{index + 1}. {answer.question?.text || 'Question text not available'}</p>
              <div className="space-y-2">
                {answer.question?.options.map(option => (
                  <div key={option._id} className={`flex items-center justify-between p-3 rounded-xl border-2 text-sm ${
                    answer.selectedOption?._id === option._id
                      ? 'bg-emerald-50 border-emerald-400 font-bold text-emerald-800'
                      : 'bg-white border-gray-200 text-gray-700'
                  }`}>
                    <span>{option.text}</span>
                    <span className="font-mono text-xs px-2 py-1 bg-gray-200 rounded-md">Score: {option.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )) : (
            <p className="text-center text-gray-500 py-8">No answers were recorded for this assessment.</p>
          )}
        </div>
      </div>
    </div>
  );
};
// --- END: NEW MODAL COMPONENT ---

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [userProjects, setUserProjects] = useState([]);

  // --- START OF CHANGES: New State ---
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  // --- END OF CHANGES ---

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users.filter(user => {
      const matchesSearch = !searchTerm || 
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = !selectedRole || user.userRole === selectedRole;
      const matchesStatus = !selectedStatus || 
        (selectedStatus === 'active' && user.isActivated) ||
        (selectedStatus === 'inactive' && !user.isActivated);
      return matchesSearch && matchesRole && matchesStatus;
    });
    setFilteredUsers(filtered);
  }, [users, searchTerm, selectedRole, selectedStatus]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      console.log('API response:', response.data);
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.put(`/admin/users/${userId}/toggle-activation`, { isActivated: !currentStatus });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleSaveUser = async (updatedData) => {
    try {
      if (selectedUser) {
        await api.put(`/admin/users/${selectedUser._id}`, updatedData);
      } else {
        await api.post('/admin/users', updatedData); 
      }
      setShowUserModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const viewUserProjects = async (userId) => {
    try {
      setShowProjectsModal(true);
      const response = await api.get(`/admin/users/${userId}/projects`);
      setUserProjects(response.data.projects || []);
      setSelectedUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user projects:', error);
    }
  };

  const exportUsers = async () => {
    alert('Export functionality not yet implemented on the backend.');
  };
  
  const viewAssessmentDetails = async (assessmentId) => {
    try {
      const response = await api.get(`/admin/assessments/${assessmentId}`);
      if (response.data.success) {
        setSelectedAssessment(response.data.data);
        setShowAssessmentModal(true);
      }
    } catch (error) {
      console.error("Failed to fetch assessment details:", error);
      alert("Could not load assessment details.");
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Admin': return Crown;
      case 'Project Manager': return Shield;
      case 'Employee': return Briefcase;
      default: return Users;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin': return 'from-red-500 to-pink-600';
      case 'Project Manager': return 'from-blue-500 to-indigo-600';
      case 'Employee': return 'from-green-500 to-emerald-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const UserModal = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState({ 
      firstName: '', 
      lastName: '', 
      email: '', 
      userRole: 'Employee' 
    });

    useEffect(() => {
      if (user) {
        setFormData({ 
          firstName: user.firstName || '', 
          lastName: user.lastName || '', 
          email: user.email || '', 
          userRole: user.userRole || 'Employee' 
        });
      }
    }, [user]);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-3xl blur-2xl"></div>
          <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              {user ? 'Modifier Utilisateur' : 'Nouvel Utilisateur'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
                <select
                  name="userRole"
                  value={formData.userRole}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Employee">Employee</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-2xl hover:bg-gray-600 transition font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 transition font-medium"
                >
                  {user ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };
  
  const ProjectsModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-4xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-3xl blur-2xl"></div>
        <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-h-[80vh] overflow-y-auto shadow-2xl border border-white/20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600">
                <Activity className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Projects of {selectedUser?.firstName} {selectedUser?.lastName}
                </h3>
                <p className="text-gray-500">{userProjects.length} projet(s) trouvé(s)</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            {userProjects.length > 0 ? userProjects.map((project) => (
              <div key={project._id} className="bg-white/50 rounded-2xl border border-gray-100 p-6">
                <h4 className="font-bold text-gray-900 text-xl mb-3">{project.name}</h4>
                <div className="space-y-3">
                  {project.assessments.length > 0 ? (
                    project.assessments.map(assessment => (
                      <div key={assessment._id} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <BarChart2 className="h-5 w-5 text-indigo-500" />
                          <div>
                            <span className="font-semibold capitalize text-gray-800">{assessment.type} Assessment</span>
                            <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${assessment.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{assessment.status}</span>
                            {assessment.overallScore != null && <span className="text-sm text-blue-600 font-bold ml-3">Score: {assessment.overallScore.toFixed(2)}</span>}
                          </div>
                        </div>
                        <button 
                          onClick={() => viewAssessmentDetails(assessment._id)}
                          className="px-4 py-2 bg-blue-500 text-white text-sm rounded-xl hover:bg-blue-600 font-semibold transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No assessments found for this project.</p>
                  )}
                </div>
              </div>
            )) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">This user has no projects.</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end mt-8">
            <button 
              onClick={() => setShowProjectsModal(false)} 
              className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 font-medium"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin"></div>
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-3xl blur-2xl"></div>
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Gestion des Utilisateurs
                </h1>
                <p className="text-gray-600 mt-1">
                  Gérez tous les utilisateurs de la plateforme
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setShowUserModal(true);
                }}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg"
              >
                <Plus className="h-5 w-5" />
                <span>Nouvel Utilisateur</span>
              </button>
              
              <button
                onClick={exportUsers}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-2xl hover:from-indigo-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg"
              >
                <Download className="h-5 w-5" />
                <span>Exporter</span>
              </button>
              
              <button
                onClick={fetchUsers}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 font-medium shadow-lg"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Actualiser</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-100/50 to-gray-200/50 rounded-2xl blur-xl"></div>
        <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl p-6 border border-white/30 shadow-lg">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, email, username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
              />
            </div>
            
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm min-w-[150px]"
            >
              <option value="">Tous les rôles</option>
              <option value="Admin">Admin</option>
              <option value="Project Manager">Project Manager</option>
              <option value="Employee">Employee</option>
            </select>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm min-w-[150px]"
            >
              <option value="">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-gray-100/20 rounded-3xl blur-2xl"></div>
        <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/20 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="text-left p-6 font-semibold text-gray-900">Utilisateur</th>
                  <th className="text-left p-6 font-semibold text-gray-900">Rôle</th>
                  <th className="text-left p-6 font-semibold text-gray-900">Statut</th>
                  <th className="text-left p-6 font-semibold text-gray-900">Dernière Connexion</th>
                  <th className="text-center p-6 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const RoleIcon = getRoleIcon(user.userRole);
                    return (
                      <tr key={user._id} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-300">
                        <td className="p-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                              {user.firstName?.charAt(0) || user.username?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {user.firstName && user.lastName 
                                  ? `${user.firstName} ${user.lastName}`
                                  : user.username || 'N/A'
                                }
                              </div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <Mail className="h-4 w-4 mr-1" />
                                {user.email || 'No email'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-xl bg-gradient-to-r ${getRoleColor(user.userRole)} text-white font-medium`}>
                            <RoleIcon className="h-4 w-4" />
                            <span>{user.userRole || 'Employee'}</span>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-xl font-medium ${
                            user.isActivated 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActivated ? (
                              <>
                                <CheckCircle className="h-4 w-4" />
                                <span>Actif</span>
                              </>
                            ) : (
                              <>
                                <Ban className="h-4 w-4" />
                                <span>Inactif</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            {user.lastLogin 
                              ? new Date(user.lastLogin).toLocaleDateString('fr-FR')
                              : 'Jamais connecté'
                            }
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => viewUserProjects(user._id)}
                              className="p-2 rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                              title="Voir les projets"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowUserModal(true);
                              }}
                              className="p-2 rounded-xl bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                              title="Modifier"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            
                            <button
                              onClick={() => toggleUserStatus(user._id, user.isActivated)}
                              className={`p-2 rounded-xl transition-colors ${
                                user.isActivated
                                  ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                                  : 'bg-green-100 text-green-600 hover:bg-green-200'
                              }`}
                              title={user.isActivated ? 'Désactiver' : 'Activer'}
                            >
                              {user.isActivated ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                            </button>
                            
                            <button
                              onClick={() => deleteUser(user._id)}
                              className="p-2 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-12">
                      <div className="flex flex-col items-center space-y-4">
                        <Users className="h-16 w-16 text-gray-300" />
                        <div>
                          <p className="text-xl font-semibold text-gray-500">Aucun utilisateur trouvé</p>
                          <p className="text-gray-400 mt-2">
                            {searchTerm || selectedRole || selectedStatus 
                              ? 'Aucun utilisateur ne correspond aux critères de recherche'
                              : 'Aucun utilisateur n\'est enregistré dans le système'
                            }
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showUserModal && (
        <UserModal 
          user={selectedUser} 
          onClose={() => setShowUserModal(false)}
          onSave={handleSaveUser}
        />
      )}
      
      {showProjectsModal && <ProjectsModal />}
      {showAssessmentModal && <AssessmentDetailModal assessment={selectedAssessment} onClose={() => setShowAssessmentModal(false)} />}
    </div>
  );
};

export default UserManagement;