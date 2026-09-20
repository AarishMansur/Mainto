export interface GitHubIssue {
  githubId: number;
  title: string;
  body: string | null;
  state: string;
  labels: string[];
  assignees: string[];
  commentsCount: number;
  createdAt: string;
  url: string;
}

interface RawGitHubIssue {
  number: number;
  title: string;
  body: string | null;
  state: string;
  labels: { name: string }[];
  assignees: { login: string }[];
  comments: number;
  created_at: string;
  html_url: string;
  pull_request?: unknown;
}

export async function fetchGitHubIssues(
  owner: string,
  repo: string,
  githubToken?: string
): Promise<GitHubIssue[]> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
  };

  if (githubToken) {
    headers.Authorization = `Bearer ${githubToken}`;
  }

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=50&sort=updated&direction=desc`,
    { headers, next: { revalidate: 60 } }
  );

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Repository ${owner}/${repo} not found`);
    }
    if (res.status === 403) {
      throw new Error("GitHub rate limit exceeded. Add a GitHub token in settings.");
    }
    throw new Error(`GitHub API error: ${res.status}`);
  }

  const data: RawGitHubIssue[] = await res.json();

  return data
    .filter((issue) => !issue.pull_request) // Exclude PRs (they also appear in /issues)
    .map((issue) => ({
      githubId: issue.number,
      title: issue.title,
      body: issue.body,
      state: issue.state,
      labels: issue.labels.map((l) => l.name),
      assignees: issue.assignees.map((a) => a.login),
      commentsCount: issue.comments,
      createdAt: issue.created_at,
      url: issue.html_url,
    }));
}
