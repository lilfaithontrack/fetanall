const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  minValue: {
    type: Number,
    required: true,
    min: 0
  },
  maxValue: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true
  },
  benefits: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  color: {
    type: String,
    default: '#007bff'
  },
  icon: {
    type: String,
    default: '⭐'
  }
}, {
  timestamps: true
});

// Validate max value is greater than min value
levelSchema.pre('save', function(next) {
  if (this.maxValue <= this.minValue) {
    next(new Error('Max value must be greater than min value'));
  }
  next();
});

module.exports = mongoose.model('Level', levelSchema); 