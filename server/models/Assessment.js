const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  selectedOption: {
    _id: { type: mongoose.Schema.Types.ObjectId },
    text: { type: String },
    value: { type: Number }
  },
  textAnswer: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  weightedScore: {
    type: Number,
    required: true,
    min: 0,
    max: 9 // max score (3) * max weight (3)
  },
  criticality: {
    type: Number,
    required: true,
    min: 1,
    max: 3,
    default: 1
  },
  timeSpent: {
    type: Number,
    default: 0
  },
  answeredAt: {
    type: Date,
    default: Date.now
  },
  // Deep assessment specific fields
  module: {
    type: String,
    enum: ['PM', 'Engineering', 'HSE', 'O&M_DOI'],
    required: function() { return this.parent().type === 'deep'; }
  },
  questionFamily: {
    type: String,
    enum: [
      'Gouvernance_Pilotage',
      'Livrables_Structurants', 
      'Methodologie_Process',
      'Outils_Digital',
      'Risques_Conformite',
      'Module_Specifique'
    ],
    required: function() { return this.parent().type === 'deep'; }
  },
  irlPhase: {
    type: String,
    enum: ['IRL1', 'IRL2', 'IRL3', 'IRL4', 'IRL5', 'IRL6'],
    required: function() { return this.parent().type === 'deep'; }
  }
}, { _id: true });

const categoryScoreSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0
  },
  weightedScore: {
    type: Number,
    required: true,
    min: 0
  },
  maxPossibleScore: {
    type: Number,
    required: true
  },
  maxPossibleWeightedScore: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  questionsAnswered: {
    type: Number,
    required: true,
    default: 0
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  strengths: [{
    type: String,
    trim: true
  }],
  weaknesses: [{
    type: String,
    trim: true
  }],
  recommendations: [{
    type: String,
    trim: true
  }]
}, { _id: true });

