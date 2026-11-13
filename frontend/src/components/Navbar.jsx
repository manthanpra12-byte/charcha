import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const linkClass = ({ isActive }) =>
    `text-sm font-medium ${isActive ? 'text-orange-400' : 'text-slate-200 hover:text-white'}`;

  return (
    <header className="sticky top-0 z-10 bg-navy-900 text-white shadow">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to={user ? '/feed' : '/'} className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 font-bold">C</span>
          <span className="text-lg font-bold tracking-wide">CHARCHA</span>
        </Link>

        {!loading && (
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <NavLink to="/feed" className={linkClass}>Feed</NavLink>
                <NavLink to="/topics" className={linkClass}>Topics</NavLink>
                <Link to="/posts/new" className="btn-primary hidden px-3 py-1.5 sm:inline-flex">+ Create post</Link>
                <span className="hidden text-sm text-slate-300 md:inline">Hi, {user.name}</span>
                {user.role === 'admin' && (
                  <span className="rounded bg-orange-500/20 px-2 py-0.5 text-xs font-semibold text-orange-300">ADMIN</span>
                )}
                <button onClick={handleLogout} className="btn-outline-light px-3 py-1.5">Log out</button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={linkClass}>Log in</NavLink>
                <Link to="/register" className="btn-primary">Join Charcha</Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}