const express = require('express');
const { body, validationResult } = require('express-validator');
const Level = require('../models/Level');

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

// Get all levels
router.get('/', async (req, res) => {
  try {
    const levels = await Level.find().sort({ createdAt: -1 });
    res.json(levels);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get level by ID
router.get('/:id', async (req, res) => {
  try {
    const level = await Level.findById(req.params.id);
    if (!level) return res.status(404).json({ error: 'Level not found' });
    res.json(level);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create level
router.post('/', verifyAdminToken, [
  body('name').notEmpty(),
  body('price').isNumeric(),
  body('minValue').isNumeric(),
  body('maxValue').isNumeric(),
  body('description').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { name, price, minValue, maxValue, description, benefits, color, icon } = req.body;
    const level = new Level({ name, price, minValue, maxValue, description, benefits, color, icon });
    await level.save();
    res.json({ success: true, level });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update level
router.put('/:id', verifyAdminToken, [
  body('name').optional().notEmpty(),
  body('price').optional().isNumeric(),
  body('minValue').optional().isNumeric(),
  body('maxValue').optional().isNumeric(),
  body('description').optional().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const level = await Level.findById(req.params.id);
    if (!level) return res.status(404).json({ error: 'Level not found' });
    Object.assign(level, req.body);
    await level.save();
    res.json({ success: true, level });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete level
router.delete('/:id', verifyAdminToken, async (req, res) => {
  try {
    const level = await Level.findById(req.params.id);
    if (!level) return res.status(404).json({ error: 'Level not found' });
    await Level.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Level deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 