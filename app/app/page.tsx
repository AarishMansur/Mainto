"use client";

import { useState } from "react";
import Link from "next/link";
import { IssuesPanel } from "../components/issues-panel";
import { RepositorySearch } from "../components/repository-search";
import { SettingsModal } from "../components/settings-modal";
import { WorkflowPipeline } from "../components/workflow-pipeline";
import { issueDocumentId } from "@/lib/issue-document-id";
import { useMaintainerCopilot } from "../hooks/use-maintainer-copilot";

type View = "list" | "pipeline";

export default function AppPage() {
  const [showSettings, setShowSettings] = useState(false);
  const [view, setView] = useState<View>("list");
  const copilot = useMaintainerCopilot();

  const workflowIssues = copilot.issues.map((issue) => {
    const result = copilot.prioritizationResults.get(issue.githubId.toString());
    const feedback = copilot.feedbackResults.get(issue.githubId.toString());
    const hasSummary = copilot.summaries.has(issue.githubId);
    return {
      _id: issueDocumentId(issue.repoOwner, issue.repoName, issue.githubId),
      githubId: issue.githubId,
      title: issue.title,
      labels: issue.labels,
      commentsCount: issue.commentsCount,
      workflowStatus: result ? "prioritized" : hasSummary ? "summarized" : "new",
      agentPriority: result?.priority,
      agentReasoning: result?.reasoning,
      decisionId: result?.decisionId,
      humanPriority: feedback?.humanPriority,
      agentAccuracy: feedback?.agentAccuracy,
    };
  });

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/" className="mb-1 inline-block text-sm text-zinc-500 transition-colors hover:text-zinc-900">
              &larr; Home
            </Link>
            <h1 className="text-2xl font-bold">Maintainer Copilot</h1>
            <p className="mt-1 text-sm text-zinc-500">
              AI-powered issue triage with historical pattern matching
            </p>
          </div>
          <div className="flex items-center gap-3">
            {copilot.issues.length > 0 && (
              <div className="flex rounded-lg border border-zinc-200 bg-white shadow-sm">
                <button
                  onClick={() => setView("list")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-l-lg transition-colors ${view === "list" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-50"}`}
                >
                  List View
                </button>
                <button
                  onClick={() => setView("pipeline")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-r-lg transition-colors ${view === "pipeline" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-50"}`}
                >
                  Pipeline
                </button>
              </div>
            )}
            <button
              onClick={() => setShowSettings(true)}
              className="rounded-lg border border-zinc-200 bg-white p-2 shadow-sm transition-colors hover:border-zinc-400"
              title="Settings"
            >
              <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-2.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </header>

        <RepositorySearch value={copilot.repoInput} loading={copilot.loadingIssues} onChange={copilot.setRepoInput} onSubmit={copilot.fetchIssues} />
        {copilot.error && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{copilot.error}</div>}

        {copilot.issues.length > 0 && view === "list" && (
          <IssuesPanel issues={copilot.issues} summaries={copilot.summaries} summarizingAll={copilot.summarizingAll} loadingIssueId={copilot.loadingIssueId} onSummarizeAll={copilot.summarizeAll} onSummarize={copilot.summarizeSingle} />
        )}

        {copilot.issues.length > 0 && view === "pipeline" && (
          <div className="mt-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium text-zinc-600">Triage Pipeline</h2>
              <p className="text-xs text-zinc-500">Click &quot;Run Agent&quot; to prioritize based on historical patterns</p>
            </div>
            <WorkflowPipeline
              issues={workflowIssues}
              onPrioritize={(card) => {
                const issue = copilot.issues.find((item) => item.githubId === card.githubId);
                if (issue) copilot.prioritizeIssue(issue);
              }}
              prioritizingId={copilot.prioritizingId}
              onFeedback={(card, humanPriority) => {
                const issue = copilot.issues.find((item) => item.githubId === card.githubId);
                if (issue) copilot.submitFeedback(issue, humanPriority);
              }}
              feedbackSubmittingId={copilot.feedbackSubmittingId}
            />
          </div>
        )}

        {copilot.issues.length === 0 && !copilot.loadingIssues && (
          <div className="py-20 text-center text-zinc-500">
            <p className="text-lg">Enter a GitHub repository to get started</p>
            <p className="mt-1 text-sm">e.g. facebook/react, vercel/next.js</p>
          </div>
        )}
      </div>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
