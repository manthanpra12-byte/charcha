const tabs = [
  { key: 'latest', label: 'Latest' },
  { key: 'popular', label: 'Popular' },
];

export default function SortTabs({ value, onChange }) {
  return (
    <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            value === tab.key ? 'bg-navy-900 text-white' : 'text-slate-600 hover:text-navy-900'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}