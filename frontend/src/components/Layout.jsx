import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

// Wraps every page: Navbar on top, the current page in the middle, footer at the bottom
export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <Outlet /> {/* the current page is rendered here */}
      </main>
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Charcha · Cloud-Based Community Discussion Platform
      </footer>
    </div>
  );
}