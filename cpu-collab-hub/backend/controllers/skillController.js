// controllers/skillController.js - Skill posts CRUD operations
const SkillPost = require('../models/SkillPost');

// @desc    Get all skill posts
// @route   GET /api/skills
// @access  Private
const getAllSkillPosts = async (req, res) => {
  try {
    const { tag, search, page = 1, limit = 10 } = req.query;
    let query = { isActive: true };

    if (tag) query.skillTags = { $in: [new RegExp(tag, 'i')] };
    if (search) query.$or = [
      { title: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') }
    ];

    const skip = (page - 1) * limit;
    const posts = await SkillPost.find(query)
      .populate('author', 'name profileImage skills')
      .populate('comments.user', 'name profileImage')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await SkillPost.countDocuments(query);

    res.json({
      success: true,
      posts,
      pagination: { page: parseInt(page), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create skill post
// @route   POST /api/skills
// @access  Private
const createSkillPost = async (req, res) => {
  try {
    const { title, description, skillTags, resourceLink } = req.body;

    const post = await SkillPost.create({
      author: req.user.id,
      title,
      description,
      skillTags: skillTags ? skillTags.split(',').map(t => t.trim()) : [],
      resourceLink: resourceLink || ''
    });

    await post.populate('author', 'name profileImage');

    res.status(201).json({ success: true, message: 'Post created!', post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Like / Unlike a skill post
// @route   PUT /api/skills/:id/like
// @access  Private
const toggleLike = async (req, res) => {
  try {
    const post = await SkillPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const userId = req.user.id;
    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json({ success: true, likes: post.likes.length, liked: !alreadyLiked });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add comment to skill post
// @route   POST /api/skills/:id/comment
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Comment text required' });

    const post = await SkillPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    post.comments.push({ user: req.user.id, text });
    await post.save();
    await post.populate('comments.user', 'name profileImage');

    res.json({ success: true, comments: post.comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete skill post
// @route   DELETE /api/skills/:id
// @access  Private
const deleteSkillPost = async (req, res) => {
  try {
    const post = await SkillPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await post.deleteOne();
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllSkillPosts, createSkillPost, toggleLike, addComment, deleteSkillPost };
