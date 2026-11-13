import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios';
import { timeAgo } from '../utils/formatDate';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import Alert from '../components/Alert';

const TABS = ['pending', 'resolved', 'dismissed', 'all'];

const REASON_LABELS = {
  spam: 'Spam',
  abuse: 'Abuse',
  misinformation: 'Misinformation',
  'off-topic': 'Off-topic',
  other: 'Other',
};

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-700',
  dismissed: 'bg-slate-100 text-slate-600',
};

export default function AdminDashboard() {
  const [status, setStatus] = useState('pending');
  const [stats, setStats] = useState(null);
  const [data, setData] = useState(null); // { reports, counts }
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Load stats + reports for the selected tab (and again after every review)
  useEffect(() => {
    let ignore = false;
    Promise.all([api.get('/admin/stats'), api.get('/reports', { params: { status } })])
      .then(([statsRes, reportsRes]) => {
        if (ignore) return;
        setStats(statsRes.data);
        setData(reportsRes.data);
      })
      .catch((err) => { if (!ignore) setError(getErrorMessage(err)); });
    return () => { ignore = true; };
  }, [status, reloadKey]);

  const changeTab = (tab) => {
    setStatus(tab);
    setData(null);
    setMessage('');
  };

  const review = async (report, action) => {
    if (action === 'remove' &&
        !window.confirm(`Remove "${report.postTitle}"? The post, its comments and votes will be deleted.`)) return;

    setBusyId(report._id);
    setError('');
    setMessage('');
    try {
      const res = await api.patch(`/reports/${report._id}`, { action });
      setMessage(res.data.message);
      setReloadKey((k) => k + 1); // refresh the list and the stats
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const countFor = (tab) => {
    if (!data) return '';
    const c = data.counts;
    return tab === 'all' ? c.pending + c.resolved + c.dismissed : c[tab];
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-navy-900">Moderation dashboard</h1>
      <p className="text-sm text-slate-500">Review reported posts and keep Charcha a healthy community.</p>

      {/* Site statistics */}
      {stats && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {[
            ['Users', stats.users],
            ['Topics', stats.topics],
            ['Posts', stats.posts],
            ['Comments', stats.comments],
            ['Pending reports', stats.pendingReports],
          ].map(([label, value]) => (
            <div key={label} className={`card p-4 text-center ${label === 'Pending reports' && value > 0 ? 'border-orange-300 bg-orange-50' : ''}`}>
              <p className="text-2xl font-bold text-navy-900">{value}</p>
              <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Status tabs */}
      <div className="mb-4 mt-8 flex flex-wrap gap-2 border-b border-slate-200">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => changeTab(tab)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold capitalize ${
              status === tab ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-navy-900'
            }`}
          >
            {tab} {data && <span className="text-xs text-slate-400">({countFor(tab)})</span>}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {message && <Alert type="success">{message}</Alert>}
        {error && <Alert>{error}</Alert>}
      </div>

      {!data && !error && <Loader text="Loading reports..." />}

      {data && data.reports.length === 0 && (
        <div className="mt-4">
          <EmptyState title={status === 'pending' ? 'No pending reports 🎉' : 'No reports here'} text="Nothing needs your attention." />
        </div>
      )}

      {data && data.reports.length > 0 && (
        <div className="mt-4 space-y-4">
          {data.reports.map((r) => (
            <div key={r._id} className="card p-5">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-red-100 px-2.5 py-0.5 font-semibold text-red-700">{REASON_LABELS[r.reason]}</span>
                <span className={`rounded-full px-2.5 py-0.5 font-semibold capitalize ${STATUS_STYLES[r.status]}`}>{r.status}</span>
                <span className="text-slate-500">
                  reported by {r.reportedBy?.name || 'Deleted user'} · {timeAgo(r.createdAt)}
                </span>
              </div>

              <h3 className="mt-2 font-semibold text-navy-900">
                {r.post ? (
                  <Link to={`/posts/${r.post._id}`} className="hover:text-orange-600 hover:underline">{r.post.title}</Link>
                ) : (
                  <span className="text-slate-400 line-through">{r.postTitle}</span>
                )}
              </h3>
              <p className="text-xs text-slate-500">
                {r.post ? `Posted by ${r.post.author?.name || 'Deleted user'}` : 'This post has been removed'}
              </p>

              {r.details && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">"{r.details}"</p>}

              {r.status === 'pending' ? (
                <div className="mt-4 flex justify-end gap-2">
                  <button type="button" onClick={() => review(r, 'dismiss')} disabled={busyId === r._id} className="btn-secondary">
                    Dismiss
                  </button>
                  <button type="button" onClick={() => review(r, 'remove')} disabled={busyId === r._id} className="btn-danger">
                    {busyId === r._id ? 'Working...' : 'Remove post'}
                  </button>
                </div>
              ) : (
                <p className="mt-3 text-xs text-slate-500">
                  {r.status === 'resolved' ? 'Post removed' : 'Report dismissed'} by {r.reviewedBy?.name || 'an admin'}
                  {r.reviewedAt && ` · ${timeAgo(r.reviewedAt)}`}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}