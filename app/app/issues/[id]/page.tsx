"use client";

import { use } from "react";
import Link from "next/link";

interface IssueData {
  githubId: number;
  title: string;
  body: string | null;
  state: string;
  labels: string[];
  commentsCount: number;
  url: string;
  repoOwner: string;
  repoName: string;
}

interface SummaryData {
  summary: string;
  urgencyScore: number;
  keyPoints: string[];
  suggestedActions: string[];
  model: string;
  generatedAt: string;
}

export default function IssuePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/app" className="text-zinc-500 hover:text-zinc-300 text-sm mb-4 inline-block">
          &larr; Back to Dashboard
        </Link>

        <div className="mt-4 p-6 rounded-lg border border-zinc-800 bg-zinc-900/50">
          <p className="text-xs text-zinc-500 mb-2">Issue ID: {id}</p>
          <p className="text-zinc-400 text-sm">
            This page will display the full issue details and live-updating summary.
            <br />
            Click &quot;Edit in Studio&quot; from the Sanity Studio to edit this content.
          </p>
        </div>
      </div>
    </div>
  );
}
