const { Category, Question } = require('../models');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res) => {
  try {
    const { isActive, phase, includeQuestionCount } = req.query;

    // Build filter object
    const filter = {};
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    if (phase && phase !== 'all') {
      filter.phase = { $in: [phase, 'All'] };
    }

    let categories = await Category.find(filter)
      .populate('createdBy', 'firstName lastName username')
      .sort({ order: 1, name: 1 });

    // Include question count if requested
    if (includeQuestionCount === 'true') {
      for (let category of categories) {
        category.questionCount = await Question.countDocuments({
          category: category._id,
          isActive: true
        });
      }
    }

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories',
      error: error.message
    });
  }
};

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Private
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id)
      .populate('createdBy', 'firstName lastName username email');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get question count
    const questionCount = await Question.countDocuments({
      category: id,
      isActive: true
    });

    // Get questions for this category (if needed)
    const questions = await Question.find({
      category: id,
      isActive: true
    }).select('text type difficulty assessmentType order');

    res.json({
      success: true,
      data: {
        category: {
          ...category.toObject(),
          questionCount,
          questions
        }
      }
    });
  } catch (error) {
    console.error('Get category by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching category',
      error: error.message
    });
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  try {
    const {
      name,
      description,
      code,
      phase,
      weight,
      quickAssessmentWeight,
      deepAssessmentWeight,
      order,
      color,
      icon
    } = req.body;

    // Check if category with same name or code already exists
    const existingCategory = await Category.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${name}$`, 'i') } },
        { code: code.toUpperCase() }
      ]
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name or code already exists'
      });
    }

    // If no order specified, set it to the highest + 1
    let categoryOrder = order;
    if (categoryOrder === undefined) {
      const lastCategory = await Category.findOne({}, {}, { sort: { order: -1 } });
      categoryOrder = lastCategory ? lastCategory.order + 1 : 1;
    }

    // Create category
    const category = new Category({
      name,
      description,
      code: code.toUpperCase(),
      phase: phase || 'All',
      weight: weight || 1,
      quickAssessmentWeight: quickAssessmentWeight || 1,
      deepAssessmentWeight: deepAssessmentWeight || 1,
      order: categoryOrder,
      color: color || '#1e3c72',
      icon: icon || 'fas fa-folder',
      createdBy: req.user.id
    });

    await category.save();

    const populatedCategory = await Category.findById(category._id)
      .populate('createdBy', 'firstName lastName username');

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category: populatedCategory }
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating category',
      error: error.message
    });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find category
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if name or code conflicts with other categories
    if (updateData.name || updateData.code) {
      const conflictFilter = {
        _id: { $ne: id }
      };

      if (updateData.name) {
        conflictFilter.name = { $regex: new RegExp(`^${updateData.name}$`, 'i') };
      }

      if (updateData.code) {
        conflictFilter.code = updateData.code.toUpperCase();
        updateData.code = updateData.code.toUpperCase();
      }

      const existingCategory = await Category.findOne(conflictFilter);
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Another category with this name or code already exists'
        });
      }
    }

    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName username');

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: { category: updatedCategory }
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating category',
      error: error.message
    });
  }
};

// @desc    Toggle category active status
// @route   PUT /api/categories/:id/toggle-active
// @access  Private/Admin
const toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // If deactivating, check if category has active questions
    if (isActive === false) {
      const activeQuestions = await Question.countDocuments({
        category: id,
        isActive: true
      });

      if (activeQuestions > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot deactivate category with active questions. Please deactivate questions first.'
        });
      }
    }

    // Update status
    category.isActive = isActive;
    await category.save();

    res.json({
      success: true,
      message: `Category ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { category }
    });
  } catch (error) {
    console.error('Toggle category status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating category status',
      error: error.message
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has questions
    const questionCount = await Question.countDocuments({ category: id });
    if (questionCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with existing questions. Please delete questions first or deactivate the category.'
      });
    }

    // Delete category
    await Category.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting category',
      error: error.message
    });
  }
};

