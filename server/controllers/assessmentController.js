  const { Assessment, Project, Question, Category, User } = require('../models');

  // @desc    Start new assessment (enhanced for deep assessment)
  // @route   POST /api/assessments
  // @access  Private
  const startAssessment = async (req, res) => {
    try {
      let { projectId, type, module, irlPhase } = req.body;
      const userId = req.user._id || req.user.id;

      console.log(`🚀 Starting ${type} assessment for project ${projectId}`);

      // Validate project exists and user has access
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      // Check if user has assessment permission
      const hasAccess = project.owner.toString() === userId.toString() ||
                      (project.manager && project.manager.toString() === userId.toString()) ||
                      project.team.some(member => 
                        member.user.toString() === userId.toString() && member.permissions.canAssess
                      ) ||
                      req.user.isAdmin;

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to assess this project'
        });
      }

      // For deep assessment, check if quick assessment is completed
      if (type === 'deep' && !project.quickAssessment?.isCompleted) {
        return res.status(400).json({
          success: false,
          message: 'Quick assessment must be completed before starting deep assessment'
        });
      }

      // Check if there's already an active assessment
      const existingAssessment = await Assessment.findOne({
        project: projectId,
        assessedBy: userId,
        type,
        status: 'in-progress'
      });

      if (existingAssessment) {
        console.log('📋 Found existing assessment, returning questions');
        
        // Return existing assessment with appropriate questions
        const questions = await getAssessmentQuestions(type, existingAssessment, module, irlPhase);
        
        return res.json({
          success: true,
          message: 'Existing assessment found',
          data: {
            assessment: existingAssessment,
            questions: questions,
            structure: type === 'deep' ? await getDeepAssessmentStructure() : null
          }
        });
      }

      // Get questions based on assessment type
      let questions = [];
      let assessmentStructure = null;

      if (type === 'quick') {
        questions = await getQuickAssessmentQuestions();
      } else {
        // Deep assessment - set defaults if not provided
        if (!module || !irlPhase) {
          module = 'PM';
          irlPhase = 'IRL1';
        }
        
        console.log(`🔍 Getting deep assessment questions for ${module}-${irlPhase}`);
        questions = await getDeepAssessmentQuestions(module, irlPhase, 'Gouvernance_Pilotage');
        assessmentStructure = await getDeepAssessmentStructure();
      }

      console.log(`📊 Found ${questions.length} questions for assessment`);

      // Create assessment
      const assessmentData = {
        project: projectId,
        assessedBy: userId,
        type,
        metadata: {
          questionsTotal: questions.length,
          questionsAnswered: 0,
          deviceInfo: req.headers['user-agent'],
          ipAddress: req.ip
        }
      };

      // Add deep assessment specific data
      if (type === 'deep') {
        assessmentData.deepAssessmentProgress = {
          currentModule: module,
          currentIrlPhase: irlPhase,
          currentQuestionFamily: 'Gouvernance_Pilotage',
          completedModules: [],
          unlockedPhases: [
            { module: 'PM', irlPhase: 'IRL1', unlockedAt: new Date() },
            { module: 'Engineering', irlPhase: 'IRL1', unlockedAt: new Date() },
            { module: 'HSE', irlPhase: 'IRL1', unlockedAt: new Date() },
            { module: 'O&M_DOI', irlPhase: 'IRL1', unlockedAt: new Date() }
          ],
          blockedReasons: []
        };

        assessmentData.metadata.totalModules = 4;
        assessmentData.metadata.totalPhases = 6 * 4;
        assessmentData.metadata.completedModules = 0;
        assessmentData.metadata.completedPhases = 0;
      }

      const assessment = new Assessment(assessmentData);

      if (type === 'deep') {
        if (questions.length > 0) {
          assessment.currentCategory = questions[0].category;
        }
      } else {
        const categories = await Category.find({ isActive: true }).sort({ order: 1 });
        if (categories.length > 0) {
          assessment.currentCategory = categories[0]._id;
        }
      }

      await assessment.save();

      const newStatus = type === 'quick' 
        ? 'Quick Assessment In Progress' 
        : 'Deep Assessment In Progress';
      
      await Project.findByIdAndUpdate(projectId, { status: newStatus });

      const populatedAssessment = await Assessment.findById(assessment._id)
        .populate('project', 'name phase')
        .populate('assessedBy', 'firstName lastName')
        .populate('currentCategory', 'name code color');

      console.log('✅ Assessment created successfully');

      res.status(201).json({
        success: true,
        message: 'Assessment started successfully',
        data: {
          assessment: populatedAssessment,
          questions: questions.map(q => formatQuestionForClient(q)),
          structure: assessmentStructure
        }
      });
    } catch (error) {
      console.error('Start assessment error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while starting assessment',
        error: error.message
      });
    }
  };

  // Helper function to get quick assessment questions
  const getQuickAssessmentQuestions = async () => {
    const categories = await Category.find({ isActive: true }).sort({ order: 1 });
    let questions = [];

    for (const category of categories) {
      const categoryQuestions = await Question.find({
        category: category._id,
        assessmentType: { $in: ['quick', 'both'] },
        isActive: true
      }).sort({ order: 1 }).limit(3);
      
      questions.push(...categoryQuestions);
    }

    return questions;
  };

  // Helper function to get deep assessment questions for specific module/phase
  const getDeepAssessmentQuestions = async (module, irlPhase, questionFamily = null) => {
    try {
      const query = {
        module,
        irlPhase,
        assessmentType: { $in: ['deep', 'both'] },
        isActive: true
      };

      if (questionFamily) {
        query.questionFamily = questionFamily;
      }

      const questions = await Question.find(query)
        .populate('category', 'name code color')
        .sort({ questionFamily: 1, criticality: -1, order: 1 });

      console.log(`📊 Found ${questions.length} questions for ${module}-${irlPhase}${questionFamily ? `-${questionFamily}` : ''}`);
      
      return questions;
    } catch (error) {
      console.error('Error fetching deep assessment questions:', error);
      return [];
    }
  };

  // Helper function to get deep assessment structure
  const getDeepAssessmentStructure = async () => {
    const modules = ['PM', 'Engineering', 'HSE', 'O&M_DOI'];
    const phases = ['IRL1', 'IRL2', 'IRL3', 'IRL4', 'IRL5', 'IRL6'];
    const questionFamilies = [
      'Gouvernance_Pilotage',
      'Livrables_Structurants',
      'Methodologie_Process',
      'Outils_Digital',
      'Risques_Conformite',
      'Module_Specifique'
    ];

    const structure = {};

    for (const module of modules) {
      structure[module] = {};
      
      for (const phase of phases) {
        // Only include phases that actually have questions
        const hasQuestions = await Question.countDocuments({
          module,
          irlPhase: phase,
          assessmentType: { $in: ['deep', 'both'] },
          isActive: true
        });

        if (hasQuestions > 0) {
          structure[module][phase] = {};
          
          for (const family of questionFamilies) {
            const questionCount = await Question.countDocuments({
              module,
              irlPhase: phase,
              questionFamily: family,
              assessmentType: { $in: ['deep', 'both'] },
              isActive: true
            });

            // Only include families that have questions
            if (questionCount > 0) {
              structure[module][phase][family] = {
                totalQuestions: questionCount,
                completed: false,
                unlocked: false
              };
            }
          }
        }
      }
    }

    return structure;
  };

  // Helper function to get questions for existing assessment
  const getAssessmentQuestions = async (type, assessment, module, irlPhase) => {
    if (type === 'quick') {
      return getQuickAssessmentQuestions();
    } else {
      const currentModule = module || assessment.deepAssessmentProgress?.currentModule || 'PM';
      const currentPhase = irlPhase || assessment.deepAssessmentProgress?.currentIrlPhase || 'IRL1';
      const currentFamily = assessment.deepAssessmentProgress?.currentQuestionFamily || 'Gouvernance_Pilotage';
      return getDeepAssessmentQuestions(currentModule, currentPhase, currentFamily);
    }
  };

  // Helper function to format question for client
  const formatQuestionForClient = (question) => {
    const formatted = {
      _id: question._id,
      text: question.text,
      description: question.description,
      type: question.type,
      options: question.options,
      category: question.category,
      order: question.order,
      weight: question.weight,
      difficulty: question.difficulty
    };

    if (question.module) {
      formatted.module = question.module;
      formatted.irlPhase = question.irlPhase;
      formatted.questionFamily = question.questionFamily;
      formatted.criticality = question.criticality;
      formatted.weightedMaxScore = question.weightedMaxScore;
      
      if (typeof question.getModuleLabel === 'function') {
        formatted.moduleLabel = question.getModuleLabel();
      } else {
        formatted.moduleLabel = question.module;
      }
      
      if (typeof question.getIrlPhaseLabel === 'function') {
        formatted.irlPhaseLabel = question.getIrlPhaseLabel();
      } else {
        formatted.irlPhaseLabel = question.irlPhase;
      }
      
      if (typeof question.getQuestionFamilyLabel === 'function') {
        formatted.questionFamilyLabel = question.getQuestionFamilyLabel();
      } else {
        formatted.questionFamilyLabel = question.questionFamily;
      }
      
      if (typeof question.getCriticalityLabel === 'function') {
        formatted.criticalityLabel = question.getCriticalityLabel();
      } else {
        formatted.criticalityLabel = question.criticality;
      }
    }

    return formatted;
  };

  // @desc    Submit answer to assessment
  // @route   POST /api/assessments/:id/answers
  // @access  Private
  const submitAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { questionId, selectedOption, textAnswer, timeSpent } = req.body;
    const userId = req.user._id || req.user.id;

    console.log(`📝 Submitting answer for assessment ${id}, question ${questionId}`);

    // Find assessment
    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Check if user owns this assessment
    if (assessment.assessedBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to submit answers for this assessment'
      });
    }

    // Check if assessment is still in progress
    if (assessment.status !== 'in-progress') {
      return res.status(400).json({
        success: false,
        message: 'Assessment is not in progress'
      });
    }

    // Get question details
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Calculate score based on question type and answer
    let score = 0;
    if (selectedOption && selectedOption.value !== undefined) {
      score = selectedOption.value;
    }

    // Prepare question data for deep assessment
    const questionData = {
      criticality: question.criticality || 1,
      module: question.module,
      questionFamily: question.questionFamily,
      irlPhase: question.irlPhase
    };

    // Add answer to assessment
    await assessment.addAnswer(questionId, selectedOption, textAnswer, score, timeSpent || 0, questionData);

    // *** FIX FOR BUG #1: PHASE UNLOCKING LOGIC ***
    // Check if this answer completes a phase and should unlock the next phase
    if (assessment.type === 'deep' && question.irlPhase) {
      await checkAndUnlockNextPhase(assessment, question.irlPhase);
    }

    // Get next questions
    let nextQuestions = [];
    if (assessment.type === 'deep') {
      const progress = assessment.deepAssessmentProgress;
      
      // Get remaining questions in current family
      nextQuestions = await getDeepAssessmentQuestions(
        progress.currentModule,
        progress.currentIrlPhase,
        progress.currentQuestionFamily
      );

      // Filter out already answered questions
      const answeredQuestionIds = assessment.answers.map(a => a.question.toString());
      nextQuestions = nextQuestions.filter(q => !answeredQuestionIds.includes(q._id.toString()));
    }

    const populatedAssessment = await Assessment.findById(assessment._id)
      .populate('currentCategory', 'name code color')
      .populate('completedCategories', 'name code color');

    console.log('✅ Answer submitted successfully');

    res.json({
      success: true,
      message: 'Answer submitted successfully',
      data: {
        assessment: populatedAssessment,
        progress: populatedAssessment.progressPercentage,
        isComplete: false,
        nextQuestions: nextQuestions.map(q => formatQuestionForClient(q))
      }
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting answer',
      error: error.message
    });
  }
};
// *** NEW HELPER FUNCTION FOR PHASE UNLOCKING ***
const checkAndUnlockNextPhase = async (assessment, completedPhase) => {
  try {
    console.log(`🔓 Checking if phase ${completedPhase} is complete and can unlock next phase...`);
    
    // Get all questions for the completed phase across all modules
    const totalQuestionsInPhase = await Question.countDocuments({
      irlPhase: completedPhase,
      assessmentType: { $in: ['deep', 'both'] },
      isActive: true
    });

    // Count how many answers the user has submitted for this phase
    const answersForPhase = assessment.answers.filter(answer => 
      answer.irlPhase === completedPhase
    ).length;

    console.log(`📊 Phase ${completedPhase} progress: ${answersForPhase}/${totalQuestionsInPhase} questions answered`);

    // Check if the phase is now complete
    if (answersForPhase >= totalQuestionsInPhase && totalQuestionsInPhase > 0) {
      console.log(`✅ Phase ${completedPhase} is complete! Checking for next phase to unlock...`);
      
      // Determine the next phase
      const phases = ['IRL1', 'IRL2', 'IRL3', 'IRL4', 'IRL5', 'IRL6'];
      const currentPhaseIndex = phases.indexOf(completedPhase);
      const nextPhase = currentPhaseIndex < phases.length - 1 ? phases[currentPhaseIndex + 1] : null;

      if (nextPhase) {
        // Check if next phase exists in the database (has questions)
        const nextPhaseQuestionCount = await Question.countDocuments({
          irlPhase: nextPhase,
          assessmentType: { $in: ['deep', 'both'] },
          isActive: true
        });

        if (nextPhaseQuestionCount > 0) {
          // Check if the next phase is already unlocked
          const isNextPhaseAlreadyUnlocked = assessment.deepAssessmentProgress.unlockedPhases.some(
            up => up.irlPhase === nextPhase
          );

          if (!isNextPhaseAlreadyUnlocked) {
            console.log(`🆕 Unlocking next phase: ${nextPhase} for all modules`);
            
            // Add unlock entries for all modules that have questions in the next phase
            const modulesWithQuestionsInNextPhase = await Question.distinct('module', {
              irlPhase: nextPhase,
              assessmentType: { $in: ['deep', 'both'] },
              isActive: true
            });

            const newUnlocks = modulesWithQuestionsInNextPhase.map(module => ({
              module: module,
              irlPhase: nextPhase,
              unlockedAt: new Date()
            }));

            // Add the new unlocks to the existing array
            assessment.deepAssessmentProgress.unlockedPhases.push(...newUnlocks);
            
            // Save the assessment with the updated unlocked phases
            await assessment.save();
            
            console.log(`✅ Successfully unlocked ${nextPhase} for modules: ${modulesWithQuestionsInNextPhase.join(', ')}`);
          } else {
            console.log(`ℹ️ Phase ${nextPhase} is already unlocked`);
          }
        } else {
          console.log(`ℹ️ No questions found for next phase ${nextPhase}, skipping unlock`);
        }
      } else {
        console.log(`ℹ️ ${completedPhase} is the final phase, no next phase to unlock`);
      }
    } else {
      console.log(`ℹ️ Phase ${completedPhase} is not yet complete (${answersForPhase}/${totalQuestionsInPhase})`);
    }
  } catch (error) {
    console.error('Error in checkAndUnlockNextPhase:', error);
    // Don't throw the error, just log it so the main answer submission still works
  }
};

  // @desc    Get deep assessment progress
  // @route   GET /api/assessments/:id/progress
  // @access  Private
const getDeepAssessmentProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    console.log(`📊 Getting progress for assessment ${id}`);

    const assessment = await Assessment.findById(id)
      .populate('project', 'name phase')
      .populate('assessedBy', 'firstName lastName');

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    if (assessment.type !== 'deep') {
      return res.status(400).json({
        success: false,
        message: 'This endpoint is only for deep assessments'
      });
    }

    if (assessment.assessedBy._id.toString() !== userId.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this assessment progress'
      });
    }

    const progress = assessment.deepAssessmentProgress;
    const modules = ['PM', 'Engineering', 'HSE', 'O&M_DOI'];
    const phases = ['IRL1', 'IRL2', 'IRL3', 'IRL4', 'IRL5', 'IRL6'];

    // Calculate actual totals from database
    let totalQuestions = 0;
    let totalPhases = 0;
    let completedPhases = 0;
    let answeredQuestions = assessment.answers.length;

    const detailedProgress = {
      currentModule: progress.currentModule,
      currentIrlPhase: progress.currentIrlPhase,
      currentQuestionFamily: progress.currentQuestionFamily,
      moduleProgress: {},
      overallProgress: {
        totalModules: modules.length,
        completedModules: 0,
        totalPhases: 0,
        completedPhases: 0,
        totalQuestions: 0,
        answeredQuestions: answeredQuestions
      }
    };

    // Process each module
    for (const module of modules) {
      const moduleAnswers = assessment.answers.filter(a => a.module === module);
      let moduleScore = 0;
      let moduleTotalQuestions = 0;
      let moduleCompletedPhases = 0;
      
      if (moduleAnswers.length > 0) {
        moduleScore = moduleAnswers.reduce((sum, a) => sum + a.score, 0) / moduleAnswers.length;
      }

      detailedProgress.moduleProgress[module] = {
        phases: {},
        completed: false,
        score: moduleScore,
        totalQuestions: 0,
        answeredQuestions: moduleAnswers.length
      };

      // Process each phase for this module
      for (const phase of phases) {
        const phaseAnswers = assessment.answers.filter(a => 
          a.module === module && a.irlPhase === phase
        );

        // *** BUG #2 FIX: Count actual questions that exist for this specific module-phase combination ***
        const actualQuestionCount = await Question.countDocuments({
          module,
          irlPhase: phase,
          assessmentType: { $in: ['deep', 'both'] },
          isActive: true
        });

        // Only count phases that actually have questions
        if (actualQuestionCount > 0) {
          totalPhases++;
          moduleTotalQuestions += actualQuestionCount;
          totalQuestions += actualQuestionCount;

          const phaseScore = phaseAnswers.length > 0 
            ? phaseAnswers.reduce((sum, a) => sum + a.score, 0) / phaseAnswers.length
            : 0;

          // *** BUG #2 FIX: A phase is complete when ALL its questions are answered ***
          const isPhaseComplete = phaseAnswers.length >= actualQuestionCount;
          
          if (isPhaseComplete) {
            completedPhases++;
            moduleCompletedPhases++;
          }

          // Check if phase is unlocked
          const isUnlocked = progress.unlockedPhases.some(up => 
            up.module === module && up.irlPhase === phase
          ) || phase === 'IRL1'; // IRL1 is always unlocked

          detailedProgress.moduleProgress[module].phases[phase] = {
            completed: isPhaseComplete,
            questionsTotal: actualQuestionCount, // *** BUG #2 FIX: This now shows the correct count ***
            questionsAnswered: phaseAnswers.length,
            score: phaseScore,
            canProgress: phaseScore >= 2.4,
            unlocked: isUnlocked
          };
        }
      }

      // Update module totals
      detailedProgress.moduleProgress[module].totalQuestions = moduleTotalQuestions;
      
      // A module is complete when all its phases are complete
      const modulePhases = Object.values(detailedProgress.moduleProgress[module].phases);
      const hasPhases = modulePhases.length > 0;
      detailedProgress.moduleProgress[module].completed = hasPhases && 
        modulePhases.every(p => p.completed);
      
      if (detailedProgress.moduleProgress[module].completed) {
        detailedProgress.overallProgress.completedModules++;
      }
    }

    // Set calculated totals
    detailedProgress.overallProgress.totalQuestions = totalQuestions;
    detailedProgress.overallProgress.totalPhases = totalPhases;
    detailedProgress.overallProgress.completedPhases = completedPhases;

    console.log(`📈 Progress calculated:`, {
      answeredQuestions: detailedProgress.overallProgress.answeredQuestions,
      totalQuestions: detailedProgress.overallProgress.totalQuestions,
      completedPhases: detailedProgress.overallProgress.completedPhases,
      totalPhases: detailedProgress.overallProgress.totalPhases
    });

    res.json({
      success: true,
      data: {
        assessment: {
          _id: assessment._id,
          type: assessment.type,
          status: assessment.status,
          startedAt: assessment.startedAt,
          project: assessment.project,
          assessedBy: assessment.assessedBy
        },
        progress: detailedProgress,
        structure: await getDeepAssessmentStructure(),
        blockedReasons: progress.blockedReasons
      }
    });
  } catch (error) {
    console.error('Get deep assessment progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching assessment progress',
      error: error.message
    });
  }
};
  // @desc    Navigate to specific module/phase
  // @route   PUT /api/assessments/:id/navigate
  // @access  Private
  const navigateToModulePhase = async (req, res) => {
    try {
      const { id } = req.params;
      const { module, irlPhase, questionFamily } = req.body;
      const userId = req.user._id || req.user.id;

      console.log(`🧭 Navigating to ${module}-${irlPhase}-${questionFamily}`);

      const assessment = await Assessment.findById(id);
      if (!assessment) {
        return res.status(404).json({
          success: false,
          message: 'Assessment not found'
        });
      }

      if (assessment.assessedBy.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized'
        });
      }

      if (assessment.type !== 'deep') {
        return res.status(400).json({
          success: false,
          message: 'Navigation is only available for deep assessments'
        });
      }

      const canAccess = req.user.isAdmin || 
        irlPhase === 'IRL1' ||
        assessment.deepAssessmentProgress.unlockedPhases.some(up =>
          up.module === module && up.irlPhase === irlPhase
        );

      if (!canAccess) {
        return res.status(403).json({
          success: false,
          message: 'Target module/phase is not yet unlocked'
        });
      }

      assessment.deepAssessmentProgress.currentModule = module;
      assessment.deepAssessmentProgress.currentIrlPhase = irlPhase;
      assessment.deepAssessmentProgress.currentQuestionFamily = questionFamily || 'Gouvernance_Pilotage';

      await assessment.save();

      const questions = await Question.find({
        module,
        irlPhase,
        questionFamily: questionFamily || 'Gouvernance_Pilotage',
        assessmentType: { $in: ['deep', 'both'] },
        isActive: true
      })
      .populate('category', 'name code color')
      .sort({ questionFamily: 1, criticality: -1, order: 1 })
      .lean();

      console.log(`📊 Found ${questions.length} questions for ${module}-${irlPhase}-${questionFamily}`);

      const answeredQuestionIds = new Set(assessment.answers.map(a => a.question.toString()));
      const unansweredQuestions = questions.filter(q => 
        !answeredQuestionIds.has(q._id.toString())
      );

      console.log(`📋 ${unansweredQuestions.length} unanswered questions remaining`);

      res.json({
        success: true,
        message: 'Navigation successful',
        data: {
          assessment: {
            _id: assessment._id,
            deepAssessmentProgress: assessment.deepAssessmentProgress
          },
          questions: unansweredQuestions.map(q => formatQuestionForClient(q))
        }
      });
    } catch (error) {
      console.error('Navigate to module/phase error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while navigating',
        error: error.message
      });
    }
  };

  // @desc    Get next questions for deep assessment
  // @route   GET /api/assessments/:id/next-questions
  // @access  Private
  const getNextQuestions = async (req, res) => {
    try {
      const { id } = req.params;
      const { module, irlPhase, questionFamily } = req.query;
      const userId = req.user._id || req.user.id;

      const assessment = await Assessment.findById(id);
      if (!assessment) {
        return res.status(404).json({
          success: false,
          message: 'Assessment not found'
        });
      }

      if (assessment.assessedBy.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized'
        });
      }

      if (assessment.type !== 'deep') {
        return res.status(400).json({
          success: false,
          message: 'This endpoint is only for deep assessments'
        });
      }

      const targetModule = module || assessment.deepAssessmentProgress.currentModule;
      const targetPhase = irlPhase || assessment.deepAssessmentProgress.currentIrlPhase;
      const targetFamily = questionFamily || assessment.deepAssessmentProgress.currentQuestionFamily;

      const questions = await getDeepAssessmentQuestions(
        targetModule, 
        targetPhase, 
        targetFamily
      );

      const answeredQuestionIds = assessment.answers.map(a => a.question.toString());
      const unansweredQuestions = questions.filter(q => 
        !answeredQuestionIds.includes(q._id.toString())
      );

      res.json({
        success: true,
        data: {
          questions: unansweredQuestions.map(q => formatQuestionForClient(q)),
          module: targetModule,
          irlPhase: targetPhase,
          questionFamily: targetFamily,
          total: questions.length,
          remaining: unansweredQuestions.length
        }
      });
    } catch (error) {
      console.error('Get next questions error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching next questions',
        error: error.message
      });
    }
  };

  // @desc    Complete assessment and calculate final scores
  // @route   POST /api/assessments/:id/complete
  // @access  Private
