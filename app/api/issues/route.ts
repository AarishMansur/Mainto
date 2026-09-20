import { NextRequest, NextResponse } from "next/server";
import { fetchGitHubIssues } from "@/lib/github";

export async function POST(request: NextRequest) {
  try {
    const { owner, repo } = await request.json();

    if (!owner || !repo) {
      return NextResponse.json(
        { error: "owner and repo are required" },
        { status: 400 }
      );
    }

    const githubToken = request.headers.get("x-github-token") || undefined;

    const issues = await fetchGitHubIssues(owner, repo, githubToken);

    return NextResponse.json({ issues, repo: `${owner}/${repo}` });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch issues";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
