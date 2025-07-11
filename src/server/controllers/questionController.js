const { Question, Category } = require('../models');

// @desc    Get all questions
// @route   GET /api/questions
// @access  Private
const getQuestions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      type,
      difficulty,
      assessmentType,
      phase,
      isActive,
      search
    } = req.query;

    // Build filter object
    const filter = {};

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (type && type !== 'all') {
      filter.type = type;
    }

    if (difficulty && difficulty !== 'all') {
      filter.difficulty = difficulty;
    }

    if (assessmentType && assessmentType !== 'all') {
      filter.assessmentType = { $in: [assessmentType, 'both'] };
    }

    if (phase && phase !== 'all') {
      filter.phase = { $in: [phase, 'All'] };
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    if (search) {
      filter.$or = [
        { text: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { 'category': 1, 'order': 1, 'createdAt': -1 }
    };

    const questions = await Question.find(filter)
      .populate('category', 'name code color phase')
      .populate('createdBy', 'firstName lastName username')
      .populate('lastModifiedBy', 'firstName lastName username')
      .sort(options.sort)
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit);

    const total = await Question.countDocuments(filter);

    res.json({
      success: true,
      data: {
        questions,
        pagination: {
          current: options.page,
          pages: Math.ceil(total / options.limit),
          total,
          limit: options.limit
        }
      }
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching questions',
      error: error.message
    });
  }
};

// @desc    Get question by ID
// @route   GET /api/questions/:id
// @access  Private
const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findById(id)
      .populate('category', 'name code color phase')
      .populate('createdBy', 'firstName lastName username email')
      .populate('lastModifiedBy', 'firstName lastName username email');

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.json({
      success: true,
      data: { question }
    });
  } catch (error) {
    console.error('Get question by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching question',
      error: error.message
    });
  }
};

// @desc    Create new question
// @route   POST /api/questions
// @access  Private/Admin
const createQuestion = async (req, res) => {
  try {
    const {
      text,
      description,
      category,
      type,
      options,
      correctAnswer,
      explanation,
      difficulty,
      weight,
      assessmentType,
      phase,
      tags,
      order
    } = req.body;

    // Validate category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Category not found'
      });
    }

    // If no order specified, set it to the highest + 1 for this category
    let questionOrder = order;
    if (questionOrder === undefined) {
      const lastQuestion = await Question.findOne(
        { category },
        {},
        { sort: { order: -1 } }
      );
      questionOrder = lastQuestion ? lastQuestion.order + 1 : 1;
    }

    // Create question
    const question = new Question({
      text,
      description,
      category,
      type: type || 'multiple-choice',
      options: options || [],
      correctAnswer,
      explanation,
      difficulty: difficulty || 'Medium',
      weight: weight || 1,
      assessmentType: assessmentType || 'both',
      phase: phase || 'All',
      tags: tags || [],
      order: questionOrder,
      createdBy: req.user.id
    });

    await question.save();

    // Update category question count
    await categoryExists.updateQuestionCount();

    const populatedQuestion = await Question.findById(question._id)
      .populate('category', 'name code color phase')
      .populate('createdBy', 'firstName lastName username');

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: { question: populatedQuestion }
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating question',
      error: error.message
    });
  }
};

// @desc    Update question
// @route   PUT /api/questions/:id
// @access  Private/Admin
const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Find question
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // If category is being changed, validate new category
    if (updateData.category && updateData.category !== question.category.toString()) {
      const newCategory = await Category.findById(updateData.category);
      if (!newCategory) {
        return res.status(400).json({
          success: false,
          message: 'New category not found'
        });
      }
    }

    // Add last modified info
    updateData.lastModifiedBy = req.user.id;

    // Update question
    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('category', 'name code color phase')
    .populate('createdBy', 'firstName lastName username')
    .populate('lastModifiedBy', 'firstName lastName username');

    // Update question counts for both old and new categories if category changed
    if (updateData.category && updateData.category !== question.category.toString()) {
      const oldCategory = await Category.findById(question.category);
      const newCategory = await Category.findById(updateData.category);
      
      if (oldCategory) await oldCategory.updateQuestionCount();
      if (newCategory) await newCategory.updateQuestionCount();
    } else {
      // Update current category count
      const category = await Category.findById(question.category);
      if (category) await category.updateQuestionCount();
    }

    res.json({
      success: true,
      message: 'Question updated successfully',
      data: { question: updatedQuestion }
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating question',
      error: error.message
    });
  }
};