// In server/controllers/assessmentController.js
// In server/controllers/assessmentController.js

// --- REPLACE your existing completeAssessment function with this one ---

// In server/controllers/assessmentController.js

// --- REPLACE your existing completeAssessment function with this one ---

// In server/controllers/assessmentController.js

// --- REPLACE your completeAssessment function with this one ---

const completeAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const assessment = await Assessment.findById(id).populate('answers.question');
    
    if (!assessment || assessment.status === 'completed') {
      // Handle cases where assessment is not found or already done
      const finalResult = await Assessment.findById(id).populate('categoryScores.category', 'name');
      return res.status(200).json({ success: true, data: { assessment: finalResult } });
    }

    // --- Perform Calculations ---
    const scoreCalculation = calculateScores(assessment);
    
    // --- Update Assessment Document ---
    assessment.overallScore = scoreCalculation.overallScore;
    assessment.categoryScores = scoreCalculation.categoryScores;
    assessment.status = 'completed';
    assessment.completedAt = new Date();
    // ... (rest of your updates) ...
    
    const savedAssessment = await assessment.save();

    // --- THIS IS THE CRUCIAL FIX for the Project document ---
    await Project.findByIdAndUpdate(assessment.project, { 
      status: 'Quick Assessment Completed', // Update the main status
      // Update the nested quickAssessment object
      quickAssessment: {
        isCompleted: true,
        completedAt: savedAssessment.completedAt,
        score: savedAssessment.overallScore,
        maturityLevel: savedAssessment.maturityLevel
      }
    });

    console.log(`✅ Project ${assessment.project} updated with assessment results.`);

    // Populate and send the final response
    const finalPopulatedAssessment = await Assessment.findById(id)
      .populate('categoryScores.category', 'name');
    
    res.status(200).json({
      success: true,
      message: 'Assessment completed successfully',
      data: { 
        assessment: finalPopulatedAssessment
      }
    });
      
  } catch (error) {
    console.error('Error completing assessment:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
  // FIXED: Helper function to calculate scores with all required fields
  const calculateScores = (assessment) => {
    let totalScore = 0;
    let totalWeightedScore = 0;
    let totalPossibleScore = 0;
    let totalWeightedPossibleScore = 0;
    const categoryScores = new Map();
    const moduleScores = new Map();
    
    console.log(`🧮 Processing ${assessment.answers.length} answers for score calculation`);
    
    assessment.answers.forEach((answer, index) => {
      console.log(`📝 Processing answer ${index + 1}:`, {
        questionId: answer.question,
        selectedOption: answer.selectedOption,
        score: answer.score,
        weightedScore: answer.weightedScore
      });

      const answerScore = answer.score || 0;
      const answerWeightedScore = answer.weightedScore || answerScore;
      const criticality = answer.criticality || 1;
      
      totalScore += answerScore;
      totalWeightedScore += answerWeightedScore;
      totalPossibleScore += 3;
      totalWeightedPossibleScore += (3 * criticality);
      
      // Category scoring (for quick assessment)
      if (answer.question && answer.question.category) {
        const categoryId = answer.question.category._id 
          ? answer.question.category._id.toString() 
          : answer.question.category.toString();
        
        if (!categoryScores.has(categoryId)) {
          categoryScores.set(categoryId, {
            category: answer.question.category,
            score: 0,
            weightedScore: 0,
            questionsAnswered: 0,
            maxPossibleScore: 0,
            maxWeightedScore: 0,
            // FIXED: Added missing required fields
            totalQuestions: 0,
            maxPossibleWeightedScore: 0
          });
        }
        
        const catScore = categoryScores.get(categoryId);
        catScore.score += answerScore;
        catScore.weightedScore += answerWeightedScore;
        catScore.questionsAnswered += 1;
        catScore.maxPossibleScore += 3;
        catScore.maxWeightedScore += (3 * criticality);
        // FIXED: Set the required fields
        catScore.totalQuestions += 1;
        catScore.maxPossibleWeightedScore += (3 * criticality);
      }
      
      // Module scoring (for deep assessment)
      if (answer.module) {
        if (!moduleScores.has(answer.module)) {
          moduleScores.set(answer.module, {
            module: answer.module,
          score: 0,
          weightedScore: 0,
          questionsAnswered: 0,
          maxPossibleScore: 0,
          maxWeightedScore: 0,
          // FIXED: Added missing required fields for modules too
          totalQuestions: 0,
          maxPossibleWeightedScore: 0
        });
      }
      
      const modScore = moduleScores.get(answer.module);
      modScore.score += answerScore;
      modScore.weightedScore += answerWeightedScore;
      modScore.questionsAnswered += 1;
      modScore.maxPossibleScore += 3;
      modScore.maxWeightedScore += (3 * criticality);
      // FIXED: Set the required fields
      modScore.totalQuestions += 1;
      modScore.maxPossibleWeightedScore += (3 * criticality);
    }
  });
  
  // Calculate overall scores
  const overallScore = totalPossibleScore > 0 ? (totalScore / totalPossibleScore) * 3 : 0;
  const overallWeightedScore = totalWeightedPossibleScore > 0 ? (totalWeightedScore / totalWeightedPossibleScore) * 3 : 0;
  
  // Calculate category percentages
  const categoryScoresArray = Array.from(categoryScores.values()).map(cat => ({
    ...cat,
    percentage: cat.maxPossibleScore > 0 ? (cat.score / cat.maxPossibleScore) * 100 : 0,
    weightedPercentage: cat.maxWeightedScore > 0 ? (cat.weightedScore / cat.maxWeightedScore) * 100 : 0
  }));
  
  // Calculate module percentages
  const moduleScoresArray = Array.from(moduleScores.values()).map(mod => ({
    ...mod,
    percentage: mod.maxPossibleScore > 0 ? (mod.score / mod.maxPossibleScore) * 100 : 0,
    weightedPercentage: mod.maxWeightedScore > 0 ? (mod.weightedScore / mod.maxWeightedScore) * 100 : 0
  }));
  
  console.log('📊 Score calculation results:', {
    overallScore: parseFloat(overallScore.toFixed(2)),
    overallWeightedScore: parseFloat(overallWeightedScore.toFixed(2)),
    totalAnswers: assessment.answers.length,
    categoryCount: categoryScoresArray.length,
    moduleCount: moduleScoresArray.length
  });
  
  return {
    overallScore: parseFloat(overallScore.toFixed(2)),
    overallWeightedScore: parseFloat(overallWeightedScore.toFixed(2)),
    categoryScores: categoryScoresArray,
    moduleScores: moduleScoresArray,
    totalScore,
    totalWeightedScore,
    totalPossibleScore,
    totalWeightedPossibleScore
  };
  };

  // Helper function to get maturity level
  const getMaturityLevel = (score) => {
  if (score >= 2.4) return 'M3';
  if (score >= 1.7) return 'M2';
  return 'M1';
  };

  // Helper function to generate feedback
  const generateFeedback = (scoreCalculation, assessment) => {
  const { overallScore, categoryScores, moduleScores } = scoreCalculation;
  
  let summary = '';
  const strengths = [];
  const improvements = [];
  const nextSteps = [];
  const moduleRecommendations = [];
  const phaseTips = [];
  
  // Generate summary based on overall score
  if (overallScore >= 2.4) {
    summary = 'Excellent! Your project demonstrates high maturity across most evaluation criteria. You have established strong foundations and processes.';
    nextSteps.push('Focus on maintaining current standards and continuous improvement');
    nextSteps.push('Consider sharing best practices with other teams');
    nextSteps.push('Monitor and refine existing processes');
  } else if (overallScore >= 1.7) {
    summary = 'Good progress! Your project has a solid foundation with clear opportunities for enhancement in specific areas.';
    nextSteps.push('Identify and prioritize key improvement areas');
    nextSteps.push('Develop structured action plans for enhancement');
    nextSteps.push('Establish regular monitoring and review cycles');
  } else {
    summary = 'Your project is in early development stages. Focus on building fundamental capabilities and establishing core processes.';
    nextSteps.push('Prioritize basic project structure and governance');
    nextSteps.push('Establish clear documentation and communication processes');
    nextSteps.push('Build foundational capabilities before advancing to complex areas');
  }
  
  // Analyze category performance
  categoryScores.forEach(catScore => {
    const avgScore = catScore.questionsAnswered > 0 ? catScore.score / catScore.questionsAnswered : 0;
    const categoryName = catScore.category.name || 'Category';
    
    if (avgScore >= 2.0) {
      strengths.push(`Strong performance in ${categoryName} (${avgScore.toFixed(1)}/3.0)`);
    } else if (avgScore < 1.5) {
      improvements.push(`${categoryName} needs attention (${avgScore.toFixed(1)}/3.0)`);
      
      // Add specific recommendations based on category
      if (categoryName.toLowerCase().includes('governance')) {
        nextSteps.push('Establish clear project governance structure and decision-making processes');
      } else if (categoryName.toLowerCase().includes('planning')) {
        nextSteps.push('Develop comprehensive project planning and scheduling frameworks');
      } else if (categoryName.toLowerCase().includes('risk')) {
        nextSteps.push('Implement systematic risk identification and mitigation strategies');
      }
    }
  });
  
  // Analyze module performance (for deep assessments)
  moduleScores.forEach(modScore => {
    const avgScore = modScore.questionsAnswered > 0 ? modScore.score / modScore.questionsAnswered : 0;
    const moduleName = modScore.module;
    
    if (avgScore >= 2.0) {
      moduleRecommendations.push(`${moduleName}: Maintain current high standards and consider advanced practices`);
    } else {
      moduleRecommendations.push(`${moduleName}: Focus on building foundational capabilities and processes`);
    }
  });
  
  // Add phase-specific tips
  if (assessment.type === 'deep') {
    phaseTips.push('IRL1: Focus on establishing basic project framework and initial planning');
    phaseTips.push('IRL2-3: Develop detailed specifications and design validation');
    phaseTips.push('IRL4-6: Emphasize implementation readiness and operational preparation');
  }
  
  return {
    summary,
    strengths: strengths.slice(0, 5),
    improvements: improvements.slice(0, 5),
    nextSteps: nextSteps.slice(0, 7),
    moduleRecommendations: moduleRecommendations.slice(0, 4),
    phaseTips: phaseTips.slice(0, 3)
  };
  };

  // Placeholder functions for other methods
  const getAssessmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    const assessment = await Assessment.findById(id)
      .populate('project', 'name phase')
      .populate('assessedBy', 'firstName lastName')
      .populate('currentCategory', 'name code color')
      .populate('completedCategories', 'name code color');

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Check if user has access to this assessment
    const hasAccess = assessment.assessedBy._id.toString() === userId.toString() ||
                      assessment.project.owner?.toString() === userId.toString() ||
                      req.user.isAdmin;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this assessment'
      });
    }

    res.json({
      success: true,
      data: { assessment }
    });
  } catch (error) {
    console.error('Get assessment by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching assessment',
      error: error.message
    });
  }
  };

  const getProjectAssessments = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id || req.user.id;

    // Check if user has access to this project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const hasAccess = project.owner.toString() === userId.toString() ||
                      (project.manager && project.manager.toString() === userId.toString()) ||
                      project.team.some(member => 
                        member.user.toString() === userId.toString()
                      ) ||
                      req.user.isAdmin;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view project assessments'
      });
    }

    const assessments = await Assessment.find({ project: projectId })
      .populate('assessedBy', 'firstName lastName')
      .populate('currentCategory', 'name code color')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { assessments }
    });
  } catch (error) {
    console.error('Get project assessments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching project assessments',
      error: error.message
    });
  }
  };
  const getAllAssessments = async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 20, 
        project, 
        assessor, 
        type, 
        status, 
        phase,
        startDate,
        endDate 
      } = req.query;

      // Build filter
      const filter = {};
      
      if (project && project !== 'all') {
        filter.project = project;
      }

      if (assessor && assessor !== 'all') {
        filter.assessor = assessor;
      }

      if (type && type !== 'all') {
        filter.type = type;
      }

      if (status && status !== 'all') {
        filter.status = status;
      }

      if (phase && phase !== 'all') {
        filter.phase = phase;
      }

      // Date range filter
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) {
          filter.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          filter.createdAt.$lte = new Date(endDate);
        }
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 }
      };

      const assessments = await Assessment.find(filter)
        .populate('project', 'name phase status')
        .populate('assessor', 'firstName lastName username email')
        .sort(options.sort)
        .limit(options.limit * 1)
        .skip((options.page - 1) * options.limit);

      const total = await Assessment.countDocuments(filter);

      res.json({
        success: true,
        data: {
          assessments,
          pagination: {
            current: options.page,
            pages: Math.ceil(total / options.limit),
            total,
            limit: options.limit
          }
        }
      });
    } catch (error) {
      console.error('Get all assessments error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching assessments',
        error: error.message
      });
    }
  };

  const getAssessmentStats = async (req, res) => {
    try {
      const totalAssessments = await Assessment.countDocuments();
      const completedAssessments = await Assessment.countDocuments({ status: 'completed' });
      const inProgressAssessments = await Assessment.countDocuments({ status: 'in-progress' });
      const pendingAssessments = await Assessment.countDocuments({ status: 'pending' });

      // Assessments by type
      const assessmentsByType = await Assessment.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            avgScore: {
              $avg: { $cond: [{ $eq: ['$status', 'completed'] }, '$overallScore', null] }
            }
          }
        }
      ]);

      // Assessments by phase
      const assessmentsByPhase = await Assessment.aggregate([
        {
          $group: {
            _id: '$phase',
            count: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            avgScore: {
              $avg: { $cond: [{ $eq: ['$status', 'completed'] }, '$overallScore', null] }
            }
          }
        }
      ]);

      // Recent assessments (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentAssessments = await Assessment.countDocuments({
        createdAt: { $gte: thirtyDaysAgo }
      });

      // Average completion time for completed assessments
      const completionTimeStats = await Assessment.aggregate([
        {
          $match: { 
            status: 'completed',
            completedAt: { $exists: true }
          }
        },
        {
          $project: {
            completionTime: {
              $divide: [
                { $subtract: ['$completedAt', '$startedAt'] },
                1000 * 60 // Convert to minutes
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            avgCompletionTime: { $avg: '$completionTime' },
            minCompletionTime: { $min: '$completionTime' },
            maxCompletionTime: { $max: '$completionTime' }
          }
        }
      ]);

      // Top assessors (users with most assessments)
      const topAssessors = await Assessment.aggregate([
        {
          $group: {
            _id: '$assessor',
            assessmentCount: { $sum: 1 },
            completedCount: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            avgScore: {
              $avg: { $cond: [{ $eq: ['$status', 'completed'] }, '$overallScore', null] }
            }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'assessorInfo'
          }
        },
        {
          $unwind: '$assessorInfo'
        },
        {
          $project: {
            _id: 1,
            assessmentCount: 1,
            completedCount: 1,
            avgScore: 1,
            assessorName: {
              $concat: ['$assessorInfo.firstName', ' ', '$assessorInfo.lastName']
            },
            assessorUsername: '$assessorInfo.username'
          }
        },
        {
          $sort: { assessmentCount: -1 }
        },
        {
          $limit: 10
        }
      ]);

      res.json({
        success: true,
        data: {
          overview: {
            totalAssessments,
            completedAssessments,
            inProgressAssessments,
            pendingAssessments,
            completionRate: totalAssessments > 0 ? Math.round((completedAssessments / totalAssessments) * 100) : 0,
            recentAssessments
          },
          distributions: {
            byType: assessmentsByType,
            byPhase: assessmentsByPhase
          },
          performance: {
            completionTime: completionTimeStats[0] || {
              avgCompletionTime: 0,
              minCompletionTime: 0,
              maxCompletionTime: 0
            },
            topAssessors
          }
        }
      });
    } catch (error) {
      console.error('Get assessment stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching assessment statistics',
        error: error.message
      });
    }
  };

  // @desc    Get assessment details by ID (admin view)
  // @route   GET /api/admin/assessments/:id
  // @access  Private/Admin

  const getAssessmentHistory = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { page = 1, limit = 10, type, status } = req.query;

    const query = { assessedBy: userId };
    
    if (type) query.type = type;
    if (status) query.status = status;

    const assessments = await Assessment.find(query)
      .populate('project', 'name phase')
      .populate('currentCategory', 'name code color')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Assessment.countDocuments(query);

    res.json({
      success: true,
      data: {
        assessments,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    console.error('Get assessment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching assessment history',
      error: error.message
    });
  }
  };

  const deleteAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Check if user owns this assessment or is admin
    if (assessment.assessedBy.toString() !== userId.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this assessment'
      });
    }

    // Don't allow deletion of completed assessments unless admin
    if (assessment.status === 'completed' && !req.user.isAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete completed assessments'
      });
    }

    await Assessment.findByIdAndDelete(id);

    // Update project status if needed
    if (assessment.status === 'in-progress') {
      await Project.findByIdAndUpdate(assessment.project, {
        status: 'Active'
      });
    }

    res.json({
      success: true,
      message: 'Assessment deleted successfully'
    });
  } catch (error) {
    console.error('Delete assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting assessment',
      error: error.message
    });
  }
  };

  module.exports = {
  startAssessment,
  submitAnswer,
  completeAssessment,
  getAssessmentById,
  getDeepAssessmentProgress,
  getNextQuestions,
  navigateToModulePhase,
  getProjectAssessments,
  getAssessmentHistory,
  deleteAssessment
  };
