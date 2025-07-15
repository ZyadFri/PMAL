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
    max: 3 // Changed to 3 for French system
  },
  timeSpent: {
    type: Number,
    default: 0 // in seconds
  },
  answeredAt: {
    type: Date,
    default: Date.now
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
    // Removed max limit since this is the total sum of category answers
  },
  maxPossibleScore: {
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
    default: 0 // in minutes
  },
  answers: [answerSchema],
  categoryScores: [categoryScoreSchema],
  overallScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 3 // Changed to 3 for French system
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
    }
  },
  metadata: {
    questionsTotal: { type: Number, default: 0 },
    questionsAnswered: { type: Number, default: 0 },
    averageTimePerQuestion: { type: Number, default: 0 },
    deviceInfo: { type: String },
    browserInfo: { type: String },
    ipAddress: { type: String }
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better performance
assessmentSchema.index({ project: 1 });
assessmentSchema.index({ assessedBy: 1 });
assessmentSchema.index({ type: 1 });
assessmentSchema.index({ status: 1 });
assessmentSchema.index({ createdAt: -1 });
assessmentSchema.index({ overallScore: 1 });

// Virtual for progress percentage
assessmentSchema.virtual('progressPercentage').get(function() {
  if (this.metadata.questionsTotal === 0) return 0;
  return Math.round((this.metadata.questionsAnswered / this.metadata.questionsTotal) * 100);
});

// Method to add answer
assessmentSchema.methods.addAnswer = function(questionId, selectedOption, textAnswer, score, timeSpent) {
  // Check if answer already exists for this question
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

  if (existingAnswerIndex !== -1) {
    // Update existing answer
    this.answers[existingAnswerIndex] = answerData;
  } else {
    // Add new answer
    this.answers.push(answerData);
    this.metadata.questionsAnswered += 1;
  }

  // Update average time per question
  const totalTime = this.answers.reduce((sum, answer) => sum + (answer.timeSpent || 0), 0);
  this.metadata.averageTimePerQuestion = totalTime / this.answers.length;

  return this.save();
};

// Method to calculate category scores - Updated for French system
assessmentSchema.methods.calculateCategoryScores = async function() {
  const Category = mongoose.model('Category');
  const Question = mongoose.model('Question');
  
  const categories = await Category.find({ isActive: true });

  this.categoryScores = [];
  let totalScore = 0;
  let totalQuestions = 0;

  for (const category of categories) {
    // Get category questions
    const categoryQuestions = await Question.find({
      category: category._id,
      isActive: true
    });

    const categoryAnswers = this.answers.filter(answer => {
      return categoryQuestions.some(q => q._id.toString() === answer.question.toString());
    });

    if (categoryAnswers.length > 0) {
      const categoryScore = categoryAnswers.reduce((sum, answer) => sum + answer.score, 0);
      const maxPossibleScore = categoryAnswers.length * 3; // Max 3 per question in French system
      const percentage = (categoryScore / maxPossibleScore) * 100;

      this.categoryScores.push({
        category: category._id,
        score: categoryScore,
        maxPossibleScore,
        percentage,
        questionsAnswered: categoryAnswers.length,
        totalQuestions: categoryAnswers.length
      });

      totalScore += categoryScore;
      totalQuestions += categoryAnswers.length;
    }
  }

  // Calculate overall score (average of all answers, max 3)
  this.overallScore = totalQuestions > 0 ? totalScore / totalQuestions : 0;
  this.overallPercentage = totalQuestions > 0 ? (totalScore / (totalQuestions * 3)) * 100 : 0;

  // Determine maturity level based on French system
  this.maturityLevel = this.getMaturityLevel(this.overallScore);

  // Find weakest and strongest categories
  if (this.categoryScores.length > 0) {
    const sortedByScore = [...this.categoryScores].sort((a, b) => a.percentage - b.percentage);
    this.weakestCategory = sortedByScore[0].category;
    this.strongestCategory = sortedByScore[sortedByScore.length - 1].category;
  }

  return this.save();
};

// Method to determine maturity level based on French system
assessmentSchema.methods.getMaturityLevel = function(score) {
  if (score >= 2.4) return 'M3'; // Maturité élevée / projet bien structuré
  if (score >= 1.7) return 'M2'; // Maturité moyenne
  return 'M1'; // Maturité très faible
};

// Method to complete assessment
assessmentSchema.methods.completeAssessment = async function() {
  this.status = 'completed';
  this.completedAt = new Date();
  this.totalDuration = Math.round((this.completedAt - this.startedAt) / (1000 * 60)); // in minutes

  // Calculate final scores
  await this.calculateCategoryScores();

  // Generate feedback
  this.generateFeedback();

  return this.save();
};

// Method to generate feedback - Updated for French system
assessmentSchema.methods.generateFeedback = function() {
  const score = this.overallScore;

  // Clear existing feedback
  this.feedback = {
    strengths: [],
    improvements: [],
    nextSteps: [],
    summary: ''
  };

  // Generate feedback based on French maturity levels
  if (score >= 2.4) { // M3 - Maturité élevée
    this.feedback.summary = "Excellente performance ! Votre projet démontre un niveau de maturité élevé et une structure bien définie.";
    this.feedback.strengths.push("Processus de gestion de projet robustes");
    this.feedback.strengths.push("Documentation complète et structurée");
    this.feedback.strengths.push("Gouvernance claire et effective");
    this.feedback.nextSteps.push("Continuer l'optimisation et l'amélioration continue");
    this.feedback.nextSteps.push("Partager les bonnes pratiques avec d'autres projets");
  } else if (score >= 1.7) { // M2 - Maturité moyenne
    this.feedback.summary = "Performance correcte avec des fondations solides, mais des améliorations sont possibles dans certains domaines.";
    this.feedback.strengths.push("Structure de base du projet établie");
    this.feedback.strengths.push("Processus partiellement définis");
    this.feedback.improvements.push("Renforcer la documentation et la standardisation");
    this.feedback.improvements.push("Améliorer la communication et la coordination");
    this.feedback.nextSteps.push("Mettre en place des processus de révision réguliers");
    this.feedback.nextSteps.push("Développer les compétences de l'équipe");
  } else { // M1 - Maturité très faible
    this.feedback.summary = "Le projet nécessite des améliorations significatives dans plusieurs domaines critiques.";
    this.feedback.improvements.push("Établir des processus de gestion de projet de base");
    this.feedback.improvements.push("Définir clairement les rôles et responsabilités");
    this.feedback.improvements.push("Mettre en place une gouvernance projet structurée");
    this.feedback.improvements.push("Améliorer la documentation et le suivi");
    this.feedback.nextSteps.push("Formation en gestion de projet recommandée");
    this.feedback.nextSteps.push("Considérer l'assistance d'experts externes");
    this.feedback.nextSteps.push("Prioriser la mise en place de processus fondamentaux");
  }

  // Add category-specific feedback
  if (this.categoryScores.length > 0) {
    const weakestCat = this.categoryScores.find(cs => 
      cs.category.toString() === this.weakestCategory?.toString()
    );
    
    if (weakestCat && weakestCat.percentage < 60) {
      this.feedback.improvements.push(`Attention particulière requise pour la catégorie la plus faible`);
    }
  }
};

// Static method to get assessments by project
assessmentSchema.statics.getByProject = function(projectId) {
  return this.find({ project: projectId })
    .populate('assessedBy', 'firstName lastName email')
    .populate('project', 'name phase')
    .sort({ createdAt: -1 });
};

// Static method to get user's assessment history
assessmentSchema.statics.getUserHistory = function(userId) {
  return this.find({ assessedBy: userId })
    .populate('project', 'name phase status')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Assessment', assessmentSchema);