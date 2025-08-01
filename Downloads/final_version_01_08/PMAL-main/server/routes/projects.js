const express = require('express');
const router = express.Router();
const {
  getProjects,
  generateProjectReport,
  getProjectById,
  createProject,
  updateProject,
  addTeamMember,
  removeTeamMember,
  deleteProject,
  getProjectAnalytics,
  toggleArchiveProject,
  getProjectStats
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { adminOrRoles } = require('../middleware/adminAuth');
const {
  validate,
  validateObjectId,
  validatePagination
} = require('../middleware/validation');

// @route   GET /api/projects
// @desc    Get all projects for current user
// @access  Private
router.get('/', protect, validatePagination, getProjects);

// @route   GET /api/projects/stats
// @desc    Get project statistics
// @access  Private
router.get('/stats', protect, getProjectStats);
router.get('/:id/report', generateProjectReport);

// @route   POST /api/projects
// @desc    Create new project
// @access  Private
router.post('/', protect, validate('projectCreate'), createProject);

// @route   GET /api/projects/:id
// @desc    Get project by ID
// @access  Private
router.get('/:id', protect, validateObjectId(), getProjectById);

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private
router.put('/:id', protect, validateObjectId(), validate('projectUpdate'), updateProject);

// @route   POST /api/projects/:id/team
// @desc    Add team member to project
// @access  Private
router.post('/:id/team', protect, validateObjectId(), addTeamMember);

// @route   DELETE /api/projects/:id/team/:memberId
// @desc    Remove team member from project
// @access  Private
router.delete(
  '/:id/team/:memberId',
  protect,
  validateObjectId(),
  validateObjectId('memberId'),
  removeTeamMember
);

// @route   PUT /api/projects/:id/archive
// @desc    Archive/Unarchive project
// @access  Private
router.put('/:id/archive', protect, validateObjectId(), toggleArchiveProject);

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private
router.delete('/:id', protect, validateObjectId(), deleteProject);
 router.get('/:id/analytics', getProjectAnalytics);
module.exports = router;