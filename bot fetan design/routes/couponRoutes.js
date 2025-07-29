const express = require('express');
const { body, validationResult } = require('express-validator');
const Coupon = require('../models/Coupon');

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

// Get all coupons
router.get('/', async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get coupon by ID
router.get('/:id', async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create coupon
router.post('/', verifyAdminToken, [
  body('code').notEmpty(),
  body('type').isIn(['percentage', 'fixed']),
  body('value').isNumeric(),
  body('validFrom').notEmpty(),
  body('validUntil').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { code, type, value, minimumAmount, maximumDiscount, usageLimit, validFrom, validUntil, applicableSubscriptions, applicableProducts, description, createdBy } = req.body;
    const coupon = new Coupon({ code, type, value, minimumAmount, maximumDiscount, usageLimit, validFrom, validUntil, applicableSubscriptions, applicableProducts, description, createdBy });
    await coupon.save();
    res.json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update coupon
router.put('/:id', verifyAdminToken, [
  body('code').optional().notEmpty(),
  body('type').optional().isIn(['percentage', 'fixed']),
  body('value').optional().isNumeric(),
  body('validFrom').optional().notEmpty(),
  body('validUntil').optional().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    Object.assign(coupon, req.body);
    await coupon.save();
    res.json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete coupon
router.delete('/:id', verifyAdminToken, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 