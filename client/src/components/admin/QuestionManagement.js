import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit3, Trash2, Search, Save, X, Trash, 
  Sparkles, Star, Zap, Filter, RefreshCw, MessageSquare,
  CheckCircle, XCircle, Award, BookOpen, Layers, Briefcase, GitBranch
} from 'lucide-react';
import api from '../../services/api';
const modules = ['PM', 'Engineering', 'HSE', 'O&M_DOI'];
const irlPhases = ['IRL1', 'IRL2', 'IRL3', 'IRL4', 'IRL5', 'IRL6'];
const questionFamilies = [
  'Gouvernance_Pilotage', 'Livrables_Structurants', 'Methodologie_Process',
  'Outils_Digital', 'Risques_Conformite', 'Module_Specifique'
];
// --- START: MAGNIFICENT MODAL COMPONENT ---
const QuestionModal = ({ show, onClose, onSave, question, categories }) => {
  const initialFormState = {
  text: '',
  category: '',
  type: 'multiple-choice',
  assessmentType: 'quick',
  weight: 1,
  order: 0,
  isActive: true,
  options: [{ text: '', value: 1, isCorrect: false }],
  // --- ADD THESE NEW FIELDS WITH DEFAULTS ---
  module: 'PM', 
  irlPhase: 'IRL1',
  questionFamily: 'Gouvernance_Pilotage',
  criticality: 1,
  correctAnswer: ''
};  

  const [form, setForm] = useState(initialFormState);

  useEffect(() => {
    if (show) {
      if (question) {
        setForm({ ...initialFormState, ...question, options: question.options && question.options.length > 0 ? question.options : initialFormState.options });
      } else {
        setForm(initialFormState);
      }
    }
  }, [question, show]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...form.options];
    newOptions[index][field] = value;
    setForm(prev => ({ ...prev, options: newOptions }));
  };

  const addOption = () => {
    setForm(prev => ({
      ...prev,
      options: [...prev.options, { text: '', value: 1, isCorrect: false }]
    }));
  };

  const removeOption = (index) => {
    const newOptions = form.options.filter((_, i) => i !== index);
    setForm(prev => ({ ...prev, options: newOptions }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900/90 via-indigo-900/90 to-pink-900/90 backdrop-blur-xl flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 w-full max-w-6xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-in fade-in-0 zoom-in-95">
        {/* Magnificent Header */}
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-gradient-to-r from-purple-200 via-indigo-200 to-pink-200">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-indigo-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
              <MessageSquare className="text-white" size={28} />
            </div>
            <div>
              <h3 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent">
                {question ? 'Modifier la Question' : 'Créer une Nouvelle Question'}
              </h3>
              <p className="text-gray-600 font-medium text-lg">Gérez vos questions avec élégance</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-14 h-14 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center text-white hover:from-red-500 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-xl"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Main Question Details with Beautiful Design */}
          <div className="bg-gradient-to-br from-purple-50/80 to-indigo-50/80 rounded-2xl p-8 border-2 border-purple-100">
            <div className="flex items-center space-x-3 mb-6">
              <BookOpen className="text-purple-600" size={24} />
              <h4 className="text-2xl font-bold text-gray-800">Détails de la Question</h4>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="lg:col-span-2 group">
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                  <Star className="text-purple-500" size={16} />
                  <span>Texte de la question *</span>
                </label>
                <textarea 
                  name="text" 
                  rows="4" 
                  value={form.text} 
                  onChange={handleChange} 
                  className="w-full px-6 py-4 bg-white/80 backdrop-blur-xl border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all duration-300 font-medium placeholder-purple-300 resize-none" 
                  placeholder="Entrez votre question ici..."
                  required 
                />
              </div>

              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                  <Zap className="text-indigo-500" size={16} />
                  <span>Catégorie *</span>
                </label>
                <select 
                  name="category" 
                  value={form.category} 
                  onChange={handleChange} 
                  className="w-full px-6 py-4 bg-white/80 backdrop-blur-xl border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 transition-all duration-300 font-medium" 
                  required
                >
                  <option value="">-- Sélectionner une catégorie --</option>
                  {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                </select>
              </div>

              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                  <Award className="text-pink-500" size={16} />
                  <span>Type d'évaluation</span>
                </label>
                <select 
                  name="assessmentType" 
                  value={form.assessmentType} 
                  onChange={handleChange} 
                  className="w-full px-6 py-4 bg-white/80 backdrop-blur-xl border-2 border-pink-200 rounded-xl focus:border-pink-500 focus:ring-4 focus:ring-pink-200 transition-all duration-300 font-medium"
                >
                  <option value="quick">Évaluation Rapide</option>
                  <option value="deep">Évaluation Approfondie</option>
                  <option value="both">Les Deux Types</option>
                </select>
              </div>

              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-3">Poids (Weight)</label>
                <input 
                  type="number" 
                  name="weight" 
                  step="0.1" 
                  value={form.weight} 
                  onChange={handleChange} 
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 transition-all duration-300 font-medium" 
                />
              </div>

              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-3">Ordre d'affichage</label>
                <input 
                  type="number" 
                  name="order" 
                  value={form.order} 
                  onChange={handleChange} 
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300 font-medium" 
                />
              </div>
            </div>
          </div>
                    {/* --- PASTE THIS NEW SECTION HERE --- */}
          {/* Conditional Deep Assessment Fields */}
          {(form.assessmentType === 'deep' || form.assessmentType === 'both') && (
            <div className="bg-gradient-to-br from-indigo-50/80 to-blue-50/80 rounded-2xl p-8 border-2 border-indigo-100">
              <div className="flex items-center space-x-3 mb-6">
                <Layers className="text-indigo-600" size={24} />
                <h4 className="text-2xl font-bold text-gray-800">Détails pour Évaluation Approfondie</h4>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="group">
                   <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                     <Briefcase className="text-indigo-500" size={16} />
                     <span>Module *</span>
                   </label>
                   <select name="module" value={form.module} onChange={handleChange} className="w-full px-6 py-4 bg-white/80 backdrop-blur-xl border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 transition-all duration-300 font-medium" required>
                      {modules.map(m => <option key={m} value={m}>{m}</option>)}
                   </select>
                </div>
                <div className="group">
                   <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                     <GitBranch className="text-blue-500" size={16} />
                     <span>Phase IRL *</span>
                   </label>
                   <select name="irlPhase" value={form.irlPhase} onChange={handleChange} className="w-full px-6 py-4 bg-white/80 backdrop-blur-xl border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300 font-medium" required>
                      {irlPhases.map(p => <option key={p} value={p}>{p}</option>)}
                   </select>
                </div>
                <div className="group">
                   <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                     <Filter className="text-cyan-500" size={16} />
                     <span>Famille de Question *</span>
                   </label>
                   <select name="questionFamily" value={form.questionFamily} onChange={handleChange} className="w-full px-6 py-4 bg-white/80 backdrop-blur-xl border-2 border-cyan-200 rounded-xl focus:border-cyan-500 focus:ring-4 focus:ring-cyan-200 transition-all duration-300 font-medium" required>
                      {questionFamilies.map(f => <option key={f} value={f}>{f.replace(/_/g, ' & ')}</option>)}
                   </select>
                </div>
                 <div className="group lg:col-span-3">
                  <label className="block text-sm font-bold text-gray-700 mb-3">Criticité (1 = Faible, 3 = Élevée) *</label>
                  <input type="number" name="criticality" min="1" max="3" value={form.criticality} onChange={handleChange} className="w-full px-6 py-4 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-200 transition-all duration-300 font-medium" required />
                </div>
              </div>
            </div>
          )}
          {/* --- END OF THE NEW SECTION --- */}

          {/* Magnificent Options Section */}
          <div className="bg-gradient-to-br from-indigo-50/80 to-purple-50/80 rounded-2xl p-8 border-2 border-indigo-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="text-indigo-600" size={24} />
                <h4 className="text-2xl font-bold text-gray-800">Options de Réponse</h4>
              </div>
              <button 
                type="button" 
                onClick={addOption} 
                className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-xl hover:from-emerald-500 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 font-bold shadow-lg"
              >
                <Plus size={20} />
                <span>Ajouter Option</span>
                <Sparkles size={16} />
              </button>
            </div>
            
            <div className="space-y-4">
              {form.options.map((option, index) => (
                <div 
                  key={index} 
                  className="flex items-center space-x-4 bg-white/80 backdrop-blur-xl p-6 rounded-xl border-2 border-white/50 hover:border-indigo-200 transition-all duration-300 shadow-lg"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                    {index + 1}
                  </div>
                  
                  <input 
                    type="text" 
                    placeholder="Texte de l'option" 
                    value={option.text} 
                    onChange={(e) => handleOptionChange(index, 'text', e.target.value)} 
                    className="flex-grow px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 transition-all duration-300 font-medium placeholder-indigo-300" 
                    required 
                  />
                  
                  <input 
                    type="number" 
                    placeholder="Valeur" 
                    value={option.value} 
                    onChange={(e) => handleOptionChange(index, 'value', e.target.value)} 
                    className="w-24 px-3 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300 font-medium" 
                    required 
                  />
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={option.isCorrect} 
                      onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)} 
                      className="sr-only" 
                    />
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      option.isCorrect 
                        ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg transform scale-105' 
                        : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                    }`}>
                      <CheckCircle size={20} />
                    </div>
                    <span className="font-bold text-gray-700">Correct</span>
                  </label>
                  
                  <button 
                    type="button" 
                    onClick={() => removeOption(index)} 
                    className="w-10 h-10 bg-gradient-to-br from-red-400 to-rose-500 text-white rounded-xl hover:from-red-500 hover:to-rose-600 transition-all duration-300 transform hover:scale-110 flex items-center justify-center shadow-lg"
                  >
                    <Trash size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Magnificent Footer Actions */}
          <div className="flex justify-between items-center pt-8 border-t-2 border-gradient-to-r from-purple-200 via-indigo-200 to-pink-200">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input 
                  type="checkbox" 
                  name="isActive" 
                  id="isActive" 
                  checked={form.isActive} 
                  onChange={handleChange} 
                  className="sr-only" 
                />
                <label 
                  htmlFor="isActive" 
                  className={`flex items-center space-x-4 cursor-pointer px-8 py-4 rounded-xl transition-all duration-300 ${
                    form.isActive 
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg transform scale-105' 
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${form.isActive ? 'bg-white/20' : 'bg-gray-400'}`}>
                    {form.isActive ? <CheckCircle className="text-white" size={20} /> : <XCircle size={20} />}
                  </div>
                  <span className="font-bold text-lg">Question Active</span>
                </label>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-8 py-4 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 rounded-xl hover:from-gray-400 hover:to-gray-500 font-bold transition-all duration-300 transform hover:scale-105 shadow-lg text-lg"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                className="px-8 py-4 bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:via-indigo-600 hover:to-pink-600 font-bold flex items-center space-x-3 transition-all duration-300 transform hover:scale-105 shadow-xl text-lg"
              >
                <Save size={22} />
                <span>Sauvegarder</span>
                <Sparkles size={18} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
// --- END: MODAL COMPONENT ---

const QuestionManagement = () => {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [questionsRes, categoriesRes] = await Promise.all([
        api.get('/admin/questions'),
        api.get('/admin/categories')
      ]);
      setQuestions(questionsRes.data.questions || []);
      setCategories(categoriesRes.data.categories || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = questions.filter(q => 
    (!search || q.text.toLowerCase().includes(search.toLowerCase())) &&
    (!categoryFilter || q.category?._id === categoryFilter)
  );

  // In handleSaveQuestion function
// --- START: CORRECTED FUNCTIONS ---

// In handleSaveQuestion function
const handleSaveQuestion = async (formData) => {
  try {
    // Add '/admin' to the beginning of the path
    const apiCall = selectedQuestion 
      ? api.put(`/admin/questions/${selectedQuestion._id}`, formData) 
      : api.post('/admin/questions', formData);
    
    await apiCall;
    setShowModal(false);
    fetchInitialData();
  } catch (error) {
    console.error("Error saving question:", error.response?.data || error);
    alert('Failed to save question. Check console for details.');
  }
};

const handleDeleteQuestion = async (id) => {
  if (window.confirm('Êtes-vous sûr de vouloir supprimer cette question?')) {
    try {
      // Add '/admin' to the beginning of the path
      await api.delete(`/admin/questions/${id}`);
      fetchInitialData();  
    } catch (err) {
      console.error("Error deleting question:", err);
      alert('Failed to delete question.');
    }
  }
};

// --- END: CORRECTED FUNCTIONS ---

  const openModalForEdit = (question) => {
    const questionToEdit = { ...question, category: question.category?._id || question.category };
    setSelectedQuestion(questionToEdit);
    setShowModal(true);
  };
  
  const openModalForNew = () => {
    setSelectedQuestion(null);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 flex justify-center items-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-purple-200 rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-24 h-24 border-4 border-purple-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="mt-6 text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Chargement des questions magiques...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Magnificent Main Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Spectacular Header */}
          <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute -top-6 -right-6 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            
            <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center shadow-xl">
                  <MessageSquare className="text-white" size={36} />
                </div>
                <div>
                  <h1 className="text-5xl font-bold mb-2">Gestion des Questions</h1>
                  <p className="text-white/90 text-xl font-medium flex items-center space-x-3">
                    <BookOpen size={24} />
                    <span>{filteredQuestions.length} question(s) extraordinaire(s)</span>
                  </p>
                </div>
              </div>
              
              <button 
                onClick={openModalForNew} 
                className="flex items-center space-x-4 px-8 py-4 bg-white text-purple-600 rounded-2xl hover:bg-white/90 transition-all duration-300 transform hover:scale-105 font-bold shadow-2xl text-lg"
              >
                <Plus size={24} />
                <span>Nouvelle Question</span>
                <Sparkles size={20} />
              </button>
            </div>
          </div>

          {/* Beautiful Filters Section */}
          <div className="p-8 bg-gradient-to-r from-purple-50/50 to-indigo-50/50 border-b border-purple-100">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="relative group md:col-span-2">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-purple-400 group-hover:text-purple-600 transition-colors" size={24} />
                <input 
                  type="text" 
                  placeholder="Rechercher une question..." 
                  className="pl-16 pr-6 py-4 w-full bg-white/80 backdrop-blur-xl border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all duration-300 font-medium placeholder-purple-400 text-lg" 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                />
              </div>
              
              <div className="relative group">
                <Filter className="absolute left-6 top-1/2 transform -translate-y-1/2 text-indigo-400 group-hover:text-indigo-600 transition-colors" size={24} />
                <select 
                  className="pl-16 pr-6 py-4 w-full bg-white/80 backdrop-blur-xl border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 transition-all duration-300 font-medium appearance-none cursor-pointer text-lg" 
                  value={categoryFilter} 
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">Toutes les catégories</option>
                  {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                </select>
              </div>
              
              <button 
                onClick={() => { setSearch(''); setCategoryFilter(''); }} 
                className="flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-pink-400 to-rose-500 text-white rounded-xl hover:from-pink-500 hover:to-rose-600 transition-all duration-300 transform hover:scale-105 font-bold shadow-lg text-lg"
              >
                <RefreshCw size={24} />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Magnificent Questions Table */}
          <div className="p-8">
            <div className="overflow-hidden rounded-2xl border-2 border-purple-100 shadow-xl">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500">
                    <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <MessageSquare size={18} />
                        <span>Question</span>
                      </div>
                    </th>
                    <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <Zap size={18} />
                        <span>Catégorie</span>
                      </div>
                    </th>
                    <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <Award size={18} />
                        <span>Type</span>
                      </div>
                    </th>
                    <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Statut</th>
                    <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white/50 backdrop-blur-xl divide-y-2 divide-purple-100">
                  {filteredQuestions.map((q, index) => (
                    <tr key={q._id} className={`hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all duration-300 ${index % 2 === 0 ? 'bg-white/30' : 'bg-purple-50/30'}`}>
                      <td className="px-8 py-6">
                        <div className="max-w-md">
                          <p className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{q.text}</p>
                          <div className="flex items-center space-x-2">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200">
                              Poids: {q.weight}
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                              Ordre: {q.order}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border border-purple-200">
                          {q.category?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${
                          q.assessmentType === 'quick' 
                            ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200' 
                            : q.assessmentType === 'deep'
                            ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200'
                            : 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border-purple-200'
                        }`}>
                          {q.assessmentType === 'quick' ? 'Rapide' : q.assessmentType === 'deep' ? 'Approfondie' : 'Les Deux'}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`flex items-center space-x-2 px-4 py-2 rounded-full font-bold ${
                          q.isActive 
                            ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-200' 
                            : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-2 border-red-200'
                        }`}>
                          {q.isActive ? <CheckCircle size={16} /> : <XCircle size={16} />}
                          <span>{q.isActive ? 'Actif' : 'Inactif'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex space-x-3">
                          <button 
                            onClick={() => openModalForEdit(q)} 
                            className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-110 flex items-center justify-center shadow-lg"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteQuestion(q._id)} 
                            className="w-12 h-12 bg-gradient-to-r from-red-400 to-rose-500 text-white rounded-xl hover:from-red-500 hover-to-rose-600 transition-all duration-300 transform hover:scale-110 flex items-center justify-center shadow-lg"
                         >
                           <Trash2 size={18} />
                         </button>
                       </div>
                     </td>
                   </tr>
                 ))}
                 {filteredQuestions.length === 0 && (
                   <tr>
                     <td colSpan="5" className="px-8 py-16 text-center">
                       <div className="flex flex-col items-center space-y-4">
                         <div className="w-24 h-24 bg-gradient-to-br from-purple-200 to-indigo-200 rounded-full flex items-center justify-center">
                           <MessageSquare className="text-purple-500" size={40} />
                         </div>
                         <div>
                           <h3 className="text-2xl font-bold text-gray-600 mb-2">Aucune question trouvée</h3>
                           <p className="text-gray-500 font-medium">Commencez par créer votre première question!</p>
                         </div>
                         <button 
                           onClick={openModalForNew}
                           className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105 font-bold shadow-lg"
                         >
                           <Plus size={20} />
                           <span>Créer une Question</span>
                           <Sparkles size={16} />
                         </button>
                       </div>
                     </td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>

           {/* Beautiful Statistics Footer */}
           {filteredQuestions.length > 0 && (
             <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
               <div className="bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl p-6 text-white shadow-xl">
                 <div className="flex items-center space-x-3">
                   <MessageSquare size={24} />
                   <div>
                     <p className="text-sm font-medium opacity-90">Total Questions</p>
                     <p className="text-3xl font-bold">{filteredQuestions.length}</p>
                   </div>
                 </div>
               </div>
               
               <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-6 text-white shadow-xl">
                 <div className="flex items-center space-x-3">
                   <CheckCircle size={24} />
                   <div>
                     <p className="text-sm font-medium opacity-90">Questions Actives</p>
                     <p className="text-3xl font-bold">{filteredQuestions.filter(q => q.isActive).length}</p>
                   </div>
                 </div>
               </div>
               
               <div className="bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl p-6 text-white shadow-xl">
                 <div className="flex items-center space-x-3">
                   <Award size={24} />
                   <div>
                     <p className="text-sm font-medium opacity-90">Éval. Rapides</p>
                     <p className="text-3xl font-bold">{filteredQuestions.filter(q => q.assessmentType === 'quick' || q.assessmentType === 'both').length}</p>
                   </div>
                 </div>
               </div>
               
               <div className="bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl p-6 text-white shadow-xl">
                 <div className="flex items-center space-x-3">
                   <BookOpen size={24} />
                   <div>
                     <p className="text-sm font-medium opacity-90">Éval. Détaillées</p>
                     <p className="text-3xl font-bold">{filteredQuestions.filter(q => q.assessmentType === 'deep' || q.assessmentType === 'both').length}</p>
                   </div>
                 </div>
               </div>
             </div>
           )}
         </div>
       </div>
     </div>
     
     {/* Render the Magnificent Modal */}
     <QuestionModal
       show={showModal}
       onClose={() => setShowModal(false)}
       onSave={handleSaveQuestion}
       question={selectedQuestion}
       categories={categories}
     />
   </div>
 );
};

export default QuestionManagement;
