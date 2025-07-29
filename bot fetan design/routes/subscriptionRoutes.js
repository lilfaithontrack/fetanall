const express = require('express');
const { body, validationResult } = require('express-validator');
const Subscription = require('../models/Subscription');

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

// Get all subscriptions
router.get('/', async (req, res) => {
  try {
    const subscriptions = await Subscription.find().sort({ createdAt: -1 });
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get subscription by ID
router.get('/:id', async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) return res.status(404).json({ error: 'Subscription not found' });
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create subscription
router.post('/', verifyAdminToken, [
  body('name').notEmpty(),
  body('price').isNumeric(),
  body('description').notEmpty(),
  body('duration').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { name, price, description, duration, features, discountPercentage, maxUsers } = req.body;
    const subscription = new Subscription({ name, price, description, duration, features, discountPercentage, maxUsers });
    await subscription.save();
    res.json({ success: true, subscription });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update subscription
router.put('/:id', verifyAdminToken, [
  body('name').optional().notEmpty(),
  body('price').optional().isNumeric(),
  body('description').optional().notEmpty(),
  body('duration').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) return res.status(404).json({ error: 'Subscription not found' });
    Object.assign(subscription, req.body);
    await subscription.save();
    res.json({ success: true, subscription });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete subscription
router.delete('/:id', verifyAdminToken, async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) return res.status(404).json({ error: 'Subscription not found' });
    await Subscription.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Subscription deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 