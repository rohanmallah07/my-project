// src/pages/DashboardPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';
import toast from 'react-hot-toast';

const StatCard = ({ icon, label, value, color }) => (
  <div className="card flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>{icon}</div>
    <div>
      <p className="text-2xl font-display font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const [recentSkills, setRecentSkills]         = useState([]);
  const [recentProjects, setRecentProjects]     = useState([]);
  const [recentInternships, setRecentInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [s, p, i] = await Promise.all([
          api.get('/skills?limit=3'),
          api.get('/projects?limit=3'),
          api.get('/internships?limit=3'),
        ]);
        setRecentSkills(s.data.posts || []);
        setRecentProjects(p.data.projects || []);
        setRecentInternships(i.data.internships || []);
      } catch {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <Spinner size="lg" text="Loading dashboard..." />;

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in">

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 sm:p-8 text-white mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold mb-1">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-indigo-200 text-sm">
            {user?.college && `${user.college} · `}{user?.year || 'Student'}
          </p>
          {user?.skills?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {user.skills.slice(0, 4).map(s => (
                <span key={s} className="bg-white/20 backdrop-blur text-white text-xs font-medium px-3 py-1 rounded-full">{s}</span>
              ))}
            </div>
          )}
        </div>
        <Link to="/profile" className="shrink-0 bg-white text-indigo-600 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-indigo-50 transition">
          Edit Profile
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="💡" label="Skill Posts" value={recentSkills.length > 0 ? '10+' : '0'} color="bg-amber-50" />
        <StatCard icon="🚀" label="Projects"   value={recentProjects.length > 0 ? '10+' : '0'} color="bg-indigo-50" />
        <StatCard icon="💼" label="Internships" value={recentInternships.length > 0 ? '10+' : '0'} color="bg-emerald-50" />
        <StatCard icon="🤝" label="Connect"    value="∞"  color="bg-violet-50" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { to: '/skills',        icon: '💡', label: 'Share a Skill',   bg: 'bg-amber-50 hover:bg-amber-100 text-amber-700' },
          { to: '/projects',      icon: '🚀', label: 'Post Project',    bg: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700' },
          { to: '/internships',   icon: '💼', label: 'Find Internship', bg: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700' },
          { to: '/find-partners', icon: '🤝', label: 'Find Partners',   bg: 'bg-violet-50 hover:bg-violet-100 text-violet-700' },
        ].map(a => (
          <Link key={a.to} to={a.to} className={`${a.bg} rounded-xl p-4 flex flex-col items-center gap-2 transition font-semibold text-sm text-center`}>
            <span className="text-2xl">{a.icon}</span>
            {a.label}
          </Link>
        ))}
      </div>

      {/* Recent Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Skill Posts */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-slate-900">Recent Skills</h2>
            <Link to="/skills" className="text-xs text-indigo-600 font-semibold hover:underline">View all →</Link>
          </div>
          {recentSkills.length === 0
            ? <p className="text-sm text-slate-400 text-center py-4">No posts yet</p>
            : recentSkills.map(post => (
              <div key={post._id} className="py-3 border-b border-slate-50 last:border-0">
                <p className="font-semibold text-sm text-slate-800 truncate">{post.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{post.author?.name} · {post.likes?.length || 0} likes</p>
              </div>
            ))
          }
        </div>

        {/* Recent Projects */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-slate-900">Open Projects</h2>
            <Link to="/projects" className="text-xs text-indigo-600 font-semibold hover:underline">View all →</Link>
          </div>
          {recentProjects.length === 0
            ? <p className="text-sm text-slate-400 text-center py-4">No projects yet</p>
            : recentProjects.map(proj => (
              <div key={proj._id} className="py-3 border-b border-slate-50 last:border-0">
                <p className="font-semibold text-sm text-slate-800 truncate">{proj.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{proj.owner?.name} · Team of {proj.teamSize}</p>
              </div>
            ))
          }
        </div>

        {/* Recent Internships */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-slate-900">Internships</h2>
            <Link to="/internships" className="text-xs text-indigo-600 font-semibold hover:underline">View all →</Link>
          </div>
          {recentInternships.length === 0
            ? <p className="text-sm text-slate-400 text-center py-4">No internships yet</p>
            : recentInternships.map(intern => (
              <div key={intern._id} className="py-3 border-b border-slate-50 last:border-0">
                <p className="font-semibold text-sm text-slate-800 truncate">{intern.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{intern.company} · {intern.location}</p>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
