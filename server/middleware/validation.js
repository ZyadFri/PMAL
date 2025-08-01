const Joi = require('joi');

// Validation schemas
const schemas = {
  // User schemas
  userRegister: Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().min(1).max(50).required(),
    lastName: Joi.string().min(1).max(50).required(),
    userRole: Joi.string().valid('Business Owner', 'Project Manager', 'COO', 'Employee').default('Employee'),
    company: Joi.string().max(100).optional(),
    department: Joi.string().max(100).optional(),
    phoneNumber: Joi.string().max(20).optional()
  }),

  userLogin: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
  }),

  userUpdate: Joi.object({
    firstName: Joi.string().min(1).max(50).optional(),
    lastName: Joi.string().min(1).max(50).optional(),
    email: Joi.string().email().optional(),
    company: Joi.string().max(100).optional(),
    department: Joi.string().max(100).optional(),
    phoneNumber: Joi.string().max(20).optional(),
    userRole: Joi.string().valid('Business Owner', 'Project Manager', 'COO', 'Employee', 'Admin').optional()
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required()
  }),

  // Project schemas
  projectCreate: Joi.object({
    name: Joi.string().min(1).max(200).required(),
    description: Joi.string().max(1000).optional(),
    phase: Joi.string().valid('Planning', 'Development', 'Testing', 'Deployment', 'Maintenance').required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().min(Joi.ref('startDate')).optional(),
    priority: Joi.string().valid('Low', 'Medium', 'High', 'Critical').default('Medium'),
    budget: Joi.number().min(0).default(0),
    managerUsername: Joi.string().optional(),
    teamMembers: Joi.array().items(
      Joi.object({
        username: Joi.string().required(),
        role: Joi.string().valid('Manager', 'Member', 'Viewer').default('Member')
      })
    ).optional(),
    tags: Joi.array().items(Joi.string().max(50)).optional()
  }),

  projectUpdate: Joi.object({
    name: Joi.string().min(1).max(200).optional(),
    description: Joi.string().max(1000).optional(),
    phase: Joi.string().valid('Planning', 'Development', 'Testing', 'Deployment', 'Maintenance').optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    priority: Joi.string().valid('Low', 'Medium', 'High', 'Critical').optional(),
    budget: Joi.number().min(0).optional(),
    managerUsername: Joi.string().optional(),
    tags: Joi.array().items(Joi.string().max(50)).optional()
  }),

  // Category schemas
  categoryCreate: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().min(1).max(500).required(),
    code: Joi.string().min(1).max(10).required(),
    phase: Joi.string().valid('Planning', 'Development', 'Testing', 'Deployment', 'Maintenance', 'All').default('All'),
    weight: Joi.number().min(0.1).max(5).default(1),
    quickAssessmentWeight: Joi.number().min(0.1).max(5).default(1),
    deepAssessmentWeight: Joi.number().min(0.1).max(5).default(1),
    order: Joi.number().min(0).optional(),
    color: Joi.string().optional(),
    icon: Joi.string().optional()
  }),

  categoryUpdate: Joi.object({
    name: Joi.string().min(1).max(100).optional(),
    description: Joi.string().min(1).max(500).optional(),
    code: Joi.string().min(1).max(10).optional(),
    phase: Joi.string().valid('Planning', 'Development', 'Testing', 'Deployment', 'Maintenance', 'All').optional(),
    weight: Joi.number().min(0.1).max(5).optional(),
    quickAssessmentWeight: Joi.number().min(0.1).max(5).optional(),
    deepAssessmentWeight: Joi.number().min(0.1).max(5).optional(),
    order: Joi.number().min(0).optional(),
    color: Joi.string().optional(),
    icon: Joi.string().optional(),
    isActive: Joi.boolean().optional()
  }),

  // Question schemas
  questionCreate: Joi.object({
    text: Joi.string().min(1).max(1000).required(),
    description: Joi.string().max(2000).optional(),
    category: Joi.string().required(),
    type: Joi.string().valid('multiple-choice', 'yes-no', 'scale', 'text').default('multiple-choice'),
    options: Joi.array().items(
      Joi.object({
        text: Joi.string().max(200).required(),
        value: Joi.number().min(0).max(5).required(),
        isCorrect: Joi.boolean().default(false)
      })
    ).when('type', {
      is: Joi.string().valid('multiple-choice', 'yes-no', 'scale'),
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    correctAnswer: Joi.any().optional(),
    explanation: Joi.string().max(1000).optional(),
    difficulty: Joi.string().valid('Easy', 'Medium', 'Hard').default('Medium'),
    weight: Joi.number().min(0.1).max(5).default(1),
    assessmentType: Joi.string().valid('quick', 'deep', 'both').default('both'),
    phase: Joi.string().valid('Planning', 'Development', 'Testing', 'Deployment', 'Maintenance', 'All').default('All'),
    tags: Joi.array().items(Joi.string().max(50)).optional(),
    order: Joi.number().min(0).optional()
  }),

  questionUpdate: Joi.object({
    text: Joi.string().min(1).max(1000).optional(),
    description: Joi.string().max(2000).optional(),
    category: Joi.string().optional(),
    type: Joi.string().valid('multiple-choice', 'yes-no', 'scale', 'text').optional(),
    options: Joi.array().items(
      Joi.object({
        text: Joi.string().max(200).required(),
        value: Joi.number().min(0).max(5).required(),
        isCorrect: Joi.boolean().default(false)
      })
    ).optional(),
    correctAnswer: Joi.any().optional(),
    explanation: Joi.string().max(1000).optional(),
    difficulty: Joi.string().valid('Easy', 'Medium', 'Hard').optional(),
    weight: Joi.number().min(0.1).max(5).optional(),
    assessmentType: Joi.string().valid('quick', 'deep', 'both').optional(),
    phase: Joi.string().valid('Planning', 'Development', 'Testing', 'Deployment', 'Maintenance', 'All').optional(),
    tags: Joi.array().items(Joi.string().max(50)).optional(),
    order: Joi.number().min(0).optional(),
    isActive: Joi.boolean().optional()
  }),

  // Assessment schemas
  assessmentStart: Joi.object({
    projectId: Joi.string().required(),
    type: Joi.string().valid('quick', 'deep').required()
  }),

  assessmentAnswer: Joi.object({
    questionId: Joi.string().required(),
    selectedOption: Joi.object({
      optionId: Joi.string().optional(),
      text: Joi.string().optional(),
      value: Joi.number().min(0).max(5).optional()
    }).optional(),
    textAnswer: Joi.string().max(1000).optional(),
    timeSpent: Joi.number().min(0).default(0)
  })
};

// Generic validation middleware
const validate = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    
    if (!schema) {
      return res.status(500).json({
        success: false,
        message: 'Validation schema not found'
      });
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errorMessages
      });
    }

    req.body = value;
    next();
  };
};

// Custom validation functions
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }

    next();
  };
};

const validatePagination = (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  if (isNaN(pageNum) || pageNum < 1) {
    return res.status(400).json({
      success: false,
      message: 'Page must be a positive integer'
    });
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return res.status(400).json({
      success: false,
      message: 'Limit must be between 1 and 100'
    });
  }

  req.query.page = pageNum;
  req.query.limit = limitNum;
  next();
};

const validateActivationToggle = (req, res, next) => {
  const { isActivated } = req.body;

  if (typeof isActivated !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'isActivated must be a boolean value'
    });
  }

  next();
};

const validateAdminToggle = (req, res, next) => {
  const { isAdmin } = req.body;

  if (typeof isAdmin !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'isAdmin must be a boolean value'
    });
  }

  next();
};

module.exports = {
  validate,
  validateObjectId,
  validatePagination,
  validateActivationToggle,
  validateAdminToggle,
  schemas
};