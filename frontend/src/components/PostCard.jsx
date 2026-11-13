import { Link } from 'react-router-dom';
import { timeAgo } from '../utils/formatDate';
import VoteButtons from './VoteButtons';

export default function PostCard({ post }) {
  return (
    <article className="card p-5 transition-colors hover:border-orange-300">
      <div className="flex gap-4">
        <div className="shrink-0">
          <VoteButtons postId={post._id} initialScore={post.score} initialVote={post.userVote} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            {post.topic && (
              <Link
                to={`/topics/${post.topic._id}`}
                className="rounded-full bg-navy-900/5 px-2.5 py-0.5 font-semibold text-navy-800 hover:bg-navy-900/10"
              >
                {post.topic.title}
              </Link>
            )}
            {post.postType === 'question' && (
              <span className="rounded-full bg-orange-100 px-2.5 py-0.5 font-semibold text-orange-700">Question</span>
            )}
            <span>by {post.author?.name || 'Deleted user'}</span>
            <span>·</span>
            <span>{timeAgo(post.createdAt)}</span>
          </div>

          <Link to={`/posts/${post._id}`}>
            <h2 className="mt-2 text-lg font-semibold text-navy-900 hover:text-orange-600">{post.title}</h2>
          </Link>
          <p className="mt-1 line-clamp-2 text-sm text-slate-600">{post.content}</p>

          <Link to={`/posts/${post._id}`} className="mt-3 inline-block text-xs font-medium text-slate-500 hover:text-orange-600">
            💬 {post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}
          </Link>
        </div>
      </div>
    </article>
  );
}