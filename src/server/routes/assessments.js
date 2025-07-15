const express = require('express');
const router = express.Router();
const {
  startAssessment,
  submitAnswer,
  completeAssessment,
  getAssessmentById,
  getProjectAssessments,
  getAssessmentHistory,
  deleteAssessment
} = require('../controllers/assessmentController');
const { protect } = require('../middleware/auth');

// Validation middleware (simple version)
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

// @route   POST /api/assessments
// @desc    Start new assessment
// @access  Private
router.post('/', protect, validateAssessmentStart, startAssessment);

// @route   GET /api/assessments/history
// @desc    Get user's assessment history
// @access  Private
router.get('/history', protect, validatePagination, getAssessmentHistory);

// @route   GET /api/assessments/project/:projectId
// @desc    Get assessments for a project
// @access  Private
router.get(
  '/project/:projectId',
  protect,
  validateObjectId('projectId'),
  validatePagination,
  getProjectAssessments
);

// @route   GET /api/assessments/:id
// @desc    Get assessment by ID
// @access  Private
router.get('/:id', protect, validateObjectId(), getAssessmentById);

// @route   POST /api/assessments/:id/answers
// @desc    Submit answer to assessment
// @access  Private
router.post(
  '/:id/answers',
  protect,
  validateObjectId(),
  validateAnswer,
  submitAnswer
);

// @route   PUT /api/assessments/:id/complete
// @desc    Complete assessment
// @access  Private
router.put('/:id/complete', protect, validateObjectId(), completeAssessment);

// @route   DELETE /api/assessments/:id
// @desc    Delete assessment
// @access  Private
router.delete('/:id', protect, validateObjectId(), deleteAssessment);

module.exports = router;