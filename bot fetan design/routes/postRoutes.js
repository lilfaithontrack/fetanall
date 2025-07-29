
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const { verifyAdminToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all posts (public posts for everyone, all posts for admins)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, isAdmin = false } = req.query;
    
    const filter = isAdmin ? {} : { isPublic: true, isActive: true };
    
    const posts = await Post.find(filter)
      .populate('author', 'fullName username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments(filter);

    res.json({
      success: true,
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'fullName username')
      .populate('likes.user', 'fullName username');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Increment views
    await post.incrementViews();

    res.json({ success: true, post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new post (admin only)
router.post('/', verifyAdminToken, upload.multiple('images', 5), async (req, res) => {
  try {
    const { title, content, isPublic = true } = req.body;

    const images = req.files ? req.files.map((file, index) => ({
      url: `/uploads/${file.path.replace(/\\/g, '/')}`,
      caption: req.body[`caption_${index}`] || '',
      isPrimary: index === 0
    })) : [];

    const post = new Post({
      title,
      content,
      images,
      author: req.user.id,
      isPublic: isPublic === 'true'
    });

    await post.save();

    // Populate author info
    await post.populate('author', 'fullName username');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update post (admin only)
router.put('/:id', verifyAdminToken, upload.multiple('images', 5), async (req, res) => {
  try {
    const { title, content, isPublic } = req.body;
    
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Update fields
    if (title) post.title = title;
    if (content) post.content = content;
    if (isPublic !== undefined) post.isPublic = isPublic === 'true';

    // Add new images if uploaded
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file, index) => ({
        url: `/uploads/${file.path.replace(/\\/g, '/')}`,
        caption: req.body[`caption_${index}`] || '',
        isPrimary: post.images.length === 0 && index === 0
      }));
      post.images.push(...newImages);
    }

    await post.save();
    await post.populate('author', 'fullName username');

    res.json({
      success: true,
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete post (admin only)
router.delete('/:id', verifyAdminToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Toggle post like
router.post('/:id/like', async (req, res) => {
  try {
    const { telegramId } = req.body;
    
    if (!telegramId) {
      return res.status(400).json({ error: 'Telegram ID required' });
    }

    const user = await User.findOne({ telegramId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    await post.toggleLike(user._id);
    await post.populate('likes.user', 'fullName username');

    res.json({
      success: true,
      message: 'Like toggled successfully',
      likes: post.likes.length
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
