// routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const { getAllProjects, createProject, applyToProject, getMyProjects, deleteProject } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAllProjects);
router.post('/', protect, createProject);
router.get('/mine', protect, getMyProjects);
router.post('/:id/apply', protect, applyToProject);
router.delete('/:id', protect, deleteProject);

module.exports = router;
