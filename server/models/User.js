const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() {
      // Password is only required for non-Keycloak users
      return this.authProvider !== 'keycloak';
    },
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  userRole: {
    type: String,
    enum: ['Business Owner', 'Project Manager', 'COO', 'Employee', 'Admin'],
    required: true,
    default: 'Employee'
  },
  isActivated: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  company: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  profileImage: {
    type: String,
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  managedProjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  // Keycloak integration fields
  keycloakId: {
    type: String,
    unique: true,
    sparse: true, // Allows null values while maintaining uniqueness
    index: true
  },
  authProvider: {
    type: String,
    enum: ['local', 'keycloak'],
    default: 'local'
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  keycloakRoles: [{
    type: String
  }]
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ userRole: 1 });
userSchema.index({ isActivated: 1 });
userSchema.index({ keycloakId: 1 });
userSchema.index({ authProvider: 1 });

// Hash password before saving (only for local auth users)
userSchema.pre('save', async function(next) {
  // Skip password hashing for Keycloak users
  if (this.authProvider === 'keycloak') {
    return next();
  }
  
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method (only for local auth users)
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (this.authProvider === 'keycloak') {
    throw new Error('Password comparison not available for Keycloak users');
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get full name virtual
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`.trim();
});

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Check if user has admin privileges (including Keycloak roles)
userSchema.methods.hasAdminAccess = function() {
  return this.isAdmin || 
         this.userRole === 'Admin' || 
         (this.keycloakRoles && (
           this.keycloakRoles.includes('admin') || 
           this.keycloakRoles.includes('pmal-admin') || 
           this.keycloakRoles.includes('realm-admin')
         ));
};

// Update user info from Keycloak token
userSchema.methods.updateFromKeycloak = function(keycloakData) {
  this.firstName = keycloakData.firstName || this.firstName;
  this.lastName = keycloakData.lastName || this.lastName;
  this.email = keycloakData.email || this.email;
  this.emailVerified = keycloakData.emailVerified || this.emailVerified;
  this.keycloakRoles = keycloakData.roles || this.keycloakRoles;
  this.lastLogin = new Date();
  this.isActivated = true; // Keycloak users are considered activated
  
  return this.save();
};

// Static method to find activated users
userSchema.statics.findActivatedUsers = function() {
  return this.find({ isActivated: true });
};

// Static method to find users by role
userSchema.statics.findByRole = function(role) {
  return this.find({ userRole: role, isActivated: true });
};

// Static method to find or create user from Keycloak data
userSchema.statics.findOrCreateFromKeycloak = async function(keycloakData) {
  try {
    // Try to find existing user by Keycloak ID first
    let user = await this.findOne({ keycloakId: keycloakData.id });
    
    if (!user) {
      // Try to find by email
      user = await this.findOne({ email: keycloakData.email });
      
      if (user) {
        // Update existing user with Keycloak ID
        user.keycloakId = keycloakData.id;
        user.authProvider = 'keycloak';
        user.isActivated = true;
        await user.updateFromKeycloak(keycloakData);
        return user;
      }
    }
    
    if (!user) {
      // Create new user
      user = new this({
        keycloakId: keycloakData.id,
        username: keycloakData.username,
        email: keycloakData.email,
        firstName: keycloakData.firstName || 'Unknown',
        lastName: keycloakData.lastName || 'User',
        userRole: keycloakData.userRole || 'Employee',
        authProvider: 'keycloak',
        isActivated: true,
        emailVerified: keycloakData.emailVerified || false,
        keycloakRoles: keycloakData.roles || [],
        lastLogin: new Date()
      });
      
      await user.save();
      return user;
    }
    
    // Update existing Keycloak user
    await user.updateFromKeycloak(keycloakData);
    return user;
    
  } catch (error) {
    console.error('Error in findOrCreateFromKeycloak:', error);
    throw error;
  }
};

// Static method to find users by auth provider
userSchema.statics.findByAuthProvider = function(provider) {
  return this.find({ authProvider: provider });
};

module.exports = mongoose.model('User', userSchema);