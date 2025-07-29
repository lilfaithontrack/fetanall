
const express = require('express');
const { body, validationResult } = require('express-validator');
const Gallery = require('../models/Gallery');

const router = express.Router();

// Get all gallery items with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const category = req.query.category || '';
    const search = req.query.search || '';

    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = { isActive: true };
    
    if (category) {
      filter.category = category;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const galleries = await Gallery.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Gallery.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      galleries,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Get gallery error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get gallery item by ID
router.get('/:id', async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);

    if (!gallery) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }

    res.json({
      success: true,
      gallery
    });
  } catch (error) {
    console.error('Get gallery item error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

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