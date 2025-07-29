const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const agentSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  referredUsers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    referredAt: {
      type: Date,
      default: Date.now
    }
  }],
  commission: {
    type: Number,
    default: 10, // percentage
    min: 0,
    max: 100
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['agent', 'super_agent'],
    default: 'agent'
  },
  permissions: [{
    type: String,
    enum: ['add_user', 'edit_user', 'delete_user', 'view_reports', 'manage_products']
  }],
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Hash password before saving
agentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Generate referral code
agentSchema.methods.generateReferralCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Compare password
agentSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Add referred user
agentSchema.methods.addReferredUser = function(userId) {
  this.referredUsers.push({ user: userId });
  return this.save();
};

// Calculate commission
agentSchema.methods.calculateCommission = function(amount) {
  return (amount * this.commission) / 100;
};

// Update earnings
agentSchema.methods.addEarnings = function(amount) {
  this.totalEarnings += amount;
  return this.save();
};

module.exports = mongoose.model('Agent', agentSchema); 