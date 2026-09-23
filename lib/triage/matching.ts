import type { GitHubIssueDraft } from "@/lib/sanity-issue";

export interface HistoricalPattern {
  _id: string;
  patternName: string;
  keywords: string[];
  labelPatterns: string[];
  avgUrgency: number;
  typicalResolution: string;
  avgResolutionDays: number;
  learnedFrom: number;
}

export interface HistoricalDecision {
  assignedPriority: string;
  resolution: string;
  agentAccuracy: number | null;
  issueRef: {
    title: string;
    labels: string[];
  };
}

const STOP_WORDS = new Set([
  "issue",
  "issues",
  "error",
  "errors",
  "page",
  "when",
  "with",
  "this",
  "that",
  "from",
  "have",
  "been",
  "does",
  "cannot",
  "should",
  "would",
  "could",
  "about",
  "after",
  "before",
  "need",
  "want",
  "using",
  "into",
  "your",
  "their",
  "feature",
  "request",
]);

const MIN_TITLE_OVERLAP = 2;

export function significantWords(text: string): string[] {
  return text
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.replace(/[^a-z0-9]/g, ""))
    .filter((word) => word.length > 3 && !STOP_WORDS.has(word));
}

function containsTerm(haystack: string, term: string): boolean {
  const normalized = term.trim().toLowerCase();
  if (!normalized) return false;
  const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "i").test(haystack);
}

export function findMatchingPatterns(
  issue: GitHubIssueDraft,
  patterns: HistoricalPattern[]
): HistoricalPattern[] {
  const haystack = `${issue.title} ${issue.body || ""}`;

  return patterns.filter((pattern) => {
    const keywordMatch = pattern.keywords.some((keyword) =>
      containsTerm(haystack, keyword)
    );

    const labelMatch = pattern.labelPatterns.some((labelPattern) =>
      issue.labels.some((label) =>
        label.toLowerCase().includes(labelPattern.toLowerCase())
      )
    );

    return keywordMatch || labelMatch;
  });
}

export function findSimilarDecisions(
  issue: GitHubIssueDraft,
  decisions: HistoricalDecision[]
): HistoricalDecision[] {
  const issueWords = new Set(significantWords(issue.title));
  if (issueWords.size === 0) return [];

  return decisions.filter((decision) => {
    if (!decision.issueRef) return false;
    const overlap = significantWords(decision.issueRef.title || "").filter(
      (word) => issueWords.has(word)
    );
    return new Set(overlap).size >= MIN_TITLE_OVERLAP;
  });
}
