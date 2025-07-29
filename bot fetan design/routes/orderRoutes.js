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