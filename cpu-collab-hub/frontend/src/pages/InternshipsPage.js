// src/pages/InternshipsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import toast from 'react-hot-toast';

/* ── Post Internship Modal ── */
const PostInternshipModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({
    title: '', company: '', description: '', requiredSkills: '',
    duration: '3 months', stipend: '', location: 'Remote', applyLink: '', deadline: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.company || !form.description) return toast.error('Title, company and description are required');
    setLoading(true);
    try {
      const { data } = await api.post('/internships', form);
      if (data.success) { toast.success('Internship posted! 💼'); onCreated(data.internship); onClose(); }
    } catch { toast.error('Failed to post internship'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto fade-in">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white">
          <h2 className="text-xl font-display font-bold">Post Internship</h2>
          <button onClick={onClose} className="text-slate-400 text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Job Title *</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Frontend Developer Intern" className="input" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Company *</label>
              <input value={form.company} onChange={e => setForm({...form, company: e.target.value})} placeholder="TechCorp India" className="input" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Description *</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              placeholder="Describe the role, responsibilities, and requirements..." rows={4} className="input resize-none" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Required Skills</label>
            <input value={form.requiredSkills} onChange={e => setForm({...form, requiredSkills: e.target.value})}
              placeholder="e.g. React, JavaScript (comma separated)" className="input" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Duration</label>
              <input value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} placeholder="3 months" className="input" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Stipend</label>
              <input value={form.stipend} onChange={e => setForm({...form, stipend: e.target.value})} placeholder="₹10,000/month" className="input" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Location</label>
              <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="Remote" className="input" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Apply Link</label>
              <input value={form.applyLink} onChange={e => setForm({...form, applyLink: e.target.value})} placeholder="https://..." className="input" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Deadline</label>
              <input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} className="input" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Posting...' : 'Post Internship'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Internship Card ── */
const InternshipCard = ({ intern, currentUser, onApply }) => {
  const hasApplied = intern.applicants?.some(a => a.user === currentUser._id || a.user?._id === currentUser._id);
  const isExpired  = intern.deadline && new Date(intern.deadline) < new Date();

  return (
    <div className="card hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
          {intern.company?.slice(0,2).toUpperCase()}
        </div>
        {isExpired && <span className="text-xs bg-red-50 text-red-600 font-semibold px-2 py-1 rounded-full">Expired</span>}
      </div>

      <h3 className="font-display font-bold text-slate-900 text-lg mb-1">{intern.title}</h3>
      <p className="text-indigo-600 text-sm font-semibold mb-2">{intern.company}</p>
      <p className="text-slate-600 text-sm leading-relaxed mb-3 line-clamp-3">{intern.description}</p>

      {intern.requiredSkills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {intern.requiredSkills.map(s => <span key={s} className="tag">{s}</span>)}
        </div>
      )}

      {/* Details */}
      <div className="grid grid-cols-3 gap-2 text-xs text-slate-500 mb-4">
        <div className="bg-slate-50 rounded-lg p-2 text-center">
          <div className="font-semibold text-slate-700">📍 Location</div>
          <div>{intern.location}</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-2 text-center">
          <div className="font-semibold text-slate-700">⏱ Duration</div>
          <div>{intern.duration}</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-2 text-center">
          <div className="font-semibold text-slate-700">💰 Stipend</div>
          <div>{intern.stipend || 'Unpaid'}</div>
        </div>
      </div>

      {intern.deadline && (
        <p className="text-xs text-slate-400 mb-3">
          Deadline: {new Date(intern.deadline).toLocaleDateString('en-IN')}
        </p>
      )}

      {/* Action */}
      <div className="flex gap-2 pt-3 border-t border-slate-100">
        {intern.applyLink && (
          <a href={intern.applyLink} target="_blank" rel="noopener noreferrer" className="btn-outline text-sm flex-1 text-center">
            Visit Website
          </a>
        )}
        {!isExpired && (
          hasApplied
            ? <span className="flex-1 text-center text-sm text-emerald-600 font-semibold py-2.5">Applied ✓</span>
            : <button onClick={() => onApply(intern._id)} className="btn-primary text-sm flex-1">Apply Now</button>
        )}
      </div>
    </div>
  );
};

/* ── Main Internships Page ── */
const InternshipsPage = () => {
  const { user } = useAuth();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch]       = useState('');
  const [location, setLocation]   = useState('');
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchInternships = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 6 });
      if (search) params.append('search', search);
      if (location) params.append('location', location);
      const { data } = await api.get(`/internships?${params}`);
      setInternships(data.internships || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch { toast.error('Failed to load internships'); }
    finally { setLoading(false); }
  }, [page, search, location]);

  useEffect(() => { fetchInternships(); }, [fetchInternships]);

  const handleApply = async (id) => {
    try {
      const { data } = await api.post(`/internships/${id}/apply`);
      if (data.success) {
        toast.success('Applied successfully! 🎉');
        setInternships(prev => prev.map(i => i._id === id
          ? { ...i, applicants: [...(i.applicants || []), { user: user._id }] } : i));
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to apply'); }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Internships</h1>
          <p className="text-slate-500 text-sm mt-1">Explore and apply to internship opportunities</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary shrink-0">+ Post Internship</button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search internships..." className="input flex-1" />
        <input value={location} onChange={e => { setLocation(e.target.value); setPage(1); }} placeholder="Filter by location..." className="input sm:w-48" />
      </div>

      {loading
        ? <Spinner text="Loading internships..." />
        : internships.length === 0
          ? <EmptyState icon="💼" title="No internships posted yet" subtitle="Post an internship opportunity for students!" action={<button onClick={() => setShowModal(true)} className="btn-primary">Post Internship</button>} />
          : <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {internships.map(i => (
                <InternshipCard key={i._id} intern={i} currentUser={user} onApply={handleApply} />
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

      {showModal && <PostInternshipModal onClose={() => setShowModal(false)} onCreated={i => setInternships(prev => [i, ...prev])} />}
    </div>
  );
};

export default InternshipsPage;
