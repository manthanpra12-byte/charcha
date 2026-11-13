import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios';
import { timeAgo } from '../utils/formatDate';
import EmptyState from './EmptyState';
import Loader from './Loader';
import Alert from './Alert';

export default function UserComments({ userId }) {
  const [comments, setComments] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    setComments(null);
    setError('');
    api
      .get(`/users/${userId}/comments`)
      .then((res) => { if (!ignore) setComments(res.data.comments); })
      .catch((err) => { if (!ignore) setError(getErrorMessage(err)); });
    return () => { ignore = true; };
  }, [userId]);

  if (error) return <Alert>{error}</Alert>;
  if (!comments) return <Loader text="Loading comments..." />;
  if (comments.length === 0) return <EmptyState title="No comments yet" />;

  return (
    <div className="space-y-3">
      {comments.length === 20 && <p className="text-xs text-slate-400">Showing the 20 most recent comments</p>}
      {comments.map((c) => (
        <Link key={c._id} to={`/posts/${c.post._id}`} className="card block p-4 transition-colors hover:border-orange-300">
          <p className="text-xs text-slate-500">
            On <span className="font-semibold text-navy-800">{c.post.title}</span> · {timeAgo(c.createdAt)}
          </p>
          <p className="mt-1 line-clamp-3 whitespace-pre-line text-sm text-slate-800">{c.content}</p>
        </Link>
      ))}
    </div>
  );
}