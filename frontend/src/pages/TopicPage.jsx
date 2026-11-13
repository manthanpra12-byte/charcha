import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios';
import { formatDate } from '../utils/formatDate';
import SidebarLayout from '../components/SidebarLayout';
import PostFeed from '../components/PostFeed';
import Loader from '../components/Loader';
import Alert from '../components/Alert';

export default function TopicPage() {
  const { id } = useParams(); // the :id part of /topics/:id
  const location = useLocation();
  const [topic, setTopic] = useState(null);
  const [error, setError] = useState('');

  // Reload when the id changes (e.g. clicking another topic in the sidebar)
  useEffect(() => {
    let ignore = false;
    setTopic(null);
    setError('');
    api
      .get(`/topics/${id}`)
      .then((res) => { if (!ignore) setTopic(res.data.topic); })
      .catch((err) => { if (!ignore) setError(getErrorMessage(err)); });
    return () => { ignore = true; };
  }, [id]);

  return (
    <SidebarLayout>
      {location.state?.message && (
        <div className="mb-4">
          <Alert type="success">{location.state.message}</Alert>
        </div>
      )}
      {error && <Alert>{error}</Alert>}
      {!topic && !error && <Loader />}

      {topic && (
        <>
          <div className="card mb-6 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-navy-900">{topic.title}</h1>
                <p className="mt-1 text-slate-600">{topic.description}</p>
                <p className="mt-3 text-xs text-slate-400">
                  Created by {topic.createdBy?.name || 'Deleted user'} · {formatDate(topic.createdAt)} · {topic.postCount}{' '}
                  {topic.postCount === 1 ? 'post' : 'posts'}
                </p>
              </div>
              <Link to={`/posts/new?topic=${topic._id}`} className="btn-primary">
                + Post in this topic
              </Link>
            </div>
          </div>

          <PostFeed endpoint={`/topics/${topic._id}/posts`} createLink={`/posts/new?topic=${topic._id}`} />
        </>
      )}
    </SidebarLayout>
  );
}