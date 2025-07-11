import React, { useState, useEffect } from 'react';

const CreateProject = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phase: '',
    startDate: '',
    endDate: '',
    priority: 'Medium',
    budget: '',
    managerUsername: '',
    teamMembers: [],
    tags: [],
    objectives: '',
    expectedOutcomes: '',
    risks: '',
    constraints: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newTeamMember, setNewTeamMember] = useState({ username: '', role: 'Member' });

  const phases = [
    { value: 'Planning', icon: '📋', description: 'Initial project planning and requirements gathering' },
    { value: 'Development', icon: '⚡', description: 'Active development and implementation phase' },
    { value: 'Testing', icon: '🧪', description: 'Quality assurance and testing phase' },
    { value: 'Deployment', icon: '🚀', description: 'Production deployment and rollout' },
    { value: 'Maintenance', icon: '🔧', description: 'Ongoing maintenance and support' }
  ];

  const priorities = [
    { value: 'Low', color: 'from-green-500 to-emerald-500', icon: '🟢', description: 'Nice to have, flexible timeline' },
    { value: 'Medium', color: 'from-yellow-500 to-orange-500', icon: '🟡', description: 'Standard priority project' },
    { value: 'High', color: 'from-red-500 to-pink-500', icon: '🔴', description: 'Critical business priority' }
  ];

  const teamRoles = [
    { value: 'Manager', icon: '👔', description: 'Project manager or team lead' },
    { value: 'Member', icon: '👤', description: 'Regular team member' },
    { value: 'Viewer', icon: '👁️', description: 'View-only access' }
  ];

  useEffect(() => {
    // Set default start date to today
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, startDate: today }));
  }, []);

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (currentStep) => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.name.trim()) newErrors.name = 'Project name is required';
      if (!formData.description.trim()) newErrors.description = 'Project description is required';
      if (!formData.phase) newErrors.phase = 'Project phase is required';
    }

    if (currentStep === 2) {
      if (!formData.startDate) newErrors.startDate = 'Start date is required';
      if (formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
      if (formData.budget && isNaN(formData.budget)) {
        newErrors.budget = 'Budget must be a valid number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const searchUsers = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockUsers = [
        { username: 'sarah.johnson', name: 'Sarah Johnson', role: 'Project Manager', avatar: '👩‍💼' },
        { username: 'mike.chen', name: 'Mike Chen', role: 'Developer', avatar: '👨‍💻' },
        { username: 'lisa.wang', name: 'Lisa Wang', role: 'Designer', avatar: '👩‍🎨' },
        { username: 'alex.kim', name: 'Alex Kim', role: 'Security Expert', avatar: '👨‍🔒' }
      ];
      
      const filtered = mockUsers.filter(user => 
        user.username.toLowerCase().includes(query.toLowerCase()) ||
        user.name.toLowerCase().includes(query.toLowerCase())
      );
      
      setSearchResults(filtered);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleInputChange('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const addTeamMember = (user) => {
    const member = {
      username: user.username,
      name: user.name,
      role: newTeamMember.role,
      avatar: user.avatar
    };
    
    if (!formData.teamMembers.find(m => m.username === user.username)) {
      handleInputChange('teamMembers', [...formData.teamMembers, member]);
      setNewTeamMember({ username: '', role: 'Member' });
      setSearchResults([]);
    }
  };

  const removeTeamMember = (username) => {
    handleInputChange('teamMembers', formData.teamMembers.filter(m => m.username !== username));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Creating project:', formData);
      
      // Redirect to project dashboard
      window.location.href = '/projects';
    } catch (error) {
      console.error('Project creation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    window.location.href = '/projects';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <span className="text-xl">←</span>
            </button>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Create New Project</h1>
              <p className="text-gray-600">Set up your project for assessment and tracking</p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  step >= stepNumber 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-20 h-1 mx-2 transition-all duration-300 ${
                    step > stepNumber ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Labels */}
          <div className="flex justify-between text-sm text-gray-600 mb-8 max-w-md mx-auto">
            <span className={step >= 1 ? 'text-blue-600 font-medium' : ''}>Project Details</span>
            <span className={step >= 2 ? 'text-blue-600 font-medium' : ''}>Timeline & Budget</span>
            <span className={step >= 3 ? 'text-blue-600 font-medium' : ''}>Team & Review</span>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          
          {/* Step 1: Project Details */}
          {step === 1 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Project Details</h2>
                <p className="text-gray-600">Let's start with the basic information about your project</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Project Name */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 ${
                      errors.name 
                        ? 'border-red-300 focus:ring-red-200' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                    placeholder="e.g., E-Commerce Platform Redesign"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-2">{errors.name}</p>
                  )}
                </div>

                {/* Project Description */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Project Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 ${
                      errors.description 
                        ? 'border-red-300 focus:ring-red-200' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                    placeholder="Describe your project goals, scope, and expected outcomes..."
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-2">{errors.description}</p>
                  )}
                </div>

                {/* Project Phase */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Project Phase *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {phases.map((phase) => (
                      <label
                        key={phase.value}
                        className={`relative cursor-pointer p-4 border-2 rounded-xl transition-all duration-300 ${
                          formData.phase === phase.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="phase"
                          value={phase.value}
                          checked={formData.phase === phase.value}
                          onChange={(e) => handleInputChange('phase', e.target.value)}
                          className="sr-only"
                        />
                        <div className="text-center">
                          <div className="text-2xl mb-2">{phase.icon}</div>
                          <div className="font-semibold text-gray-900 text-sm">{phase.value}</div>
                          <div className="text-xs text-gray-500 mt-1">{phase.description}</div>
                        </div>
                        {formData.phase === phase.value && (
                          <div className="absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                  {errors.phase && (
                    <p className="text-red-500 text-sm mt-2">{errors.phase}</p>
                  )}
                </div>

                {/* Priority */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Project Priority
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {priorities.map((priority) => (
                      <label
                        key={priority.value}
                        className={`relative cursor-pointer p-4 border-2 rounded-xl transition-all duration-300 ${
                          formData.priority === priority.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="priority"
                          value={priority.value}
                          checked={formData.priority === priority.value}
                          onChange={(e) => handleInputChange('priority', e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${priority.color} flex items-center justify-center text-white text-xl`}>
                            {priority.icon}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">{priority.value}</div>
                            <div className="text-xs text-gray-500">{priority.description}</div>
                          </div>
                        </div>
                        {formData.priority === priority.value && (
                          <div className="absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleNext}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Next Step →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Timeline & Budget */}
          {step === 2 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Timeline & Budget</h2>
                <p className="text-gray-600">Set up project timelines and budget constraints</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Start Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl text-gray-900 focus:outline-none focus:ring-2 transition-all duration-300 ${
                      errors.startDate 
                        ? 'border-red-300 focus:ring-red-200' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-sm mt-2">{errors.startDate}</p>
                  )}
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    min={formData.startDate}
                    className={`w-full px-4 py-3 border rounded-xl text-gray-900 focus:outline-none focus:ring-2 transition-all duration-300 ${
                      errors.endDate 
                        ? 'border-red-300 focus:ring-red-200' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                  />
                  {errors.endDate && (
                    <p className="text-red-500 text-sm mt-2">{errors.endDate}</p>
                  )}
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Budget (USD)
                  </label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 ${
                      errors.budget 
                        ? 'border-red-300 focus:ring-red-200' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                    placeholder="e.g., 50000"
                  />
                  {errors.budget && (
                    <p className="text-red-500 text-sm mt-2">{errors.budget}</p>
                  )}
                </div>

                {/* Manager Username */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Project Manager Username
                  </label>
                  <input
                    type="text"
                    value={formData.managerUsername}
                    onChange={(e) => {
                      handleInputChange('managerUsername', e.target.value);
                      searchUsers(e.target.value);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                    placeholder="Search by username..."
                  />
                  
                  {isSearching && (
                    <div className="mt-2 text-sm text-blue-600">Searching users...</div>
                  )}
                  
                  {searchResults.length > 0 && formData.managerUsername && (
                    <div className="mt-2 border border-gray-200 rounded-xl max-h-40 overflow-y-auto">
                      {searchResults.map((user) => (
                        <div
                          key={user.username}
                          onClick={() => {
                            handleInputChange('managerUsername', user.username);
                            setSearchResults([]);
                          }}
                          className="p-3 hover:bg-gray-50 cursor-pointer flex items-center space-x-3"
                        >
                          <span className="text-xl">{user.avatar}</span>
                          <div>
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">@{user.username}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Project Objectives */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Project Objectives
                  </label>
                  <textarea
                    value={formData.objectives}
                    onChange={(e) => handleInputChange('objectives', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                    placeholder="What are the main objectives of this project?"
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handleBack}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 transition-all duration-200"
                >
                  ← Previous
                </button>
                <button
                  onClick={handleNext}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Next Step →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Team & Review */}
          {step === 3 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Team & Review</h2>
                <p className="text-gray-600">Add team members and review your project details</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Tags */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Project Tags
                  </label>
                  <div className="flex space-x-2 mb-3">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                      placeholder="Add a tag..."
                    />
                    <button
                      onClick={addTag}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center space-x-2"
                      >
                        <span>{tag}</span>
                        <button
                          onClick={() => removeTag(tag)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Team Members */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Team Members
                  </label>
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newTeamMember.username}
                        onChange={(e) => {
                          setNewTeamMember(prev => ({ ...prev, username: e.target.value }));
                          searchUsers(e.target.value);
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                        placeholder="Search username..."
                      />
                      <select
                        value={newTeamMember.role}
                        onChange={(e) => setNewTeamMember(prev => ({ ...prev, role: e.target.value }))}
                        className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                      >
                        {teamRoles.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.value}
                          </option>
                        ))}
                      </select>
                    </div>

                    {searchResults.length > 0 && newTeamMember.username && (
                      <div className="border border-gray-200 rounded-xl max-h-32 overflow-y-auto">
                        {searchResults.map((user) => (
                          <div
                            key={user.username}
                            onClick={() => addTeamMember(user)}
                            className="p-3 hover:bg-gray-50 cursor-pointer flex items-center space-x-3"
                          >
                            <span className="text-xl">{user.avatar}</span>
                            <div>
                              <div className="font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">@{user.username}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Added Team Members */}
                    <div className="space-y-2">
                      {formData.teamMembers.map((member, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-xl">{member.avatar}</span>
                            <div>
                              <div className="font-medium text-gray-900">{member.name}</div>
                              <div className="text-sm text-gray-500">@{member.username} • {member.role}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => removeTeamMember(member.username)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Project Summary */}
                <div className="lg:col-span-2">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Project Summary</h3>
                  <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Name:</span>
                        <span className="ml-2 text-gray-900">{formData.name}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Phase:</span>
                        <span className="ml-2 text-gray-900">{formData.phase}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Priority:</span>
                        <span className="ml-2 text-gray-900">{formData.priority}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Start Date:</span>
                        <span className="ml-2 text-gray-900">{formData.startDate}</span>
                      </div>
                      {formData.endDate && (
                        <div>
                          <span className="font-medium text-gray-700">End Date:</span>
                          <span className="ml-2 text-gray-900">{formData.endDate}</span>
                        </div>
                      )}
                      {formData.budget && (
                        <div>
                          <span className="font-medium text-gray-700">Budget:</span>
                          <span className="ml-2 text-gray-900">${parseInt(formData.budget).toLocaleString()}</span>
                        </div>
                      )}
                      {formData.managerUsername && (
                        <div>
                          <span className="font-medium text-gray-700">Manager:</span>
                          <span className="ml-2 text-gray-900">@{formData.managerUsername}</span>
                        </div>
                      )}
                      <div>
                        <span className="font-medium text-gray-700">Team Size:</span>
                        <span className="ml-2 text-gray-900">{formData.teamMembers.length} members</span>
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-700">Description:</span>
                      <p className="mt-1 text-gray-900">{formData.description}</p>
                    </div>

                    {formData.objectives && (
                      <div>
                        <span className="font-medium text-gray-700">Objectives:</span>
                        <p className="mt-1 text-gray-900">{formData.objectives}</p>
                      </div>
                    )}

                    {formData.tags.length > 0 && (
                      <div>
                        <span className="font-medium text-gray-700">Tags:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {formData.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handleBack}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 transition-all duration-200"
                >
                  ← Previous
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating Project...</span>
                    </div>
                  ) : (
                    'Create Project ✨'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateProject;