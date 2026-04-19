// src/pages/AdminPage.js
import React, { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';
import toast from 'react-hot-toast';

const StatBox = ({ icon, label, value, color }) => (
  <div className={`card flex items-center gap-4 border-l-4 ${color}`}>
    <span className="text-3xl">{icon}</span>
    <div>
      <p className="text-3xl font-display font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  </div>
);

const AdminPage = () => {
  const [stats, setStats]         = useState(null);
  const [users, setUsers]         = useState([]);
  const [tab, setTab]             = useState('overview');
  const [loading, setLoading]     = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users'),
        ]);
        setStats(statsRes.data.stats);
        setUsers(usersRes.data.users || []);
      } catch { toast.error('Failed to load admin data'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const toggleUser = async (id) => {
    setTogglingId(id);
    try {
      const { data } = await api.put(`/admin/users/${id}/toggle`);
      if (data.success) {
        setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: data.isActive } : u));
        toast.success(data.message);
      }
    } catch { toast.error('Failed to update user'); }
    finally { setTogglingId(null); }
  };

  if (loading) return <Spinner size="lg" text="Loading admin panel..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Admin Panel</h1>
          <p className="text-slate-500 text-sm mt-1">Manage users and platform content</p>
        </div>
        <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full">Admin</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit mb-8">
        {['overview', 'users'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition ${
              tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && stats && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <StatBox icon="👥" label="Total Users"        value={stats.totalUsers}       color="border-indigo-400" />
            <StatBox icon="💡" label="Skill Posts"        value={stats.totalPosts}       color="border-amber-400" />
            <StatBox icon="🚀" label="Projects"           value={stats.totalProjects}    color="border-violet-400" />
            <StatBox icon="💼" label="Internships"        value={stats.totalInternships} color="border-emerald-400" />
          </div>

          {/* Recent Users */}
          <div className="card">
            <h2 className="font-display font-bold text-slate-900 mb-4">Recently Joined Users</h2>
            <div className="space-y-3">
              {stats.recentUsers?.map(u => (
                <div key={u._id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{u.name}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                      {u.role}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Users Tab */}
      {tab === 'users' && (
        <div className="card overflow-hidden p-0">
          <div className="p-5 border-b border-slate-100">
            <h2 className="font-display font-bold text-slate-900">All Users ({users.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">College</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-slate-800">{u.name}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600 hidden sm:table-cell">
                      {u.college || '—'}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                      }`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => toggleUser(u._id)}
                          disabled={togglingId === u._id}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
                            u.isActive
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {togglingId === u._id ? '...' : u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
