import { useState } from 'react';
import api, { getErrorMessage } from '../api/axios';

export default function VoteButtons({ postId, initialScore, initialVote }) {
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState(initialVote || 0); // 1, -1 or 0
  const [busy, setBusy] = useState(false);

  const vote = async (clicked) => {
    if (busy) return;
    // Clicking the arrow you already chose removes your vote
    const value = userVote === clicked ? 0 : clicked;

    setBusy(true);
    try {
      const res = await api.post(`/posts/${postId}/vote`, { value });
      setScore(res.data.score); // always trust the server's numbers
      setUserVote(res.data.userVote);
    } catch (err) {
      window.alert(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const arrowClass = (active, activeColor) =>
    `flex h-8 w-8 items-center justify-center rounded-md text-base transition-colors disabled:opacity-50 ${
      active ? activeColor : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
    }`;

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={() => vote(1)}
        disabled={busy}
        aria-label="Upvote"
        aria-pressed={userVote === 1}
        className={arrowClass(userVote === 1, 'bg-orange-50 text-orange-600')}
      >
        ▲
      </button>
      <span
        className={`text-sm font-bold ${
          userVote === 1 ? 'text-orange-600' : userVote === -1 ? 'text-blue-600' : 'text-navy-900'
        }`}
      >
        {score}
      </span>
      <button
        type="button"
        onClick={() => vote(-1)}
        disabled={busy}
        aria-label="Downvote"
        aria-pressed={userVote === -1}
        className={arrowClass(userVote === -1, 'bg-blue-50 text-blue-600')}
      >
        ▼
      </button>
    </div>
  );
}