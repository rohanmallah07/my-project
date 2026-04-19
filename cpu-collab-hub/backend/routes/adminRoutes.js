// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { getStats, getAllUsersAdmin, toggleUserStatus, deletePost } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly); // All admin routes require auth + admin role

router.get('/stats', getStats);
router.get('/users', getAllUsersAdmin);
router.put('/users/:id/toggle', toggleUserStatus);
router.delete('/posts/:id', deletePost);

module.exports = router;
