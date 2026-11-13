import { useState } from 'react';
import api, { getErrorMessage } from '../api/axios';
import FormInput from './FormInput';
import Alert from './Alert';

export default function EditProfileForm({ user, onSaved, onCancel }) {
  const [form, setForm] = useState({ name: user.name, bio: user.bio || '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const name = form.name.trim();
    const bio = form.bio.trim();
    if (name.length < 2 || name.length > 50) return setError('Name must be 2 to 50 characters');
    if (bio.length > 300) return setError('Bio can be at most 300 characters');

    setSaving(true);
    try {
      const res = await api.put('/users/profile', { name, bio });
      onSaved(res.data.user);
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Alert>{error}</Alert>
      <FormInput label="Name" name="name" value={form.name} onChange={handleChange} maxLength={50} />
      <div>
        <FormInput label="Bio" name="bio" rows={3} value={form.bio} onChange={handleChange} maxLength={300}
          placeholder="Tell the community a little about yourself" />
        <p className="mt-1 text-right text-xs text-slate-400">{form.bio.length}/300</p>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save profile'}</button>
      </div>
    </form>
  );
}