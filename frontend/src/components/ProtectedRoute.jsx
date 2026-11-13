import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

// Logged-in users only. With adminOnly, also requires the admin role.
export default function ProtectedRoute({ adminOnly = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader />;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (adminOnly && user.role !== 'admin') {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-5xl">🔒</p>
        <h1 className="mt-4 text-2xl font-bold text-navy-900">Admins only</h1>
        <p className="mt-2 text-slate-500">You don't have permission to view this page.</p>
        <Link to="/feed" className="btn-primary mt-6">Back to feed</Link>
      </div>
    );
  }

  return <Outlet />;
}