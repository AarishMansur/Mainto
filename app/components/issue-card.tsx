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
    <div className="animate-[issue-in_450ms_ease-out_both] rounded-xl border border-zinc-200 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-zinc-400">#{issue.githubId}</span>
            <h3 className="truncate font-medium text-zinc-900">{issue.title}</h3>
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <span>{issue.commentsCount} comments</span>
            <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
            {issue.labels.length > 0 && (
              <span className="text-zinc-500">
                {issue.labels.slice(0, 3).join(", ")}
                {issue.labels.length > 3 && ` +${issue.labels.length - 3}`}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {summary && <UrgencyBadge score={summary.urgencyScore} />}
          <button onClick={onSummarize} disabled={loading} className="rounded-md bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? "Summarizing..." : summary ? "Re-summarize" : "Summarize"}
          </button>
        </div>
      </div>
      {summary && (
        <div className="mt-2 space-y-2 border-t border-zinc-100 pt-2">
          <p className="text-sm text-zinc-700">{summary.summary}</p>
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
      <p className="mb-1 text-xs font-medium text-zinc-500">{title}</p>
      <ul className="space-y-0.5 text-sm text-zinc-600">
        {items.map((item, index) => <li key={index}>{bullet} {item}</li>)}
      </ul>
    </div>
  );
}
