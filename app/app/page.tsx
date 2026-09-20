"use client";

import { useState } from "react";
import Link from "next/link";
import { IssuesPanel } from "../components/issues-panel";
import { RepositorySearch } from "../components/repository-search";
import { SettingsModal } from "../components/settings-modal";
import { useMaintainerCopilot } from "../hooks/use-maintainer-copilot";

export default function AppPage() {
  const [showSettings, setShowSettings] = useState(false);
  const copilot = useMaintainerCopilot();

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/" className="mb-1 inline-block text-sm text-zinc-500 transition-colors hover:text-zinc-900">
              &larr; Home
            </Link>
            <h1 className="text-2xl font-bold">Maintainer Copilot</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Paste a repo, fetch issues, get AI-powered summaries ranked by urgency
            </p>
          </div>
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
        </header>

        <RepositorySearch value={copilot.repoInput} loading={copilot.loadingIssues} onChange={copilot.setRepoInput} onSubmit={copilot.fetchIssues} />
        {copilot.error && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{copilot.error}</div>}
        {copilot.issues.length > 0 && <IssuesPanel issues={copilot.issues} summaries={copilot.summaries} summarizingAll={copilot.summarizingAll} loadingIssueId={copilot.loadingIssueId} onSummarizeAll={copilot.summarizeAll} onSummarize={copilot.summarizeSingle} />}
        {copilot.issues.length === 0 && !copilot.loadingIssues && <div className="py-20 text-center text-zinc-500"><p className="text-lg">Enter a GitHub repository to get started</p><p className="mt-1 text-sm">e.g. facebook/react, vercel/next.js</p></div>}
      </div>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
