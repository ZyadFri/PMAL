const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: 10
  },
  phase: {
    type: String,
    enum: ['Planning', 'Development', 'Testing', 'Deployment', 'Maintenance', 'All'],
    required: true,
    default: 'All'
  },
  weight: {
    type: Number,
    required: true,
    default: 1,
    min: 0.1,
    max: 5
  },
  quickAssessmentWeight: {
    type: Number,
    required: true,
    default: 1,
    min: 0.1,
    max: 5
  },
  deepAssessmentWeight: {
    type: Number,
    required: true,
    default: 1,
    min: 0.1,
    max: 5
  },
  order: {
    type: Number,
    required: true,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  color: {
    type: String,
    default: '#1e3c72',
    trim: true
  },
  icon: {
    type: String,
    default: 'fas fa-folder',
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questionCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better performance
categorySchema.index({ code: 1 });
categorySchema.index({ phase: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ order: 1 });

// Static method to get active categories
categorySchema.statics.getActiveCategories = function() {
  return this.find({ isActive: true }).sort({ order: 1 });
};

// Static method to get categories by phase
categorySchema.statics.getCategoriesByPhase = function(phase) {
  return this.find({ 
    phase: { $in: [phase, 'All'] }, 
    isActive: true 
  }).sort({ order: 1 });
};

// Update question count when questions are added/removed
categorySchema.methods.updateQuestionCount = async function() {
  const Question = mongoose.model('Question');
  this.questionCount = await Question.countDocuments({ 
    category: this._id, 
    isActive: true 
  });
  return this.save();
};

module.exports = mongoose.model('Category', categorySchema);