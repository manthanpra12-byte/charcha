export default function EmptyState({ title, text, action }) {
  return (
    <div className="card px-6 py-12 text-center">
      <p className="text-3xl">💬</p>
      <h3 className="mt-3 font-semibold text-navy-900">{title}</h3>
      {text && <p className="mt-1 text-sm text-slate-500">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}