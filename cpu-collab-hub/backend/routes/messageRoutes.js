// routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const { sendMessage, getConversation, getMyChats } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getMyChats);
router.post('/', protect, sendMessage);
router.get('/:userId', protect, getConversation);

module.exports = router;
