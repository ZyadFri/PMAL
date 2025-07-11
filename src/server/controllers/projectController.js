const { Project, User, Assessment } = require('../models');

// @desc    Get all projects for current user
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, phase, search } = req.query;
    const userId = req.user.id;

    // Build filter object
    const filter = {
      $or: [
        { owner: userId },
        { manager: userId },
        { 'team.user': userId }
      ],
      isActive: true
    };

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (phase && phase !== 'all') {
      filter.phase = phase;
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { updatedAt: -1 }
    };

    const projects = await Project.find(filter)
      .populate('owner', 'firstName lastName email userRole')
      .populate('manager', 'firstName lastName email userRole')
      .populate('team.user', 'firstName lastName email userRole')
      .populate('weakestCategory', 'name code')
      .sort(options.sort)
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit);

    const total = await Project.countDocuments(filter);

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          current: options.page,
          pages: Math.ceil(total / options.limit),
          total,
          limit: options.limit
        }
      }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching projects',
      error: error.message
    });
  }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const project = await Project.findById(id)
      .populate('owner', 'firstName lastName email userRole')
      .populate('manager', 'firstName lastName email userRole')
      .populate('team.user', 'firstName lastName email userRole')
      .populate('assessmentHistory')
      .populate('quickAssessment.weakestCategory', 'name code color')
      .populate('deepAssessment.currentCategory', 'name code')
      .populate('deepAssessment.completedCategories', 'name code');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user has access to this project
    const hasAccess = project.owner._id.toString() === userId ||
                     (project.manager && project.manager._id.toString() === userId) ||
                     project.team.some(member => member.user._id.toString() === userId) ||
                     req.user.isAdmin;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this project'
      });
    }

    res.json({
      success: true,
      data: { project }
    });
  } catch (error) {
    console.error('Get project by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching project',
      error: error.message
    });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    const {
      name,
      description,
      phase,
      startDate,
      endDate,
      priority,
      budget,
      managerUsername,
      teamMembers,
      tags
    } = req.body;

    const userId = req.user.id;

    // Check if manager username exists (if provided)
    let managerId = null;
    if (managerUsername) {
      const manager = await User.findOne({ 
        username: managerUsername,
        isActivated: true 
      });
      
      if (!manager) {
        return res.status(400).json({
          success: false,
          message: 'Manager username not found or user not activated'
        });
      }
      managerId = manager._id;
    }

    // Validate team members (if provided)
    let validatedTeamMembers = [];
    if (teamMembers && teamMembers.length > 0) {
      for (const member of teamMembers) {
        const user = await User.findOne({
          username: member.username,
          isActivated: true
        });
        
        if (user) {
          validatedTeamMembers.push({
            user: user._id,
            role: member.role || 'Member',
            permissions: {
              canEdit: member.role === 'Manager',
              canAssess: true,
              canViewReports: true,
              canManageTeam: member.role === 'Manager'
            }
          });
        }
      }
    }

    // Create project
    const project = new Project({
      name,
      description,
      phase,
      startDate,
      endDate,
      priority: priority || 'Medium',
      budget: budget || 0,
      owner: userId,
      manager: managerId,
      team: validatedTeamMembers,
      tags: tags || []
    });

    // Add owner to team automatically
    project.team.push({
      user: userId,
      role: 'Owner',
      permissions: {
        canEdit: true,
        canAssess: true,
        canViewReports: true,
        canManageTeam: true
      }
    });

    // Add manager to team if different from owner
    if (managerId && managerId.toString() !== userId) {
      project.team.push({
        user: managerId,
        role: 'Manager',
        permissions: {
          canEdit: true,
          canAssess: true,
          canViewReports: true,
          canManageTeam: true
        }
      });
    }

    await project.save();

    // Update user's projects array
    await User.findByIdAndUpdate(userId, {
      $addToSet: { projects: project._id }
    });

    // Update manager's managedProjects array
    if (managerId) {
      await User.findByIdAndUpdate(managerId, {
        $addToSet: { managedProjects: project._id }
      });
    }

    // Populate the created project
    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'firstName lastName email userRole')
      .populate('manager', 'firstName lastName email userRole')
      .populate('team.user', 'firstName lastName email userRole');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project: populatedProject }
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating project',
      error: error.message
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Find project
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permissions
    const teamMember = project.team.find(member => 
      member.user.toString() === userId
    );
    
    const canEdit = project.owner.toString() === userId ||
                   (project.manager && project.manager.toString() === userId) ||
                   (teamMember && teamMember.permissions.canEdit) ||
                   req.user.isAdmin;

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this project'
      });
    }

    // Handle manager update
    if (updateData.managerUsername) {
      const manager = await User.findOne({ 
        username: updateData.managerUsername,
        isActivated: true 
      });
      
      if (!manager) {
        return res.status(400).json({
          success: false,
          message: 'Manager username not found or user not activated'
        });
      }
      
      updateData.manager = manager._id;
      delete updateData.managerUsername;
    }

    // Update project
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('owner', 'firstName lastName email userRole')
    .populate('manager', 'firstName lastName email userRole')
    .populate('team.user', 'firstName lastName email userRole');

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: { project: updatedProject }
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating project',
      error: error.message
    });
  }
};

