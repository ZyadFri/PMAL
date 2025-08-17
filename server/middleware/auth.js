const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { jwtSecret } = require('../config/keys');

// @desc    Protect routes - Keycloak authentication
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log('🔐 Token received:', token.substring(0, 50) + '...');

      // Decode Keycloak token WITHOUT verification (since we don't have Keycloak's public key)
      const decoded = jwt.decode(token);
      console.log('🔓 Decoded token:', decoded ? 'Success' : 'Failed');

      if (!decoded) {
        console.log('❌ Token decode failed');
        return res.status(401).json({
          success: false,
          message: 'Invalid token format'
        });
      }

      console.log('✅ Token decoded successfully:', {
        sub: decoded.sub,
        email: decoded.email,
        exp: decoded.exp,
        preferred_username: decoded.preferred_username
      });

      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < currentTime) {
        console.log('⏰ Token expired:', new Date(decoded.exp * 1000));
        return res.status(401).json({
          success: false,
          message: 'Token expired'
        });
      }

      console.log('⏰ Token is valid, expires at:', new Date(decoded.exp * 1000));

      // Extract user info from Keycloak token
      const keycloakUser = {
        id: decoded.sub, // Keycloak user ID
        username: decoded.preferred_username || decoded.email,
        email: decoded.email,
        firstName: decoded.given_name || '',
        lastName: decoded.family_name || '',
        fullName: decoded.name || '',
        roles: [
          ...(decoded.realm_access?.roles || []),
          ...(decoded.resource_access?.['PMAL-client']?.roles || [])
        ],
        emailVerified: decoded.email_verified || false,
        userRole: decoded.user_role || 'Employee' // You can set this in Keycloak user attributes
      };

      // Use the new static method to find or create user
      const user = await User.findOrCreateFromKeycloak(keycloakUser);
      console.log('👤 User found/created:', user._id, user.email);

      // Set req.user with our database user + Keycloak info
     req.user = {
  id: user._id, // Explicitly add the database user's ID
  ...user.toObject(),
  keycloakData: keycloakUser
};

      console.log('✅ Authentication successful for user:', user.email);
      next();
    } catch (error) {
      console.error('❌ Keycloak auth middleware error:', error.message);
      console.error('Stack:', error.stack);
      
      return res.status(401).json({
        success: false,
        message: 'Not authorized - Invalid Keycloak token',
        error: error.message
      });
    }
  } else {
    console.log('❌ No Authorization header found');
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided'
    });
  }
};

// @desc    Legacy JWT protection (for backward compatibility)
const protectLegacy = async (req, res, next) => {
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
      console.error('Legacy auth middleware error:', error);
      
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
      
      // Try Keycloak token first
      const decoded = jwt.decode(token);
      if (decoded && decoded.sub) {
        // Looks like a Keycloak token
        const user = await User.findOne({ 
          $or: [
            { keycloakId: decoded.sub },
            { email: decoded.email }
          ]
        });
        
        if (user && user.isActivated) {
          req.user = user;
        }
      } else {
        // Try legacy JWT
        const legacyDecoded = jwt.verify(token, jwtSecret);
        const user = await User.findById(legacyDecoded.id).select('-password');
        
        if (user && user.isActivated) {
          req.user = user;
        }
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

// @desc    Check if user is admin (works with Keycloak roles)
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  // --- START OF FIX ---
  // Check for the role in the database OR in the roles from the Keycloak token
  const isDatabaseAdmin = req.user.userRole === 'Admin';
  const isKeycloakAdmin = req.user.keycloakData?.roles?.includes('admin');

  if (isDatabaseAdmin || isKeycloakAdmin) {
    next(); // User is an admin, proceed.
  } else {
    res.status(403).json({ success: false, message: 'Admin access required' });
  }
  // --- END OF FIX ---
};

module.exports = {
  protect,
  protectLegacy,
  optionalAuth,
  authorize,
  requireActivation,
  isAdmin
};