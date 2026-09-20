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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">{issues.length} open issues{summaries.size > 0 && ` · ${summaries.size} summarized`}</p>
        <button onClick={onSummarizeAll} disabled={summarizingAll} className="px-4 py-1.5 text-xs font-medium rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {summarizingAll ? "Summarizing all..." : "Summarize All"}
        </button>
      </div>
      {sortedIssues.map((issue) => <IssueCard key={issue.githubId} issue={issue} summary={summaries.get(issue.githubId) || null} onSummarize={() => onSummarize(issue)} loading={loadingIssueId === issue.githubId} />)}
    </div>
  );
}