// @desc    Add team member to project
// @route   POST /api/projects/:id/team
// @access  Private
const addTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, role } = req.body;
    const userId = req.user.id;

    // Find project
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permissions
    const teamMember = project.team.find(member => 
      member.user.toString() === userId
    );
    
    const canManageTeam = project.owner.toString() === userId ||
                         (project.manager && project.manager.toString() === userId) ||
                         (teamMember && teamMember.permissions.canManageTeam) ||
                         req.user.isAdmin;

    if (!canManageTeam) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to manage team members'
      });
    }

    // Find user to add
    const userToAdd = await User.findOne({ 
      username,
      isActivated: true 
    });
    
    if (!userToAdd) {
      return res.status(400).json({
        success: false,
        message: 'User not found or not activated'
      });
    }

    // Check if user is already a team member
    const existingMember = project.team.find(member => 
      member.user.toString() === userToAdd._id.toString()
    );
    
    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a team member'
      });
    }

    // Add team member
    await project.addTeamMember(userToAdd._id, role);

    // Populate updated project
    const updatedProject = await Project.findById(id)
      .populate('team.user', 'firstName lastName email userRole');

    res.json({
      success: true,
      message: 'Team member added successfully',
      data: { project: updatedProject }
    });
  } catch (error) {
    console.error('Add team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding team member',
      error: error.message
    });
  }
};

// @desc    Remove team member from project
// @route   DELETE /api/projects/:id/team/:memberId
// @access  Private
const removeTeamMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const userId = req.user.id;

    // Find project
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permissions
    const teamMember = project.team.find(member => 
      member.user.toString() === userId
    );
    
    const canManageTeam = project.owner.toString() === userId ||
                         (project.manager && project.manager.toString() === userId) ||
                         (teamMember && teamMember.permissions.canManageTeam) ||
                         req.user.isAdmin;

    if (!canManageTeam) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to manage team members'
      });
    }

    // Cannot remove owner
    if (project.owner.toString() === memberId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove project owner'
      });
    }

    // Remove team member
    await project.removeTeamMember(memberId);

    res.json({
      success: true,
      message: 'Team member removed successfully'
    });
  } catch (error) {
    console.error('Remove team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing team member',
      error: error.message
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find project
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Only owner or admin can delete project
    if (project.owner.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only project owner or admin can delete project'
      });
    }

    // Check if project has assessments
    const assessmentCount = await Assessment.countDocuments({ project: id });
    if (assessmentCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete project with existing assessments. Archive it instead.'
      });
    }

    // Delete project
    await Project.findByIdAndDelete(id);

    // Remove project from users' arrays
    await User.updateMany(
      { projects: id },
      { $pull: { projects: id } }
    );

    await User.updateMany(
      { managedProjects: id },
      { $pull: { managedProjects: id } }
    );

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting project',
      error: error.message
    });
  }
};

// @desc    Archive/Unarchive project
// @route   PUT /api/projects/:id/archive
// @access  Private
const toggleArchiveProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { isArchived } = req.body;
    const userId = req.user.id;

    // Find project
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Only owner or admin can archive project
    if (project.owner.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only project owner or admin can archive project'
      });
    }

    // Update archive status
    project.isArchived = isArchived;
    await project.save();

    res.json({
      success: true,
      message: `Project ${isArchived ? 'archived' : 'unarchived'} successfully`,
      data: { project }
    });
  } catch (error) {
    console.error('Toggle archive project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while archiving project',
      error: error.message
    });
  }
};

// @desc    Get project statistics
// @route   GET /api/projects/stats
// @access  Private
const getProjectStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // User's projects filter
    const userProjectsFilter = {
      $or: [
        { owner: userId },
        { manager: userId },
        { 'team.user': userId }
      ],
      isActive: true
    };

    const totalProjects = await Project.countDocuments(userProjectsFilter);
    
    // Status distribution
    const statusStats = await Project.aggregate([
      { $match: userProjectsFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Phase distribution
    const phaseStats = await Project.aggregate([
      { $match: userProjectsFilter },
      {
        $group: {
          _id: '$phase',
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent projects (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentProjects = await Project.countDocuments({
      ...userProjectsFilter,
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Average scores
    const projectsWithScores = await Project.find({
      ...userProjectsFilter,
      overallScore: { $gt: 0 }
    });

    const averageScore = projectsWithScores.length > 0 
      ? projectsWithScores.reduce((sum, project) => sum + project.overallScore, 0) / projectsWithScores.length
      : 0;

    res.json({
      success: true,
      data: {
        totalProjects,
        recentProjects,
        averageScore: Math.round(averageScore * 100) / 100,
        statusDistribution: statusStats,
        phaseDistribution: phaseStats
      }
    });
  } catch (error) {
    console.error('Get project stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching project statistics',
      error: error.message
    });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  addTeamMember,
  removeTeamMember,
  deleteProject,
  toggleArchiveProject,
  getProjectStats
};