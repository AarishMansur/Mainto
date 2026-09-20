interface RepositorySearchProps {
  value: string;
  loading: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export function RepositorySearch({ value, loading, onChange, onSubmit }: RepositorySearchProps) {
  return (
    <div className="mb-6 flex gap-2">
      <input type="text" value={value} onChange={(event) => onChange(event.target.value)} onKeyDown={(event) => event.key === "Enter" && onSubmit()} placeholder="owner/repo (e.g. facebook/react)" className="flex-1 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm outline-none transition-shadow placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-100" />
      <button onClick={onSubmit} disabled={loading || !value.trim()} className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-black disabled:cursor-not-allowed disabled:opacity-50">
        {loading ? "Fetching..." : "Fetch Issues"}
      </button>
    </div>
  );
}
