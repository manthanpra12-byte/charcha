import { useState } from 'react';
import api, { getErrorMessage } from '../api/axios';
import Alert from './Alert';

const REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'abuse', label: 'Abuse or harassment' },
  { value: 'misinformation', label: 'Misinformation' },
  { value: 'off-topic', label: 'Off-topic' },
  { value: 'other', label: 'Other' },
];

export default function ReportPostForm({ postId, onClose }) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!reason) return setError('Please choose a reason');

    setSubmitting(true);
    try {
      await api.post('/reports', { postId, reason, details: details.trim() });
      setDone(true);
    } catch (err) {
      setError(getErrorMessage(err)); // e.g. "You have already reported this post"
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="space-y-3">
        <Alert type="success">Thank you. An admin will review this post.</Alert>
        <div className="flex justify-end">
          <button type="button" onClick={onClose} className="btn-secondary">Close</button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3 rounded-lg bg-slate-50 p-4">
      <h3 className="font-semibold text-navy-900">Report this post</h3>
      <Alert>{error}</Alert>

      <select
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
      >
        <option value="">Choose a reason...</option>
        {REASONS.map((r) => (
          <option key={r.value} value={r.value}>{r.label}</option>
        ))}
      </select>

      <textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        rows={2}
        maxLength={500}
        placeholder="Extra details (optional)"
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
      />

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={submitting} className="btn-danger">
          {submitting ? 'Sending...' : 'Submit report'}
        </button>
      </div>
    </form>
  );
}