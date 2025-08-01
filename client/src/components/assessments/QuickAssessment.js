import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const QuickAssessment = () => {
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);

  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

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
    // Timer for tracking time spent on current question
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

      const response = await api.post('/assessments', {
        projectId,
        type: 'quick'
      });

      if (response.data.success) {
        setAssessment(response.data.data.assessment);
        setQuestions(response.data.data.questions);
        setStartTime(Date.now());
        
        // If there are existing answers, load them
        if (response.data.data.assessment.answers && response.data.data.assessment.answers.length > 0) {
          const existingAnswers = {};
          response.data.data.assessment.answers.forEach(answer => {
            existingAnswers[answer.question] = answer.selectedOption;
          });
          setAnswers(existingAnswers);
          setCurrentQuestionIndex(response.data.data.assessment.answers.length);
        }
      } else {
        setError('Failed to start assessment');
      }
    } catch (err) {
      console.error('Error starting assessment:', err);
      setError(err.response?.data?.message || 'Failed to start assessment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (option) => {
    const currentQuestion = questions[currentQuestionIndex];
    setAnswers(prev => ({
      ...prev,
      [currentQuestion._id]: option
    }));
  };

const submitAnswer = async () => {
  try {
    setIsSubmitting(true);
    setError('');
    
    // Check if assessment exists
    if (!assessment || !assessment._id) {
      setError('Assessment not found. Please restart the assessment.');
      return;
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    const selectedAnswer = answers[currentQuestion._id];

    if (!selectedAnswer) {
      setError('Please select an answer before continuing');
      return;
    }

    console.log(`📝 Submitting answer for question ${currentQuestionIndex + 1}/${questions.length}`);
    console.log('📋 Current assessment status:', assessment.status);
    console.log('📋 Assessment ID:', assessment._id);

    const response = await api.post(`/assessments/${assessment._id}/answers`, {
      questionId: currentQuestion._id,
      selectedOption: selectedAnswer,
      timeSpent: timeSpent
    });

    console.log('✅ Answer submitted successfully');
    console.log('📊 Backend response structure:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      // Update assessment state with the returned data
      if (response.data.data?.assessment) {
        console.log('🔄 Updating assessment state with backend data');
        setAssessment(response.data.data.assessment);
      }
      
      // Check completion status with more detailed logging
      const isLastQuestion = currentQuestionIndex >= questions.length - 1;
      const backendSaysComplete = response.data.data?.isComplete === true;
      const noMoreQuestions = !response.data.data?.nextQuestions || response.data.data.nextQuestions.length === 0;
      const assessmentStatusCompleted = response.data.data?.assessment?.status === 'completed';
      const hasResults = response.data.data?.assessment?.overallScore !== undefined;
      
      console.log(`🔍 Detailed assessment status check:`, {
        isLastQuestion,
        backendSaysComplete,
        noMoreQuestions,
        assessmentStatusCompleted,
        hasResults,
        currentIndex: currentQuestionIndex,
        totalQuestions: questions.length,
        nextQuestionsCount: response.data.data?.nextQuestions?.length || 0,
        assessmentStatus: response.data.data?.assessment?.status,
        overallScore: response.data.data?.assessment?.overallScore
      });

      // If backend already completed it and has results, show them directly
      if (assessmentStatusCompleted && hasResults) {
        console.log('📊 Assessment already completed by backend with results');
        setResults(response.data.data.assessment);
        setShowResults(true);
        return;
      }

      // Check if we should complete the assessment
      const shouldComplete = backendSaysComplete || (isLastQuestion && noMoreQuestions);
      
      if (shouldComplete) {
        console.log('🎯 Assessment should be completed! Finalizing...');
        
        // If the backend already marked it as complete but we don't have results,
        // we still need to call complete to get the results
        if (assessmentStatusCompleted && !hasResults) {
          console.log('⚠️ Assessment marked complete but no results, calling complete endpoint');
        }
        
        await completeAssessment();
        return;
      }

      // Continue to next question
      if (currentQuestionIndex < questions.length - 1) {
        console.log('➡️ Moving to next question');
        setCurrentQuestionIndex(prev => prev + 1);
        setStartTime(Date.now());
        setTimeSpent(0);
      } else {
        console.warn('⚠️ Reached end of questions but assessment not marked complete');
        console.log('🔧 Force completing assessment...');
        await completeAssessment();
      }
    } else {
      console.error('❌ Backend returned success: false');
      setError(response.data.message || 'Failed to submit answer');
    }
  } catch (err) {
    console.error('❌ Error submitting answer:', err);
    console.error('❌ Error response data:', err.response?.data);
    setError(err.response?.data?.message || 'Failed to submit answer');
  } finally {
    setIsSubmitting(false);
  }
};
const completeAssessment = async () => {
  try {
    console.log('🎯 Completing assessment...');
    
    // Check if assessment exists
    if (!assessment || !assessment._id) {
      console.error('❌ No assessment ID available');
      setError('Assessment not found. Please restart the assessment.');
      return;
    }
    
    console.log('📤 Making request to complete assessment with ID:', assessment._id);
    
    const response = await api.put(`/assessments/${assessment._id}/complete`);
    
    console.log('📡 Complete assessment response:', response.data);
    console.log('📊 Full response structure:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('✅ Assessment completed successfully');
      
      // Try different possible response structures
      let completedAssessment = null;
      
      // Option 1: response.data.data.assessment
      if (response.data.data?.assessment) {
        completedAssessment = response.data.data.assessment;
        console.log('📋 Found assessment in data.assessment');
      }
      // Option 2: response.data.assessment
      else if (response.data.assessment) {
        completedAssessment = response.data.assessment;
        console.log('📋 Found assessment in direct assessment field');
      }
      // Option 3: response.data.data (if the assessment is directly in data)
      else if (response.data.data && typeof response.data.data === 'object' && response.data.data.overallScore !== undefined) {
        completedAssessment = response.data.data;
        console.log('📋 Found assessment data directly in data field');
      }
      // Option 4: Use current assessment with updated status
      else if (assessment) {
        console.log('⚠️ No assessment in response, using current assessment with completed status');
        completedAssessment = {
          ...assessment,
          status: 'completed',
          completedAt: new Date(),
          // Add mock data if needed for display
          overallScore: 0,
          categoryScores: [],
          feedback: {
            summary: 'Assessment completed successfully.',
            strengths: [],
            improvements: [],
            nextSteps: []
          }
        };
      }
      
      if (completedAssessment) {
        console.log('📊 Using assessment data:', completedAssessment);
        setResults(completedAssessment);
        setShowResults(true);
      } else {
        console.error('❌ No valid assessment data found anywhere in response');
        console.error('Response structure:', {
          hasData: !!response.data.data,
          hasAssessment: !!response.data.assessment,
          dataKeys: response.data.data ? Object.keys(response.data.data) : [],
          responseKeys: Object.keys(response.data)
        });
        
        // Try to fetch the assessment separately
        console.log('🔄 Attempting to fetch assessment separately...');
        try {
          const fetchResponse = await api.get(`/assessments/${assessment._id}`);
          if (fetchResponse.data.success && fetchResponse.data.data) {
            console.log('✅ Successfully fetched assessment separately');
            setResults(fetchResponse.data.data);
            setShowResults(true);
            return;
          }
        } catch (fetchError) {
          console.error('❌ Failed to fetch assessment separately:', fetchError);
        }
        
        setError('Assessment completed but unable to retrieve results. Please check your project dashboard.');
      }
    } else {
      console.error('❌ Complete assessment failed:', response.data.message);
      setError(response.data.message || 'Failed to complete assessment');
    }
  } catch (err) {
    console.error('❌ Error completing assessment:', err);
    console.error('Error response:', err.response?.data);
    
    // Provide more specific error messages
    if (err.response?.status === 404) {
      setError('Assessment not found. It may have been deleted or completed already.');
    } else if (err.response?.status === 400) {
      setError('Assessment cannot be completed. Please check if all questions are answered.');
    } else {
      setError(err.response?.data?.message || 'Failed to complete assessment. Please try again.');
    }
  }
};

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setStartTime(Date.now());
      setTimeSpent(0);
    }
  };

  const getMaturityLevel = (score) => {
    if (score >= 2.4) return { level: 'M3', label: 'Maturité élevée / projet bien structuré', color: 'bg-green-500' };
    if (score >= 1.7) return { level: 'M2', label: 'Maturité moyenne', color: 'bg-yellow-500' };
    return { level: 'M1', label: 'Maturité très faible', color: 'bg-red-500' };
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl font-bold text-white">📊</span>
          </div>
          <div className="text-gray-600">Starting your assessment...</div>
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
          <div className="space-y-4">
            <button
              onClick={() => {
                setError('');
                startAssessment();
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 mr-4"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate(`/projects/${projectId}`)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
            >
              Back to Project
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResults && results) {
    const maturity = getMaturityLevel(results.overallScore);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✓</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Assessment Complete!</h1>
              <p className="text-gray-600">Your Quick Assessment has been successfully completed</p>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Overall Score */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Overall Score</h3>
              
              <div className="text-center mb-6">
                <div className="text-6xl font-bold text-blue-600 mb-2">
                  {results.overallScore?.toFixed(1) || 'N/A'}
                </div>
                <div className="text-lg text-gray-600">out of 3.0</div>
              </div>

              <div className={`${maturity.color} text-white rounded-xl p-4 text-center mb-6`}>
                <div className="text-xl font-bold">{maturity.level}</div>
                <div className="text-sm">{maturity.label}</div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Questions Answered</span>
                  <span className="font-medium">{results.metadata?.questionsAnswered || 0} / {results.metadata?.questionsTotal || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{results.totalDuration || 0} minutes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completion</span>
                  <span className="font-medium">{results.completedAt ? new Date(results.completedAt).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Category Breakdown</h3>
              
              <div className="space-y-4">
                {(results.categoryScores || []).map((categoryScore, index) => (
                  <div key={index} className="border-b border-gray-100 pb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900">
                        {categoryScore.category?.name || 'Category'}
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        {categoryScore.questionsAnswered > 0 ? (categoryScore.score / categoryScore.questionsAnswered).toFixed(1) : '0.0'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${categoryScore.maxPossibleScore > 0 ? (categoryScore.score / categoryScore.maxPossibleScore) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {categoryScore.questionsAnswered} questions answered
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          {results.feedback && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mt-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Assessment Summary</h3>
              
              <div className="prose max-w-none">
                {results.feedback.summary && (
                  <p className="text-gray-700 mb-4">{results.feedback.summary}</p>
                )}
                
                {results.feedback.strengths && results.feedback.strengths.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-green-700 mb-2">Strengths:</h4>
                    <ul className="list-disc list-inside text-gray-700">
                      {results.feedback.strengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {results.feedback.improvements && results.feedback.improvements.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-red-700 mb-2">Areas for Improvement:</h4>
                    <ul className="list-disc list-inside text-gray-700">
                      {results.feedback.improvements.map((improvement, index) => (
                        <li key={index}>{improvement}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {results.feedback.nextSteps && results.feedback.nextSteps.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-blue-700 mb-2">Next Steps:</h4>
                    <ul className="list-disc list-inside text-gray-700">
                      {results.feedback.nextSteps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-center space-x-4 mt-8">
            <button
  onClick={() => navigate(`/projects/${projectId}`, { state: { refresh: true } })}
  className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors duration-200"
>
  Back to Project
</button>
            <button
              onClick={() => navigate('/projects')}
              className="px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors duration-200"
            >
              All Projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Don't render the assessment form if we don't have assessment or questions
  if (!assessment || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl font-bold text-white">📊</span>
          </div>
          <div className="text-gray-600">Loading assessment questions...</div>
        </div>
      </div>
    );
  }

  // Assessment in progress
  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl text-yellow-600">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Question Not Found</h2>
          <p className="text-gray-600 mb-6">Unable to load the current question.</p>
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

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quick Assessment</h1>
              <p className="text-gray-600">{assessment?.project?.name || 'Project Assessment'}</p>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-600">Question {currentQuestionIndex + 1} of {questions.length}</div>
              <div className="text-sm text-gray-600">Time: {formatTime(timeSpent)}</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center">
                <span className="text-red-500 mr-2">⚠️</span>
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {currentQuestion.text}
            </h2>
            
            {currentQuestion.description && (
              <p className="text-gray-600 mb-6">{currentQuestion.description}</p>
            )}
          </div>

          {/* Answer Options */}
          <div className="space-y-4 mb-8">
            {currentQuestion.options?.map((option) => (
              <label
                key={option._id}
                className={`block p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  answers[currentQuestion._id]?._id === option._id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion._id}`}
                  value={option._id}
                  checked={answers[currentQuestion._id]?._id === option._id}
                  onChange={() => handleAnswerSelect({
                    _id: option._id,
                    text: option.text,
                    value: option.value
                  })}
                  className="sr-only"
                />
                <div className="flex items-center justify-between">
                  <span className="text-gray-900">{option.text}</span>
                  {answers[currentQuestion._id]?._id === option._id && (
                    <span className="text-blue-500">✓</span>
                  )}
                </div>
              </label>
            )) || <div className="text-gray-500">No options available</div>}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <button
              onClick={submitAnswer}
              disabled={isSubmitting || !answers[currentQuestion._id]}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </div>
              ) : currentQuestionIndex === questions.length - 1 ? (
                'Complete Assessment'
              ) : (
                'Next Question'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickAssessment;