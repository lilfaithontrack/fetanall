const express = require('express');
const { body, validationResult } = require('express-validator');
const Agent = require('../models/Agent');
const bcrypt = require('bcryptjs');

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

// Get all agents
router.get('/', verifyAdminToken, async (req, res) => {
  try {
    const agents = await Agent.find().sort({ createdAt: -1 });
    res.json(agents);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get agent by ID
router.get('/:id', verifyAdminToken, async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    res.json(agent);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create agent
router.post('/', verifyAdminToken, [
  body('fullName').notEmpty(),
  body('email').isEmail(),
  body('phone').notEmpty(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { fullName, email, phone, password, commission, role, permissions } = req.body;
    const agent = new Agent({ fullName, email, phone, password, commission, role, permissions });
    agent.referralCode = agent.generateReferralCode();
    await agent.save();
    res.json({ success: true, agent });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update agent
router.put('/:id', verifyAdminToken, [
  body('fullName').optional().notEmpty(),
  body('email').optional().isEmail(),
  body('phone').optional().notEmpty(),
  body('commission').optional().isNumeric(),
  body('role').optional().isIn(['agent', 'super_agent'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const agent = await Agent.findById(req.params.id);
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    Object.assign(agent, req.body);
    await agent.save();
    res.json({ success: true, agent });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete agent
router.delete('/:id', verifyAdminToken, async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    await Agent.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Agent deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Generate referral code for agent
router.post('/:id/generate-referral', verifyAdminToken, async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    agent.referralCode = agent.generateReferralCode();
    await agent.save();
    res.json({ success: true, referralCode: agent.referralCode });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Change agent password
router.post('/:id/change-password', verifyAdminToken, [
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const agent = await Agent.findById(req.params.id);
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    agent.password = req.body.newPassword;
    await agent.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin registration (one-time setup)
router.post('/admin/register', async (req, res) => {
  try {
    const { email, password, fullName, phone } = req.body;
    // Only allow if no super_agent exists
    const existingAdmin = await Agent.findOne({ role: 'super_agent' });
    if (existingAdmin) {
      return res.status(400).json({ error: 'Admin already exists.' });
    }
    const agent = new Agent({
      email,
      password,
      fullName,
      phone,
      role: 'super_agent',
      isActive: true
    });
    agent.referralCode = agent.generateReferralCode();
    await agent.save();
    res.json({ success: true, message: 'Admin registered successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 