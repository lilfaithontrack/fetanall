const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['bank', 'mobile_money', 'crypto', 'other'],
    required: true
  },
  accountNumber: {
    type: String,
    required: true
  },
  accountName: {
    type: String,
    required: true
  },
  bankName: {
    type: String,
    default: null
  },
  screenshot: {
    url: String,
    publicId: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  instructions: {
    type: String,
    required: true
  },
  minimumAmount: {
    type: Number,
    default: 0
  },
  maximumAmount: {
    type: Number,
    default: null
  },
  processingTime: {
    type: String,
    default: 'Instant'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema); 