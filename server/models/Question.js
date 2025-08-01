const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2'); // <-- 1. IMPORT THE PLUGIN

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  value: {
    type: Number,
    required: true,
    min: 0,
    max: 3 // Updated for French system
  },
  isCorrect: {
    type: Boolean,
    default: false
  }
}, { _id: true });

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  description: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  type: {
    type: String,
    enum: ['multiple-choice', 'yes-no', 'scale', 'text'],
    required: true,
    default: 'multiple-choice'
  },
  options: [optionSchema],
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  explanation: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true,
    default: 'Medium'
  },
  weight: {
    type: Number,
    required: true,
    default: 1,
    min: 0.1,
    max: 5
  },
  assessmentType: {
    type: String,
    enum: ['quick', 'deep', 'both'],
    required: true,
    default: 'both'
  },
  phase: {
    type: String,
    enum: ['Planning', 'Development', 'Testing', 'Deployment', 'Maintenance', 'All'],
    required: true,
    default: 'All'
  },
  
  // Deep Assessment specific fields
  module: {
    type: String,
    enum: ['PM', 'Engineering', 'HSE', 'O&M_DOI'],
    required: function() { 
      return this.assessmentType === 'deep' || this.assessmentType === 'both'; 
    }
  },
  irlPhase: {
    type: String,
    enum: ['IRL1', 'IRL2', 'IRL3', 'IRL4', 'IRL5', 'IRL6'],
    required: function() { 
      return this.assessmentType === 'deep' || this.assessmentType === 'both'; 
    }
  },
  questionFamily: {
    type: String,
    enum: [
      'Gouvernance_Pilotage',        // 1. Gouvernance & Pilotage
      'Livrables_Structurants',      // 2. Livrables structurants
      'Methodologie_Process',        // 3. Méthodologie / process
      'Outils_Digital',              // 4. Outils et digital
      'Risques_Conformite',          // 5. Risques et conformité
      'Module_Specifique'            // 6. 1 Famille spécifique à chaque module
    ],
    required: function() { 
      return this.assessmentType === 'deep' || this.assessmentType === 'both'; 
    }
  },
  criticality: {
    type: Number,
    required: function() { 
      return this.assessmentType === 'deep' || this.assessmentType === 'both'; 
    },
    min: 1,
    max: 3,
    default: 1,
    // 1 = Low criticality, 2 = Medium criticality, 3 = High criticality
    validate: {
      validator: function(v) {
        return [1, 2, 3].includes(v);
      },
      message: 'Criticality must be 1, 2, or 3'
    }
  },
  
  // Enhanced metadata for deep assessment
  prerequisites: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  deliverables: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  impactAreas: [{
    type: String,
    enum: ['Technical', 'Commercial', 'Regulatory', 'Operational', 'Financial'],
    required: function() { 
      return this.assessmentType === 'deep' || this.assessmentType === 'both'; 
    }
  }],
  
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 3
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better performance
questionSchema.index({ category: 1 });
questionSchema.index({ type: 1 });
questionSchema.index({ assessmentType: 1 });
questionSchema.index({ phase: 1 });
questionSchema.index({ isActive: 1 });
questionSchema.index({ difficulty: 1 });
questionSchema.index({ tags: 1 });
// Deep assessment specific indexes
questionSchema.index({ module: 1 });
questionSchema.index({ irlPhase: 1 });
questionSchema.index({ questionFamily: 1 });
questionSchema.index({ criticality: 1 });
questionSchema.index({ module: 1, irlPhase: 1, questionFamily: 1 });

