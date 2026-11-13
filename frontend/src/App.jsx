import { useEffect, useState } from 'react';
import api from './api/axios';

function App() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState('');

  // Runs once when the page loads: ask the backend for its status
  useEffect(() => {
    api
      .get('/health')
      .then((res) => setHealth(res.data))
      .catch(() => setError('Cannot reach the backend. Is it running on port 5000?'));
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-slate-900">CHARCHA</h1>
        <p className="text-sm text-slate-500">Cloud-Based Community Discussion Platform</p>
        <p className="mt-1 font-medium text-orange-500">Every Topic. Every Perspective.</p>

        <div className="mt-6 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
          {error && <p className="text-red-600">{error}</p>}
          {!error && !health && <p>Checking backend...</p>}
          {health && (
            <ul className="space-y-1">
              <li>Backend: {health.status === 'ok' ? '✅ running' : '❌'}</li>
              <li>Environment: {health.environment}</li>
              <li>Database: {health.database} {health.dbConnected ? '✅ connected' : '❌ not connected'}</li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;