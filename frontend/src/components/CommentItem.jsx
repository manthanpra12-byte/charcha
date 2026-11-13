import { useState } from 'react';
import api, { getErrorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { timeAgo } from '../utils/formatDate';
import CommentForm from './CommentForm';

// Shows one comment, then its replies, each rendered by this same component
export default function CommentItem({ comment, postId, depth = 0, onChanged }) {
  const { user } = useAuth();
  const [replying, setReplying] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const isOwner = comment.author?._id === user._id;
  const canDelete = !comment.isDeleted && (isOwner || user.role === 'admin');

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return;
    setDeleting(true);
    setError('');
    try {
      await api.delete(`/comments/${comment._id}`);
      onChanged(); // reload the whole thread
    } catch (err) {
      setError(getErrorMessage(err));
      setDeleting(false);
    }
  };

  // Indent replies with a line on the left, but stop adding indentation after 4 levels
  // so deep threads stay readable on phones
  const wrapperClass =
    depth === 0 ? 'pt-4' : depth <= 4 ? 'mt-3 border-l-2 border-slate-200 pl-4' : 'mt-3';

  return (
    <div className={wrapperClass}>
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span className="font-semibold text-slate-700">{comment.author?.name || '[deleted]'}</span>
        <span>·</span>
        <span>{timeAgo(comment.createdAt)}</span>
      </div>

      <p
        className={`mt-1 whitespace-pre-line break-words text-sm ${
          comment.isDeleted ? 'italic text-slate-400' : 'text-slate-800'
        }`}
      >
        {comment.content}
      </p>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

      {/* Deleted comments can't be replied to or deleted again */}
      {!comment.isDeleted && (
        <div className="mt-1 flex gap-4 text-xs font-semibold text-slate-500">
          <button type="button" onClick={() => setReplying(!replying)} className="hover:text-orange-600">
            {replying ? 'Cancel reply' : 'Reply'}
          </button>
          {canDelete && (
            <button type="button" onClick={handleDelete} disabled={deleting} className="hover:text-red-600">
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
        </div>
      )}

      {replying && (
        <div className="mt-2">
          <CommentForm
            postId={postId}
            parentCommentId={comment._id}
            autoFocus
            placeholder={`Reply to ${comment.author?.name}...`}
            onCancel={() => setReplying(false)}
            onSubmitted={() => {
              setReplying(false);
              onChanged();
            }}
          />
        </div>
      )}

      {/* Recursion: each reply is shown by another CommentItem, one level deeper */}
      {comment.replies.map((reply) => (
        <CommentItem key={reply._id} comment={reply} postId={postId} depth={depth + 1} onChanged={onChanged} />
      ))}
    </div>
  );
}