// @desc    Toggle question active status
// @route   PUT /api/questions/:id/toggle-active
// @access  Private/Admin
const toggleQuestionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Update status
    question.isActive = isActive;
    question.lastModifiedBy = req.user.id;
    await question.save();

    // Update category question count
    const category = await Category.findById(question.category);
    if (category) {
      await category.updateQuestionCount();
    }

    res.json({
      success: true,
      message: `Question ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { question }
    });
  } catch (error) {
    console.error('Toggle question status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating question status',
      error: error.message
    });
  }
};

// @desc    Delete question
// @route   DELETE /api/questions/:id
// @access  Private/Admin
const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if question exists
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    const categoryId = question.category;

    // Delete question
    await Question.findByIdAndDelete(id);

    // Update category question count
    const category = await Category.findById(categoryId);
    if (category) {
      await category.updateQuestionCount();
    }

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting question',
      error: error.message
    });
  }
};

// @desc    Get questions by category
// @route   GET /api/questions/by-category/:categoryId
// @access  Private
const getQuestionsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { assessmentType = 'both', isActive = true } = req.query;

    const questions = await Question.getByCategory(categoryId, assessmentType)
      .populate('category', 'name code color');

    res.json({
      success: true,
      data: { questions }
    });
  } catch (error) {
    console.error('Get questions by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching questions by category',
      error: error.message
    });
  }
};

// @desc    Get random questions for quick assessment
// @route   GET /api/questions/random/:categoryId
// @access  Private
const getRandomQuestions = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { count = 5 } = req.query;

    const questions = await Question.getRandomQuestions(categoryId, parseInt(count));

    res.json({
      success: true,
      data: { questions }
    });
  } catch (error) {
    console.error('Get random questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching random questions',
      error: error.message
    });
  }
};

// @desc    Bulk create questions
// @route   POST /api/questions/bulk
// @access  Private/Admin
const bulkCreateQuestions = async (req, res) => {
  try {
    const { questions } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Questions array is required and cannot be empty'
      });
    }

    const createdQuestions = [];
    const errors = [];

    for (let i = 0; i < questions.length; i++) {
      try {
        const questionData = {
          ...questions[i],
          createdBy: req.user.id
        };

        // Validate category exists
        const category = await Category.findById(questionData.category);
        if (!category) {
          errors.push({
            index: i,
            error: 'Category not found'
          });
          continue;
        }

        const question = new Question(questionData);
        await question.save();
        
        const populatedQuestion = await Question.findById(question._id)
          .populate('category', 'name code color phase');
        
        createdQuestions.push(populatedQuestion);

        // Update category question count
        await category.updateQuestionCount();
      } catch (error) {
        errors.push({
          index: i,
          error: error.message
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `${createdQuestions.length} questions created successfully`,
      data: {
        created: createdQuestions,
        errors: errors
      }
    });
  } catch (error) {
    console.error('Bulk create questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while bulk creating questions',
      error: error.message
    });
  }
};

// @desc    Get question statistics
// @route   GET /api/questions/stats
// @access  Private/Admin
const getQuestionStats = async (req, res) => {
  try {
    const totalQuestions = await Question.countDocuments();
    const activeQuestions = await Question.countDocuments({ isActive: true });

    // Questions by type
    const typeDistribution = await Question.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    // Questions by difficulty
    const difficultyDistribution = await Question.aggregate([
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 }
        }
      }
    ]);

    // Questions by assessment type
    const assessmentTypeDistribution = await Question.aggregate([
      {
        $group: {
          _id: '$assessmentType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Questions by category
    const categoryDistribution = await Question.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          categoryName: { $first: { $arrayElemAt: ['$categoryInfo.name', 0] } }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Usage statistics
    const usageStats = await Question.aggregate([
      {
        $group: {
          _id: null,
          totalUsage: { $sum: '$usageCount' },
          avgUsage: { $avg: '$usageCount' },
          avgScore: { $avg: '$averageScore' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalQuestions,
       activeQuestions,
       inactiveQuestions: totalQuestions - activeQuestions,
       typeDistribution,
       difficultyDistribution,
       assessmentTypeDistribution,
       categoryDistribution,
       usageStats: usageStats[0] || {
         totalUsage: 0,
         avgUsage: 0,
         avgScore: 0
       }
     }
   });
 } catch (error) {
   console.error('Get question stats error:', error);
   res.status(500).json({
     success: false,
     message: 'Server error while fetching question statistics',
     error: error.message
   });
 }
};

// @desc    Reorder questions within category
// @route   PUT /api/questions/reorder
// @access  Private/Admin
const reorderQuestions = async (req, res) => {
 try {
   const { questionOrders } = req.body; // Array of {id, order}

   if (!Array.isArray(questionOrders)) {
     return res.status(400).json({
       success: false,
       message: 'questionOrders must be an array'
     });
   }

   // Update each question's order
   const updatePromises = questionOrders.map(({ id, order }) =>
     Question.findByIdAndUpdate(
       id,
       { order, lastModifiedBy: req.user.id },
       { new: true }
     )
   );

   await Promise.all(updatePromises);

   res.json({
     success: true,
     message: 'Questions reordered successfully'
   });
 } catch (error) {
   console.error('Reorder questions error:', error);
   res.status(500).json({
     success: false,
     message: 'Server error while reordering questions',
     error: error.message
   });
 }
};

module.exports = {
 getQuestions,
 getQuestionById,
 createQuestion,
 updateQuestion,
 toggleQuestionStatus,
 deleteQuestion,
 getQuestionsByCategory,
 getRandomQuestions,
 bulkCreateQuestions,
 getQuestionStats,
 reorderQuestions
};