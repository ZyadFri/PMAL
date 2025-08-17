const { User, Project, Question, Assessment, Category } = require('../models');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActivated: true });
    const totalProjects = await Project.countDocuments({ isActive: true });
    const totalQuestions = await Question.countDocuments();
    const totalAssessments = await Assessment.countDocuments();
    const totalCategories = await Category.countDocuments();
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentActivity = [];

    // Recent users
    const newUsers = await User.find({ createdAt: { $gte: thirtyDaysAgo } })
      .select('firstName lastName username createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    newUsers.forEach(user => {
      recentActivity.push({
        // CORRECTED: from 'message' to 'description'
        description: `${user.firstName} ${user.lastName} (${user.username}) registered`,
        timestamp: user.createdAt.toISOString(),
        type: 'user_registered',
      });
    });

    // Recent projects
    const newProjects = await Project.find({ createdAt: { $gte: thirtyDaysAgo } })
      .populate('owner', 'firstName lastName')
      .select('name owner createdAt')
      .sort({ createdAt: -1 })
      .limit(5);
    
    newProjects.forEach(project => {
        if (project.owner) {
            recentActivity.push({
                // CORRECTED: from 'message' to 'description'
                description: `Project "${project.name}" created by ${project.owner.firstName} ${project.owner.lastName}`,
                timestamp: project.createdAt.toISOString(),
                type: 'project_created',
            });
        }
    });

    recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // CORRECTED: Return a flat object that matches the frontend's expectations
    res.json({
      success: true,
      totalUsers,
      totalProjects,
      totalQuestions,
      totalAssessments,
      totalCategories,
      recentActivity: recentActivity.slice(0, 10)
    });

  } catch (error) {
    console.error('🛑 Admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching admin statistics',
      error: error.message
    });
  }
};

// @desc    Get all users (admin view)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  const startTime = Date.now();
  try {
    const { page = 1, limit = 10, search, userRole, isActivated } = req.query;

    console.log('--- getAllUsers called ---');
    console.log('Request query:', req.query);

    const filter = {};

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
      console.log('Search filter applied:', JSON.stringify(filter.$or));
    }

    if (userRole && userRole !== 'all') {
      filter.userRole = userRole;
      console.log('User role filter applied:', userRole);
    }

    if (isActivated !== undefined) {
      filter.isActivated = isActivated === 'true';
      console.log('Activation filter applied:', filter.isActivated);
    }

    const options = { page: parseInt(page), limit: parseInt(limit), sort: { createdAt: -1 } };
    console.log('Pagination and sorting options:', options);

    // Trace Mongo query
    console.log('Mongo query filter:', JSON.stringify(filter));

    const users = await User.find(filter)
      .select('-password')
      .sort(options.sort)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit);

    console.log(`Fetched ${users.length} users from DB`);

    const total = await User.countDocuments(filter);
    console.log('Total users matching filter:', total);

    const endTime = Date.now();
    console.log(`getAllUsers execution time: ${endTime - startTime} ms`);

    res.json({
      success: true,
      users,
      pagination: { current: options.page, pages: Math.ceil(total / options.limit), total, limit: options.limit }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching users', error: error.message });
  }
};



// In server/controllers/adminController.js

// --- ADD THIS NEW FUNCTION ---

