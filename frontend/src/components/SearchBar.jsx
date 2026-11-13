import { useState } from 'react';

export default function SearchBar({ initialValue = '', onSearch, placeholder = 'Search posts...' }) {
  const [term, setTerm] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(term.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full gap-2 sm:max-w-sm">
      <input
        type="search"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
      />
      <button type="submit" className="btn-primary">
        Search
      </button>
    </form>
  );
}