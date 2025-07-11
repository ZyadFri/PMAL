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
const {
  validate,
  validateObjectId,
  validatePagination
} = require('../middleware/validation');

// @route   POST /api/assessments
// @desc    Start new assessment
// @access  Private
router.post('/', protect, validate('assessmentStart'), startAssessment);

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
  validate('assessmentAnswer'),
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