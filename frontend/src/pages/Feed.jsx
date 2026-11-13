import { useAuth } from '../context/AuthContext';

export default function Feed() {
  const { user } = useAuth();

  const joined = new Date(user.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-navy-900">Welcome, {user.name} 👋</h1>
        <p className="mt-1 text-slate-500">You are logged in to Charcha.</p>

        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-slate-500">Email</dt>
            <dd className="font-medium text-slate-900">{user.email}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Role</dt>
            <dd className="font-medium capitalize text-slate-900">{user.role}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Member since</dt>
            <dd className="font-medium text-slate-900">{joined}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}