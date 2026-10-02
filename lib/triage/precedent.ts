import type { GitHubIssueDraft } from "@/lib/sanity-issue";
import {
  rankSimilarDecisions,
  type HistoricalDecision,
  type HistoricalPattern,
} from "@/lib/triage/matching";

export const PRIORITIES = ["P0", "P1", "P2", "P3", "P4"] as const;
export type Priority = (typeof PRIORITIES)[number];

export interface RepositoryScope {
  repoOwner: string;
  repoName: string;
}

export function isPriority(value: string | null | undefined): value is Priority {
  return !!value && (PRIORITIES as readonly string[]).includes(value);
}

export const REPOSITORY_PRECEDENT_QUERY = `*[
  _type == "triageDecision" &&
  (
    (repoOwner == $repoOwner && repoName == $repoName) ||
    (!defined(repoOwner) && issueRef->repoOwner == $repoOwner && issueRef->repoName == $repoName)
  ) &&
  (defined(precedentPriority) || defined(humanPriority))
] | order(decidedAt desc)[0...100] {
  assignedPriority,
  humanPriority,
  precedentPriority,
  modelPriority,
  resolution,
  agentAccuracy,
  "repoOwner": coalesce(repoOwner, issueRef->repoOwner),
  "repoName": coalesce(repoName, issueRef->repoName),
  issueRef->{title, labels}
}`;

export const REPOSITORY_PATTERNS_QUERY = `*[
  _type == "triagePattern" &&
  repoOwner == $repoOwner &&
  repoName == $repoName
] | order(learnedFrom desc) {
  _id,
  patternName,
  keywords,
  labelPatterns,
  avgUrgency,
  typicalResolution,
  avgResolutionDays,
  learnedFrom,
  repoOwner,
  repoName
}`;

export function effectivePrecedentPriority(decision: HistoricalDecision | undefined): Priority | null {
  if (!decision) return null;
  const value = decision.precedentPriority || decision.humanPriority;
  return isPriority(value) ? value : null;
}

export function applyHumanFeedback(assignedPriority: string | undefined, humanPriority: Priority) {
  return {
    humanPriority,
    precedentPriority: humanPriority,
    agentAccuracy: assignedPriority === humanPriority ? 100 : 0,
  };
}

export function patternsForRepository(patterns: HistoricalPattern[], repo: RepositoryScope) {
  return patterns
    .filter((pattern) => pattern.repoOwner === repo.repoOwner && pattern.repoName === repo.repoName)
    .map((pattern) => ({
      ...pattern,
      keywords: pattern.keywords ?? [],
      labelPatterns: pattern.labelPatterns ?? [],
    }));
}

export function selectPrecedent(
  issue: GitHubIssueDraft,
  decisions: HistoricalDecision[],
  repo: RepositoryScope
): HistoricalDecision[] {
  const scoped = decisions.filter(
    (decision) =>
      decision.repoOwner === repo.repoOwner &&
      decision.repoName === repo.repoName &&
      effectivePrecedentPriority(decision) !== null
  );
  return rankSimilarDecisions(issue, scoped);
}

export function shouldConsultModel(precedent: HistoricalDecision[]): boolean {
  return effectivePrecedentPriority(precedent[0]) === null;
}

export function resolveSuggestedPriority(
  modelPriority: Priority | null,
  precedent: HistoricalDecision[]
): { priority: Priority; source: "precedent" | "model" } | null {
  const leading = effectivePrecedentPriority(precedent[0]);
  if (leading) return { priority: leading, source: "precedent" };
  if (modelPriority && isPriority(modelPriority)) return { priority: modelPriority, source: "model" };
  return null;
}
