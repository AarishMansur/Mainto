import type { Issue, Summary } from "../types";
import { IssueCard } from "./issue-card";

interface IssuesPanelProps {
  issues: Issue[];
  summaries: Map<number, Summary>;
  summarizingAll: boolean;
  loadingIssueId: number | null;
  onSummarizeAll: () => void;
  onSummarize: (issue: Issue) => void;
}

export function IssuesPanel({ issues, summaries, summarizingAll, loadingIssueId, onSummarizeAll, onSummarize }: IssuesPanelProps) {
  const sortedIssues = [...issues].sort((a, b) => {
    const first = summaries.get(a.githubId);
    const second = summaries.get(b.githubId);
    if (first && second) return second.urgencyScore - first.urgencyScore;
    if (first) return -1;
    if (second) return 1;
    return 0;
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">{issues.length} open issues{summaries.size > 0 && ` · ${summaries.size} summarized`}</p>
        <button onClick={onSummarizeAll} disabled={summarizingAll} className="rounded-lg border border-zinc-200 bg-white px-4 py-1.5 text-xs font-medium text-zinc-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-zinc-300 disabled:cursor-not-allowed disabled:opacity-50">
          {summarizingAll ? "Summarizing all..." : "Summarize All"}
        </button>
      </div>
      {sortedIssues.map((issue) => <IssueCard key={issue.githubId} issue={issue} summary={summaries.get(issue.githubId) || null} onSummarize={() => onSummarize(issue)} loading={loadingIssueId === issue.githubId} />)}
    </div>
  );
}
