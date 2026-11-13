// A labelled input. Pass "rows" to get a multi-line textarea instead.
export default function FormInput({
  label, name, type = 'text', value, onChange, error, autoComplete, rows, placeholder, maxLength,
}) {
  const className = `w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${
    error ? 'border-red-400 focus:ring-red-200' : 'border-slate-300 focus:border-orange-500 focus:ring-orange-200'
  }`;

  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {rows ? (
        <textarea id={name} name={name} rows={rows} value={value} onChange={onChange}
          placeholder={placeholder} maxLength={maxLength} className={className} />
      ) : (
        <input id={name} name={name} type={type} value={value} onChange={onChange}
          autoComplete={autoComplete} placeholder={placeholder} maxLength={maxLength} className={className} />
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}