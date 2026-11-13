import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SidebarLayout from '../components/SidebarLayout';
import PostFeed from '../components/PostFeed';
import Alert from '../components/Alert';

export default function Feed() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <SidebarLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Home feed</h1>
          <p className="text-sm text-slate-500">Welcome back, {user.name}. Here's what the community is discussing.</p>
        </div>
        <Link to="/posts/new" className="btn-primary">+ Create post</Link>
      </div>

      {location.state?.message && (
        <div className="mb-4">
          <Alert type="success">{location.state.message}</Alert>
        </div>
      )}

      <PostFeed endpoint="/posts" />
    </SidebarLayout>
  );
}