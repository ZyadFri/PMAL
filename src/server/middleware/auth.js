const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { jwtSecret } = require('../config/keys');

// @desc    Protect routes - General authentication
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, jwtSecret);

      // Get user from token
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if user is activated
      if (!user.isActivated) {
        return res.status(403).json({
          success: false,
          message: 'Account not activated. Please contact administrator.'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired'
        });
      }
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided'
    });
  }
};

// @desc    Optional authentication - User info if token provided
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, jwtSecret);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActivated) {
        req.user = user;
      }
    } catch (error) {
      // Continue without authentication if token is invalid
      console.log('Optional auth failed:', error.message);
    }
  }

  next();
};

// @desc    Check if user has specific role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (!roles.includes(req.user.userRole)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.userRole}' is not authorized to access this route`
      });
    }

    next();
  };
};

// @desc    Check if user is activated
const requireActivation = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized'
    });
  }

  if (!req.user.isActivated) {
    return res.status(403).json({
      success: false,
      message: 'Account not activated. Please contact administrator.'
    });
  }

  next();
};

module.exports = {
  protect,
  optionalAuth,
  authorize,
  requireActivation
};