import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/axios';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import Loader from './Loader';
import Alert from './Alert';

export default function CommentSection({ postId }) {
  const [data, setData] = useState(null); // { comments: [...tree], total }
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  // Changing reloadKey re-runs the effect below, which fetches the comments again
  const reload = () => setReloadKey((key) => key + 1);

  useEffect(() => {
    let ignore = false;
    setError('');
    api
      .get(`/comments/post/${postId}`)
      .then((res) => { if (!ignore) setData(res.data); })
      .catch((err) => { if (!ignore) setError(getErrorMessage(err)); });
    return () => { ignore = true; };
  }, [postId, reloadKey]);

  return (
    <section className="card mt-6 p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-navy-900">
        Comments {data && <span className="font-normal text-slate-400">({data.total})</span>}
      </h2>

      <div className="mt-4">
        <CommentForm postId={postId} onSubmitted={reload} />
      </div>

      {error && <div className="mt-4"><Alert>{error}</Alert></div>}
      {!data && !error && <Loader text="Loading comments..." />}

      {data && data.comments.length === 0 && (
        <p className="mt-6 text-center text-sm text-slate-500">No comments yet. Start the conversation!</p>
      )}

      {data && data.comments.length > 0 && (
        <div className="mt-2 divide-y divide-slate-100">
          {data.comments.map((comment) => (
            <div key={comment._id} className="pb-4">
              <CommentItem comment={comment} postId={postId} onChanged={reload} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}