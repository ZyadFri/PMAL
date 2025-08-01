const express = require('express');
const router = express.Router();
const {
  register,
  loginUser,
  loginAdmin,
  getMe,
  changePassword,
  refreshToken
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', validate('userRegister'), register);

// @route   POST /api/auth/login-user
// @desc    Login user
// @access  Public
router.post('/login-user', validate('userLogin'), loginUser);

// @route   POST /api/auth/login-admin
// @desc    Login admin
// @access  Public
router.post('/login-admin', validate('userLogin'), loginAdmin);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, getMe);

// @route   PUT /api/auth/change-password
// @desc    Change password
// @access  Private
router.put('/change-password', protect, validate('changePassword'), changePassword);

// @route   POST /api/auth/refresh
// @desc    Refresh token
// @access  Private
router.post('/refresh', protect, refreshToken);

module.exports = router;