// @desc    Get a single assessment by ID with full details (admin view)
// @route   GET /api/admin/assessments/:assessmentId
// @access  Private/Admin
const getAssessmentDetails = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const assessment = await Assessment.findById(assessmentId)
      .populate('project', 'name')
      .populate('assessedBy', 'fullName')
      .populate({
        path: 'answers.question', // For each answer, populate the full question
        select: 'text options'    // We need the question text and all possible options
      });

    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    res.json({ success: true, data: assessment });
  } catch (error) {
    console.error('Get assessment details error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// --- IMPORTANT: Don't forget to export the new function! ---
module.exports = {
    // ... all your other exports
    getAssessmentDetails
};
// In server/controllers/adminController.js

// --- REPLACE your old getUserProjects function with this new version ---

const getUserProjects = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).lean(); // Use .lean() for performance
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const projects = await Project.find({
      $or: [{ owner: id }, { manager: id }, { 'team.user': id }]
    }).lean();

    // For each project, find its associated assessments
    const projectsWithAssessments = await Promise.all(
      projects.map(async (project) => {
        const assessments = await Assessment.find({ project: project._id })
          .select('type status overallScore completedAt') // Only select summary fields
          .sort({ completedAt: -1 }); // Get the most recent first
        return { ...project, assessments };
      })
    );

    res.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      projects: projectsWithAssessments,
    });
  } catch (error) {
    console.error('Get user projects error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get user's projects (admin view)
// @route   GET /api/admin/users/:id/projects
// @access  Private/Admin


// @desc    Get all categories (admin view)
// @route   GET /api/admin/categories
// @access  Private/Admin
const getAllCategories = async (req, res) => {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const filter = {};
      if (search) filter.name = { $regex: search, $options: 'i' };
      const options = { page: parseInt(page), limit: parseInt(limit), sort: { order: 1, name: 1 } };
      const categories = await Category.find(filter).populate('createdBy', 'firstName lastName').sort(options.sort).limit(options.limit * 1).skip((options.page - 1) * options.limit);
      const total = await Category.countDocuments(filter);

      res.json({
        success: true,
        categories: categories,
        pagination: { current: options.page, pages: Math.ceil(total / options.limit), total, limit: options.limit }
      });
    } catch (error) {
      console.error('Get all categories error:', error);
      res.status(500).json({ success: false, message: 'Server error while fetching categories', error: error.message });
    }
};

// @desc    Get all questions (admin view)
// @route   GET /api/admin/questions
// @access  Private/Admin
// @desc    Get all questions with pagination and filtering
// @route   GET /api/admin/questions
// @access  Private/Admin
const getAllQuestions = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search) filter.text = { $regex: search, $options: 'i' };
    
    const options = { 
      page: parseInt(page, 10), 
      limit: parseInt(limit, 10),
      populate: { path: 'category', select: 'name' }, // Populate category name
      sort: { order: 1, createdAt: -1 },
    };
    
    const result = await Question.paginate(filter, options);

    res.json({
      success: true,
      questions: result.docs,
      pagination: {
        total: result.totalDocs,
        limit: result.limit,
        page: result.page,
        pages: result.totalPages,
      }
    });
  } catch (error) {
    console.error('Get all questions error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching questions' });
  }
};

// @desc    Create a new question
// @route   POST /api/admin/questions
// @access  Private/Admin
// @desc    Create a new question
// In src/server/controllers/adminController.js

// @desc    Create a new question
// @route   POST /api/admin/questions
// @access  Private/Admin
const createQuestion = async (req, res) => {
  try {
    // --- THIS IS THE CRUCIAL FIX ---
    // We must ensure req.user exists. If it doesn't, the auth middleware has a problem.
    if (!req.user || !req.user.id) {
      // This is a safeguard. If this triggers, your 'protect' middleware is the issue.
      return res.status(401).json({ success: false, message: 'Not authorized, no user data found' });
    }
    
    // Merge the form data from the request body with the logged-in user's ID
    const questionData = { ...req.body, createdBy: req.user.id };

    const newQuestion = new Question(questionData);
    const savedQuestion = await newQuestion.save();
    res.status(201).json(savedQuestion);
  } catch (error) {
    console.error('Create question error:', error);
    // Send back the detailed validation error to the client if it exists
    res.status(400).json({ success: false, message: 'Error creating question', error: error.message });
  }
};

// @desc    Update an existing question
// @route   PUT /api/admin/questions/:id
// @access  Private/Admin
const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedQuestion = await Question.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updatedQuestion) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    res.json(updatedQuestion);
  } catch (error) {
    console.error('Update question error:', error);
    res.status(400).json({ success: false, message: 'Error updating question', error: error.message });
  }
};

// @desc    Delete a question
// @route   DELETE /api/admin/questions/:id
// @access  Private/Admin
const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    await question.deleteOne();
    res.json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting question' });
  }
};

