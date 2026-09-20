import { NextRequest, NextResponse } from "next/server";
import { summarizeIssue, type IssueToSummarize } from "@/lib/ai/summarize";
import type { Provider } from "@/lib/ai/providers";
import { client } from "@/sanity/lib/client";

export async function POST(request: NextRequest) {
  try {
    const { issues }: { issues: IssueToSummarize[] } = await request.json();

    if (!issues || issues.length === 0) {
      return NextResponse.json(
        { error: "issues array is required" },
        { status: 400 }
      );
    }

    const provider =
      (request.headers.get("x-ai-provider") as Provider) || "anthropic";
    const apiKey =
      request.headers.get("x-ai-key") ||
      process.env.ANTHROPIC_API_KEY ||
      "";

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "No API key provided. Add one in settings or set ANTHROPIC_API_KEY in .env.local",
        },
        { status: 401 }
      );
    }

    const summaries = await Promise.all(
      issues.map((issue) => summarizeIssue(issue, provider, apiKey))
    );

    const token = process.env.NEXT_PUBLIC_SANITY_API_TOKEN;
    const results = [];

    for (let i = 0; i < issues.length; i++) {
      const issue = issues[i];
      const summary = summaries[i];

      const existingIssue = await client.fetch(
        '*[_type == "issue" && githubId == $githubId && repoOwner == $repoOwner && repoName == $repoName][0]._id',
        { githubId: issue.githubId, repoOwner: issue.repoOwner || "unknown", repoName: issue.repoName || "unknown" }
      );

      let issueId = existingIssue;

      if (!issueId && token) {
        const newIssue = await client.create(
          {
            _type: "issue",
            githubId: issue.githubId,
            repoOwner: issue.repoOwner || "unknown",
            repoName: issue.repoName || "unknown",
            title: issue.title,
            body: issue.body,
            state: "open",
            labels: issue.labels,
            commentsCount: issue.commentsCount,
            fetchedAt: new Date().toISOString(),
          },
          { token }
        );
        issueId = newIssue._id;
      }

      if (issueId && token) {
        await client.create(
          {
            _type: "issueSummary",
            issueRef: { _type: "reference", _ref: issueId },
            summary: summary.summary,
            urgencyScore: summary.urgencyScore,
            keyPoints: summary.keyPoints,
            suggestedActions: summary.suggestedActions,
            model: provider,
            generatedAt: new Date().toISOString(),
          },
          { token }
        );
      }

      results.push({
        ...summary,
        issueId,
        storedInSanity: !!token && !!issueId,
      });
    }

    return NextResponse.json({ summaries: results });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to summarize issues";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
