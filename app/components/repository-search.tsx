interface RepositorySearchProps {
  value: string;
  loading: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export function RepositorySearch({ value, loading, onChange, onSubmit }: RepositorySearchProps) {
  return (
    <div className="flex gap-2 mb-6">
      <input type="text" value={value} onChange={(event) => onChange(event.target.value)} onKeyDown={(event) => event.key === "Enter" && onSubmit()} placeholder="owner/repo (e.g. facebook/react)" className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-600" />
      <button onClick={onSubmit} disabled={loading || !value.trim()} className="px-5 py-2.5 text-sm font-medium rounded-lg bg-zinc-100 text-zinc-900 hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        {loading ? "Fetching..." : "Fetch Issues"}
      </button>
    </div>
  );
}
