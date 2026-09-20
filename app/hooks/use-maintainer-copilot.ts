"use client";

import { useState } from "react";
import { getStoredSettings } from "../lib/settings";
import type { Issue, Provider, Summary } from "../types";

export function useMaintainerCopilot() {
  const [repoInput, setRepoInput] = useState("");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [summaries, setSummaries] = useState<Map<number, Summary>>(new Map());
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [summarizingAll, setSummarizingAll] = useState(false);
  const [loadingIssueId, setLoadingIssueId] = useState<number | null>(null);
  const [error, setError] = useState("");

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

  return { repoInput, setRepoInput, issues, summaries, loadingIssues, summarizingAll, loadingIssueId, error, fetchIssues, summarizeSingle, summarizeAll };
}
