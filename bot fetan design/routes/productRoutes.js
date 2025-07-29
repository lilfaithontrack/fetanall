const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');

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

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create product
router.post('/', verifyAdminToken, [
  body('name').notEmpty(),
  body('description').notEmpty(),
  body('price').isNumeric(),
  body('originalPrice').isNumeric(),
  body('category').notEmpty(),
  body('createdBy').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { name, description, price, originalPrice, images, category, tags, stock, featured, subscriptionDiscounts, specifications, createdBy } = req.body;
    const product = new Product({ name, description, price, originalPrice, images, category, tags, stock, featured, subscriptionDiscounts, specifications, createdBy });
    await product.save();
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update product
router.put('/:id', verifyAdminToken, [
  body('name').optional().notEmpty(),
  body('description').optional().notEmpty(),
  body('price').optional().isNumeric(),
  body('originalPrice').optional().isNumeric(),
  body('category').optional().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    Object.assign(product, req.body);
    await product.save();
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete product
router.delete('/:id', verifyAdminToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 