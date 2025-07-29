const express = require('express');
const { body, validationResult } = require('express-validator');
const Gallery = require('../models/Gallery');

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

// Get all gallery items
router.get('/', async (req, res) => {
  try {
    const items = await Gallery.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get gallery item by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Gallery item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create gallery item
router.post('/', verifyAdminToken, [
  body('title').notEmpty(),
  body('image.url').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { title, description, image, category, tags, featured, uploadedBy } = req.body;
    const item = new Gallery({ title, description, image, category, tags, featured, uploadedBy });
    await item.save();
    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update gallery item
router.put('/:id', verifyAdminToken, [
  body('title').optional().notEmpty(),
  body('image.url').optional().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const item = await Gallery.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Gallery item not found' });
    Object.assign(item, req.body);
    await item.save();
    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete gallery item
router.delete('/:id', verifyAdminToken, async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Gallery item not found' });
    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Gallery item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 