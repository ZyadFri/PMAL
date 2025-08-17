// @desc    Admin only access
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized'
    });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  next();
};

// @desc    Admin or specific roles access
const adminOrRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (req.user.isAdmin || roles.includes(req.user.userRole)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Insufficient permissions'
    });
  };
};

// @desc    Super admin check (for critical operations)
const superAdminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized'
    });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Super admin access required'
    });
  }

  // You can add additional checks here for super admin
  // For example, check if user was created first, or has special flag
  
  next();
};

module.exports = {
  adminOnly,
  adminOrRoles,
  superAdminOnly
};