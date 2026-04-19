// controllers/adminController.js - Admin panel logic
const User = require('../models/User');
const SkillPost = require('../models/SkillPost');
const Project = require('../models/Project');
const Internship = require('../models/Internship');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Admin
const getStats = async (req, res) => {
  try {
    const [totalUsers, totalPosts, totalProjects, totalInternships] = await Promise.all([
      User.countDocuments(),
      SkillPost.countDocuments(),
      Project.countDocuments(),
      Internship.countDocuments()
    ]);

    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt role');

    res.json({
      success: true,
      stats: { totalUsers, totalPosts, totalProjects, totalInternships },
      recentUsers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users for admin
// @route   GET /api/admin/users
// @access  Admin
const getAllUsersAdmin = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle
// @access  Admin
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, isActive: user.isActive });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete any post (admin)
// @route   DELETE /api/admin/posts/:id
// @access  Admin
const deletePost = async (req, res) => {
  try {
    await SkillPost.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Post deleted by admin' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getStats, getAllUsersAdmin, toggleUserStatus, deletePost };
