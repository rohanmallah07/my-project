// controllers/internshipController.js - Internship management
const Internship = require('../models/Internship');

const getAllInternships = async (req, res) => {
  try {
    const { skill, search, location, page = 1, limit = 10 } = req.query;
    let query = { isActive: true };

    if (skill) query.requiredSkills = { $in: [new RegExp(skill, 'i')] };
    if (location) query.location = new RegExp(location, 'i');
    if (search) query.$or = [
      { title: new RegExp(search, 'i') },
      { company: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') }
    ];

    const skip = (page - 1) * limit;
    const internships = await Internship.find(query)
      .populate('postedBy', 'name profileImage')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Internship.countDocuments(query);
    res.json({ success: true, internships, pagination: { page: parseInt(page), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createInternship = async (req, res) => {
  try {
    const { title, company, description, requiredSkills, duration, stipend, location, applyLink, deadline } = req.body;

    const internship = await Internship.create({
      postedBy: req.user.id,
      title, company, description,
      requiredSkills: requiredSkills ? requiredSkills.split(',').map(s => s.trim()) : [],
      duration: duration || '3 months',
      stipend: stipend || 'Unpaid',
      location: location || 'Remote',
      applyLink: applyLink || '',
      deadline: deadline || null
    });

    await internship.populate('postedBy', 'name profileImage');
    res.status(201).json({ success: true, message: 'Internship posted!', internship });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const applyToInternship = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ success: false, message: 'Internship not found' });

    const alreadyApplied = internship.applicants.some(a => a.user.toString() === req.user.id);
    if (alreadyApplied) return res.status(400).json({ success: false, message: 'Already applied' });

    internship.applicants.push({ user: req.user.id });
    await internship.save();

    res.json({ success: true, message: 'Application submitted!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getInternshipById = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id)
      .populate('postedBy', 'name profileImage email')
      .populate('applicants.user', 'name profileImage');
    if (!internship) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, internship });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllInternships, createInternship, applyToInternship, getInternshipById };
