import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/formatDate';
import PostFeed from '../components/PostFeed';
import UserComments from '../components/UserComments';
import EditProfileForm from '../components/EditProfileForm';
import Loader from '../components/Loader';
import Alert from '../components/Alert';

const TABS = [
  { key: 'posts', label: 'Posts' },
  { key: 'comments', label: 'Comments' },
];

export default function Profile() {
  const { id } = useParams();
  const { user: me, setUser } = useAuth();

  const [profile, setProfile] = useState(null); // { user, stats }
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [success, setSuccess] = useState('');
  const [tab, setTab] = useState('posts');

  // Load (or reload) whenever the id in the URL changes
  useEffect(() => {
    let ignore = false;
    setProfile(null);
    setError('');
    setEditing(false);
    setSuccess('');
    setTab('posts');
    api
      .get(`/users/${id}`)
      .then((res) => { if (!ignore) setProfile(res.data); })
      .catch((err) => { if (!ignore) setError(getErrorMessage(err)); });
    return () => { ignore = true; };
  }, [id]);

  const isMe = me._id === id;

  const handleSaved = (updatedUser) => {
    setProfile({ ...profile, user: { ...profile.user, name: updatedUser.name, bio: updatedUser.bio } });
    setUser(updatedUser); // the Navbar shows the new name right away
    setEditing(false);
    setSuccess('Profile updated successfully');
  };

  if (error) return <div className="mx-auto max-w-3xl px-4 py-10"><Alert>{error}</Alert></div>;
  if (!profile) return <Loader />;

  const { user, stats } = profile;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {success && <div className="mb-4"><Alert type="success">{success}</Alert></div>}

      <div className="card p-6 sm:p-8">
        <div className="flex flex-wrap items-start gap-5">
          {/* Simple avatar: the first letter of the name */}
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-navy-900 text-2xl font-bold text-white">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-navy-900">{user.name}</h1>
              {user.role === 'admin' && (
                <span className="rounded bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">ADMIN</span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-500">Member since {formatDate(user.createdAt)}</p>
            {user.bio ? (
              <p className="mt-3 whitespace-pre-line text-slate-700">{user.bio}</p>
            ) : (
              <p className="mt-3 text-sm italic text-slate-400">
                {isMe ? 'Add a short bio to tell the community about yourself.' : 'No bio yet.'}
              </p>
            )}
          </div>

          {isMe && !editing && (
            <button type="button" onClick={() => { setEditing(true); setSuccess(''); }} className="btn-secondary">
              Edit profile
            </button>
          )}
        </div>

        {editing && (
          <div className="mt-6 border-t border-slate-100 pt-6">
            <EditProfileForm user={user} onSaved={handleSaved} onCancel={() => setEditing(false)} />
          </div>
        )}

        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-slate-100 pt-6 text-center">
          {[
            ['Posts', stats.posts],
            ['Comments', stats.comments],
            ['Total score', stats.totalScore],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-2xl font-bold text-navy-900">{value}</p>
              <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 mt-6 flex gap-2 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold ${
              tab === t.key ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-navy-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'posts' ? (
        <PostFeed endpoint={`/users/${id}/posts`} createLink={isMe ? '/posts/new' : null} />
      ) : (
        <UserComments userId={id} />
      )}
    </div>
  );
}