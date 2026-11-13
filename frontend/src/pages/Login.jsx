import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/axios';
import { isValidEmail } from '../utils/validators';
import AuthCard from '../components/AuthCard';
import FormInput from '../components/FormInput';
import Alert from '../components/Alert';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/feed'; // the page they tried to open before logging in

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const errs = {};
    if (!isValidEmail(form.email)) errs.email = 'Enter a valid email address';
    if (!form.password) errs.password = 'Password is required';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      await login(form.email.trim(), form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err)); // e.g. "Invalid email or password"
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to continue the discussion."
      footer={
        <>
          New to Charcha?{' '}
          <Link to="/register" className="font-semibold text-orange-600 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {location.state?.from && !serverError && <Alert type="info">Please log in to continue.</Alert>}
        <Alert type="error">{serverError}</Alert>
        <FormInput label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} autoComplete="email" />
        <FormInput label="Password" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} autoComplete="current-password" />
        <button type="submit" disabled={submitting} className="btn-primary w-full py-2.5">
          {submitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>
    </AuthCard>
  );
}