// Validation for deep assessment questions
questionSchema.pre('save', function(next) {
  // Validate options based on question type
  if (this.type === 'multiple-choice' && this.options.length < 2) {
    return next(new Error('Multiple choice questions must have at least 2 options'));
  }
  
  if (this.type === 'yes-no' && this.options.length !== 2) {
    return next(new Error('Yes/No questions must have exactly 2 options'));
  }
  
  if (this.type === 'scale') {
    if (this.options.length < 3 || this.options.length > 10) {
      return next(new Error('Scale questions must have between 3 and 10 options'));
    }
  }

  // Deep assessment specific validations
  if (this.assessmentType === 'deep' || this.assessmentType === 'both') {
    if (!this.module) {
      return next(new Error('Module is required for deep assessment questions'));
    }
    if (!this.irlPhase) {
      return next(new Error('IRL Phase is required for deep assessment questions'));
    }
    if (!this.questionFamily) {
      return next(new Error('Question Family is required for deep assessment questions'));
    }
    if (!this.criticality) {
      return next(new Error('Criticality is required for deep assessment questions'));
    }

    // Validate module-specific question families
    const moduleSpecificFamilies = {
      'PM': 'Project_Management_Specifique',
      'Engineering': 'Engineering_Specifique',
      'HSE': 'HSE_Specifique',
      'O&M_DOI': 'Operations_Maintenance_Specifique'
    };

    if (this.questionFamily === 'Module_Specifique') {
      // This is acceptable - generic module specific family
    }
  }
  
  next();
});

// Virtual for weighted max score
questionSchema.virtual('weightedMaxScore').get(function() {
  return 3 * this.criticality; // max score (3) * criticality weight
});

// Static method to get questions by category (enhanced)
questionSchema.statics.getByCategory = function(categoryId, assessmentType = 'both') {
  const query = { 
    category: categoryId, 
    isActive: true 
  };
  
  if (assessmentType !== 'both') {
    query.assessmentType = { $in: [assessmentType, 'both'] };
  }
  
  return this.find(query).sort({ order: 1 });
};

// Static method to get questions for deep assessment by module and phase
questionSchema.statics.getDeepAssessmentQuestions = function(module, irlPhase, questionFamily = null) {
  const query = {
    module,
    irlPhase,
    assessmentType: { $in: ['deep', 'both'] },
    isActive: true
  };
  
  if (questionFamily) {
    query.questionFamily = questionFamily;
  }
  
  return this.find(query)
    .sort({ questionFamily: 1, criticality: -1, order: 1 })
    .populate('category', 'name code color');
};

// Static method to get all questions for a specific module across all phases
questionSchema.statics.getModuleQuestions = function(module) {
  return this.find({
    module,
    assessmentType: { $in: ['deep', 'both'] },
    isActive: true
  })
  .sort({ irlPhase: 1, questionFamily: 1, criticality: -1, order: 1 })
  .populate('category', 'name code color');
};

// Static method to get questions by IRL phase across all modules
questionSchema.statics.getPhaseQuestions = function(irlPhase) {
  return this.find({
    irlPhase,
    assessmentType: { $in: ['deep', 'both'] },
    isActive: true
  })
  .sort({ module: 1, questionFamily: 1, criticality: -1, order: 1 })
  .populate('category', 'name code color');
};

// Static method to get questions by family across modules/phases
questionSchema.statics.getFamilyQuestions = function(questionFamily, module = null, irlPhase = null) {
  const query = {
    questionFamily,
    assessmentType: { $in: ['deep', 'both'] },
    isActive: true
  };
  
  if (module) query.module = module;
  if (irlPhase) query.irlPhase = irlPhase;
  
  return this.find(query)
    .sort({ module: 1, irlPhase: 1, criticality: -1, order: 1 })
    .populate('category', 'name code color');
};

// Static method to get random questions for quick assessment (existing)
questionSchema.statics.getRandomQuestions = function(categoryId, count = 5) {
  return this.aggregate([
    { 
      $match: { 
        category: mongoose.Types.ObjectId(categoryId),
        assessmentType: { $in: ['quick', 'both'] },
        isActive: true
      }
    },
    { $sample: { size: count } }
  ]);
};

