const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/assessmentController');
const { protect } = require('../middleware/auth');

// Validation middleware
const validateObjectId = (paramName = 'id') => (req, res, next) => {
  const id = req.params[paramName];
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  next();
};

const validateAssessmentStart = (req, res, next) => {
  const { projectId, type } = req.body;
  
  if (!projectId || !projectId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Valid project ID is required'
    });
  }
  
  if (!type || !['quick', 'deep'].includes(type)) {
    return res.status(400).json({
      success: false,
      message: 'Assessment type must be either "quick" or "deep"'
    });
  }
  
  next();
};

const validateAnswer = (req, res, next) => {
  const { questionId, selectedOption } = req.body;
  
  if (!questionId || !questionId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Valid question ID is required'
    });
  }
  
  if (!selectedOption) {
    return res.status(400).json({
      success: false,
      message: 'Selected option is required'
    });
  }
  
  next();
};

const validateNavigation = (req, res, next) => {
  const { module, irlPhase, questionFamily } = req.body;
  
  if (!module || !['PM', 'Engineering', 'HSE', 'O&M_DOI'].includes(module)) {
    return res.status(400).json({
      success: false,
      message: 'Valid module is required (PM, Engineering, HSE, O&M_DOI)'
    });
  }
  
  if (!irlPhase || !['IRL1', 'IRL2', 'IRL3', 'IRL4', 'IRL5', 'IRL6'].includes(irlPhase)) {
    return res.status(400).json({
      success: false,
      message: 'Valid IRL phase is required (IRL1-IRL6)'
    });
  }
  
  if (questionFamily && !['Gouvernance_Pilotage', 'Livrables_Structurants', 'Methodologie_Process', 'Outils_Digital', 'Risques_Conformite', 'Module_Specifique'].includes(questionFamily)) {
    return res.status(400).json({
      success: false,
      message: 'Valid question family is required'
    });
  }
  
  next();
};

const validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  if (page < 1) {
    return res.status(400).json({
      success: false,
      message: 'Page must be greater than 0'
    });
  }
  
  if (limit < 1 || limit > 100) {
    return res.status(400).json({
      success: false,
      message: 'Limit must be between 1 and 100'
    });
  }
  
  req.query.page = page;
  req.query.limit = limit;
  next();
};

// Routes
router.post('/', protect, validateAssessmentStart, startAssessment);
router.get('/history', protect, validatePagination, getAssessmentHistory);
router.get('/project/:projectId', protect, validateObjectId('projectId'), validatePagination, getProjectAssessments);
router.get('/:id', protect, validateObjectId(), getAssessmentById);
router.get('/:id/progress', protect, validateObjectId(), getDeepAssessmentProgress);
router.get('/:id/next-questions', protect, validateObjectId(), getNextQuestions);
router.post('/:id/answers', protect, validateObjectId(), validateAnswer, submitAnswer);
router.put('/:id/navigate', protect, validateObjectId(), validateNavigation, navigateToModulePhase);
router.put('/:id/complete', protect, validateObjectId(), completeAssessment);
router.delete('/:id', protect, validateObjectId(), deleteAssessment);

module.exports = router;