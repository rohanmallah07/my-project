// src/pages/FindPartnersPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import toast from 'react-hot-toast';

const UserCard = ({ profile, currentUser }) => {
  const navigate = useNavigate();
  const BASE = process.env.REACT_APP_API_URL?.replace('/api', '');
  const initials = profile.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);

  return (
    <div className="card hover:shadow-md transition-shadow flex flex-col">
      {/* Avatar + Name */}
      <div className="flex items-center gap-4 mb-4">
        {profile.profileImage
          ? <img src={`${BASE}${profile.profileImage}`} alt={profile.name} className="w-14 h-14 rounded-xl object-cover border-2 border-slate-100" />
          : <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-display font-bold text-lg shrink-0">
              {initials}
            </div>
        }
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-slate-900 truncate">{profile.name}</h3>
          {profile.college && <p className="text-xs text-slate-500 truncate">{profile.college}</p>}
          {profile.year    && <p className="text-xs text-indigo-600 font-medium">{profile.year}</p>}
        </div>
      </div>

      {profile.bio && (
        <p className="text-sm text-slate-600 mb-3 line-clamp-2 leading-relaxed">{profile.bio}</p>
      )}

      {/* Skills */}
      {profile.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {profile.skills.slice(0,5).map(s => <span key={s} className="tag text-xs">{s}</span>)}
          {profile.skills.length > 5 && <span className="tag text-xs">+{profile.skills.length - 5}</span>}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-4 border-t border-slate-100">
        <Link to={`/profile/${profile._id}`} className="btn-secondary text-sm flex-1 text-center">
          View Profile
        </Link>
        <button onClick={() => navigate(`/messages/${profile._id}`)} className="btn-primary text-sm flex-1">
          💬 Message
        </button>
      </div>
    </div>
  );
};

const FindPartnersPage = () => {
  const { user } = useAuth();
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (search) params.append('search', search);
      if (skillFilter) params.append('skill', skillFilter);
      const { data } = await api.get(`/users?${params}`);
      setUsers(data.users || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [page, search, skillFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const popularSkills = ['React', 'Python', 'JavaScript', 'Node.js', 'Java', 'Flutter', 'ML', 'Figma'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-slate-900">Find Partners</h1>
        <p className="text-slate-500 text-sm mt-1">Discover talented students to collaborate with</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name or skill..."
          className="input flex-1"
        />
        <input
          value={skillFilter}
          onChange={e => { setSkillFilter(e.target.value); setPage(1); }}
          placeholder="Filter by skill..."
          className="input sm:w-48"
        />
      </div>

      {/* Quick Skill Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {popularSkills.map(s => (
          <button
            key={s}
            onClick={() => { setSkillFilter(skillFilter === s ? '' : s); setPage(1); }}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition ${
              skillFilter === s ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading
        ? <Spinner text="Finding partners..." />
        : users.length === 0
          ? <EmptyState icon="🤝" title="No users found" subtitle="Try a different search or skill filter" />
          : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {users.map(u => <UserCard key={u._id} profile={u} currentUser={user} />)}
            </div>
      }

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">← Prev</button>
          <span className="flex items-center text-sm text-slate-600 px-3">Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  );
};

export default FindPartnersPage;
