import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/FormInput';
import Loader from '../components/Loader';
import Alert from '../components/Alert';

const POST_TYPES = [
  { value: 'discussion', label: '💬 Discussion' },
  { value: 'question', label: '❓ Question' },
];

export default function PostForm() {
  const { id } = useParams(); // only present on /posts/:id/edit
  const isEdit = Boolean(id);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [topics, setTopics] = useState([]);
  const [form, setForm] = useState({
    title: '',
    content: '',
    postType: 'discussion',
    topic: searchParams.get('topic') || '', // pre-selected when coming from a topic page
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Load the topic list, and the existing post when editing
  useEffect(() => {
    const requests = [api.get('/topics')];
    if (isEdit) requests.push(api.get(`/posts/${id}`));

    Promise.all(requests)
      .then(([topicsRes, postRes]) => {
        setTopics(topicsRes.data.topics);
        if (postRes) {
          const post = postRes.data.post;
          if (post.author?._id !== user._id) {
            setLoadError('You can only edit your own posts.');
            return;
          }
          setForm({ title: post.title, content: post.content, postType: post.postType, topic: post.topic?._id || '' });
        }
      })
      .catch((err) => setLoadError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id, isEdit, user._id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const errs = {};
    if (!form.topic) errs.topic = 'Please choose a topic';
    if (form.title.trim().length < 5 || form.title.trim().length > 150) errs.title = 'Title must be 5 to 150 characters';
    if (!form.content.trim()) errs.content = 'Content is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    const payload = { title: form.title.trim(), content: form.content.trim(), postType: form.postType };
    try {
      const res = isEdit
        ? await api.put(`/posts/${id}`, payload)
        : await api.post('/posts', { ...payload, topic: form.topic });

      navigate(`/posts/${res.data.post._id}`, {
        state: { message: isEdit ? 'Post updated successfully' : 'Post published successfully' },
      });
    } catch (err) {
      setServerError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  if (loadError) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-10">
        <Alert>{loadError}</Alert>
        <Link to="/feed" className="btn-secondary">Back to feed</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <form onSubmit={handleSubmit} noValidate className="card space-y-5 p-6 sm:p-8">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">{isEdit ? 'Edit post' : 'Create a post'}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {isEdit ? 'Update your post. The topic cannot be changed.' : 'Start a discussion or ask the community a question.'}
          </p>
        </div>

        <Alert>{serverError}</Alert>

        <div>
          <label htmlFor="topic" className="mb-1 block text-sm font-medium text-slate-700">Topic</label>
          <select
            id="topic"
            name="topic"
            value={form.topic}
            onChange={handleChange}
            disabled={isEdit}
            className={`w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 disabled:bg-slate-100 ${
              errors.topic ? 'border-red-400 focus:ring-red-200' : 'border-slate-300 focus:border-orange-500 focus:ring-orange-200'
            }`}
          >
            <option value="">Choose a topic...</option>
            {topics.map((t) => (
              <option key={t._id} value={t._id}>{t.title}</option>
            ))}
          </select>
          {errors.topic && <p className="mt-1 text-xs text-red-600">{errors.topic}</p>}
        </div>

        <div>
          <span className="mb-1 block text-sm font-medium text-slate-700">Post type</span>
          <div className="flex gap-2">
            {POST_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setForm({ ...form, postType: type.value })}
                className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  form.postType === type.value
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <FormInput label="Title" name="title" value={form.title} onChange={handleChange} error={errors.title}
          maxLength={150} placeholder="A clear, specific title" />
        <FormInput label="Content" name="content" rows={8} value={form.content} onChange={handleChange}
          error={errors.content} maxLength={10000} placeholder="Share details, context or your question..." />

        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Publish post'}
          </button>
        </div>
      </form>
    </div>
  );
}