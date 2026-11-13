import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  { title: 'Topics', text: 'Browse communities from Technology and AI to Sports and Careers.' },
  { title: 'Discussions', text: 'Start a discussion or ask a question and get answers from the community.' },
  { title: 'Votes', text: 'Upvote the most useful contributions so the best ideas rise to the top.' },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <>
      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-400">
            Cloud-Based Community Discussion Platform
          </p>
          <h1 className="mt-4 text-5xl font-extrabold tracking-tight sm:text-6xl">CHARCHA</h1>
          <p className="mt-4 text-xl text-slate-300">Every Topic. Every Perspective.</p>
          <p className="mx-auto mt-6 max-w-2xl text-slate-400">
            Create topics, ask questions, share opinions and vote on the best answers, all in one
            organized community.
          </p>

          <div className="mt-8 flex justify-center gap-3">
            {user ? (
              <Link to="/feed" className="btn-primary px-6 py-3">
                Go to your feed
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary px-6 py-3">
                  Get started
                </Link>
                <Link to="/login" className="btn-outline-light px-6 py-3">
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-16 sm:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="card p-6">
            <h3 className="font-semibold text-navy-900">{f.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{f.text}</p>
          </div>
        ))}
      </section>
    </>
  );
}