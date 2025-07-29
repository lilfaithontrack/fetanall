const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');

const router = express.Router();

// Middleware to verify admin token
const verifyAdminToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Access denied. Admin only.' });
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// Get all orders
router.get('/', verifyAdminToken, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate('user').populate('items.product').populate('agent');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get order by ID
router.get('/:id', verifyAdminToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user').populate('items.product').populate('agent');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update order status
router.put('/:id/status', verifyAdminToken, [
  body('status').isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    order.status = req.body.status;
    if (req.body.status === 'delivered') order.deliveredAt = new Date();
    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete order
router.delete('/:id', verifyAdminToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 
const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { verifyToken, verifyAdminToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Generate order number
function generateOrderNumber() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp.slice(-6)}${random}`;
}

// Create order (Customer)
router.post('/', verifyToken, upload.single('paymentScreenshot'), async (req, res) => {
  try {
    const { orderData } = req.body;
    const parsedOrderData = JSON.parse(orderData);
    const userId = req.user.userId;

    // Validate order data
    if (!parsedOrderData.items || parsedOrderData.items.length === 0) {
      return res.status(400).json({ error: 'No items in order' });
    }

    if (!parsedOrderData.paymentMethod) {
      return res.status(400).json({ error: 'Payment method is required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Payment screenshot is required' });
    }

    // Verify products exist and calculate total
    let calculatedSubtotal = 0;
    const orderItems = [];

    for (const item of parsedOrderData.items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({ error: `Product not found: ${item.product}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }

      const itemTotal = product.price * item.quantity;
      calculatedSubtotal += itemTotal;

      orderItems.push({
        product: item.product,
        quantity: item.quantity,
        price: product.price,
        discount: product.price - item.price // Calculate discount applied
      });
    }

    // Create order
    const order = new Order({
      orderNumber: generateOrderNumber(),
      user: userId,
      items: orderItems,
      subtotal: calculatedSubtotal,
      discount: parsedOrderData.discount || 0,
      total: parsedOrderData.total,
      paymentMethod: parsedOrderData.paymentMethod,
      paymentScreenshot: {
        url: `/uploads/payments/${req.file.filename}`,
        uploadedAt: new Date()
      },
      shippingAddress: parsedOrderData.shippingAddress,
      status: 'pending',
      paymentStatus: 'pending'
    });

    await order.save();

    // Update product stock (reserve items)
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }
      );
    }

    res.json({
      success: true,
      message: 'Order placed successfully',
      order: {
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user orders
router.get('/my-orders', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: userId })
      .populate('items.product', 'name images category')
      .populate('paymentMethod', 'name type')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments({ user: userId });

    res.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get order by ID (Customer)
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const order = await Order.findOne({ 
      _id: req.params.id, 
      user: userId 
    })
      .populate('items.product', 'name images category description')
      .populate('paymentMethod', 'name type accountName accountNumber')
      .populate('user', 'fullName email phone');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin routes
// Get all orders (Admin)
router.get('/admin/all', verifyAdminToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || '';
    const paymentStatus = req.query.paymentStatus || '';
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const orders = await Order.find(filter)
      .populate('user', 'fullName email phone telegramId')
      .populate('items.product', 'name category price')
      .populate('paymentMethod', 'name type')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update order status (Admin)
router.put('/admin/:id/status', verifyAdminToken, [
  body('status').isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
  body('paymentStatus').optional().isIn(['pending', 'processing', 'completed', 'failed', 'cancelled'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update status
    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    // If order is cancelled, restore product stock
    if (status === 'cancelled' && order.status !== 'cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity } }
        );
      }
    }

    // If payment is completed, update product sales
    if (paymentStatus === 'completed' && order.paymentStatus !== 'completed') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { sales: item.quantity } }
        );
      }
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get order statistics (Admin)
router.get('/admin/stats', verifyAdminToken, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const completedOrders = await Order.countDocuments({ paymentStatus: 'completed' });
    
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    const monthlyRevenue = await Order.aggregate([
      { 
        $match: { 
          paymentStatus: 'completed',
          createdAt: { 
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthlyRevenue
      }
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
