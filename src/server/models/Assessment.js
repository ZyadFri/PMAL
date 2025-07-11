const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  selectedOption: {
    optionId: { type: mongoose.Schema.Types.ObjectId },
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
    max: 5
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
    min: 0,
    max: 5
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
    max: 5
  },
  overallPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  maturityLevel: {
    type: String,
    enum: ['Level 1: Initial', 'Level 2: Repeatable', 'Level 3: Defined', 'Level 4: Managed', 'Level 5: Optimized'],
    default: 'Level 1: Initial'
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

// Method to calculate category scores
assessmentSchema.methods.calculateCategoryScores = async function() {
  const Category = mongoose.model('Category');
  const categories = await Category.find({ isActive: true });

  this.categoryScores = [];
  let totalScore = 0;
  let totalMaxScore = 0;

  for (const category of categories) {
    const categoryAnswers = this.answers.filter(answer => 
      answer.question && answer.question.category && 
      answer.question.category.toString() === category._id.toString()
    );

    if (categoryAnswers.length > 0) {
      const categoryScore = categoryAnswers.reduce((sum, answer) => sum + answer.score, 0);
      const maxPossibleScore = categoryAnswers.length * 5;
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
      totalMaxScore += maxPossibleScore;
    }
  }

  // Calculate overall score
  this.overallScore = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 5 : 0;
  this.overallPercentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;

  // Determine maturity level
  this.maturityLevel = this.getMaturityLevel(this.overallPercentage);

  // Find weakest and strongest categories
  if (this.categoryScores.length > 0) {
    const sortedByScore = [...this.categoryScores].sort((a, b) => a.percentage - b.percentage);
    this.weakestCategory = sortedByScore[0].category;
    this.strongestCategory = sortedByScore[sortedByScore.length - 1].category;
  }

  return this.save();
};

// Method to determine maturity level based on percentage
assessmentSchema.methods.getMaturityLevel = function(percentage) {
  if (percentage >= 90) return 'Level 5: Optimized';
  if (percentage >= 75) return 'Level 4: Managed';
  if (percentage >= 60) return 'Level 3: Defined';
  if (percentage >= 40) return 'Level 2: Repeatable';
  return 'Level 1: Initial';
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

// Method to generate feedback
assessmentSchema.methods.generateFeedback = function() {
  const percentage = this.overallPercentage;

  // General feedback based on score
  if (percentage >= 80) {
    this.feedback.summary = "Excellent performance! Your project demonstrates high maturity levels across most categories.";
    this.feedback.strengths.push("Strong project management practices");
    this.feedback.strengths.push("Well-defined processes and procedures");
    this.feedback.nextSteps.push("Focus on continuous improvement and optimization");
  } else if (percentage >= 60) {
    this.feedback.summary = "Good performance with room for improvement. Your project shows solid foundations with some areas needing attention.";
    this.feedback.improvements.push("Enhance documentation and standardization");
    this.feedback.nextSteps.push("Implement regular review processes");
  } else if (percentage >= 40) {
    this.feedback.summary = "Fair performance. Your project has basic structures in place but requires significant improvements.";
    this.feedback.improvements.push("Establish formal processes and procedures");
    this.feedback.improvements.push("Improve team communication and coordination");
    this.feedback.nextSteps.push("Prioritize training and skill development");
  } else {
    this.feedback.summary = "Needs significant improvement. Your project requires immediate attention across multiple areas.";
    this.feedback.improvements.push("Implement basic project management practices");
    this.feedback.improvements.push("Establish clear roles and responsibilities");
    this.feedback.nextSteps.push("Consider project management training");
    this.feedback.nextSteps.push("Seek expert consultation");
  }

  // Category-specific feedback
  if (this.weakestCategory) {
    this.feedback.improvements.push(`Focus on improving ${this.weakestCategory.name} practices`);
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