// Deep assessment specific schemas
const moduleScoreSchema = new mongoose.Schema({
  module: {
    type: String,
    enum: ['PM', 'Engineering', 'HSE', 'O&M_DOI'],
    required: true
  },
  irlPhase: {
    type: String,
    enum: ['IRL1', 'IRL2', 'IRL3', 'IRL4', 'IRL5', 'IRL6'],
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  weightedScore: {
    type: Number,
    required: true,
    min: 0
  },
  maxPossibleWeightedScore: {
    type: Number,
    required: true
  },
  maturityLevel: {
    type: String,
    enum: ['M1', 'M2', 'M3'],
    required: true
  },
  isComplete: {
    type: Boolean,
    default: false
  },
  canProceedToNext: {
    type: Boolean,
    default: false
  },
  familyScores: [{
    family: {
      type: String,
      enum: [
        'Gouvernance_Pilotage',
        'Livrables_Structurants', 
        'Methodologie_Process',
        'Outils_Digital',
        'Risques_Conformite',
        'Module_Specifique'
      ],
      required: true
    },
    score: { type: Number, required: true, min: 0 },
    weightedScore: { type: Number, required: true, min: 0 },
    questionsAnswered: { type: Number, required: true, default: 0 },
    totalQuestions: { type: Number, required: true }
  }],
  strengths: [String],
  weaknesses: [String],
  recommendations: [String]
}, { _id: true });

const deepAssessmentProgressSchema = new mongoose.Schema({
  currentModule: {
    type: String,
    enum: ['PM', 'Engineering', 'HSE', 'O&M_DOI'],
    required: function() { return this.parent().type === 'deep'; }
  },
  currentIrlPhase: {
    type: String,
    enum: ['IRL1', 'IRL2', 'IRL3', 'IRL4', 'IRL5', 'IRL6'],
    required: function() { return this.parent().type === 'deep'; }
  },
  currentQuestionFamily: {
    type: String,
    enum: [
      'Gouvernance_Pilotage',
      'Livrables_Structurants', 
      'Methodologie_Process',
      'Outils_Digital',
      'Risques_Conformite',
      'Module_Specifique'
    ],
    required: function() { return this.parent().type === 'deep'; }
  },
  completedModules: [{
    module: String,
    irlPhase: String,
    completedAt: Date,
    score: Number
  }],
  unlockedPhases: [{
    module: String,
    irlPhase: String,
    unlockedAt: Date
  }],
  blockedReasons: [{
    module: String,
    irlPhase: String,
    reason: String,
    requiredScore: Number,
    currentScore: Number
  }]
});

const assessmentSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  assessedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['quick', 'deep'],
    required: true
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'paused', 'cancelled'],
    default: 'in-progress'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  totalDuration: {
    type: Number,
    default: 0
  },
  answers: [answerSchema],
  categoryScores: [categoryScoreSchema],
  
  // Deep assessment specific fields
  moduleScores: [moduleScoreSchema],
  deepAssessmentProgress: {
    type: deepAssessmentProgressSchema,
    required: function() { return this.type === 'deep'; }
  },
  
  overallScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 3
  },
  overallWeightedScore: {
    type: Number,
    default: 0,
    min: 0
  },
  overallPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  maturityLevel: {
    type: String,
    enum: ['M1', 'M2', 'M3'],
    default: 'M1'
  },
  weakestCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  strongestCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  currentQuestionIndex: {
    type: Number,
    default: 0
  },
  currentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  completedCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  feedback: {
    strengths: [{
      type: String,
      trim: true
    }],
    improvements: [{
      type: String,
      trim: true
    }],
    nextSteps: [{
      type: String,
      trim: true
    }],
    summary: {
      type: String,
      trim: true,
      maxlength: 2000
    },
    // Deep assessment specific feedback
    moduleRecommendations: [{
      module: String,
      irlPhase: String,
      recommendations: [String]
    }],
    phaseTips: [{
      currentPhase: String,
      nextPhase: String,
      tips: [String]
    }]
  },
  metadata: {
    questionsTotal: { type: Number, default: 0 },
    questionsAnswered: { type: Number, default: 0 },
    averageTimePerQuestion: { type: Number, default: 0 },
    deviceInfo: { type: String },
    browserInfo: { type: String },
    ipAddress: { type: String },
    // Deep assessment metadata
    totalModules: { type: Number, default: 0 },
    completedModules: { type: Number, default: 0 },
    totalPhases: { type: Number, default: 0 },
    completedPhases: { type: Number, default: 0 }
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
assessmentSchema.index({ project: 1 });
assessmentSchema.index({ assessedBy: 1 });
assessmentSchema.index({ type: 1 });
assessmentSchema.index({ status: 1 });
assessmentSchema.index({ createdAt: -1 });
assessmentSchema.index({ overallScore: 1 });
assessmentSchema.index({ 'deepAssessmentProgress.currentModule': 1 });
assessmentSchema.index({ 'deepAssessmentProgress.currentIrlPhase': 1 });

// Virtual for progress percentage
assessmentSchema.virtual('progressPercentage').get(function() {
  if (this.type === 'quick') {
    if (this.metadata.questionsTotal === 0) return 0;
    return Math.round((this.metadata.questionsAnswered / this.metadata.questionsTotal) * 100);
  } else {
    // Deep assessment progress calculation
    if (this.metadata.totalPhases === 0) return 0;
    return Math.round((this.metadata.completedPhases / this.metadata.totalPhases) * 100);
  }
});

// Method to add answer (enhanced for deep assessment)
assessmentSchema.methods.addAnswer = function(questionId, selectedOption, textAnswer, score, timeSpent, questionData = {}) {
  const existingAnswerIndex = this.answers.findIndex(
    answer => answer.question.toString() === questionId.toString()
  );

  const answerData = {
    question: questionId,
    selectedOption,
    textAnswer,
    score,
    timeSpent,
    answeredAt: new Date()
  };

  // Add deep assessment specific data
  if (this.type === 'deep' && questionData) {
    answerData.weightedScore = score * (questionData.criticality || 1);
    answerData.criticality = questionData.criticality || 1;
    answerData.module = questionData.module;
    answerData.questionFamily = questionData.questionFamily;
    answerData.irlPhase = questionData.irlPhase;
  } else {
    answerData.weightedScore = score;
    answerData.criticality = 1;
  }

  if (existingAnswerIndex !== -1) {
    this.answers[existingAnswerIndex] = answerData;
  } else {
    this.answers.push(answerData);
    this.metadata.questionsAnswered += 1;
  }

  const totalTime = this.answers.reduce((sum, answer) => sum + (answer.timeSpent || 0), 0);
  this.metadata.averageTimePerQuestion = totalTime / this.answers.length;

  return this.save();
};

// Method to calculate scores (enhanced for deep assessment)
assessmentSchema.methods.calculateScores = async function() {
  if (this.type === 'quick') {
    return this.calculateCategoryScores();
  } else {
    return this.calculateDeepAssessmentScores();
  }
};

// Enhanced category scores calculation
assessmentSchema.methods.calculateCategoryScores = async function() {
  const Category = mongoose.model('Category');
  const Question = mongoose.model('Question');
  
  const categories = await Category.find({ isActive: true });

  this.categoryScores = [];
  let totalScore = 0;
  let totalWeightedScore = 0;
  let totalMaxWeightedScore = 0;
  let totalQuestions = 0;

  for (const category of categories) {
    const categoryQuestions = await Question.find({
      category: category._id,
      isActive: true
    });

    const categoryAnswers = this.answers.filter(answer => {
      return categoryQuestions.some(q => q._id.toString() === answer.question.toString());
    });

    if (categoryAnswers.length > 0) {
      const categoryScore = categoryAnswers.reduce((sum, answer) => sum + answer.score, 0);
      const categoryWeightedScore = categoryAnswers.reduce((sum, answer) => sum + answer.weightedScore, 0);
      const maxPossibleScore = categoryAnswers.length * 3;
      const maxPossibleWeightedScore = categoryAnswers.reduce((sum, answer) => sum + (3 * answer.criticality), 0);
      const percentage = (categoryWeightedScore / maxPossibleWeightedScore) * 100;

      this.categoryScores.push({
        category: category._id,
        score: categoryScore,
        weightedScore: categoryWeightedScore,
        maxPossibleScore,
        maxPossibleWeightedScore,
        percentage,
        questionsAnswered: categoryAnswers.length,
        totalQuestions: categoryAnswers.length
      });

      totalScore += categoryScore;
      totalWeightedScore += categoryWeightedScore;
      totalMaxWeightedScore += maxPossibleWeightedScore;
      totalQuestions += categoryAnswers.length;
    }
  }

  this.overallScore = totalQuestions > 0 ? totalScore / totalQuestions : 0;
  this.overallWeightedScore = totalWeightedScore;
  this.overallPercentage = totalMaxWeightedScore > 0 ? (totalWeightedScore / totalMaxWeightedScore) * 100 : 0;
  this.maturityLevel = this.getMaturityLevel(this.overallScore);

  if (this.categoryScores.length > 0) {
    const sortedByScore = [...this.categoryScores].sort((a, b) => a.percentage - b.percentage);
    this.weakestCategory = sortedByScore[0].category;
    this.strongestCategory = sortedByScore[sortedByScore.length - 1].category;
  }

  return this.save();
};

// New method for deep assessment score calculation
assessmentSchema.methods.calculateDeepAssessmentScores = async function() {
  const Question = mongoose.model('Question');
  
  // Group answers by module and IRL phase
  const modulePhaseAnswers = {};
  
  for (const answer of this.answers) {
    const key = `${answer.module}_${answer.irlPhase}`;
    if (!modulePhaseAnswers[key]) {
      modulePhaseAnswers[key] = [];
    }
    modulePhaseAnswers[key].push(answer);
  }

  this.moduleScores = [];
  let totalWeightedScore = 0;
  let totalMaxWeightedScore = 0;

  // Calculate scores for each module-phase combination
  for (const [key, answers] of Object.entries(modulePhaseAnswers)) {
    const [module, irlPhase] = key.split('_');
    
    // Group by question family
    const familyScores = {};
    const families = ['Gouvernance_Pilotage', 'Livrables_Structurants', 'Methodologie_Process', 'Outils_Digital', 'Risques_Conformite', 'Module_Specifique'];
    
    for (const family of families) {
      const familyAnswers = answers.filter(a => a.questionFamily === family);
      if (familyAnswers.length > 0) {
        const familyScore = familyAnswers.reduce((sum, a) => sum + a.score, 0) / familyAnswers.length;
        const familyWeightedScore = familyAnswers.reduce((sum, a) => sum + a.weightedScore, 0);
        
        familyScores[family] = {
          family,
          score: familyScore,
          weightedScore: familyWeightedScore,
          questionsAnswered: familyAnswers.length,
          totalQuestions: familyAnswers.length
        };
      }
    }

    // Calculate module-phase score
    const moduleScore = answers.reduce((sum, a) => sum + a.score, 0) / answers.length;
    const moduleWeightedScore = answers.reduce((sum, a) => sum + a.weightedScore, 0);
    const maxPossibleWeightedScore = answers.reduce((sum, a) => sum + (3 * a.criticality), 0);
    
    const maturityLevel = this.getMaturityLevel(moduleScore);
    const canProceedToNext = moduleScore >= 2.4; // M3 level required to proceed

    this.moduleScores.push({
      module,
      irlPhase,
      score: moduleScore,
      weightedScore: moduleWeightedScore,
      maxPossibleWeightedScore,
      maturityLevel,
      isComplete: true,
      canProceedToNext,
      familyScores: Object.values(familyScores)
    });

    totalWeightedScore += moduleWeightedScore;
    totalMaxWeightedScore += maxPossibleWeightedScore;
  }

  // Calculate overall scores
  this.overallWeightedScore = totalWeightedScore;
  this.overallScore = this.answers.length > 0 ? 
    this.answers.reduce((sum, a) => sum + a.score, 0) / this.answers.length : 0;
  this.overallPercentage = totalMaxWeightedScore > 0 ? 
    (totalWeightedScore / totalMaxWeightedScore) * 100 : 0;
  this.maturityLevel = this.getMaturityLevel(this.overallScore);

  return this.save();
};

// Method to check phase progression eligibility
assessmentSchema.methods.canProgressToPhase = function(module, targetPhase) {
  if (this.type !== 'deep') return false;
  
  const moduleScore = this.moduleScores.find(ms => 
    ms.module === module && 
    ms.irlPhase === this.getPreviousPhase(targetPhase)
  );
  
  return moduleScore && moduleScore.canProceedToNext;
};

// Helper method to get previous phase
assessmentSchema.methods.getPreviousPhase = function(currentPhase) {
  const phases = ['IRL1', 'IRL2', 'IRL3', 'IRL4', 'IRL5', 'IRL6'];
  const index = phases.indexOf(currentPhase);
  return index > 0 ? phases[index - 1] : null;
};

// Method to determine maturity level
assessmentSchema.methods.getMaturityLevel = function(score) {
  if (score >= 2.4) return 'M3';
  if (score >= 1.7) return 'M2';
  return 'M1';
};

// Method to complete assessment (enhanced)
assessmentSchema.methods.completeAssessment = async function() {
  this.status = 'completed';
  this.completedAt = new Date();
  this.totalDuration = Math.round((this.completedAt - this.startedAt) / (1000 * 60));

  await this.calculateScores();
  this.generateFeedback();

  return this.save();
};

// Enhanced feedback generation
assessmentSchema.methods.generateFeedback = function() {
  const score = this.overallScore;

  this.feedback = {
    strengths: [],
    improvements: [],
    nextSteps: [],
    summary: '',
    moduleRecommendations: [],
    phaseTips: []
  };

  if (this.type === 'quick') {
    // Quick assessment feedback (existing logic)
    if (score >= 2.4) {
      this.feedback.summary = "Excellente performance ! Votre projet démontre un niveau de maturité élevé et une structure bien définie.";
      this.feedback.strengths.push("Processus de gestion de projet robustes");
      this.feedback.strengths.push("Documentation complète et structurée");
      this.feedback.strengths.push("Gouvernance claire et effective");
      this.feedback.nextSteps.push("Continuer l'optimisation et l'amélioration continue");
      this.feedback.nextSteps.push("Considérer le passage au Deep Assessment");
    } else if (score >= 1.7) {
      this.feedback.summary = "Performance correcte avec des fondations solides, mais des améliorations sont possibles.";
      this.feedback.improvements.push("Renforcer la documentation et la standardisation");
      this.feedback.improvements.push("Améliorer la communication et la coordination");
      this.feedback.nextSteps.push("Mettre en place des processus de révision réguliers");
      this.feedback.nextSteps.push("Préparer le Deep Assessment pour une analyse approfondie");
    } else {
      this.feedback.summary = "Le projet nécessite des améliorations significatives avant de passer au Deep Assessment.";
      this.feedback.improvements.push("Établir des processus de gestion de projet de base");
      this.feedback.improvements.push("Définir clairement les rôles et responsabilités");
      this.feedback.nextSteps.push("Formation en gestion de projet recommandée");
      this.feedback.nextSteps.push("Atteindre M2 minimum avant le Deep Assessment");
    }
  } else {
    // Deep assessment feedback
    this.feedback.summary = `Évaluation approfondie terminée avec un niveau de maturité ${this.maturityLevel}. `;
    
    if (score >= 2.4) {
      this.feedback.summary += "Projet prêt pour la transition vers les phases industrielles.";
      this.feedback.strengths.push("Excellente maturité technique et organisationnelle");
      this.feedback.strengths.push("Processus industriels bien définis");
    } else if (score >= 1.7) {
      this.feedback.summary += "Bases solides établies, quelques axes d'amélioration identifiés.";
      this.feedback.improvements.push("Renforcer les processus critiques identifiés");
    } else {
      this.feedback.summary += "Importantes lacunes à combler avant la suite du projet.";
      this.feedback.improvements.push("Revoir fondamentalement l'approche projet");
    }

    // Module-specific recommendations
    this.moduleScores.forEach(moduleScore => {
      const recommendations = [];
      
      if (moduleScore.score < 2.0) {
        recommendations.push(`Renforcer significativement le module ${moduleScore.module} en phase ${moduleScore.irlPhase}`);
      }
      
      if (!moduleScore.canProceedToNext) {
        recommendations.push(`Atteindre M3 (≥2.4) pour débloquer la phase suivante`);
      }

      if (recommendations.length > 0) {
        this.feedback.moduleRecommendations.push({
          module: moduleScore.module,
          irlPhase: moduleScore.irlPhase,
          recommendations
        });
      }
    });
  }
};

// Static methods
assessmentSchema.statics.getByProject = function(projectId) {
  return this.find({ project: projectId })
    .populate('assessedBy', 'firstName lastName email')
    .populate('project', 'name phase')
    .sort({ createdAt: -1 });
};

assessmentSchema.statics.getUserHistory = function(userId) {
  return this.find({ assessedBy: userId })
    .populate('project', 'name phase status')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Assessment', assessmentSchema);