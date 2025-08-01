import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Edit3, Trash2, Plus, Eye, Ban, CheckCircle, 
  Download, UserCheck, Crown, Shield, Briefcase, Mail, Calendar,
  Filter, RefreshCw, Star, Sparkles, Activity
} from 'lucide-react';
import api from '../../services/api';

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

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filterUsers = () => {
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
    };

    filterUsers();
  }, [users, searchTerm, selectedRole, selectedStatus]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
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
      userRole: 'Employee',
    });

    useEffect(() => {
      if (user) {
        setFormData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          userRole: user.userRole || 'Employee',
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
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-3xl blur-2xl"></div>
          <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20">
            <div className="flex items-center space-x-4 mb-8">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {user ? 'Modifier l\'utilisateur' : 'Créer un nouvel utilisateur'}
                </h3>
                <p className="text-gray-500">Informations utilisateur</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">Prénom</label>
                  <input 
                    type="text" 
                    name="firstName" 
                    id="firstName" 
                    value={formData.firstName} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50/50" 
                    placeholder="Entrez le prénom"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">Nom</label>
                  <input 
                    type="text" 
                    name="lastName" 
                    id="lastName" 
                    value={formData.lastName} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50/50" 
                    placeholder="Entrez le nom"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input 
                      type="email" 
                      name="email" 
                      id="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50/50" 
                      placeholder="exemple@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="userRole" className="block text-sm font-semibold text-gray-700 mb-2">Rôle</label>
                  <select 
                    name="userRole" 
                    id="userRole" 
                    value={formData.userRole} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50/50"
                  >
                    <option value="Employee">Employé</option>
                    <option value="Project Manager">Chef de Projet</option>
                    <option value="Admin">Administrateur</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end pt-6 space-x-4">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-all duration-300 font-medium"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg"
                >
                  Sauvegarder
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
      <div className="relative w-full max-w-4xl max-h-[80vh]">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-3xl blur-2xl"></div>
        <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 overflow-y-auto shadow-2xl border border-white/20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600">
                <Activity className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Projets de {selectedUser?.firstName} {selectedUser?.lastName}
                </h3>
                <p className="text-gray-500">{userProjects.length} projet(s) trouvé(s)</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {userProjects.length > 0 ? userProjects.map((project) => (
              <div key={project._id} className="group relative overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all duration-300">
                  <h4 className="font-semibold text-gray-900 text-lg">{project.name}</h4>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl">
                  <Activity className="w-full h-full text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">Cet utilisateur n'a aucun projet</p>
                <p className="text-sm text-gray-400 mt-1">Les projets apparaîtront ici une fois assignés</p>
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
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-600 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '0.8s'}}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-3xl blur-2xl"></div>
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Gestion des Utilisateurs
                </h2>
                <div className="flex items-center space-x-2 mt-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <p className="text-gray-600 font-medium">{filteredUsers.length} utilisateur(s) trouvé(s)</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={exportUsers} 
                className="group flex items-center space-x-3 px-6 py-3 bg-white/70 hover:bg-emerald-500 text-gray-700 hover:text-white rounded-2xl backdrop-blur-sm border border-gray-200 hover:border-emerald-400 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Download className="h-5 w-5 group-hover:animate-bounce" />
                <span className="font-medium">Exporter</span>
              </button>
              <button 
                onClick={() => { setSelectedUser(null); setShowUserModal(true); }} 
                className="group flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                <span className="font-medium">Nouvel Utilisateur</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-600/10 rounded-2xl blur-xl"></div>
        <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Filter className="h-6 w-6 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filtres de recherche</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input 
                type="text" 
                placeholder="Rechercher un utilisateur..." 
                className="pl-12 pr-4 py-3 w-full border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
            
            <select 
              className="px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm" 
              value={selectedRole} 
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="">Tous les rôles</option>
              <option value="Employee">Employé</option>
              <option value="Project Manager">Chef de Projet</option>
              <option value="Admin">Administrateur</option>
            </select>
            
            <select 
              className="px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm" 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
            
            <button 
              onClick={() => { setSearchTerm(''); setSelectedRole(''); setSelectedStatus(''); }} 
              className="group flex items-center justify-center space-x-2 px-4 py-3 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm"
            >
              <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
              <span>Réinitialiser</span>
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-gray-50/40 rounded-3xl blur-2xl"></div>
        <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50/90 to-gray-100/90 backdrop-blur-sm">
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Utilisateur</th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Rôle</th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Entreprise</th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Statut</th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Dernière Connexion</th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user, index) => {
                  const RoleIcon = getRoleIcon(user.userRole);
                  return (
                    <tr key={user._id} className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-300">
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${getRoleColor(user.userRole)} flex items-center justify-center shadow-lg`}>
                              <span className="text-lg font-bold text-white">
                                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                              </span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                              <RoleIcon className="h-2.5 w-2.5 text-gray-600" />
                            </div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-gray-900">{user.firstName} {user.lastName}</div>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Mail className="h-4 w-4" />
                              <span>{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-2xl bg-gradient-to-r ${getRoleColor(user.userRole)} text-white shadow-lg`}>
                          <RoleIcon className="h-4 w-4" />
                          <span className="font-medium">{user.userRole}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-gray-900 font-medium">{user.company || 'Non définie'}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`inline-flex items-center space-x-2 px-4 py-2 text-sm font-bold rounded-2xl shadow-lg ${
                          user.isActivated 
                            ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200' 
                            : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200'
                        }`}>
                          {user.isActivated ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                          <span>{user.isActivated ? 'Actif' : 'Inactif'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium">
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Jamais'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-3">
                          <button 
                            onClick={() => viewUserProjects(user._id)} 
                            className="p-2 text-blue-600 hover:text-white hover:bg-blue-500 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg"
                            title="Voir les projets"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => { setSelectedUser(user); setShowUserModal(true); }} 
                            className="p-2 text-yellow-600 hover:text-white hover:bg-yellow-500 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg"
                            title="Modifier"
                          >
                            <Edit3 className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => toggleUserStatus(user._id, user.isActivated)} 
                            className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg ${
                              user.isActivated 
                                ? 'text-red-600 hover:text-white hover:bg-red-500' 
                                : 'text-green-600 hover:text-white hover:bg-green-500'
                            }`}
                            title={user.isActivated ? 'Désactiver' : 'Activer'}
                          >
                            {user.isActivated ? <Ban className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                          </button>
                          <button 
                            onClick={() => deleteUser(user._id)} 
                            className="p-2 text-red-600 hover:text-white hover:bg-red-500 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg"
                            title="Supprimer"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
    </div>
  );
};

export default UserManagement;