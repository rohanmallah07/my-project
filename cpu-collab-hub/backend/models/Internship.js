// models/Internship.js - Internship opportunities schema
const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  company: {
    type: String,
    required: [true, 'Company name is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [3000, 'Description cannot exceed 3000 characters']
  },
  requiredSkills: [{
    type: String,
    trim: true
  }],
  duration: {
    type: String,
    default: '3 months'
  },
  stipend: {
    type: String,
    default: 'Unpaid'
  },
  location: {
    type: String,
    default: 'Remote'
  },
  applyLink: {
    type: String,
    default: ''
  },
  deadline: {
    type: Date
  },
  applicants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    appliedAt: { type: Date, default: Date.now }
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Internship', internshipSchema);
