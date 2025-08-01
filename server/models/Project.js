const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['Owner', 'Manager', 'Member', 'Viewer'],
    required: true,
    default: 'Member'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  permissions: {
    canEdit: { type: Boolean, default: false },
    canAssess: { type: Boolean, default: true },
    canViewReports: { type: Boolean, default: true },
    canManageTeam: { type: Boolean, default: false }
  }
}, { _id: true });

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  phase: {
    type: String,
    enum: ['Planning', 'Development', 'Testing', 'Deployment', 'Maintenance'],
    required: true
  },
  status: {
    type: String,
    enum: ['Not Yet Scored', 'Quick Assessment In Progress', 'Quick Assessment Complete', 
           'Deep Assessment In Progress', 'Deep Assessment Complete', 'Completed'],
    default: 'Not Yet Scored'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  team: [teamMemberSchema],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  budget: {
    type: Number,
    default: 0
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  quickAssessment: {
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score: { type: Number, default: 0, min: 0, max: 5 },
    weakestCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    duration: { type: Number, default: 0 } // in minutes
  },
  deepAssessment: {
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score: { type: Number, default: 0, min: 0, max: 5 },
    currentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    completedCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    duration: { type: Number, default: 0 } // in minutes
  },
  overallScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  maturityLevel: {
    type: String,
    enum: ['Initial', 'Repeatable', 'Defined', 'Managed', 'Optimized'],
    default: 'Initial'
  },
  assessmentHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment'
  }],
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better performance
projectSchema.index({ owner: 1 });
projectSchema.index({ manager: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ phase: 1 });
projectSchema.index({ isActive: 1 });
projectSchema.index({ 'team.user': 1 });

// Virtual for calculating completion percentage
projectSchema.virtual('completionPercentage').get(function() {
  if (this.status === 'Completed') return 100;
  if (this.status === 'Deep Assessment Complete') return 90;
  if (this.status === 'Deep Assessment In Progress') return 60;
  if (this.status === 'Quick Assessment Complete') return 40;
  if (this.status === 'Quick Assessment In Progress') return 20;
  return 0;
});

// Method to add team member
projectSchema.methods.addTeamMember = function(userId, role = 'Member') {
  const existingMember = this.team.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (!existingMember) {
    this.team.push({
      user: userId,
      role: role,
      permissions: this.getDefaultPermissions(role)
    });
  }
  
  return this.save();
};

// Method to remove team member
projectSchema.methods.removeTeamMember = function(userId) {
  this.team = this.team.filter(member => 
    member.user.toString() !== userId.toString()
  );
  return this.save();
};

// Method to get default permissions based on role
projectSchema.methods.getDefaultPermissions = function(role) {
  switch (role) {
    case 'Owner':
      return {
        canEdit: true,
        canAssess: true,
        canViewReports: true,
        canManageTeam: true
      };
    case 'Manager':
      return {
        canEdit: true,
        canAssess: true,
        canViewReports: true,
        canManageTeam: true
      };
    case 'Member':
      return {
        canEdit: false,
        canAssess: true,
        canViewReports: true,
        canManageTeam: false
      };
    case 'Viewer':
      return {
        canEdit: false,
        canAssess: false,
        canViewReports: true,
        canManageTeam: false
      };
    default:
      return {
        canEdit: false,
        canAssess: false,
        canViewReports: false,
        canManageTeam: false
      };
  }
};

// Method to update project status
projectSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  
  // Update progress based on status
  switch (newStatus) {
    case 'Quick Assessment Complete':
      this.progress = Math.max(this.progress, 40);
      break;
    case 'Deep Assessment Complete':
      this.progress = Math.max(this.progress, 90);
      break;
    case 'Completed':
      this.progress = 100;
      break;
  }
  
  return this.save();
};

// Static method to find projects by user
projectSchema.statics.findByUser = function(userId) {
  return this.find({
    $or: [
      { owner: userId },
      { manager: userId },
      { 'team.user': userId }
    ],
    isActive: true
  }).populate('owner manager', 'firstName lastName email userRole');
};

// Static method to find projects by phase
projectSchema.statics.findByPhase = function(phase) {
  return this.find({ phase, isActive: true });
};

module.exports = mongoose.model('Project', projectSchema);