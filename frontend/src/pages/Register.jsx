import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/axios';
import { isValidEmail, isStrongPassword } from '../utils/validators';
import AuthCard from '../components/AuthCard';
import FormInput from '../components/FormInput';
import Alert from '../components/Alert';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Already logged in? No need to register.
  if (user) return <Navigate to="/feed" replace />;

  // One handler for all inputs: uses the input's "name" to update the right field
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const errs = {};
    if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!isValidEmail(form.email)) errs.email = 'Enter a valid email address';
    if (!isStrongPassword(form.password))
      errs.password = 'At least 8 characters, including a letter and a number';
    if (form.confirmPassword !== form.password) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // stop the browser from reloading the page
    setServerError('');

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      navigate('/feed', { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err)); // e.g. "An account with this email already exists"
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Join Charcha"
      subtitle="Create your account and start the conversation."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-orange-600 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Alert type="error">{serverError}</Alert>
        <FormInput label="Name" name="name" value={form.name} onChange={handleChange} error={errors.name} autoComplete="name" />
        <FormInput label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} autoComplete="email" />
        <FormInput label="Password" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} autoComplete="new-password" />
        <FormInput label="Confirm password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} autoComplete="new-password" />
        <button type="submit" disabled={submitting} className="btn-primary w-full py-2.5">
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </AuthCard>
  );
}