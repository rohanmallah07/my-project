// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    skills: '', interests: '', bio: '', college: '', year: ''
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Name, email and password are required');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        skills: form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        interests: form.interests ? form.interests.split(',').map(i => i.trim()).filter(Boolean) : [],
        bio: form.bio,
        college: form.college,
        year: form.year
      };
      const res = await register(payload);
      if (res.success) {
        toast.success('Account created! Welcome 🎉');
        navigate('/dashboard');
      } else {
        toast.error(res.message || 'Registration failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm border border-slate-100 p-8 fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-display font-bold text-xl">C</span>
          </div>
          <h2 className="text-3xl font-display font-bold text-slate-900">Create Account</h2>
          <p className="text-slate-500 mt-1">Join the CPU Collaboration Hub</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name *</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Raj Kumar" className="input" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="raj@example.com" className="input" required />
            </div>
          </div>

          {/* Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Password *</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" className="input" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Confirm Password *</label>
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password" className="input" required />
            </div>
          </div>

          {/* College & Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">College</label>
              <input name="college" value={form.college} onChange={handleChange} placeholder="Your college name" className="input" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Year</label>
              <select name="year" value={form.year} onChange={handleChange} className="input">
                <option value="">Select year</option>
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>Final Year</option>
                <option>Graduate</option>
              </select>
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Skills</label>
            <input name="skills" value={form.skills} onChange={handleChange} placeholder="e.g. React, Python, Figma (comma separated)" className="input" />
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Interests</label>
            <input name="interests" value={form.interests} onChange={handleChange} placeholder="e.g. Web Dev, AI, UI Design (comma separated)" className="input" />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Bio</label>
            <textarea name="bio" value={form.bio} onChange={handleChange} placeholder="Tell others about yourself..." rows={3} className="input resize-none" />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-center mt-2">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin h-4 w-4 rounded-full border-2 border-white border-t-transparent"></span>
                Creating account...
              </span>
            ) : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
