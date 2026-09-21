"use client";

import { useState } from "react";
import { getStoredSettings } from "../lib/settings";
import type { Issue, Provider, Summary } from "../types";

interface PrioritizationResult {
  priority: string;
  reasoning: string;
  matchedPatterns: string[];
  suggestedResolution: string;
  confidence: number;
}

export function useMaintainerCopilot() {
  const [repoInput, setRepoInput] = useState("");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [summaries, setSummaries] = useState<Map<number, Summary>>(new Map());
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [summarizingAll, setSummarizingAll] = useState(false);
  const [loadingIssueId, setLoadingIssueId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [prioritizingId, setPrioritizingId] = useState<string | null>(null);
  const [prioritizationResults, setPrioritizationResults] = useState<Map<string, PrioritizationResult>>(new Map());

  async function requestSummaries(requestIssues: Issue[]) {
    const settings = getStoredSettings();
    const response = await fetch("/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-ai-provider": settings.provider as Provider, "x-ai-key": settings.apiKey },
      body: JSON.stringify({ issues: requestIssues.map(({ githubId, title, body, labels, commentsCount }) => ({ githubId, title, body, labels, commentsCount })) }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data.summaries as Summary[];
  }

  async function fetchIssues() {
    const match = repoInput.trim().match(/^github\.com\/([^/]+)\/([^/]+)$/) || repoInput.trim().match(/^([^/]+)\/([^/]+)$/);
    if (!match) return setError("Enter a valid repo: owner/repo or github.com/owner/repo");
    setError(""); setLoadingIssues(true); setSummaries(new Map());
    try {
      const settings = getStoredSettings();
      const response = await fetch("/api/issues", { method: "POST", headers: { "Content-Type": "application/json", ...(settings.githubToken ? { "x-github-token": settings.githubToken } : {}) }, body: JSON.stringify({ owner: match[1], repo: match[2] }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setIssues(data.issues);
    } catch (error) { setError(error instanceof Error ? error.message : "Failed to fetch issues"); }
    finally { setLoadingIssues(false); }
  }

  async function summarizeSingle(issue: Issue) {
    setLoadingIssueId(issue.githubId); setError("");
    try { const [summary] = await requestSummaries([issue]); setSummaries((previous) => new Map(previous).set(issue.githubId, summary)); }
    catch (error) { setError(error instanceof Error ? error.message : "Failed to summarize"); }
    finally { setLoadingIssueId(null); }
  }

  async function summarizeAll() {
    setSummarizingAll(true); setError("");
    try { const results = await requestSummaries(issues); setSummaries(new Map(results.map((summary, index) => [issues[index].githubId, summary]))); }
    catch (error) { setError(error instanceof Error ? error.message : "Failed to summarize"); }
    finally { setSummarizingAll(false); }
  }

  async function prioritizeIssue(issue: Issue) {
    setPrioritizingId(issue.githubId.toString()); setError("");
    try {
      const settings = getStoredSettings();
      const response = await fetch("/api/prioritize", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-ai-provider": settings.provider as Provider, "x-ai-key": settings.apiKey },
        body: JSON.stringify({
          issue: { _id: issue.githubId.toString(), githubId: issue.githubId, title: issue.title, body: issue.body, labels: issue.labels, commentsCount: issue.commentsCount },
          provider: settings.provider,
          apiKey: settings.apiKey,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setPrioritizationResults((previous) => new Map(previous).set(issue.githubId.toString(), data));
    } catch (error) { setError(error instanceof Error ? error.message : "Failed to prioritize"); }
    finally { setPrioritizingId(null); }
  }

  return { repoInput, setRepoInput, issues, summaries, loadingIssues, summarizingAll, loadingIssueId, error, fetchIssues, summarizeSingle, summarizeAll, prioritizingId, prioritizationResults, prioritizeIssue };
}
