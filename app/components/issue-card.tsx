import type { Issue, Summary } from "../types";
import { UrgencyBadge } from "./urgency-badge";

interface IssueCardProps {
  issue: Issue;
  summary: Summary | null;
  onSummarize: () => void;
  loading: boolean;
}

export function IssueCard({ issue, summary, onSummarize, loading }: IssueCardProps) {
  return (
    <div className="border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-zinc-500 text-sm">#{issue.githubId}</span>
            <h3 className="font-medium text-zinc-100 truncate">{issue.title}</h3>
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <span>{issue.commentsCount} comments</span>
            <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
            {issue.labels.length > 0 && (
              <span className="text-zinc-600">
                {issue.labels.slice(0, 3).join(", ")}
                {issue.labels.length > 3 && ` +${issue.labels.length - 3}`}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {summary && <UrgencyBadge score={summary.urgencyScore} />}
          <button onClick={onSummarize} disabled={loading} className="px-3 py-1 text-xs font-medium rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {loading ? "Summarizing..." : summary ? "Re-summarize" : "Summarize"}
          </button>
        </div>
      </div>
      {summary && (
        <div className="mt-3 pt-3 border-t border-zinc-800 space-y-3">
          <p className="text-sm text-zinc-300">{summary.summary}</p>
          <SummaryList title="Key Points" items={summary.keyPoints} bullet="•" />
          <SummaryList title="Suggested Actions" items={summary.suggestedActions} bullet="→" />
        </div>
      )}
    </div>
  );
}

function SummaryList({ title, items, bullet }: { title: string; items: string[]; bullet: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-zinc-500 mb-1">{title}</p>
      <ul className="text-sm text-zinc-400 space-y-0.5">
        {items.map((item, index) => <li key={index}>{bullet} {item}</li>)}
      </ul>
    </div>
  );
}
