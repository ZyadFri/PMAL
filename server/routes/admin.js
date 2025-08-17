
// server/routes/admin.js
const express = require('express');
const router  = express.Router();

// Middleware
const { protect, isAdmin } = require('../middleware/auth');

// Controller Imports
const { 
  getStats,
  getAllUsers,
  getUserProjects,
  getAssessmentDetails,
  updateUser,
  deleteUser,
  toggleUserActivation,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryActive,
  getAllQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getAllAssessments
} = require('../controllers/adminController');

// Apply protection and admin check to ALL routes in this file
router.use(protect, isAdmin);

// --- Overview ---
// GET /api/admin/stats
router.get('/stats', getStats);
// GET /api/admin/assessments
router.get('/assessments', getAllAssessments);

router.get('/assessments/:assessmentId', getAssessmentDetails);
// --- User Management ---
// GET /api/admin/users - Get all users
// POST /api/admin/users - (Future use: create a user)
router.route('/users')
  .get(getAllUsers);

// PUT /api/admin/users/:id - Update a specific user
// DELETE /api/admin/users/:id - Delete a specific user
router.route('/users/:id')
  .put(updateUser)
  .delete(deleteUser);

// GET /api/admin/users/:id/projects - Get projects for a specific user
router.get('/users/:id/projects', getUserProjects);
// PUT /api/admin/users/:id/toggle-activation - Toggle user active status
router.put('/users/:id/toggle-activation', toggleUserActivation);


// --- Category Management ---
// GET /api/admin/categories - Get all categories
// POST /api/admin/categories - Create a new category
router.route('/categories')
  .get(getAllCategories)
  .post(createCategory);

// PUT /api/admin/categories/:id - Update a specific category
// DELETE /api/admin/categories/:id - Delete a specific category
router.route('/categories/:id')
  .put(updateCategory)
  .delete(deleteCategory);

// PUT /api/admin/categories/:id/toggle-active - Toggle category active status
router.put('/categories/:id/toggle-active', toggleCategoryActive);


// --- Question Management ---
// GET /api/admin/questions - Get all questions
// POST /api/admin/questions - Create a new question
router.route('/questions')
  .get(getAllQuestions)
  .post(createQuestion);

// PUT /api/admin/questions/:id - Update a specific question
// DELETE /api/admin/questions/:id - Delete a specific question
router.route('/questions/:id')
  .put(updateQuestion)
  .delete(deleteQuestion);


module.exports = router;