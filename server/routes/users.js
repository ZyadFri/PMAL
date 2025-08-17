const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
    getMe,
  getMyNotificationPreferences,
  updateMyNotificationPreferences,
  updateMyPassword,
  toggleUserActivation,
  toggleAdminStatus,
  deleteUser,
  getUserStats,
  searchUsers
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { adminOnly, adminOrRoles } = require('../middleware/adminAuth');
const {
  validate,
  validateObjectId,
  validatePagination,
  validateActivationToggle,
  validateAdminToggle
} = require('../middleware/validation');

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/', protect, adminOnly, validatePagination, getAllUsers);

// @route   GET /api/users/stats
// @desc    Get user statistics (Admin only)
// @access  Private/Admin
router.get('/stats', protect, adminOnly, getUserStats);

// @route   GET /api/users/search
// @desc    Search users by username
// @access  Private
router.get('/search', protect, searchUsers);
router.get('/me', protect, getMe);
router.put('/me', protect, updateUser); // We can reuse the updateUser controller
router.get('/me/notifications', protect, getMyNotificationPreferences);
router.put('/me/notifications', protect, updateMyNotificationPreferences);
router.post('/me/password', protect, updateMyPassword);
// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', protect, validateObjectId(), getUserById);

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private
router.put('/:id', protect, validateObjectId(), validate('userUpdate'), updateUser);

// @route   PUT /api/users/:id/activation
// @desc    Activate/Deactivate user (Admin only)
// @access  Private/Admin
router.put(
  '/:id/activation',
  protect,
  adminOnly,
  validateObjectId(),
  validateActivationToggle,
  toggleUserActivation
);

// @route   PUT /api/users/:id/admin
// @desc    Make user admin (Admin only)
// @access  Private/Admin
router.put(
  '/:id/admin',
  protect,
  adminOnly,
  validateObjectId(),
  validateAdminToggle,
  toggleAdminStatus
);

// @route   DELETE /api/users/:id
// @desc    Delete user (Admin only)
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, validateObjectId(), deleteUser);

module.exports = router;