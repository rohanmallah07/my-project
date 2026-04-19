// controllers/messageController.js - Chat messaging logic
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;

    if (!receiverId || !text) {
      return res.status(400).json({ success: false, message: 'Receiver and text are required' });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) return res.status(404).json({ success: false, message: 'Receiver not found' });

    const message = await Message.create({
      sender: req.user.id,
      receiver: receiverId,
      text
    });

    await message.populate('sender', 'name profileImage');
    await message.populate('receiver', 'name profileImage');

    res.status(201).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get conversation between two users
// @route   GET /api/messages/:userId
// @access  Private
const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: userId },
        { sender: userId, receiver: myId }
      ]
    })
    .populate('sender', 'name profileImage')
    .populate('receiver', 'name profileImage')
    .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      { sender: userId, receiver: myId, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get list of users I've chatted with
// @route   GET /api/messages
// @access  Private
const getMyChats = async (req, res) => {
  try {
    const myId = req.user.id;

    // Find all messages involving me
    const messages = await Message.find({
      $or: [{ sender: myId }, { receiver: myId }]
    })
    .populate('sender', 'name profileImage')
    .populate('receiver', 'name profileImage')
    .sort({ createdAt: -1 });

    // Extract unique chat partners
    const chatMap = new Map();
    messages.forEach(msg => {
      const other = msg.sender._id.toString() === myId ? msg.receiver : msg.sender;
      if (!chatMap.has(other._id.toString())) {
        chatMap.set(other._id.toString(), {
          user: other,
          lastMessage: msg.text,
          lastTime: msg.createdAt,
          unread: msg.receiver._id.toString() === myId && !msg.isRead ? 1 : 0
        });
      }
    });

    res.json({ success: true, chats: Array.from(chatMap.values()) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { sendMessage, getConversation, getMyChats };
