const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Order = require('../models/Order');

const router = express.Router();

// Middleware to verify admin token
const verifyAdminToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// Get all users with pagination and filters
router.get('/', verifyAdminToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const subscription = req.query.subscription || '';

    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { referralCode: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      filter.subscriptionStatus = status;
    }
    
    if (subscription) {
      filter.subscription = subscription;
    }

    const users = await User.find(filter)
      .populate('subscription')
      .populate('level')
      .populate('referredBy')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', verifyAdminToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('subscription')
      .populate('level')
      .populate('referredBy')
      .populate('referrals')
      .populate('cart.product')
      .populate('orders');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user
router.put('/:id', verifyAdminToken, [
  body('fullName').optional().isLength({ min: 2 }),
  body('phone').optional().isMobilePhone(),
  body('subscriptionStatus').optional().isIn(['active', 'expired', 'pending']),
  body('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { fullName, phone, subscriptionStatus, isActive, subscription, level } = req.body;

    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (subscriptionStatus) user.subscriptionStatus = subscriptionStatus;
    if (typeof isActive === 'boolean') user.isActive = isActive;
    if (subscription) user.subscription = subscription;
    if (level) user.level = level;

    // Update subscription expiry if subscription status is active
    if (subscriptionStatus === 'active' && subscription) {
      const sub = await Subscription.findById(subscription);
      if (sub) {
        user.subscriptionExpiry = new Date(Date.now() + sub.duration * 24 * 60 * 60 * 1000);
      }
    }

    await user.save();

    res.json({ success: true, user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user
router.delete('/:id', verifyAdminToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user statistics
router.get('/stats/overview', verifyAdminToken, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const registeredUsers = await User.countDocuments({ isRegistered: true });
    const activeSubscriptions = await User.countDocuments({ subscriptionStatus: 'active' });
    const pendingPayments = await User.countDocuments({ 
      'paymentScreenshots.status': 'pending' 
    });

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('fullName createdAt subscriptionStatus');

    const subscriptionStats = await User.aggregate([
      {
        $group: {
          _id: '$subscriptionStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      totalUsers,
      registeredUsers,
      activeSubscriptions,
      pendingPayments,
      recentUsers,
      subscriptionStats
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Approve payment screenshot
router.post('/:id/approve-payment', verifyAdminToken, async (req, res) => {
  try {
    const { screenshotId } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const screenshot = user.paymentScreenshots.id(screenshotId);
    if (!screenshot) {
      return res.status(404).json({ error: 'Payment screenshot not found' });
    }

    screenshot.status = 'approved';
    await user.save();

    res.json({ success: true, message: 'Payment approved successfully' });
  } catch (error) {
    console.error('Approve payment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reject payment screenshot
router.post('/:id/reject-payment', verifyAdminToken, async (req, res) => {
  try {
    const { screenshotId, reason } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const screenshot = user.paymentScreenshots.id(screenshotId);
    if (!screenshot) {
      return res.status(404).json({ error: 'Payment screenshot not found' });
    }

    screenshot.status = 'rejected';
    await user.save();

    res.json({ success: true, message: 'Payment rejected successfully' });
  } catch (error) {
    console.error('Reject payment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user referrals
router.get('/:id/referrals', verifyAdminToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('referrals', 'fullName phone createdAt subscriptionStatus');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      referralCode: user.referralCode,
      referredBy: user.referredBy,
      referrals: user.referrals
    });
  } catch (error) {
    console.error('Get user referrals error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user orders
router.get('/:id/orders', verifyAdminToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate({
        path: 'orders',
        populate: {
          path: 'items.product',
          select: 'name price images'
        }
      });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.orders);
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 