// @desc    Reorder categories
// @route   PUT /api/categories/reorder
// @access  Private/Admin
const reorderCategories = async (req, res) => {
  try {
    const { categoryOrders } = req.body; // Array of {id, order}

    if (!Array.isArray(categoryOrders)) {
      return res.status(400).json({
        success: false,
        message: 'categoryOrders must be an array'
      });
    }

    // Update each category's order
    const updatePromises = categoryOrders.map(({ id, order }) =>
      Category.findByIdAndUpdate(id, { order }, { new: true })
    );

    await Promise.all(updatePromises);

    // Get updated categories
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1 })
      .populate('createdBy', 'firstName lastName username');

    res.json({
      success: true,
      message: 'Categories reordered successfully',
      data: { categories }
    });
  } catch (error) {
    console.error('Reorder categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while reordering categories',
      error: error.message
    });
  }
};

// @desc    Get categories by phase
// @route   GET /api/categories/by-phase/:phase
// @access  Private
const getCategoriesByPhase = async (req, res) => {
  try {
    const { phase } = req.params;

    const categories = await Category.find({
      phase: { $in: [phase, 'All'] },
      isActive: true
    })
    .sort({ order: 1 })
    .populate('createdBy', 'firstName lastName username');

    // Include question counts
    for (let category of categories) {
      const questionCounts = await Question.aggregate([
        {
          $match: {
            category: category._id,
            isActive: true
          }
        },
        {
          $group: {
            _id: '$assessmentType',
            count: { $sum: 1 }
          }
        }
      ]);

      category.questionCounts = {
        total: await Question.countDocuments({
          category: category._id,
          isActive: true
        }),
        quick: questionCounts.find(c => c._id === 'quick')?.count || 0,
        deep: questionCounts.find(c => c._id === 'deep')?.count || 0,
        both: questionCounts.find(c => c._id === 'both')?.count || 0
      };
    }

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories by phase error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories by phase',
      error: error.message
    });
  }
};

// @desc    Get category statistics
// @route   GET /api/categories/stats
// @access  Private/Admin
const getCategoryStats = async (req, res) => {
  try {
    const totalCategories = await Category.countDocuments();
    const activeCategories = await Category.countDocuments({ isActive: true });
    const inactiveCategories = totalCategories - activeCategories;

    // Categories by phase
    const phaseDistribution = await Category.aggregate([
      {
        $group: {
          _id: '$phase',
          count: { $sum: 1 }
        }
      }
    ]);

    // Categories with question counts
    const categoriesWithQuestions = await Category.aggregate([
      {
        $lookup: {
          from: 'questions',
          localField: '_id',
          foreignField: 'category',
          as: 'questions'
        }
      },
      {
        $project: {
          name: 1,
          code: 1,
          questionCount: { $size: '$questions' },
          activeQuestionCount: {
            $size: {
              $filter: {
                input: '$questions',
                cond: { $eq: ['$$this.isActive', true] }
              }
            }
          }
        }
      },
      {
        $sort: { questionCount: -1 }
      }
    ]);

    // Average weights
    const weightStats = await Category.aggregate([
      {
        $group: {
          _id: null,
          avgWeight: { $avg: '$weight' },
          avgQuickWeight: { $avg: '$quickAssessmentWeight' },
          avgDeepWeight: { $avg: '$deepAssessmentWeight' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalCategories,
        activeCategories,
        inactiveCategories,
        phaseDistribution,
        categoriesWithQuestions,
        averageWeights: weightStats[0] || {
          avgWeight: 0,
          avgQuickWeight: 0,
          avgDeepWeight: 0
        }
      }
    });
  } catch (error) {
    console.error('Get category stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching category statistics',
      error: error.message
    });
  }
};

// @desc    Update category question count
// @route   PUT /api/categories/:id/update-question-count
// @access  Private/Admin
const updateCategoryQuestionCount = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Update question count
    await category.updateQuestionCount();

    res.json({
      success: true,
      message: 'Category question count updated successfully',
      data: { category }
    });
  } catch (error) {
    console.error('Update category question count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating question count',
      error: error.message
    });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory,
  reorderCategories,
  getCategoriesByPhase,
  getCategoryStats,
  updateCategoryQuestionCount
};
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.json({ success: true, data: { categories } });
  } catch (err) {
    next(err);
  }
};

exports.countCategories = () => Category.countDocuments();