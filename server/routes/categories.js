const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory,
  reorderCategories,
  getCategoriesByPhase,
  getCategoryStats,
  updateCategoryQuestionCount
} = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminAuth');
const {
  validate,
  validateObjectId
} = require('../middleware/validation');

// @route   GET /api/categories
// @desc    Get all categories
// @access  Private
router.get('/', protect, getCategories);

// @route   GET /api/categories/stats
// @desc    Get category statistics (Admin only)
// @access  Private/Admin
router.get('/stats', protect, adminOnly, getCategoryStats);

// @route   PUT /api/categories/reorder
// @desc    Reorder categories (Admin only)
// @access  Private/Admin
router.put('/reorder', protect, adminOnly, reorderCategories);

// @route   GET /api/categories/by-phase/:phase
// @desc    Get categories by phase
// @access  Private
router.get('/by-phase/:phase', protect, getCategoriesByPhase);

// @route   POST /api/categories
// @desc    Create new category (Admin only)
// @access  Private/Admin
router.post('/', protect, adminOnly, validate('categoryCreate'), createCategory);

// @route   GET /api/categories/:id
// @desc    Get category by ID
// @access  Private
router.get('/:id', protect, validateObjectId(), getCategoryById);

// @route   PUT /api/categories/:id
// @desc    Update category (Admin only)
// @access  Private/Admin
router.put(
  '/:id',
  protect,
  adminOnly,
  validateObjectId(),
  validate('categoryUpdate'),
  updateCategory
);

// @route   PUT /api/categories/:id/toggle-active
// @desc    Toggle category active status (Admin only)
// @access  Private/Admin
router.put(
  '/:id/toggle-active',
  protect,
  adminOnly,
  validateObjectId(),
  toggleCategoryStatus
);

// @route   PUT /api/categories/:id/update-question-count
// @desc    Update category question count (Admin only)
// @access  Private/Admin
router.put(
  '/:id/update-question-count',
  protect,
  adminOnly,
  validateObjectId(),
  updateCategoryQuestionCount
);

// @route   DELETE /api/categories/:id
// @desc    Delete category (Admin only)
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, validateObjectId(), deleteCategory);

module.exports = router;