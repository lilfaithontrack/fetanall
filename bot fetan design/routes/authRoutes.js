const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Agent = require('../models/Agent');
const User = require('../models/User');

const router = express.Router();

// Admin login
router.post('/admin/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check for super_agent in Agent collection
    const Agent = require('../models/Agent');
    const agent = await Agent.findOne({ email, role: 'super_agent', isActive: true });
    console.log('Admin login attempt:', { email, agent });
    if (agent) {
      const isPasswordValid = await agent.comparePassword(password);
      console.log('Password valid:', isPasswordValid);
      if (isPasswordValid) {
        const token = jwt.sign(
          {
            id: agent._id,
            email: agent.email,
            role: 'admin',
            permissions: agent.permissions
          },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN }
        );
        return res.json({
          success: true,
          token,
          user: {
            id: agent._id,
            email: agent.email,
            role: 'admin',
            fullName: agent.fullName,
            permissions: agent.permissions
          }
        });
      }
    }

    res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Agent login
router.post('/agent/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const agent = await Agent.findOne({ email, isActive: true });
    if (!agent) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await agent.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    agent.lastLogin = new Date();
    await agent.save();

    const token = jwt.sign(
      { 
        id: agent._id,
        email: agent.email,
        role: 'agent',
        permissions: agent.permissions
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      token,
      user: {
        id: agent._id,
        email: agent.email,
        role: 'agent',
        fullName: agent.fullName,
        permissions: agent.permissions,
        referralCode: agent.referralCode
      }
    });
  } catch (error) {
    console.error('Agent login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify token middleware
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// Get current user
router.get('/me', verifyToken, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      return res.json({
        id: 'admin',
        email: process.env.ADMIN_EMAIL,
        role: 'admin',
        fullName: 'System Admin'
      });
    }

    if (req.user.role === 'agent') {
      const agent = await Agent.findById(req.user.id);
      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }

      return res.json({
        id: agent._id,
        email: agent.email,
        role: 'agent',
        fullName: agent.fullName,
        permissions: agent.permissions,
        referralCode: agent.referralCode
      });
    }

    res.status(400).json({ error: 'Invalid user role' });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Change password
router.post('/change-password', verifyToken, [
  body('currentPassword').isLength({ min: 6 }),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    if (req.user.role === 'agent') {
      const agent = await Agent.findById(req.user.id);
      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }

      const isCurrentPasswordValid = await agent.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      agent.password = newPassword;
      await agent.save();

      res.json({ success: true, message: 'Password changed successfully' });
    } else {
      res.status(400).json({ error: 'Invalid user role' });
    }
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 