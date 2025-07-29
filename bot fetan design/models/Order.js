const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      default: 0
    }
  }],
  subtotal: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
    default: null
  },
  paymentMethod: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentMethod',
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  paymentScreenshot: {
    url: String,
    publicId: String,
    uploadedAt: {
      type: Date,
      default: null
    }
  },
  paymentLink: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  shippingAddress: {
    fullName: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  notes: {
    type: String,
    default: ''
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    default: null
  },
  commission: {
    type: Number,
    default: 0
  },
  trackingNumber: {
    type: String,
    default: null
  },
  estimatedDelivery: {
    type: Date,
    default: null
  },
  deliveredAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Get count of orders today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const count = await this.constructor.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });
    
    const sequence = (count + 1).toString().padStart(4, '0');
    this.orderNumber = `FD${year}${month}${day}${sequence}`;
  }
  next();
});

// Calculate totals
orderSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
  
  this.total = this.subtotal - this.discount;
  return this;
};

// Update payment status
orderSchema.methods.updatePaymentStatus = function(status) {
  this.paymentStatus = status;
  if (status === 'completed') {
    this.status = 'confirmed';
  }
  return this.save();
};

// Update order status
orderSchema.methods.updateStatus = function(status) {
  this.status = status;
  if (status === 'delivered') {
    this.deliveredAt = new Date();
  }
  return this.save();
};

// Add payment screenshot
orderSchema.methods.addPaymentScreenshot = function(url, publicId) {
  this.paymentScreenshot = {
    url,
    publicId,
    uploadedAt: new Date()
  };
  return this.save();
};

module.exports = mongoose.model('Order', orderSchema); 