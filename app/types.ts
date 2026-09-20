export interface Issue {
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

export interface Summary {
  summary: string;
  urgencyScore: number;
  keyPoints: string[];
  suggestedActions: string[];
}

export type Provider = "anthropic" | "openai" | "google";