// Static method to get deep assessment structure
questionSchema.statics.getDeepAssessmentStructure = async function() {
  const structure = await this.aggregate([
    {
      $match: {
        assessmentType: { $in: ['deep', 'both'] },
        isActive: true
      }
    },
    {
      $group: {
        _id: {
          module: '$module',
          irlPhase: '$irlPhase',
          questionFamily: '$questionFamily'
        },
        questionCount: { $sum: 1 },
        totalCriticality: { $sum: '$criticality' },
        avgCriticality: { $avg: '$criticality' },
        maxWeightedScore: { $sum: { $multiply: [3, '$criticality'] } }
      }
    },
    {
      $group: {
        _id: {
          module: '$_id.module',
          irlPhase: '$_id.irlPhase'
        },
        families: {
          $push: {
            family: '$_id.questionFamily',
            questionCount: '$questionCount',
            totalCriticality: '$totalCriticality',
            avgCriticality: '$avgCriticality',
            maxWeightedScore: '$maxWeightedScore'
          }
        },
        totalQuestions: { $sum: '$questionCount' },
        totalMaxWeightedScore: { $sum: '$maxWeightedScore' }
      }
    },
    {
      $group: {
        _id: '$_id.module',
        phases: {
          $push: {
            phase: '$_id.irlPhase',
            families: '$families',
            totalQuestions: '$totalQuestions',
            totalMaxWeightedScore: '$totalMaxWeightedScore'
          }
        },
        moduleQuestionCount: { $sum: '$totalQuestions' },
        moduleMaxWeightedScore: { $sum: '$totalMaxWeightedScore' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  return structure;
};

// Method to increment usage count
questionSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  return this.save();
};

// Method to update average score
questionSchema.methods.updateAverageScore = function(newScore) {
  const totalScores = this.usageCount * this.averageScore + newScore;
  this.averageScore = totalScores / (this.usageCount + 1);
  return this.save();
};

// Method to check if question is available for assessment type
questionSchema.methods.isAvailableFor = function(assessmentType) {
  return this.assessmentType === assessmentType || this.assessmentType === 'both';
};

// Method to get question difficulty level in French
questionSchema.methods.getDifficultyLabel = function() {
  const labels = {
    'Easy': 'Facile',
    'Medium': 'Moyen',
    'Hard': 'Difficile'
  };
  return labels[this.difficulty] || this.difficulty;
};

// Method to get criticality label in French
questionSchema.methods.getCriticalityLabel = function() {
  const labels = {
    1: 'Faible',
    2: 'Moyenne',
    3: 'Élevée'
  };
  return labels[this.criticality] || 'Non définie';
};

// Method to get module label in French
questionSchema.methods.getModuleLabel = function() {
  const labels = {
    'PM': 'Project Management',
    'Engineering': 'Ingénierie',
    'HSE': 'HSE',
    'O&M_DOI': 'O&M / DOI'
  };
  return labels[this.module] || this.module;
};

// Method to get IRL phase label in French
questionSchema.methods.getIrlPhaseLabel = function() {
  const labels = {
    'IRL1': 'IRL 1 - Observation des principes de base',
    'IRL2': 'IRL 2 - Formulation du concept technologique',
    'IRL3': 'IRL 3 - Preuve de concept analytique et expérimentale',
    'IRL4': 'IRL 4 - Validation de la technologie en laboratoire',
    'IRL5': 'IRL 5 - Validation de la technologie en environnement représentatif',
    'IRL6': 'IRL 6 - Démonstration de la technologie en environnement opérationnel'
  };
  return labels[this.irlPhase] || this.irlPhase;
};

// Method to get question family label in French
questionSchema.methods.getQuestionFamilyLabel = function() {
  const labels = {
    'Gouvernance_Pilotage': 'Gouvernance & Pilotage',
    'Livrables_Structurants': 'Livrables Structurants',
    'Methodologie_Process': 'Méthodologie / Process',
    'Outils_Digital': 'Outils et Digital',
    'Risques_Conformite': 'Risques et Conformité',
    'Module_Specifique': 'Spécifique au Module'
  };
  return labels[this.questionFamily] || this.questionFamily;
};

// --- THIS IS THE FIX ---
// Apply the pagination plugin to your schema
questionSchema.plugin(mongoosePaginate); // <-- 2. APPLY THE PLUGIN

module.exports = mongoose.model('Question', questionSchema);