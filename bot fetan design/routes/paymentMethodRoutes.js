const express = require('express');
const { body, validationResult } = require('express-validator');
const PaymentMethod = require('../models/PaymentMethod');

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

// Get all payment methods
router.get('/', async (req, res) => {
  try {
    const methods = await PaymentMethod.find().sort({ createdAt: -1 });
    res.json(methods);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get payment method by ID
router.get('/:id', async (req, res) => {
  try {
    const method = await PaymentMethod.findById(req.params.id);
    if (!method) return res.status(404).json({ error: 'Payment method not found' });
    res.json(method);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create payment method
router.post('/', verifyAdminToken, [
  body('name').notEmpty(),
  body('type').notEmpty(),
  body('accountNumber').notEmpty(),
  body('accountName').notEmpty(),
  body('instructions').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { name, type, accountNumber, accountName, bankName, screenshot, instructions, minimumAmount, maximumAmount, processingTime } = req.body;
    const method = new PaymentMethod({ name, type, accountNumber, accountName, bankName, screenshot, instructions, minimumAmount, maximumAmount, processingTime });
    await method.save();
    res.json({ success: true, method });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update payment method
router.put('/:id', verifyAdminToken, [
  body('name').optional().notEmpty(),
  body('type').optional().notEmpty(),
  body('accountNumber').optional().notEmpty(),
  body('accountName').optional().notEmpty(),
  body('instructions').optional().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const method = await PaymentMethod.findById(req.params.id);
    if (!method) return res.status(404).json({ error: 'Payment method not found' });
    Object.assign(method, req.body);
    await method.save();
    res.json({ success: true, method });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete payment method
router.delete('/:id', verifyAdminToken, async (req, res) => {
  try {
    const method = await PaymentMethod.findById(req.params.id);
    if (!method) return res.status(404).json({ error: 'Payment method not found' });
    await PaymentMethod.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Payment method deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 