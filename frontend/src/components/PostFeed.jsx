import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios';
import PostCard from './PostCard';
import SortTabs from './SortTabs';
import SearchBar from './SearchBar';
import Pagination from './Pagination';
import EmptyState from './EmptyState';
import Loader from './Loader';
import Alert from './Alert';

// Shows a sortable, searchable, paginated list of posts from the given API endpoint
export default function PostFeed({ endpoint, createLink = '/posts/new' }) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read the current filters from the URL, e.g. ?sort=popular&page=2&search=aws
  const sort = searchParams.get('sort') === 'popular' ? 'popular' : 'latest';
  const page = Math.max(Number(searchParams.get('page')) || 1, 1);
  const search = searchParams.get('search') || '';

  const [data, setData] = useState(null); // { posts, page, totalPages, total }
  const [error, setError] = useState('');

  // Fetch again whenever the endpoint or any filter changes
  useEffect(() => {
    let ignore = false; // ignore old responses if the user clicks quickly
    setData(null);
    setError('');

    api
      .get(endpoint, { params: { sort, page, limit: 10, search: search || undefined } })
      .then((res) => { if (!ignore) setData(res.data); })
      .catch((err) => { if (!ignore) setError(getErrorMessage(err)); });

    return () => { ignore = true; };
  }, [endpoint, sort, page, search]);

  // Change some URL parameters and keep the others. An empty value removes the parameter.
  const updateParams = (changes) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    setSearchParams(next);
  };

  const goToPage = (newPage) => {
    updateParams({ page: newPage > 1 ? String(newPage) : null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      {/* Toolbar: sorting + search. Changing either one goes back to page 1. */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SortTabs value={sort} onChange={(value) => updateParams({ sort: value === 'popular' ? value : null, page: null })} />
        {/* key={search} resets the input when the search is cleared */}
        <SearchBar key={search} initialValue={search} onSearch={(term) => updateParams({ search: term, page: null })} />
      </div>

      {search && (
        <div className="mb-4 flex items-center justify-between rounded-lg bg-orange-50 px-4 py-2 text-sm text-orange-800">
          <span>
            Results for "<strong>{search}</strong>"{data && ` · ${data.total} found`}
          </span>
          <button type="button" onClick={() => updateParams({ search: null, page: null })} className="font-semibold hover:underline">
            Clear
          </button>
        </div>
      )}

      {error && <Alert>{error}</Alert>}
      {!data && !error && <Loader text="Loading posts..." />}

      {data && data.posts.length === 0 && (
        <EmptyState
          title={search ? 'No posts match your search' : 'No posts yet'}
          text={search ? 'Try different words. Search matches whole words in titles and content.' : 'Be the first to start a discussion.'}
          action={!search && <Link to={createLink} className="btn-primary">Create the first post</Link>}
        />
      )}

      {data && data.posts.length > 0 && (
        <>
          <div className="space-y-4">
            {data.posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={goToPage} />
        </>
      )}
    </div>
  );
}