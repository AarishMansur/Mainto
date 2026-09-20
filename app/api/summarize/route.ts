import { NextRequest, NextResponse } from "next/server";
import { summarizeIssue, type IssueToSummarize } from "@/lib/ai/summarize";
import type { Provider } from "@/lib/ai/providers";

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

    return NextResponse.json({ summaries });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to summarize issues";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
