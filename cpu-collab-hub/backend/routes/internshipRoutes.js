// routes/internshipRoutes.js
const express = require('express');
const router = express.Router();
const { getAllInternships, createInternship, applyToInternship, getInternshipById } = require('../controllers/internshipController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAllInternships);
router.post('/', protect, createInternship);
router.get('/:id', protect, getInternshipById);
router.post('/:id/apply', protect, applyToInternship);

module.exports = router;
