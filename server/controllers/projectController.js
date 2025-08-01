const { Project, User, Assessment } = require('../models');
const PDFDocument = require('pdfkit');
// @desc    Get all projects for current user
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, phase, search } = req.query;
    const userId = req.user._id || req.user.id;

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
// In server/controllers/projectController.js

// --- REPLACE your getProjectById function ---
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // --- THIS IS THE FIX ---
    // We need to populate the owner and manager details, and also the nested
    // assessment data so the frontend has access to the score and completion status.
    const project = await Project.findById(id)
      .populate('owner', 'firstName lastName email')
      .populate('manager', 'firstName lastName email')
      .populate('team.user', 'firstName lastName email');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({ success: true, data: { project } });
  } catch (error) {
    console.error('Get project by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Generate a PDF report for a project
// @route   GET /api/projects/:id/report
// @access  Private
const generateProjectReport = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch all necessary data with populate
    const project = await Project.findById(id).populate('owner', 'fullName');
    const assessment = await Assessment.findOne({ project: id, status: 'completed' })
      .sort({ completedAt: -1 }) // Get the latest completed assessment
      .populate({
        path: 'categoryScores.category',
        select: 'name'
      });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'No completed assessment found for this project.' });
    }

    // --- Start PDF Generation ---
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers to trigger a download
    const filename = `PMAL-Report-${project.name.replace(/\s/g, '_')}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Pipe the PDF content directly to the response
    doc.pipe(res);

    // --- PDF Content ---

    // Header
    doc.fontSize(24).font('Helvetica-Bold').text('Project Assessment Report', { align: 'center' });
    doc.fontSize(18).font('Helvetica').text(project.name, { align: 'center' });
    doc.moveDown(2);

    // Project Details
    doc.fontSize(16).font('Helvetica-Bold').text('Project Details');
    doc.fontSize(12).font('Helvetica')
      .text(`Owner: ${project.owner.fullName}`)
      .text(`Start Date: ${new Date(project.startDate).toLocaleDateString()}`)
      .text(`Status: ${project.status}`)
      .text(`Phase: ${project.phase}`);
    doc.moveDown(2);

    // Assessment Summary
    doc.fontSize(16).font('Helvetica-Bold').text('Latest Assessment Summary');
    doc.fontSize(12).font('Helvetica')
      .text(`Completion Date: ${new Date(assessment.completedAt).toLocaleDateString()}`)
      .text(`Overall Score: ${assessment.overallScore.toFixed(2)} / 3.0`)
      .text(`Maturity Level: ${assessment.maturityLevel}`);
    doc.moveDown(2);

    // Category Breakdown
    doc.fontSize(16).font('Helvetica-Bold').text('Category Performance');
    assessment.categoryScores.forEach(cs => {
      if (cs.category) { // Safeguard
        const avgScore = cs.questionsAnswered > 0 ? (cs.score / cs.questionsAnswered) : 0;
        doc.fontSize(12).font('Helvetica-Bold').text(cs.category.name);
        doc.font('Helvetica').text(`Average Score: ${avgScore.toFixed(2)} (${cs.questionsAnswered} questions)`);
        doc.moveDown(0.5);
      }
    });
    doc.moveDown(2);

    // Feedback Section
    doc.fontSize(16).font('Helvetica-Bold').text('Feedback & Recommendations');
    doc.fontSize(12).font('Helvetica').text(assessment.feedback.summary);
    doc.moveDown();

    if (assessment.feedback.strengths.length > 0) {
      doc.font('Helvetica-Bold').text('Strengths:');
      assessment.feedback.strengths.forEach(s => doc.font('Helvetica').list([s]));
      doc.moveDown();
    }

    if (assessment.feedback.nextSteps.length > 0) {
      doc.font('Helvetica-Bold').text('Next Steps:');
      assessment.feedback.nextSteps.forEach(s => doc.font('Helvetica').list([s]));
    }

    // Finalize the PDF and end the stream
    doc.end();

  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ success: false, message: 'Server error while generating report' });
  }
};


// @desc    Create new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    console.log('🛠️ DEBUG - req.user:', {
      id: req.user.id,
      _id: req.user._id,
      email: req.user.email
    });

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

    // Use _id instead of id for Keycloak users
    const userId = req.user._id || req.user.id;
    console.log('🔑 Using userId:', userId);
    console.log('🔍 UserId type:', typeof userId, 'UserId value:', userId);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID not found in request'
      });
    }

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

    console.log('📝 Creating project with owner:', userId);

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
      team: [], // Start with empty team, we'll add members below
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

    console.log('👥 Team after adding owner:', project.team);
    console.log('🏠 Project owner field:', project.owner);

    // Add validated team members
    project.team.push(...validatedTeamMembers);

    // Add manager to team if different from owner
    if (managerId && managerId.toString() !== userId.toString()) {
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

    console.log('💾 Saving project...');
    await project.save();
    console.log('✅ Project saved successfully with ID:', project._id);

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

    console.log('🎉 Project creation completed successfully');

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
    const userId = req.user._id || req.user.id;
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
      member.user.toString() === userId.toString()
    );
    
    const canEdit = project.owner.toString() === userId.toString() ||
                   (project.manager && project.manager.toString() === userId.toString()) ||
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
    const userId = req.user._id || req.user.id;

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
      member.user.toString() === userId.toString()
    );
    
    const canManageTeam = project.owner.toString() === userId.toString() ||
                         (project.manager && project.manager.toString() === userId.toString()) ||
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
    const userId = req.user._id || req.user.id;

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
      member.user.toString() === userId.toString()
    );
    
    const canManageTeam = project.owner.toString() === userId.toString() ||
                         (project.manager && project.manager.toString() === userId.toString()) ||
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
    const userId = req.user._id || req.user.id;

    // Find project
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Only owner or admin can delete project
    if (project.owner.toString() !== userId.toString() && !req.user.isAdmin) {
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
 // @desc    Get analytics data for a specific project
    // @route   GET /api/projects/:id/analytics
    // @access  Private
   // In server/controllers/projectController.js

// --- REPLACE your old getProjectAnalytics function with this one ---

// @desc    Get analytics data for a specific project
// @route   GET /api/projects/:id/analytics
// @access  Private
const getProjectAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id).lean();
    const assessments = await Assessment.find({ 
      project: id, 
      status: 'completed' 
    }).populate({
      path: 'categoryScores.category',
      select: 'name'
    }).sort({ completedAt: 1 });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const scoreHistory = assessments.map(a => ({
      date: a.completedAt,
      score: a.overallScore,
      type: a.type
    }));

    // --- START OF FIX ---
    const latestAssessment = assessments[assessments.length - 1];
    let categoryPerformance = [];
    if (latestAssessment && latestAssessment.categoryScores) {
      categoryPerformance = latestAssessment.categoryScores
        .filter(cs => cs.category != null) // Add this filter to remove any null categories
        .map(cs => ({
          category: cs.category.name, // This line is now safe
          score: cs.questionsAnswered > 0 ? (cs.score / cs.questionsAnswered) : 0
        }));
    }
    // --- END OF FIX ---

    const quickAssessments = assessments.filter(a => a.type === 'quick');
    const deepAssessments = assessments.filter(a => a.type === 'deep');

    const kpis = {
      totalAssessments: assessments.length,
      quickAssessmentCount: quickAssessments.length,
      deepAssessmentCount: deepAssessments.length,
      highestScore: Math.max(0, ...assessments.map(a => a.overallScore)),
      lowestScore: assessments.length > 0 ? Math.min(...assessments.map(a => a.overallScore)) : 0,
      averageScore: assessments.length > 0 
        ? assessments.reduce((sum, a) => sum + a.overallScore, 0) / assessments.length 
        : 0
    };

    res.json({
      success: true,
      data: {
        projectName: project.name,
        kpis,
        charts: {
          scoreHistory,
          categoryPerformance
        }
      }
    });

  } catch (error) {
    console.error('Error fetching project analytics:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


// @desc    Archive/Unarchive project
// @route   PUT /api/projects/:id/archive
// @access  Private
const toggleArchiveProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { isArchived } = req.body;
    const userId = req.user._id || req.user.id;

    // Find project
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Only owner or admin can archive project
    if (project.owner.toString() !== userId.toString() && !req.user.isAdmin) {
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
    const userId = req.user._id || req.user.id;

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
  generateProjectReport,
  getProjectById,
  createProject,
  updateProject,
  addTeamMember,
  removeTeamMember,
  deleteProject,
  toggleArchiveProject,
  getProjectAnalytics,
  getProjectStats
};
exports.countProjects = () => Project.countDocuments();