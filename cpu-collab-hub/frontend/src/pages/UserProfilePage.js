// src/pages/UserProfilePage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';
import toast from 'react-hot-toast';

const UserProfilePage = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const BASE = process.env.REACT_APP_API_URL?.replace('/api', '');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get(`/users/${id}`);
        if (data.success) setProfile(data.user);
      } catch {
        toast.error('User not found');
        navigate('/find-partners');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, navigate]);

  if (loading) return <Spinner size="lg" text="Loading profile..." />;
  if (!profile)  return null;

  const initials = profile.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 fade-in">
      <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:text-slate-800 mb-5 flex items-center gap-1">
        ← Back
      </button>

      <div className="card">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-100 mb-6">
          {profile.profileImage
            ? <img src={`${BASE}${profile.profileImage}`} alt={profile.name}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-md" />
            : <div className="w-24 h-24 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-display font-bold shadow-md">
                {initials}
              </div>
          }
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-display font-bold text-slate-900">{profile.name}</h1>
            {profile.college && <p className="text-slate-500 text-sm">{profile.college}{profile.year && ` · ${profile.year}`}</p>}
            {profile.bio && <p className="text-slate-600 text-sm mt-2 max-w-md">{profile.bio}</p>}
            <div className="flex gap-3 mt-3 justify-center sm:justify-start">
              {profile.github   && <a href={profile.github}   target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 underline">GitHub</a>}
              {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 underline">LinkedIn</a>}
              {profile.website  && <a href={profile.website}  target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 underline">Website</a>}
            </div>
          </div>
          {/* Message button */}
          {currentUser._id !== profile._id && (
            <button onClick={() => navigate(`/messages/${profile._id}`)} className="btn-primary shrink-0 text-sm">
              💬 Message
            </button>
          )}
        </div>

        {/* Skills */}
        {profile.skills?.length > 0 && (
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map(s => <span key={s} className="tag">{s}</span>)}
            </div>
          </div>
        )}

        {/* Interests */}
        {profile.interests?.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map(i => <span key={i} className="tag-green">{i}</span>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;
