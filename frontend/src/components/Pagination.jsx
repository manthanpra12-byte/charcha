export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null; // only one page: no buttons needed

  return (
    <div className="mt-6 flex items-center justify-center gap-3">
      <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="btn-secondary">
        ← Previous
      </button>
      <span className="text-sm text-slate-600">
        Page {page} of {totalPages}
      </span>
      <button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className="btn-secondary">
        Next →
      </button>
    </div>
  );
}