// @desc    Get all assessments (admin view)
// @route   GET /api/admin/assessments
// @access  Private/Admin
const getAllAssessments = async (req, res) => {
  try {
    const { page = 1, limit = 20, project, assessor, type, status } = req.query;
    const filter = {};
    if (project && project !== 'all') filter.project = project;
    if (assessor && assessor !== 'all') filter.assessedBy = assessor;
    if (type && type !== 'all') filter.type = type;
    if (status && status !== 'all') filter.status = status;
    const options = { page: parseInt(page), limit: parseInt(limit), sort: { createdAt: -1 } };
    const assessments = await Assessment.find(filter).populate('project', 'name phase').populate('assessedBy', 'firstName lastName username').sort(options.sort).limit(options.limit * 1).skip((options.page - 1) * options.limit);
    const total = await Assessment.countDocuments(filter);

    res.json({
      success: true,
      assessments: assessments,
      pagination: { current: options.page, pages: Math.ceil(total / options.limit), total, limit: options.limit }
    });
  } catch (error) {
    console.error('Get all assessments error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching assessments', error: error.message });
  }
};

// Add these new functions to your existing adminController.js file

// @desc    Update user details (admin view)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
// @desc    Update user details (admin view)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    // Get the fields to update from the request body
    const { firstName, lastName, email, userRole, company } = req.body; 

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update the user's properties
    user.firstName = firstName ?? user.firstName;
    user.lastName = lastName ?? user.lastName;
    user.email = email ?? user.email;
    user.userRole = userRole ?? user.userRole;
    user.company = company ?? user.company;
    
    const updatedUser = await user.save();

    // --- THIS IS THE FIX ---
    // 1. Convert the Mongoose document to a plain JavaScript object
    const userObject = updatedUser.toObject();
    // 2. Delete the password property from the plain object
    delete userObject.password;

    res.json({
      success: true,
      message: 'User updated successfully',
      user: userObject, // 3. Send the clean object back
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating user', error: error.message });
  }
};

// @desc    Delete a user (admin view)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // --- THIS IS THE FIX ---
    await user.deleteOne(); 

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting user', error: error.message });
  }
};


// @desc    Toggle user activation status (admin view)
// @route   PUT /api/admin/users/:id/toggle-activation
// @access  Private/Admin
const toggleUserActivation = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActivated = !user.isActivated;
    await user.save();

    res.json({
      success: true,
      message: `User has been ${user.isActivated ? 'activated' : 'deactivated'}.`,
      isActivated: user.isActivated
    });
  } catch (error) {
    console.error('Toggle user activation error:', error);
    res.status(500).json({ success: false, message: 'Server error while toggling user status', error: error.message });
  }
};
// @desc    Create a new category
// @route   POST /api/admin/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  try {
    // Add createdBy field, assuming req.user.id is available from your auth middleware
    const category = new Category({ ...req.body, createdBy: req.user.id });
    const createdCategory = await category.save();
    res.status(201).json(createdCategory);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(400).json({ message: 'Error creating category', error: error.message });
  }
};

// @desc    Update an existing category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCategory = await Category.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(updatedCategory);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(400).json({ message: 'Error updating category', error: error.message });
  }
};

// @desc    Delete a category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    await category.deleteOne();
    res.json({ message: 'Category removed' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error deleting category', error: error.message });
  }
};

// @desc    Toggle category active status
// @route   PUT /api/admin/categories/:id/toggle-active
// @access  Private/Admin
const toggleCategoryActive = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    category.isActive = req.body.isActive;
    await category.save();
    res.json(category);
  } catch (error) {
    console.error('Toggle category status error:', error);
    res.status(500).json({ message: 'Server error toggling category status', error: error.message });
  }
};
module.exports = {
  getStats,
  getAllUsers,
  getUserProjects,
  getAllCategories,
  getAllQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getAllAssessments,
  updateUser, 
  deleteUser, // <-- Add this
  toggleUserActivation,
  createCategory,
  updateCategory,
  deleteCategory,
  getAssessmentDetails,
  toggleCategoryActive // <-- Add this
};