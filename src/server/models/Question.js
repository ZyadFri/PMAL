const mongoose = require('mongoose');

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
    max: 5
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
    max: 5
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

// Validate options based on question type
questionSchema.pre('save', function(next) {
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
  
  next();
});

// Static method to get questions by category
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

// Static method to get random questions for quick assessment
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

module.exports = mongoose.model('Question', questionSchema);