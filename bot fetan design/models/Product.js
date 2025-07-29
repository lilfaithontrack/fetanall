const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  images: [{
    url: String,
    publicId: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  category: {
    type: String,
    required: true
  },
  tags: [{
    type: String
  }],
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  subscriptionDiscounts: [{
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      required: true
    },
    discountPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  sales: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  specifications: [{
    name: String,
    value: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Calculate price with subscription discount
productSchema.methods.getPriceWithDiscount = function(subscriptionId) {
  if (!subscriptionId) return this.price;
  
  const discount = this.subscriptionDiscounts.find(
    d => d.subscription.toString() === subscriptionId.toString()
  );
  
  if (discount) {
    return this.price - (this.price * discount.discountPercentage / 100);
  }
  
  return this.price;
};

// Increment views
productSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Increment sales
productSchema.methods.incrementSales = function(quantity = 1) {
  this.sales += quantity;
  this.stock = Math.max(0, this.stock - quantity);
  return this.save();
};

// Update rating
productSchema.methods.updateRating = function(newRating) {
  const totalRating = this.rating.average * this.rating.count + newRating;
  this.rating.count += 1;
  this.rating.average = totalRating / this.rating.count;
  return this.save();
};

module.exports = mongoose.model('Product', productSchema); 