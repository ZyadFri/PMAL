const { User, Project } = require('../models');

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, isActivated, search } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (role && role !== 'all') {
      filter.userRole = role;
    }
    
    if (isActivated !== undefined) {
      filter.isActivated = isActivated === 'true';
    }
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      select: '-password'
    };

    const users = await User.find(filter)
      .select('-password')
      .sort(options.sort)
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: options.page,
          pages: Math.ceil(total / options.limit),
          total,
          limit: options.limit
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users',
      error: error.message
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('projects', 'name phase status')
      .populate('managedProjects', 'name phase status');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      company,
      department,
      phoneNumber,
      userRole
    } = req.body;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check permissions (user can only update their own profile unless admin)
    if (req.user.id !== id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user'
      });
    }

    // Only admins can change user roles
    if (userRole && userRole !== user.userRole && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to change user role'
      });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use by another user'
        });
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        firstName,
        lastName,
        email,
        company,
        department,
        phoneNumber,
        ...(req.user.isAdmin && userRole && { userRole })
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user',
      error: error.message
    });
  }
};

// @desc    Activate/Deactivate user (Admin only)
// @route   PUT /api/users/:id/activation
// @access  Private/Admin
const toggleUserActivation = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActivated } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update activation status
    user.isActivated = isActivated;
    await user.save();

    res.json({
      success: true,
      message: `User ${isActivated ? 'activated' : 'deactivated'} successfully`,
      data: { user: user.toJSON() }
    });
  } catch (error) {
    console.error('Toggle user activation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user activation',
      error: error.message
    });
  }
};

// @desc    Make user admin (Admin only)
// @route   PUT /api/users/:id/admin
// @access  Private/Admin
const toggleAdminStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAdmin } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update admin status
    user.isAdmin = isAdmin;
    if (isAdmin) {
      user.isActivated = true; // Admins are automatically activated
    }
    await user.save();

    res.json({
      success: true,
      message: `User ${isAdmin ? 'promoted to admin' : 'removed from admin'} successfully`,
      data: { user: user.toJSON() }
    });
  } catch (error) {
    console.error('Toggle admin status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating admin status',
      error: error.message
    });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has active projects
    const userProjects = await Project.find({
      $or: [
        { owner: id },
        { manager: id },
        { 'team.user': id }
      ],
      isActive: true
    });

    if (userProjects.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user with active projects. Please reassign or archive projects first.'
      });
    }

    // Delete user
    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user',
      error: error.message
    });
  }
};

// @desc    Get user statistics (Admin only)
// @route   GET /api/users/stats
// @access  Private/Admin
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActivated: true });
    const adminUsers = await User.countDocuments({ isAdmin: true });
    const pendingUsers = await User.countDocuments({ isActivated: false });

    // User roles distribution
    const roleDistribution = await User.aggregate([
      {
        $group: {
          _id: '$userRole',
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        adminUsers,
        pendingUsers,
        recentRegistrations,
        roleDistribution
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user statistics',
      error: error.message
    });
  }
};

// @desc    Search users by username
// @route   GET /api/users/search
// @access  Private
const searchUsers = async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const users = await User.find({
      $and: [
        { isActivated: true },
        {
          $or: [
            { username: { $regex: query, $options: 'i' } },
            { firstName: { $regex: query, $options: 'i' } },
            { lastName: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    })
    .select('username firstName lastName email userRole')
    .limit(parseInt(limit));

    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching users',
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  toggleUserActivation,
  toggleAdminStatus,
  deleteUser,
  getUserStats,
  searchUsers
};