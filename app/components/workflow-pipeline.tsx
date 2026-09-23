"use client";

interface Issue {
  _id: string;
  githubId: number;
  title: string;
  labels: string[];
  commentsCount: number;
  workflowStatus: string;
  agentPriority?: string;
  agentReasoning?: string;
  decisionId?: string;
  humanPriority?: string;
  agentAccuracy?: number;
}

interface WorkflowPipelineProps {
  issues: Issue[];
  onPrioritize: (issue: Issue) => void;
  prioritizingId: string | null;
  onFeedback: (issue: Issue, humanPriority: string) => void;
  feedbackSubmittingId: string | null;
}

const PRIORITIES = ["P0", "P1", "P2", "P3", "P4"];

const COLUMNS = [
  { id: "new", label: "New", color: "border-zinc-500" },
  { id: "summarized", label: "Summarized", color: "border-blue-500" },
  { id: "prioritized", label: "Prioritized", color: "border-yellow-500" },
  { id: "in_review", label: "In Review", color: "border-orange-500" },
  { id: "resolved", label: "Resolved", color: "border-green-500" },
];

const PRIORITY_COLORS: Record<string, string> = {
  P0: "bg-red-500/20 text-red-400 border-red-500/30",
  P1: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  P2: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  P3: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  P4: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

function IssueCard({
  issue,
  onPrioritize,
  isPrioritizing,
  onFeedback,
  isSubmittingFeedback,
}: {
  issue: Issue;
  onPrioritize: () => void;
  isPrioritizing: boolean;
  onFeedback: (humanPriority: string) => void;
  isSubmittingFeedback: boolean;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 hover:border-zinc-700 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs text-zinc-500">#{issue.githubId}</span>
        {issue.agentPriority && (
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${PRIORITY_COLORS[issue.agentPriority]}`}
          >
            {issue.agentPriority}
          </span>
        )}
      </div>
      <p className="text-sm text-zinc-200 line-clamp-2 mb-2">{issue.title}</p>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-zinc-600">
          {issue.commentsCount} comments
        </span>
        {issue.workflowStatus === "new" && (
          <button
            onClick={onPrioritize}
            disabled={isPrioritizing}
            className="px-2 py-1 text-[10px] font-medium rounded bg-zinc-800 text-zinc-400 hover:bg-zinc-700 disabled:opacity-50 transition-colors"
          >
            {isPrioritizing ? "..." : "Prioritize"}
          </button>
        )}
        {issue.workflowStatus === "summarized" && (
          <button
            onClick={onPrioritize}
            disabled={isPrioritizing}
            className="px-2 py-1 text-[10px] font-medium rounded bg-zinc-800 text-zinc-400 hover:bg-zinc-700 disabled:opacity-50 transition-colors"
          >
            {isPrioritizing ? "..." : "Run Agent"}
          </button>
        )}
      </div>
      {issue.agentReasoning && (
        <p className="mt-2 text-[10px] text-zinc-500 line-clamp-2 italic">
          {issue.agentReasoning}
        </p>
      )}
      {issue.decisionId && (
        <div className="mt-2 border-t border-zinc-800 pt-2">
          {issue.humanPriority ? (
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="text-zinc-500">You set</span>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded font-medium border ${PRIORITY_COLORS[issue.humanPriority]}`}>
                {issue.humanPriority}
              </span>
              <span className={issue.agentAccuracy === 100 ? "text-green-400" : "text-red-400"}>
                {issue.agentAccuracy === 100 ? "agent matched" : "agent missed"}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-zinc-500">Override:</span>
              <div className="flex gap-1">
                {PRIORITIES.map((priority) => (
                  <button
                    key={priority}
                    onClick={() => onFeedback(priority)}
                    disabled={isSubmittingFeedback}
                    className={`px-1.5 py-0.5 text-[10px] font-medium rounded border transition-colors disabled:opacity-50 ${PRIORITY_COLORS[priority]}`}
                  >
                    {priority}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function WorkflowPipeline({
  issues,
  onPrioritize,
  prioritizingId,
  onFeedback,
  feedbackSubmittingId,
}: WorkflowPipelineProps) {
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-4 min-w-max pb-4">
        {COLUMNS.map((col) => {
          const colIssues = issues.filter(
            (i) => i.workflowStatus === col.id
          );
          return (
            <div key={col.id} className="w-64 flex-shrink-0">
              <div
                className={`flex items-center gap-2 mb-3 pb-2 border-b-2 ${col.color}`}
              >
                <h3 className="text-sm font-medium text-zinc-300">
                  {col.label}
                </h3>
                <span className="text-xs text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded">
                  {colIssues.length}
                </span>
              </div>
              <div className="space-y-2">
                {colIssues.map((issue) => (
                  <IssueCard
                    key={issue._id}
                    issue={issue}
                    onPrioritize={() => onPrioritize(issue)}
                    isPrioritizing={prioritizingId === issue._id}
                    onFeedback={(humanPriority) => onFeedback(issue, humanPriority)}
                    isSubmittingFeedback={feedbackSubmittingId === issue.decisionId}
                  />
                ))}
                {colIssues.length === 0 && (
                  <p className="text-xs text-zinc-600 text-center py-8">
                    No issues
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
