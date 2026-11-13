import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import api from '../api/axios';

const linkClass = ({ isActive }) =>
  `flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
    isActive ? 'bg-orange-50 font-semibold text-orange-700' : 'text-slate-700 hover:bg-slate-50'
  }`;

export default function TopicSidebar() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/topics')
      .then((res) => setTopics(res.data.topics))
      .catch(() => setTopics([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <aside className="card p-4">
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Topics</h2>
        <Link to="/topics" className="text-xs font-semibold text-orange-600 hover:underline">
          See all
        </Link>
      </div>

      {loading ? (
        <p className="px-3 text-sm text-slate-400">Loading...</p>
      ) : (
        <nav className="space-y-1">
          <NavLink to="/feed" className={linkClass}>
            All posts
          </NavLink>
          {topics.map((topic) => (
            <NavLink key={topic._id} to={`/topics/${topic._id}`} className={linkClass}>
              <span className="truncate">{topic.title}</span>
              <span className="text-xs text-slate-400">{topic.postCount}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </aside>
  );
}