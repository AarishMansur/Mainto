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
    <div className="min-h-screen bg-black text-zinc-100">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <header className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="text-zinc-500 hover:text-zinc-300 text-sm mb-1 inline-block">
              &larr; Home
            </Link>
            <h1 className="text-2xl font-bold">Maintainer Copilot</h1>
            <p className="text-zinc-500 text-sm mt-1">
              Paste a repo, fetch issues, get AI-powered summaries ranked by urgency
            </p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
            title="Settings"
          >
            <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-2.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </header>

        <RepositorySearch value={copilot.repoInput} loading={copilot.loadingIssues} onChange={copilot.setRepoInput} onSubmit={copilot.fetchIssues} />
        {copilot.error && <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{copilot.error}</div>}
        {copilot.issues.length > 0 && <IssuesPanel issues={copilot.issues} summaries={copilot.summaries} summarizingAll={copilot.summarizingAll} loadingIssueId={copilot.loadingIssueId} onSummarizeAll={copilot.summarizeAll} onSummarize={copilot.summarizeSingle} />}
        {copilot.issues.length === 0 && !copilot.loadingIssues && <div className="text-center py-20 text-zinc-600"><p className="text-lg">Enter a GitHub repository to get started</p><p className="text-sm mt-1">e.g. facebook/react, vercel/next.js</p></div>}
      </div>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
