import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios';
import FormInput from './FormInput';
import Alert from './Alert';

export default function CreateTopicForm({ onCancel }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const title = form.title.trim();
    const description = form.description.trim();
    if (title.length < 3 || title.length > 50) return setError('Title must be 3 to 50 characters');
    if (!description) return setError('Description is required');

    setSubmitting(true);
    try {
      const res = await api.post('/topics', { title, description });
      // Open the new topic's page right away
      navigate(`/topics/${res.data.topic._id}`, { state: { message: 'Topic created successfully' } });
    } catch (err) {
      setError(getErrorMessage(err)); // e.g. "A topic with this title already exists"
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="card space-y-4 p-6">
      <h2 className="text-lg font-semibold text-navy-900">Create a new topic</h2>
      <Alert>{error}</Alert>
      <FormInput label="Title" name="title" value={form.title} onChange={handleChange} maxLength={50} placeholder="e.g. Web Development" />
      <FormInput label="Description" name="description" rows={3} value={form.description} onChange={handleChange} maxLength={500} placeholder="What is this topic about?" />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Creating...' : 'Create topic'}
        </button>
      </div>
    </form>
  );
}