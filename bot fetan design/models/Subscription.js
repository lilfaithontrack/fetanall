const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
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
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in days
    required: true,
    default: 30
  },
  features: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  discountPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  maxUsers: {
    type: Number,
    default: null // null means unlimited
  },
  currentUsers: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate discounted price
subscriptionSchema.methods.getDiscountedPrice = function() {
  if (this.discountPercentage > 0) {
    return this.price - (this.price * this.discountPercentage / 100);
  }
  return this.price;
};

module.exports = mongoose.model('Subscription', subscriptionSchema); 