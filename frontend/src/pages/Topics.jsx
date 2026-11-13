import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios';
import SearchBar from '../components/SearchBar';
import CreateTopicForm from '../components/CreateTopicForm';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import Alert from '../components/Alert';

export default function Topics() {
  const [topics, setTopics] = useState(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Load topics on page load and again whenever the search changes
  useEffect(() => {
    let ignore = false;
    setTopics(null);
    setError('');
    api
      .get('/topics', { params: { search: search || undefined } })
      .then((res) => { if (!ignore) setTopics(res.data.topics); })
      .catch((err) => { if (!ignore) setError(getErrorMessage(err)); });
    return () => { ignore = true; };
  }, [search]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Topics</h1>
          <p className="text-sm text-slate-500">Find a community or start a new one.</p>
        </div>
        {!showForm && (
          <button type="button" onClick={() => setShowForm(true)} className="btn-primary">
            + New topic
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6">
          <CreateTopicForm onCancel={() => setShowForm(false)} />
        </div>
      )}

      <div className="mb-6">
        <SearchBar onSearch={setSearch} placeholder="Search topics..." />
      </div>

      {error && <Alert>{error}</Alert>}
      {!topics && !error && <Loader text="Loading topics..." />}

      {topics && topics.length === 0 && (
        <EmptyState title="No topics found" text={search ? 'Try a different search.' : 'Create the first topic.'} />
      )}

      {topics && topics.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <Link key={topic._id} to={`/topics/${topic._id}`} className="card block p-5 transition-colors hover:border-orange-300">
              <h2 className="font-semibold text-navy-900">{topic.title}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-slate-600">{topic.description}</p>
              <p className="mt-3 text-xs text-slate-400">
                {topic.postCount} {topic.postCount === 1 ? 'post' : 'posts'}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}