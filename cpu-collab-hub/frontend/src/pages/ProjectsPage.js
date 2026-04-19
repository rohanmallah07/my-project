// src/pages/ProjectsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import toast from 'react-hot-toast';

/* ── Create Project Modal ── */
const CreateProjectModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ title: '', description: '', requiredSkills: '', teamSize: 2, duration: '', githubLink: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description) return toast.error('Title and description required');
    setLoading(true);
    try {
      const { data } = await api.post('/projects', form);
      if (data.success) { toast.success('Project posted! 🚀'); onCreated(data.project); onClose(); }
    } catch { toast.error('Failed to create project'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto fade-in">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white">
          <h2 className="text-xl font-display font-bold text-slate-900">Post Project Idea</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Project Title *</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
              placeholder="e.g. AI-powered Study Helper" className="input" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Description *</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              placeholder="Describe your project idea, goals, and what you want to build..." rows={4} className="input resize-none" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Required Skills</label>
            <input value={form.requiredSkills} onChange={e => setForm({...form, requiredSkills: e.target.value})}
              placeholder="e.g. React, Node.js, MongoDB (comma separated)" className="input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Team Size</label>
              <input type="number" min="1" max="10" value={form.teamSize}
                onChange={e => setForm({...form, teamSize: e.target.value})} className="input" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Duration</label>
              <input value={form.duration} onChange={e => setForm({...form, duration: e.target.value})}
                placeholder="e.g. 2 months" className="input" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">GitHub Link (optional)</label>
            <input value={form.githubLink} onChange={e => setForm({...form, githubLink: e.target.value})}
              placeholder="https://github.com/..." className="input" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Posting...' : 'Post Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Apply Modal ── */
const ApplyModal = ({ project, onClose }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    setLoading(true);
    try {
      const { data } = await api.post(`/projects/${project._id}/apply`, { message });
      if (data.success) { toast.success('Application sent! ✅'); onClose(); }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md fade-in">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-display font-bold">Apply to Project</h2>
          <button onClick={onClose} className="text-slate-400 text-2xl">&times;</button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-slate-600 text-sm">Applying to: <strong>{project.title}</strong></p>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Message (optional)</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)}
              placeholder="Introduce yourself and why you want to join..." rows={3} className="input resize-none" />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleApply} disabled={loading} className="btn-primary flex-1">
              {loading ? 'Sending...' : 'Send Application'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Project Card ── */
const ProjectCard = ({ project, currentUser, onDelete, onApply }) => {
  const statusColors = { open: 'bg-emerald-50 text-emerald-700', 'in-progress': 'bg-amber-50 text-amber-700', completed: 'bg-slate-100 text-slate-600' };
  const isOwner = project.owner?._id === currentUser._id;
  const hasApplied = project.applicants?.some(a => a.user === currentUser._id || a.user?._id === currentUser._id);
  const isMember  = project.members?.some(m => m._id === currentUser._id || m === currentUser._id);

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[project.status]}`}>
          {project.status}
        </span>
        {(isOwner || currentUser.role === 'admin') && (
          <button onClick={() => onDelete(project._id)} className="text-slate-400 hover:text-red-500 transition">🗑</button>
        )}
      </div>

      <h3 className="font-display font-bold text-slate-900 text-lg mb-2">{project.title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">{project.description}</p>

      {project.requiredSkills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.requiredSkills.map(s => <span key={s} className="tag">{s}</span>)}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
        <span>👥 Team of {project.teamSize}</span>
        {project.duration && <span>⏱ {project.duration}</span>}
        <span>📋 {project.applicants?.length || 0} applicants</span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
            {project.owner?.name?.slice(0,2).toUpperCase()}
          </div>
          <span className="text-xs text-slate-600">{project.owner?.name}</span>
        </div>

        <div className="flex gap-2">
          {project.githubLink && (
            <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-slate-800">GitHub</a>
          )}
          {!isOwner && !isMember && project.status === 'open' && (
            hasApplied
              ? <span className="text-xs text-emerald-600 font-semibold">Applied ✓</span>
              : <button onClick={() => onApply(project)} className="btn-primary text-xs px-3 py-1.5">Apply</button>
          )}
          {isOwner && <span className="text-xs text-indigo-600 font-semibold">Your Project</span>}
        </div>
      </div>
    </div>
  );
};

/* ── Main Projects Page ── */
const ProjectsPage = () => {
  const { user } = useAuth();
  const [projects, setProjects]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [applyProject, setApplyProject] = useState(null);
  const [search, setSearch]   = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 6 });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      const { data } = await api.get(`/projects?${params}`);
      setProjects(data.projects || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(prev => prev.filter(p => p._id !== id));
      toast.success('Project deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Project Collaboration</h1>
          <p className="text-slate-500 text-sm mt-1">Find projects or post your own idea</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary shrink-0">+ Post Project</button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search projects..." className="input flex-1" />
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="input sm:w-40">
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {loading
        ? <Spinner text="Loading projects..." />
        : projects.length === 0
          ? <EmptyState icon="🚀" title="No projects yet" subtitle="Post your first project idea and find teammates!" action={<button onClick={() => setShowModal(true)} className="btn-primary">Post Project</button>} />
          : <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {projects.map(p => (
                <ProjectCard key={p._id} project={p} currentUser={user} onDelete={handleDelete} onApply={setApplyProject} />
              ))}
            </div>
      }

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">← Prev</button>
          <span className="flex items-center text-sm text-slate-600 px-3">Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">Next →</button>
        </div>
      )}

      {showModal && <CreateProjectModal onClose={() => setShowModal(false)} onCreated={p => setProjects(prev => [p, ...prev])} />}
      {applyProject && <ApplyModal project={applyProject} onClose={() => setApplyProject(null)} />}
    </div>
  );
};

export default ProjectsPage;
