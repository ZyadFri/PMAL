const { Assessment, Project, Question, Category, User } = require('../models');

// @desc    Start new assessment
// @route   POST /api/assessments
// @access  Private
const startAssessment = async (req, res) => {
  try {
    const { projectId, type } = req.body;
    const userId = req.user._id || req.user.id;

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
      // Return existing assessment with questions
      const categories = await Category.find({ isActive: true }).sort({ order: 1 });
      let questions = [];

      for (const category of categories) {
        const categoryQuestions = await Question.find({
          category: category._id,
          assessmentType: { $in: [type, 'both'] },
          isActive: true
        }).sort({ order: 1 }).limit(type === 'quick' ? 3 : 50);
        
        questions.push(...categoryQuestions);
      }

      return res.json({
        success: true,
        message: 'Existing assessment found',
        data: {
          assessment: existingAssessment,
          questions: questions.map(q => ({
            _id: q._id,
            text: q.text,
            type: q.type,
            options: q.options,
            category: q.category,
            order: q.order
          }))
        }
      });
    }

    // Get all active categories
    const categories = await Category.find({ isActive: true }).sort({ order: 1 });
    let questions = [];

    // Get questions based on assessment type
    for (const category of categories) {
      const categoryQuestions = await Question.find({
        category: category._id,
        assessmentType: { $in: [type, 'both'] },
        isActive: true
      }).sort({ order: 1 }).limit(type === 'quick' ? 3 : 50);
      
      questions.push(...categoryQuestions);
    }

    // Create assessment
    const assessment = new Assessment({
      project: projectId,
      assessedBy: userId,
      type,
      metadata: {
        questionsTotal: questions.length,
        questionsAnswered: 0,
        deviceInfo: req.headers['user-agent'],
        ipAddress: req.ip
      }
    });

    if (type === 'deep' && categories.length > 0) {
      assessment.currentCategory = categories[0]._id;
    }

    await assessment.save();

    // Update project status
    const newStatus = type === 'quick' 
      ? 'Quick Assessment In Progress' 
      : 'Deep Assessment In Progress';
    
    await Project.findByIdAndUpdate(projectId, { status: newStatus });

    const populatedAssessment = await Assessment.findById(assessment._id)
      .populate('project', 'name phase')
      .populate('assessedBy', 'firstName lastName')
      .populate('currentCategory', 'name code color');

    res.status(201).json({
      success: true,
      message: 'Assessment started successfully',
      data: {
        assessment: populatedAssessment,
        questions: questions.map(q => ({
          _id: q._id,
          text: q.text,
          type: q.type,
          options: q.options,
          category: q.category,
          order: q.order
        }))
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

// @desc    Submit answer to assessment
// @route   POST /api/assessments/:id/answers
// @access  Private
const submitAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { questionId, selectedOption, textAnswer, timeSpent } = req.body;
    const userId = req.user._id || req.user.id;

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

    // Add answer to assessment
    await assessment.addAnswer(questionId, selectedOption, textAnswer, score, timeSpent || 0);

    const populatedAssessment = await Assessment.findById(assessment._id)
      .populate('currentCategory', 'name code color')
      .populate('completedCategories', 'name code color');

    const isComplete = populatedAssessment.metadata.questionsAnswered >= populatedAssessment.metadata.questionsTotal;

    res.json({
      success: true,
      message: 'Answer submitted successfully',
      data: {
        assessment: populatedAssessment,
        progress: populatedAssessment.progressPercentage,
        isComplete
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

// @desc    Complete assessment
// @route   PUT /api/assessments/:id/complete
// @access  Private
const completeAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

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
        message: 'Not authorized to complete this assessment'
      });
    }

    // Complete assessment
    await assessment.completeAssessment();

    // Update project
    const project = await Project.findById(assessment.project);
    if (project) {
      if (assessment.type === 'quick') {
        project.quickAssessment = {
          isCompleted: true,
          completedAt: assessment.completedAt,
          completedBy: userId,
          score: assessment.overallScore,
          weakestCategory: assessment.weakestCategory,
          duration: assessment.totalDuration
        };
        project.status = 'Quick Assessment Complete';
      } else {
        project.deepAssessment = {
          isCompleted: true,
          completedAt: assessment.completedAt,
          completedBy: userId,
          score: assessment.overallScore,
          duration: assessment.totalDuration
        };
        project.overallScore = assessment.overallScore;
        project.maturityLevel = assessment.maturityLevel.replace('Level ', '').replace(':', '');
        project.status = 'Deep Assessment Complete';
      }

      // Add to assessment history
      project.assessmentHistory.push(assessment._id);
      await project.save();
    }

    const populatedAssessment = await Assessment.findById(assessment._id)
      .populate('project', 'name phase')
      .populate('assessedBy', 'firstName lastName')
      .populate('categoryScores.category', 'name code color')
      .populate('weakestCategory', 'name code color')
      .populate('strongestCategory', 'name code color');

    res.json({
      success: true,
      message: 'Assessment completed successfully',
      data: { assessment: populatedAssessment }
    });
  } catch (error) {
    console.error('Complete assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while completing assessment',
      error: error.message
    });
  }
};

// @desc    Get assessment by ID
// @route   GET /api/assessments/:id
// @access  Private
const getAssessmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    const assessment = await Assessment.findById(id)
      .populate('project', 'name phase owner manager team')
      .populate('assessedBy', 'firstName lastName email')
      .populate('answers.question', 'text type options category')
      .populate('categoryScores.category', 'name code color')
      .populate('weakestCategory', 'name code color')
      .populate('strongestCategory', 'name code color')
      .populate('currentCategory', 'name code color')
      .populate('completedCategories', 'name code color');

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Check access permissions
    const project = assessment.project;
    const hasAccess = project.owner.toString() === userId.toString() ||
                     (project.manager && project.manager.toString() === userId.toString()) ||
                     project.team.some(member => 
                       member.user.toString() === userId.toString() && member.permissions.canViewReports
                     ) ||
                     assessment.assessedBy._id.toString() === userId.toString() ||
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

// @desc    Get assessments for a project
// @route   GET /api/assessments/project/:projectId
// @access  Private
const getProjectAssessments = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { type, status, page = 1, limit = 10 } = req.query;
    const userId = req.user._id || req.user.id;

    // Validate project access
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
                       member.user.toString() === userId.toString() && member.permissions.canViewReports
                     ) ||
                     req.user.isAdmin;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view project assessments'
      });
    }

    // Build filter
    const filter = { project: projectId };
    if (type && type !== 'all') filter.type = type;
    if (status && status !== 'all') filter.status = status;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    };

    const assessments = await Assessment.find(filter)
      .populate('assessedBy', 'firstName lastName email')
      .populate('weakestCategory', 'name code color')
      .populate('strongestCategory', 'name code color')
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
    console.error('Get project assessments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching project assessments',
      error: error.message
    });
  }
};

// @desc    Get user's assessment history
// @route   GET /api/assessments/history
// @access  Private
const getAssessmentHistory = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { page = 1, limit = 10, type, status } = req.query;

    const filter = { assessedBy: userId };
    if (type && type !== 'all') filter.type = type;
    if (status && status !== 'all') filter.status = status;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    };

    const assessments = await Assessment.find(filter)
      .populate('project', 'name phase status')
      .populate('weakestCategory', 'name code color')
      .populate('strongestCategory', 'name code color')
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
    console.error('Get assessment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching assessment history',
      error: error.message
    });
  }
};

// @desc    Delete assessment
// @route   DELETE /api/assessments/:id
// @access  Private
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

    // Only owner or admin can delete assessment
    if (assessment.assessedBy.toString() !== userId.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this assessment'
      });
    }

    // Cannot delete completed assessments that are linked to project
    if (assessment.status === 'completed') {
      const project = await Project.findById(assessment.project);
      if (project && project.assessmentHistory.includes(assessment._id)) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete completed assessment that is part of project history'
        });
      }
    }

    await Assessment.findByIdAndDelete(id);

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
  getProjectAssessments,
  getAssessmentHistory,
  deleteAssessment
};