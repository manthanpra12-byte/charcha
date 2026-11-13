import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/formatDate';
import VoteButtons from '../components/VoteButtons';
import CommentSection from '../components/CommentSection';
import Loader from '../components/Loader';
import Alert from '../components/Alert';

export default function PostDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [post, setPost] = useState(null);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let ignore = false;
    setPost(null);
    setError('');
    api
      .get(`/posts/${id}`)
      .then((res) => { if (!ignore) setPost(res.data.post); })
      .catch((err) => { if (!ignore) setError(getErrorMessage(err)); });
    return () => { ignore = true; };
  }, [id]);

  const isOwner = post && post.author?._id === user._id;
  const isAdmin = user.role === 'admin';

  const handleDelete = async () => {
    if (!window.confirm('Delete this post? Its comments and votes will also be removed.')) return;
    setDeleting(true);
    try {
      await api.delete(`/posts/${id}`);
      navigate('/feed', { replace: true, state: { message: 'Post deleted successfully' } });
    } catch (err) {
      setError(getErrorMessage(err));
      setDeleting(false);
    }
  };

  if (!post && !error) return <Loader />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link to="/feed" className="text-sm font-medium text-slate-500 hover:text-orange-600">← Back to feed</Link>

      <div className="mt-4 space-y-4">
        {location.state?.message && <Alert type="success">{location.state.message}</Alert>}
        <Alert>{error}</Alert>
      </div>

      {post && (
        <>
          <article className="card mt-4 p-6 sm:p-8">
            <div className="flex gap-4">
              <div className="shrink-0">
                <VoteButtons postId={post._id} initialScore={post.score} initialVote={post.userVote} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {post.topic && (
                    <Link to={`/topics/${post.topic._id}`} className="rounded-full bg-navy-900/5 px-2.5 py-0.5 font-semibold text-navy-800 hover:bg-navy-900/10">
                      {post.topic.title}
                    </Link>
                  )}
                  {post.postType === 'question' && (
                    <span className="rounded-full bg-orange-100 px-2.5 py-0.5 font-semibold text-orange-700">Question</span>
                  )}
                </div>

                <h1 className="mt-3 text-2xl font-bold text-navy-900 sm:text-3xl">{post.title}</h1>
                <p className="mt-2 text-sm text-slate-500">
                                    Posted by{' '}
                  {post.author ? (
                    <Link to={`/users/${post.author._id}`} className="font-medium text-slate-700 hover:text-orange-600 hover:underline">
                      {post.author.name}
                    </Link>
                  ) : (
                    <span className="font-medium text-slate-700">Deleted user</span>
                  )}{' '}
                  ·{' '}
                  {formatDate(post.createdAt)}
                  {post.updatedAt !== post.createdAt && ' · edited'}
                </p>

                {/* whitespace-pre-line keeps the line breaks the author typed */}
                <div className="mt-6 whitespace-pre-line break-words leading-relaxed text-slate-800">{post.content}</div>
              </div>
            </div>

            {(isOwner || isAdmin) && (
              <div className="mt-8 flex justify-end gap-2 border-t border-slate-100 pt-4">
                {isOwner && <Link to={`/posts/${post._id}/edit`} className="btn-secondary">Edit</Link>}
                <button type="button" onClick={handleDelete} disabled={deleting} className="btn-danger">
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            )}
          </article>

          <CommentSection postId={post._id} />
        </>
      )}
    </div>
  );
}