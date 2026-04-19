// controllers/projectController.js - Project collaboration logic
const Project = require('../models/Project');

const getAllProjects = async (req, res) => {
  try {
    const { skill, status, search, page = 1, limit = 10 } = req.query;
    let query = { isActive: true };

    if (skill) query.requiredSkills = { $in: [new RegExp(skill, 'i')] };
    if (status) query.status = status;
    if (search) query.$or = [
      { title: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') }
    ];

    const skip = (page - 1) * limit;
    const projects = await Project.find(query)
      .populate('owner', 'name profileImage skills')
      .populate('members', 'name profileImage')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Project.countDocuments(query);

    res.json({ success: true, projects, pagination: { page: parseInt(page), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createProject = async (req, res) => {
  try {
    const { title, description, requiredSkills, teamSize, duration, githubLink } = req.body;

    const project = await Project.create({
      owner: req.user.id,
      title,
      description,
      requiredSkills: requiredSkills ? requiredSkills.split(',').map(s => s.trim()) : [],
      teamSize: teamSize || 2,
      duration: duration || '',
      githubLink: githubLink || '',
      members: [req.user.id]
    });

    await project.populate('owner', 'name profileImage');
    res.status(201).json({ success: true, message: 'Project created!', project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const applyToProject = async (req, res) => {
  try {
    const { message } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (project.owner.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot apply to your own project' });
    }

    const alreadyApplied = project.applicants.some(a => a.user.toString() === req.user.id);
    if (alreadyApplied) return res.status(400).json({ success: false, message: 'Already applied' });

    project.applicants.push({ user: req.user.id, message: message || '' });
    await project.save();

    res.json({ success: true, message: 'Application sent!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user.id }, { members: req.user.id }]
    }).populate('owner', 'name profileImage').populate('members', 'name profileImage');

    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    if (project.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await project.deleteOne();
    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllProjects, createProject, applyToProject, getMyProjects, deleteProject };
