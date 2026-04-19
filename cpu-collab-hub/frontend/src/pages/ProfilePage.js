// src/pages/ProfilePage.js
import React, { useState } from 'react';
import { useAuth, api } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({
    name:      user?.name || '',
    bio:       user?.bio  || '',
    skills:    user?.skills?.join(', ') || '',
    interests: user?.interests?.join(', ') || '',
    college:   user?.college || '',
    year:      user?.year    || '',
    github:    user?.github  || '',
    linkedin:  user?.linkedin || '',
    website:   user?.website  || '',
  });

  const BASE = process.env.REACT_APP_API_URL?.replace('/api', '');
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be under 5MB');
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (imageFile) formData.append('profileImage', imageFile);

      const { data } = await api.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (data.success) {
        updateUser(data.user);
        toast.success('Profile updated! ✅');
        setEditing(false);
        setImageFile(null);
        setPreview(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 fade-in">
      <div className="card">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-100 mb-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            {preview || user?.profileImage
              ? <img src={preview || `${BASE}${user.profileImage}`} alt={user.name}
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-md" />
              : <div className="w-24 h-24 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-display font-bold shadow-md">
                  {initials}
                </div>
            }
            {editing && (
              <label className="absolute -bottom-2 -right-2 bg-white border border-slate-200 rounded-lg p-1.5 cursor-pointer shadow hover:bg-slate-50 transition">
                <span className="text-sm">📷</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>

          {/* Basic Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-display font-bold text-slate-900">{user?.name}</h1>
            <p className="text-slate-500 text-sm mt-1">{user?.email}</p>
            {user?.college && <p className="text-slate-500 text-sm">{user.college}{user.year && ` · ${user.year}`}</p>}
            {user?.bio && <p className="text-slate-600 text-sm mt-2 max-w-md">{user.bio}</p>}

            <div className="flex gap-3 mt-3 justify-center sm:justify-start">
              {user?.github && <a href={user.github} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-slate-800 underline">GitHub</a>}
              {user?.linkedin && <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-slate-800 underline">LinkedIn</a>}
              {user?.website && <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-slate-800 underline">Website</a>}
            </div>
          </div>

          <button onClick={() => setEditing(!editing)} className={editing ? 'btn-secondary shrink-0' : 'btn-primary shrink-0'}>
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Skills & Interests (View Mode) */}
        {!editing && (
          <div className="space-y-5">
            {user?.skills?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map(s => <span key={s} className="tag">{s}</span>)}
                </div>
              </div>
            )}
            {user?.interests?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {user.interests.map(i => <span key={i} className="tag-green">{i}</span>)}
                </div>
              </div>
            )}
            {user?.skills?.length === 0 && user?.interests?.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No skills or interests added yet. Click "Edit Profile" to add some!</p>
            )}
          </div>
        )}

        {/* Edit Form */}
        {editing && (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} className="input" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">College</label>
                <input name="college" value={form.college} onChange={handleChange} placeholder="Your college" className="input" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Year</label>
                <select name="year" value={form.year} onChange={handleChange} className="input">
                  <option value="">Select year</option>
                  <option>1st Year</option><option>2nd Year</option>
                  <option>3rd Year</option><option>Final Year</option><option>Graduate</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">GitHub URL</label>
                <input name="github" value={form.github} onChange={handleChange} placeholder="https://github.com/..." className="input" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Bio</label>
              <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} placeholder="Tell others about yourself..." className="input resize-none" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Skills (comma separated)</label>
              <input name="skills" value={form.skills} onChange={handleChange} placeholder="React, Python, Figma..." className="input" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Interests (comma separated)</label>
              <input name="interests" value={form.interests} onChange={handleChange} placeholder="Web Dev, AI, Design..." className="input" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">LinkedIn URL</label>
                <input name="linkedin" value={form.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/..." className="input" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Website</label>
                <input name="website" value={form.website} onChange={handleChange} placeholder="https://yoursite.com" className="input" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setEditing(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
