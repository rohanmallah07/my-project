// routes/skillRoutes.js
const express = require('express');
const router = express.Router();
const { getAllSkillPosts, createSkillPost, toggleLike, addComment, deleteSkillPost } = require('../controllers/skillController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAllSkillPosts);
router.post('/', protect, createSkillPost);
router.put('/:id/like', protect, toggleLike);
router.post('/:id/comment', protect, addComment);
router.delete('/:id', protect, deleteSkillPost);

module.exports = router;
