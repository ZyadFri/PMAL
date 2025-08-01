import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const DeepAssessment = () => {
  const [assessment, setAssessment] = useState(null);
  const [structure, setStructure] = useState(null);
  const [progress, setProgress] = useState(null);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [activeTab, setActiveTab] = useState('assessment');
  const [selectedModule, setSelectedModule] = useState('PM');
  const [selectedPhase, setSelectedPhase] = useState('IRL1');
  const [selectedFamily, setSelectedFamily] = useState('Gouvernance_Pilotage');

  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const modules = [
    { code: 'PM', name: 'Project Management', icon: '📊', color: 'blue' },
    { code: 'Engineering', name: 'Ingénierie', icon: '⚙️', color: 'green' },
    { code: 'HSE', name: 'HSE', icon: '🛡️', color: 'red' },
    { code: 'O&M_DOI', name: 'O&M / DOI', icon: '🔧', color: 'purple' }
  ];

  const phases = [
    { code: 'IRL1', name: 'Observation des principes de base', level: 1 },
    { code: 'IRL2', name: 'Formulation du concept technologique', level: 2 },
    { code: 'IRL3', name: 'Preuve de concept analytique', level: 3 },
    { code: 'IRL4', name: 'Validation en laboratoire', level: 4 },
    { code: 'IRL5', name: 'Validation en environnement représentatif', level: 5 },
    { code: 'IRL6', name: 'Démonstration en environnement opérationnel', level: 6 }
  ];

  const questionFamilies = [
    { code: 'Gouvernance_Pilotage', name: 'Gouvernance & Pilotage', icon: '👥' },
    { code: 'Livrables_Structurants', name: 'Livrables Structurants', icon: '📋' },
    { code: 'Methodologie_Process', name: 'Méthodologie / Process', icon: '🔄' },
    { code: 'Outils_Digital', name: 'Outils et Digital', icon: '💻' },
    { code: 'Risques_Conformite', name: 'Risques et Conformité', icon: '⚠️' },
    { code: 'Module_Specifique', name: 'Spécifique au Module', icon: '🎯' }
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (projectId) {
      startAssessment();
    }
  }, [projectId, isAuthenticated, navigate]);

  useEffect(() => {
    if (startTime) {
      const interval = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime]);

  const startAssessment = async () => {
    try {
      setIsLoading(true);
      setError('');

      console.log('🚀 Starting deep assessment...');

      const response = await api.post('/assessments', {
        projectId,
        type: 'deep',
        module: selectedModule,
        irlPhase: selectedPhase
      });

      if (response.data.success) {
        console.log('✅ Assessment started successfully');
        setAssessment(response.data.data.assessment);
        setStructure(response.data.data.structure);
        setCurrentQuestions(response.data.data.questions || []);
        setStartTime(Date.now());
        
        // Set initial selection from assessment
        if (response.data.data.assessment.deepAssessmentProgress) {
          const progress = response.data.data.assessment.deepAssessmentProgress;
          setSelectedModule(progress.currentModule);
          setSelectedPhase(progress.currentIrlPhase);
          setSelectedFamily(progress.currentQuestionFamily);
        }
        
        // Load existing answers if any
        if (response.data.data.assessment.answers && response.data.data.assessment.answers.length > 0) {
          const existingAnswers = {};
          response.data.data.assessment.answers.forEach(answer => {
            existingAnswers[answer.question] = answer.selectedOption;
          });
          setAnswers(existingAnswers);
        }

        // Load progress
        await loadProgress(response.data.data.assessment._id);
      } else {
        setError('Failed to start deep assessment');
      }
    } catch (err) {
      console.error('❌ Error starting assessment:', err);
      setError(err.response?.data?.message || 'Failed to start deep assessment');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProgress = async (assessmentId) => {
    try {
      console.log('📊 Loading progress...');
      const response = await api.get(`/assessments/${assessmentId}/progress`);
      if (response.data.success) {
        setProgress(response.data.data.progress);
        console.log('✅ Progress loaded successfully');
      }
    } catch (err) {
      console.error('❌ Error loading progress:', err);
      // Don't set error state for progress loading failure
    }
  };

  const handleAnswerSelect = (option) => {
    const currentQuestion = currentQuestions[currentQuestionIndex];
    if (currentQuestion) {
      setAnswers(prev => ({
        ...prev,
        [currentQuestion._id]: option
      }));
    }
  };

  const submitAnswer = async () => {
    try {
      setIsSubmitting(true);
      setError('');
      
      const currentQuestion = currentQuestions[currentQuestionIndex];
      if (!currentQuestion) {
        setError('No current question found');
        return;
      }

      const selectedAnswer = answers[currentQuestion._id];
      if (!selectedAnswer) {
        setError('Please select an answer before continuing');
        return;
      }

      console.log('📝 Submitting answer...');

      const response = await api.post(`/assessments/${assessment._id}/answers`, {
        questionId: currentQuestion._id,
        selectedOption: selectedAnswer,
        timeSpent: timeSpent
      });

      if (response.data.success) {
        console.log('✅ Answer submitted successfully');
        setAssessment(response.data.data.assessment);
        
        // Move to next question or get next questions
        if (response.data.data.nextQuestions && response.data.data.nextQuestions.length > 0) {
          setCurrentQuestions(response.data.data.nextQuestions);
          setCurrentQuestionIndex(0);
        } else if (currentQuestionIndex < currentQuestions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
        } else {
          // No more questions in current family, show completion message
          setCurrentQuestions([]);
          setCurrentQuestionIndex(0);
        }

        // Reload progress
        await loadProgress(assessment._id);
        setStartTime(Date.now());
        setTimeSpent(0);
      }
    } catch (err) {
      console.error('❌ Error submitting answer:', err);
      setError(err.response?.data?.message || 'Failed to submit answer');
    } finally {
      setIsSubmitting(false);
    }
  };

const navigateToModulePhase = async (module, phase, family) => {
  try {
    setIsLoading(true);
    setError('');
    
    console.log(`🧭 Navigating to ${module}-${phase}-${family}...`);
    
    const response = await api.put(`/assessments/${assessment._id}/navigate`, {
      module,
      irlPhase: phase,
      questionFamily: family
    });

    if (response.data.success) {
      console.log('✅ Navigation successful');
      setSelectedModule(module);
      setSelectedPhase(phase);
      setSelectedFamily(family);
      setCurrentQuestions(response.data.data.questions || []);
      setCurrentQuestionIndex(0);
      setStartTime(Date.now());
      setTimeSpent(0);
      setActiveTab('assessment'); // Switch to assessment tab
      
      // Load progress in background (don't wait for it)
      loadProgress(assessment._id).catch(console.error);
    }
  } catch (err) {
    console.error('❌ Error navigating:', err);
    setError(err.response?.data?.message || 'Failed to navigate');
  } finally {
    setIsLoading(false);
  }
};

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getModuleColor = (moduleCode) => {
    const module = modules.find(m => m.code === moduleCode);
    return module ? module.color : 'gray';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl font-bold text-white">🔍</span>
          </div>
          <div className="text-gray-600">Loading Deep Assessment...</div>
        </div>
      </div>
    );
  }

  if (error && !assessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl text-red-600">!</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Assessment Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(`/projects/${projectId}`)}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
          >
            Back to Project
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Deep Assessment</h1>
              <p className="text-gray-600">{assessment?.project?.name}</p>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-600">Time: {formatTime(timeSpent)}</div>
              {progress && (
                <div className="text-sm text-gray-600">
                  Progress: {progress.overallProgress.answeredQuestions} / {progress.overallProgress.totalQuestions} questions
                </div>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('assessment')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'assessment'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Assessment
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'progress'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Progress Overview
            </button>
            <button
              onClick={() => setActiveTab('navigation')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'navigation'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Navigation
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === 'assessment' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center">
                  <span className="text-red-500 mr-2">⚠️</span>
                  <span className="text-red-700">{error}</span>
                </div>
              </div>
            )}

            {/* Current Context */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-sm">
                    <span className="font-medium text-blue-900">Module:</span>
                    <span className="ml-1 text-blue-700">{modules.find(m => m.code === selectedModule)?.name}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-blue-900">Phase:</span>
                    <span className="ml-1 text-blue-700">{selectedPhase}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-blue-900">Family:</span>
                    <span className="ml-1 text-blue-700">{questionFamilies.find(f => f.code === selectedFamily)?.name}</span>
                  </div>
                </div>
                <div className="text-sm text-blue-600">
                  Question {currentQuestionIndex + 1} of {currentQuestions.length}
                </div>
              </div>
            </div>

            {/* Current Question */}
            {currentQuestions.length > 0 && currentQuestions[currentQuestionIndex] && (
              <>
                <div className="mb-8">
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-2xl font-semibold text-gray-900 flex-1 mr-4">
                      {currentQuestions[currentQuestionIndex].text}
                    </h2>
                    {currentQuestions[currentQuestionIndex].criticality && (
                      <div className="flex-shrink-0">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          currentQuestions[currentQuestionIndex].criticality === 3
                            ? 'bg-red-100 text-red-800'
                            : currentQuestions[currentQuestionIndex].criticality === 2
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          Criticité: {currentQuestions[currentQuestionIndex].criticalityLabel || 'Élevée'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {currentQuestions[currentQuestionIndex].description && (
                    <p className="text-gray-600 mb-6">{currentQuestions[currentQuestionIndex].description}</p>
                  )}
                </div>

                {/* Answer Options */}
                <div className="space-y-4 mb-8">
                  {currentQuestions[currentQuestionIndex].options.map((option, index) => (
                    <label
                      key={index}
                      className={`block p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        answers[currentQuestions[currentQuestionIndex]._id]?.text === option.text
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestions[currentQuestionIndex]._id}`}
                        value={option.text}
                        checked={answers[currentQuestions[currentQuestionIndex]._id]?.text === option.text}
                        onChange={() => handleAnswerSelect({
                          _id: option._id,
                          text: option.text,
                          value: option.value
                        })}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-gray-900">{option.text}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">({option.value} pts)</span>
                          {answers[currentQuestions[currentQuestionIndex]._id]?.text === option.text && (
                            <span className="text-blue-500">✓</span>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <button
                    onClick={submitAnswer}
                    disabled={isSubmitting || !answers[currentQuestions[currentQuestionIndex]._id]}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Submitting...</span>
                      </div>
                    ) : currentQuestionIndex === currentQuestions.length - 1 ? (
                      'Submit Answer'
                    ) : (
                      'Next Question'
                    )}
                  </button>
                </div>
              </>
            )}

            {/* No Questions Available */}
            {currentQuestions.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Section Complete!</h3>
                <p className="text-gray-600 mb-6">
                  You've completed all questions in this section. Use the Navigation tab to move to another section.
                </p>
                <button
                  onClick={() => setActiveTab('navigation')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
                >
                  Go to Navigation
                </button>
              </div>
            )}
          </div>
        )}

  {activeTab === 'progress' && progress && (
  <div className="space-y-6">
    {/* Overall Progress */}
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      <h3 className="text-2xl font-semibold text-gray-900 mb-6">Overall Progress</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">
            {progress.overallProgress.completedModules}
          </div>
          <div className="text-gray-600">Modules Completed</div>
          <div className="text-sm text-gray-500">
            / {progress.overallProgress.totalModules}
          </div>
        </div>
                
                 <div className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {progress.overallProgress.completedPhases}
          </div>
          <div className="text-gray-600">Phases Completed</div>
          <div className="text-sm text-gray-500">
            / {progress.overallProgress.totalPhases}
          </div>
        </div>
                
                <div className="text-center">
          <div className="text-3xl font-bold text-purple-600">
            {progress.overallProgress.answeredQuestions}
          </div>
          <div className="text-gray-600">Questions Answered</div>
          <div className="text-sm text-gray-500">
            / {progress.overallProgress.totalQuestions}
          </div>
        </div>
                
               <div className="text-center">
          <div className="text-3xl font-bold text-orange-600">
            {progress.overallProgress.totalQuestions > 0 
              ? Math.round((progress.overallProgress.answeredQuestions / progress.overallProgress.totalQuestions) * 100)
              : 0
            }%
          </div>
          <div className="text-gray-600">Completion</div>
        </div>
      </div>

            {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div 
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-300"
          style={{ 
            width: `${progress.overallProgress.totalQuestions > 0 
              ? (progress.overallProgress.answeredQuestions / progress.overallProgress.totalQuestions) * 100 
              : 0}%` 
          }}
        />
      </div>
    </div>
           {/* Module Progress */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {modules.map(module => {
        const moduleProgress = progress.moduleProgress[module];
        if (!moduleProgress) return null;

        return (
          <div key={module.code} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-3">{module.icon}</span>
              <div>
                <h4 className="text-xl font-semibold text-gray-900">{module.name}</h4>
                <div className="text-sm text-gray-600">
                  Score: {moduleProgress.score.toFixed(1)} | 
                  {moduleProgress.answeredQuestions} / {moduleProgress.totalQuestions} questions
                </div>
              </div>
            </div>

                               <div className="space-y-3">
              {phases.map(phase => {
                const phaseProgress = moduleProgress.phases[phase.code];
                if (!phaseProgress) return null;

                // Show current family progress if this is the active module/phase
                const isCurrentModulePhase = selectedModule === module.code && selectedPhase === phase.code;
                let displayText = `${phaseProgress.questionsAnswered} / ${phaseProgress.questionsTotal}`;
                
                if (isCurrentModulePhase) {
                  // Count questions in current family for more granular progress
                  const currentFamilyAnswers = assessment?.answers?.filter(a => 
                    a.module === module.code && 
                    a.irlPhase === phase.code && 
                    a.questionFamily === selectedFamily
                  ) || [];
                  
                  displayText += ` (Current family: ${currentFamilyAnswers.length} answered)`;
                }

                return (
                  <div key={phase.code} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        phaseProgress.completed ? 'bg-green-500' : 
                        phaseProgress.unlocked ? 'bg-blue-500' : 'bg-gray-300'
                      }`} />
                      <span className="font-medium text-gray-900">{phase.code}</span>
                      {isCurrentModulePhase && (
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                            
                           <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600">
                        {displayText}
                      </span>
                      <span className={`text-sm px-2 py-1 rounded ${
                        phaseProgress.canProgress ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {phaseProgress.score.toFixed(1)}
                      </span>
                      {!phaseProgress.unlocked && (
                        <span className="text-sm text-gray-400">🔒</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
          </div>
        )}

        {activeTab === 'navigation' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Assessment Navigation</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Module Selection */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Select Module</h4>
                <div className="space-y-2">
                  {modules.map(module => (
                    <button
                      key={module.code}
                      onClick={() => setSelectedModule(module.code)}
                      className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                        selectedModule === module.code
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{module.icon}</span>
                        <div>
                          <div className="font-medium text-gray-900">{module.name}</div>
                          {progress?.moduleProgress[module.code] && (
                            <div className="text-sm text-gray-600">
                              {progress.moduleProgress[module.code].answeredQuestions} / {progress.moduleProgress[module.code].totalQuestions} questions
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Phase Selection */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Select IRL Phase</h4>
                <div className="space-y-2">
                  {phases.map(phase => {
                    const isUnlocked = progress?.moduleProgress[selectedModule]?.phases[phase.code]?.unlocked || phase.code === 'IRL1';
                    
                    return (
                      <button
                        key={phase.code}
                        onClick={() => setSelectedPhase(phase.code)}
                        disabled={!isUnlocked}
                        className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                          selectedPhase === phase.code
                            ? 'border-blue-500 bg-blue-50'
                            : isUnlocked
                            ? 'border-gray-200 hover:border-gray-300'
                            : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{phase.code}</div>
                            <div className="text-sm text-gray-600">{phase.name}</div>
                          </div>
                          {!isUnlocked && <span className="text-sm text-gray-400">🔒</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question Family Selection */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Select Question Family</h4>
                <div className="space-y-2">
                  {questionFamilies.map(family => (
                    <button
                      key={family.code}
                      onClick={() => setSelectedFamily(family.code)}
                      className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                        selectedFamily === family.code
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="text-xl mr-3">{family.icon}</span>
                        <div className="font-medium text-gray-900">{family.name}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Navigate Button */}
            <div className="mt-8 text-center">
              <button
onClick={() => navigateToModulePhase(selectedModule, selectedPhase, selectedFamily)}
               disabled={isLoading}
               className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
             >
               {isLoading ? (
                 <div className="flex items-center space-x-2">
                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                   <span>Navigating...</span>
                 </div>
               ) : (
                 `Navigate to ${selectedModule} - ${selectedPhase} - ${questionFamilies.find(f => f.code === selectedFamily)?.name}`
               )}
             </button>
           </div>
         </div>
       )}
     </div>
   </div>
 );
};

export default DeepAssessment;