import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit3, Trash2, Search, Save, X, 
  Download, ToggleLeft, ToggleRight, Sparkles, 
  Star, Zap, Filter, RefreshCw
} from 'lucide-react';
import api from '../../services/api';

// --- START: MODAL COMPONENT WITH MAGNIFICENT DESIGN ---
const CategoryModal = ({ show, onClose, onSave, category }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const initialState = {
      name: '', 
      description: '', 
      code: '', 
      phase: 'All', 
      weight: 1.0,
      quickAssessmentWeight: 1.0, 
      deepAssessmentWeight: 1.0, 
      order: 0,
      color: '#4a90e2', 
      icon: 'fas fa-folder', 
      isActive: true
    };
    setFormData(category ? { ...initialState, ...category } : initialState);
  }, [category, show]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900/90 via-indigo-900/90 to-pink-900/90 backdrop-blur-xl flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-in fade-in-0 zoom-in-95">
        {/* Header with Gradient */}
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-gradient-to-r from-purple-200 via-indigo-200 to-pink-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent">
                {category ? 'Modifier la Catégorie' : 'Créer une Nouvelle Catégorie'}
              </h3>
              <p className="text-gray-600 font-medium">Gérez vos catégories avec style</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center text-white hover:from-red-500 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Column 1 - Enhanced Design */}
          <div className="space-y-6">
            <div className="group">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center space-x-2">
                <Star className="text-purple-500" size={16} />
                <span>Nom de la Catégorie</span>
              </label>
              <input 
                type="text" 
                name="name" 
                value={formData.name || ''} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all duration-300 font-medium placeholder-purple-300" 
                placeholder="Entrez le nom..."
                required 
              />
            </div>

            <div className="group">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center space-x-2">
                <Edit3 className="text-indigo-500" size={16} />
                <span>Description</span>
              </label>
              <textarea 
                name="description" 
                value={formData.description || ''} 
                onChange={handleChange} 
                rows="4" 
                className="w-full px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 transition-all duration-300 font-medium placeholder-indigo-300 resize-none"
                placeholder="Décrivez la catégorie..."
              />
            </div>

            <div className="group">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center space-x-2">
                <Zap className="text-pink-500" size={16} />
                <span>Code Unique</span>
              </label>
              <input 
                type="text" 
                name="code" 
                value={formData.code || ''} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200 rounded-xl focus:border-pink-500 focus:ring-4 focus:ring-pink-200 transition-all duration-300 font-medium placeholder-pink-300" 
                placeholder="CODE_CAT"
                required 
              />
            </div>

            <div className="group">
              <label className="block text-sm font-bold text-gray-700 mb-2">Phase du Projet</label>
              <select 
                name="phase" 
                value={formData.phase || 'All'} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all duration-300 font-medium"
              >
                {['Planning', 'Development', 'Testing', 'Deployment', 'Maintenance', 'All'].map(p => 
                  <option key={p} value={p}>{p}</option>
                )}
              </select>
            </div>
          </div>
          
          {/* Column 2 - Enhanced Design */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-2">Poids Principal</label>
                <input 
                  type="number" 
                  step="0.1" 
                  name="weight" 
                  value={formData.weight || 1} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 transition-all duration-300 font-medium" 
                />
              </div>

              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-2">Poids Éval. Rapide</label>
                <input 
                  type="number" 
                  step="0.1" 
                  name="quickAssessmentWeight" 
                  value={formData.quickAssessmentWeight || 1} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300 font-medium" 
                />
              </div>

              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-2">Poids Éval. Détaillée</label>
                <input 
                  type="number" 
                  step="0.1" 
                  name="deepAssessmentWeight" 
                  value={formData.deepAssessmentWeight || 1} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl focus:border-yellow-500 focus:ring-4 focus:ring-yellow-200 transition-all duration-300 font-medium" 
                />
              </div>

              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-2">Ordre d'Affichage</label>
                <input 
                  type="number" 
                  name="order" 
                  value={formData.order || 0} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-slate-50 border-2 border-gray-200 rounded-xl focus:border-gray-500 focus:ring-4 focus:ring-gray-200 transition-all duration-300 font-medium" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-2">Couleur</label>
                <div className="relative">
                  <input 
                    type="color" 
                    name="color" 
                    value={formData.color || '#4a90e2'} 
                    onChange={handleChange} 
                    className="w-full h-12 border-2 border-purple-200 rounded-xl cursor-pointer hover:border-purple-400 transition-all duration-300"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
                </div>
              </div>
              
              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-2">Icône FontAwesome</label>
                <input 
                  type="text" 
                  name="icon" 
                  placeholder="fas fa-folder" 
                  value={formData.icon || ''} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all duration-300 font-medium placeholder-purple-300" 
                />
              </div>
            </div>
          </div>

          {/* Footer with Enhanced Buttons */}
          <div className="lg:col-span-2 flex items-center justify-between pt-8 border-t border-gradient-to-r from-purple-200 via-indigo-200 to-pink-200">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <input 
                  id="isActive" 
                  type="checkbox" 
                  name="isActive" 
                  checked={formData.isActive || false} 
                  onChange={handleChange} 
                  className="sr-only" 
                />
                <label 
                  htmlFor="isActive" 
                  className={`flex items-center space-x-3 cursor-pointer px-6 py-3 rounded-xl transition-all duration-300 ${
                    formData.isActive 
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg transform scale-105' 
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${formData.isActive ? 'bg-white/20' : 'bg-gray-400'}`}>
                    {formData.isActive && <span className="text-white font-bold">✓</span>}
                  </div>
                  <span className="font-bold">Catégorie Active</span>
                </label>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-8 py-3 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 rounded-xl hover:from-gray-400 hover:to-gray-500 font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                className="px-8 py-3 bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:via-indigo-600 hover:to-pink-600 font-bold flex items-center space-x-3 transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                <Save size={20} />
                <span>Sauvegarder</span>
                <Sparkles size={16} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
// --- END: MODAL COMPONENT ---

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPhase, setSelectedPhase] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const phases = ['Planning', 'Development', 'Testing', 'Deployment', 'Maintenance', 'All'];

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    let filtered = categories.filter(category => {
      const nameMatch = category.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const codeMatch = category.code?.toLowerCase().includes(searchTerm.toLowerCase());
      const phaseMatch = !selectedPhase || category.phase === selectedPhase;
      return (nameMatch || codeMatch) && phaseMatch;
    });
    filtered.sort((a, b) => (a.order || 0) - (b.order || 0));
    setFilteredCategories(filtered);
  }, [categories, searchTerm, selectedPhase]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/categories');
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSave = async (categoryData) => {
    try {
      if (selectedCategory) {
        await api.put(`/admin/categories/${selectedCategory._id}`, categoryData);
      } else {
        await api.post('/admin/categories', categoryData);
      }
      setShowCategoryModal(false);
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error.response ? error.response.data : error);
      alert('Failed to save category. Check console for details.');
    }
  };

  const handleAddNew = () => {
    setSelectedCategory(null);
    setShowCategoryModal(true);
  };
  
  const handleEdit = (category) => {
    setSelectedCategory(category);
    setShowCategoryModal(true);
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie?')) {
      try {
        await api.delete(`/admin/categories/${categoryId}`);
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Failed to delete category.');
      }
    }
  };

  const handleToggleStatus = async (category) => {
    try {
      await api.put(`/admin/categories/${category._id}/toggle-active`, { isActive: !category.isActive });
      fetchCategories();
    } catch (error) {
      console.error('Error toggling category status:', error);
      alert('Failed to toggle status.');
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 flex justify-center items-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-purple-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="mt-4 text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Chargement des catégories...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Main Card with Glass Effect */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header Section with Magnificent Design */}
          <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            
            <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                  <Sparkles className="text-white" size={32} />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">Gestion des Catégories</h1>
                  <p className="text-white/90 text-lg font-medium flex items-center space-x-2">
                    <Star size={20} />
                    <span>{filteredCategories.length} catégorie(s) magnifique(s)</span>
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button className="flex items-center space-x-3 px-6 py-3 bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl hover:bg-white/30 transition-all duration-300 transform hover:scale-105 font-bold">
                  <Download size={20} />
                  <span>Exporter</span>
                </button>
                <button 
                  onClick={handleAddNew} 
                  className="flex items-center space-x-3 px-6 py-3 bg-white text-purple-600 rounded-xl hover:bg-white/90 transition-all duration-300 transform hover:scale-105 font-bold shadow-xl"
                >
                  <Plus size={20} />
                  <span>Nouvelle Catégorie</span>
                  <Sparkles size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Filters Section with Beautiful Design */}
          <div className="p-8 bg-gradient-to-r from-purple-50/50 to-indigo-50/50 border-b border-purple-100">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 group-hover:text-purple-600 transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Rechercher une catégorie..." 
                  className="pl-12 pr-4 py-4 w-full bg-white/80 backdrop-blur-xl border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all duration-300 font-medium placeholder-purple-400" 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
              </div>
              
              <div className="relative group">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-400 group-hover:text-indigo-600 transition-colors" size={20} />
                <select 
                  className="pl-12 pr-4 py-4 w-full bg-white/80 backdrop-blur-xl border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 transition-all duration-300 font-medium appearance-none cursor-pointer" 
                  value={selectedPhase} 
                  onChange={(e) => setSelectedPhase(e.target.value)}
                >
                  <option value="">Toutes les phases</option>
                  {phases.map((phase) => <option key={phase} value={phase}>{phase}</option>)}
                </select>
              </div>
              
              <button 
                onClick={() => { setSearchTerm(''); setSelectedPhase(''); }} 
                className="flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-pink-400 to-rose-500 text-white rounded-xl hover:from-pink-500 hover:to-rose-600 transition-all duration-300 transform hover:scale-105 font-bold shadow-lg"
              >
                <RefreshCw size={20} />
                <span>Réinitialiser</span>
              </button>
              
              <div className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-xl font-bold shadow-lg">
                <Zap className="mr-3" size={20} />
                <span>Total: {filteredCategories.length}</span>
              </div>
            </div>
          </div>

          {/* Table Section with Magnificent Design */}
          <div className="p-8">
            <div className="overflow-hidden rounded-2xl border-2 border-purple-100 shadow-xl">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500">
                    <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <Star size={16} />
                        <span>Catégorie</span>
                      </div>
                    </th>
                    <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Code</th>
                    <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Phase</th>
                    <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Statut</th>
                    <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white/50 backdrop-blur-xl divide-y-2 divide-purple-100">
                  {filteredCategories.map((category, index) => (
                    <tr key={category._id} className={`hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all duration-300 ${index % 2 === 0 ? 'bg-white/30' : 'bg-purple-50/30'}`}>
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-4">
                          <div 
                            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg transform hover:scale-110 transition-all duration-300" 
                            style={{ 
                              background: `linear-gradient(135deg, ${category.color || '#4a90e2'}, ${category.color || '#4a90e2'}dd)` 
                            }}
                          >
                            {category.icon ? <i className={category.icon}></i> : category.code?.charAt(0)}
                          </div>
                          <div>
                            <div className="text-lg font-bold text-gray-900 mb-1">{category.name}</div>
                            <div className="text-sm text-gray-600 font-medium">{category.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border border-purple-200">
                          {category.code}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200">
                          {category.phase}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <button 
                          onClick={() => handleToggleStatus(category)} 
                          className={`text-3xl transition-all duration-300 transform hover:scale-110 ${
                            category.isActive 
                              ? 'text-emerald-500 hover:text-emerald-600 drop-shadow-lg' 
                              : 'text-gray-400 hover:text-gray-500'
                          }`}
                        >
                          {category.isActive ? <ToggleRight /> : <ToggleLeft />}
                        </button>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex space-x-3">
                          <button 
                            onClick={() => handleEdit(category)} 
                            className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-110 flex items-center justify-center shadow-lg"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(category._id)} 
                            className="w-10 h-10 bg-gradient-to-r from-red-400 to-rose-500 text-white rounded-xl hover:from-red-500 hover:to-rose-600 transition-all duration-300 transform hover:scale-110 flex items-center justify-center shadow-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal */}
      <CategoryModal
        show={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSave={handleSave}
        category={selectedCategory}
      />
    </div>
  );
};

export default CategoryManagement;