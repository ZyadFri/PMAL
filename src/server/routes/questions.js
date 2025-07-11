const express = require('express');
const router = express.Router();
const {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  toggleQuestionStatus,
  deleteQuestion,
  getQuestionsByCategory,
  getRandomQuestions,
  bulkCreateQuestions,
  getQuestionStats,
  reorderQuestions
} = require('../controllers/questionController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminAuth');
const {
  validate,
  validateObjectId,
  validatePagination
} = require('../middleware/validation');

// @route   GET /api/questions
// @desc    Get all questions
// @access  Private
router.get('/', protect, validatePagination, getQuestions);

// @route   GET /api/questions/stats
// @desc    Get question statistics (Admin only)
// @access  Private/Admin
router.get('/stats', protect, adminOnly, getQuestionStats);

// @route   PUT /api/questions/reorder
// @desc    Reorder questions (Admin only)
// @access  Private/Admin
router.put('/reorder', protect, adminOnly, reorderQuestions);

// @route   POST /api/questions/bulk
// @desc    Bulk create questions (Admin only)
// @access  Private/Admin
router.post('/bulk', protect, adminOnly, bulkCreateQuestions);

// @route   GET /api/questions/by-category/:categoryId
// @desc    Get questions by category
// @access  Private
router.get('/by-category/:categoryId', protect, validateObjectId('categoryId'), getQuestionsByCategory);

// @route   GET /api/questions/random/:categoryId
// @desc    Get random questions for quick assessment
// @access  Private
router.get('/random/:categoryId', protect, validateObjectId('categoryId'), getRandomQuestions);

// @route   POST /api/questions
// @desc    Create new question (Admin only)
// @access  Private/Admin
router.post('/', protect, adminOnly, validate('questionCreate'), createQuestion);

// @route   GET /api/questions/:id
// @desc    Get question by ID
// @access  Private
router.get('/:id', protect, validateObjectId(), getQuestionById);

// @route   PUT /api/questions/:id
// @desc    Update question (Admin only)
// @access  Private/Admin
router.put(
  '/:id',
  protect,
  adminOnly,
  validateObjectId(),
  validate('questionUpdate'),
  updateQuestion
);

// @route   PUT /api/questions/:id/toggle-active
// @desc    Toggle question active status (Admin only)
// @access  Private/Admin
router.put(
  '/:id/toggle-active',
  protect,
  adminOnly,
  validateObjectId(),
  toggleQuestionStatus
);

// @route   DELETE /api/questions/:id
// @desc    Delete question (Admin only)
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, validateObjectId(), deleteQuestion);

module.exports = router;