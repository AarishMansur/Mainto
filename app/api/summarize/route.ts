import { NextRequest, NextResponse } from "next/server";
import { summarizeIssue, type IssueToSummarize } from "@/lib/ai/summarize";
import type { Provider } from "@/lib/ai/providers";
import { issueDocumentId } from "@/lib/issue-document-id";
import { saveGitHubIssue } from "@/lib/sanity-issue";
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

    const missingIdentity = issues.some(
      (issue) => !issue.repoOwner || !issue.repoName || !Number.isInteger(issue.githubId)
    );
    if (missingIdentity) {
      return NextResponse.json(
        { error: "Each issue needs repoOwner, repoName, and githubId." },
        { status: 400 }
      );
    }

    const provider =
      (request.headers.get("x-ai-provider") as Provider) || "anthropic";
    const suppliedApiKey = request.headers.get("x-ai-key")?.trim() || "";
    const apiKey =
      suppliedApiKey || (provider === "anthropic" ? process.env.ANTHROPIC_API_KEY || "" : "");

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            `No API key provided for ${provider}. Add the matching key in Settings${provider === "anthropic" ? " or set ANTHROPIC_API_KEY in .env.local" : ""}.`,
        },
        { status: 401 }
      );
    }

    const summaries = [];
    const batchSize = 2;

    for (let index = 0; index < issues.length; index += batchSize) {
      const batch = issues.slice(index, index + batchSize);
      const batchSummaries = await Promise.all(
        batch.map((issue) => summarizeIssue(issue, provider, apiKey))
      );
      summaries.push(...batchSummaries);
    }

    const token = process.env.NEXT_PUBLIC_SANITY_API_TOKEN;
    const results = [];

    for (let i = 0; i < issues.length; i++) {
      const issue = issues[i];
      const summary = summaries[i];
      const issueId = issueDocumentId(issue.repoOwner, issue.repoName, issue.githubId);

      if (token) {
        await saveGitHubIssue(issue, token, { workflowStatus: "summarized" });
        await client.withConfig({ useCdn: false, token, stega: false }).create({
          _type: "issueSummary",
          issueRef: { _type: "reference", _ref: issueId },
          summary: summary.summary,
          urgencyScore: summary.urgencyScore,
          keyPoints: summary.keyPoints,
          suggestedActions: summary.suggestedActions,
          model: provider,
          generatedAt: new Date().toISOString(),
        });
      }

      results.push({
        ...summary,
        issueId,
        storedInSanity: !!token,
      });
    }

    return NextResponse.json({ summaries: results });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to summarize issues";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
