import { useState } from 'react';
import api, { getErrorMessage } from '../api/axios';
import Alert from './Alert';

export default function CommentForm({
  postId,
  parentCommentId = null, // null = top-level comment, otherwise a reply
  onSubmitted,
  onCancel,
  placeholder = 'Share your thoughts...',
  autoFocus = false,
}) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!content.trim()) return setError('Comment cannot be empty');

    setSubmitting(true);
    try {
      await api.post('/comments', { postId, content: content.trim(), parentCommentId });
      setContent('');
      onSubmitted(); // tell the parent to reload the comments
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Alert>{error}</Alert>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        maxLength={2000}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary px-3 py-1.5">
            Cancel
          </button>
        )}
        <button type="submit" disabled={submitting} className="btn-primary px-3 py-1.5">
          {submitting ? 'Posting...' : parentCommentId ? 'Reply' : 'Comment'}
        </button>
      </div>
    </form>
  );
}