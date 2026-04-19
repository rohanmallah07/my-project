// src/pages/SkillsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import toast from 'react-hot-toast';

/* ── Create Post Modal ── */
const CreatePostModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ title: '', description: '', skillTags: '', resourceLink: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description) return toast.error('Title and description required');
    setLoading(true);
    try {
      const { data } = await api.post('/skills', form);
      if (data.success) { toast.success('Post created! 🎉'); onCreated(data.post); onClose(); }
    } catch { toast.error('Failed to create post'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg fade-in">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-display font-bold text-slate-900">Share a Skill</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Title *</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
              placeholder="e.g. How I learned React in 30 days" className="input" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Description *</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              placeholder="Share your knowledge, experience, or tutorial..." rows={4} className="input resize-none" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Skill Tags</label>
            <input value={form.skillTags} onChange={e => setForm({...form, skillTags: e.target.value})}
              placeholder="e.g. React, JavaScript, CSS (comma separated)" className="input" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Resource Link (optional)</label>
            <input value={form.resourceLink} onChange={e => setForm({...form, resourceLink: e.target.value})}
              placeholder="https://..." className="input" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Posting...' : 'Share Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Single Skill Card ── */
const SkillCard = ({ post, currentUser, onLike, onDelete }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText]   = useState('');
  const [comments, setComments]         = useState(post.comments || []);
  const [loadingComment, setLoadingComment] = useState(false);

  const liked = post.likes?.includes(currentUser._id);

  const submitComment = async () => {
    if (!commentText.trim()) return;
    setLoadingComment(true);
    try {
      const { data } = await api.post(`/skills/${post._id}/comment`, { text: commentText });
      if (data.success) { setComments(data.comments); setCommentText(''); }
    } catch { toast.error('Failed to add comment'); }
    finally { setLoadingComment(false); }
  };

  const BASE = process.env.REACT_APP_API_URL?.replace('/api', '');

  return (
    <div className="card hover:shadow-md transition-shadow">
      {/* Author */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {post.author?.profileImage
            ? <img src={`${BASE}${post.author.profileImage}`} alt="" className="w-10 h-10 rounded-full object-cover" />
            : <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                {post.author?.name?.slice(0,2).toUpperCase()}
              </div>
          }
          <div>
            <p className="font-semibold text-slate-800 text-sm">{post.author?.name}</p>
            <p className="text-xs text-slate-400">{new Date(post.createdAt).toLocaleDateString('en-IN')}</p>
          </div>
        </div>
        {(post.author?._id === currentUser._id || currentUser.role === 'admin') && (
          <button onClick={() => onDelete(post._id)} className="text-slate-400 hover:text-red-500 transition text-lg" title="Delete">🗑</button>
        )}
      </div>

      {/* Content */}
      <h3 className="font-display font-bold text-slate-900 text-lg mb-2">{post.title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed mb-3 line-clamp-3">{post.description}</p>

      {/* Tags */}
      {post.skillTags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.skillTags.map(t => <span key={t} className="tag">{t}</span>)}
        </div>
      )}

      {/* Resource Link */}
      {post.resourceLink && (
        <a href={post.resourceLink} target="_blank" rel="noopener noreferrer"
          className="text-xs text-indigo-600 hover:underline font-medium mb-3 block">
          🔗 View Resource
        </a>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-3 border-t border-slate-100">
        <button
          onClick={() => onLike(post._id)}
          className={`flex items-center gap-1.5 text-sm font-medium transition ${liked ? 'text-rose-500' : 'text-slate-500 hover:text-rose-400'}`}
        >
          {liked ? '❤️' : '🤍'} {post.likes?.length || 0}
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 transition"
        >
          💬 {comments.length}
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 space-y-3">
          {comments.map((c, i) => (
            <div key={i} className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                {c.user?.name?.slice(0,2).toUpperCase()}
              </div>
              <div className="bg-slate-50 rounded-xl px-3 py-2 flex-1">
                <p className="text-xs font-semibold text-slate-700">{c.user?.name}</p>
                <p className="text-sm text-slate-600">{c.text}</p>
              </div>
            </div>
          ))}
          <div className="flex gap-2 mt-2">
            <input
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitComment()}
              placeholder="Add a comment..."
              className="input py-2 text-sm flex-1"
            />
            <button onClick={submitComment} disabled={loadingComment} className="btn-primary px-4 py-2 text-sm">
              {loadingComment ? '...' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Main Skills Page ── */
const SkillsPage = () => {
  const { user } = useAuth();
  const [posts, setPosts]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 6 });
      if (search) params.append('search', search);
      const { data } = await api.get(`/skills?${params}`);
      setPosts(data.posts || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch { toast.error('Failed to load posts'); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleLike = async (postId) => {
    try {
      const { data } = await api.put(`/skills/${postId}/like`);
      if (data.success) {
        setPosts(prev => prev.map(p => p._id === postId
          ? { ...p, likes: data.liked
              ? [...(p.likes || []), user._id]
              : (p.likes || []).filter(id => id !== user._id) }
          : p
        ));
      }
    } catch { toast.error('Failed to like post'); }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/skills/${postId}`);
      setPosts(prev => prev.filter(p => p._id !== postId));
      toast.success('Post deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Skill Sharing</h1>
          <p className="text-slate-500 text-sm mt-1">Share knowledge, learn from peers</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary shrink-0">+ Share Skill</button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search skill posts..."
          className="input"
        />
      </div>

      {/* Posts Grid */}
      {loading
        ? <Spinner text="Loading posts..." />
        : posts.length === 0
          ? <EmptyState icon="💡" title="No skill posts yet" subtitle="Be the first to share something!" action={<button onClick={() => setShowModal(true)} className="btn-primary">Share a Skill</button>} />
          : <div className="grid gap-5">
              {posts.map(post => (
                <SkillCard key={post._id} post={post} currentUser={user} onLike={handleLike} onDelete={handleDelete} />
              ))}
            </div>
      }

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">← Prev</button>
          <span className="flex items-center text-sm text-slate-600 px-3">Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">Next →</button>
        </div>
      )}

      {showModal && (
        <CreatePostModal onClose={() => setShowModal(false)} onCreated={post => setPosts(prev => [post, ...prev])} />
      )}
    </div>
  );
};

export default SkillsPage;
