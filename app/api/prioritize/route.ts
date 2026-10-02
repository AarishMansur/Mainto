import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { getModel, type Provider } from "@/lib/ai/providers";
import { saveGitHubIssue, type GitHubIssueDraft } from "@/lib/sanity-issue";
import {
  findMatchingPatterns,
  type HistoricalDecision,
  type HistoricalPattern,
} from "@/lib/triage/matching";
import {
  patternsForRepository,
  REPOSITORY_PATTERNS_QUERY,
  REPOSITORY_PRECEDENT_QUERY,
  resolveSuggestedPriority,
  selectPrecedent,
  shouldConsultModel,
  type Priority,
  type RepositoryScope,
} from "@/lib/triage/precedent";
import { buildTriagePrompt, prioritizationSchema } from "@/lib/triage/prompt";
import { sanityWriteToken } from "@/lib/sanity-token";
import { client } from "@/sanity/lib/client";

const REPO_SEGMENT = /^[A-Za-z0-9_.-]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const issue = body?.issue as GitHubIssueDraft | undefined;
    const provider = body?.provider as Provider | undefined;
    const apiKey = typeof body?.apiKey === "string" ? body.apiKey.trim() : "";

    if (
      !issue?.repoOwner ||
      !issue.repoName ||
      !REPO_SEGMENT.test(issue.repoOwner) ||
      !REPO_SEGMENT.test(issue.repoName) ||
      !Number.isInteger(issue.githubId)
    ) {
      return NextResponse.json(
        { error: "issue repoOwner, repoName, and githubId are required" },
        { status: 400 }
      );
    }

    const repo: RepositoryScope = {
      repoOwner: issue.repoOwner,
      repoName: issue.repoName,
    };
    const token = sanityWriteToken();
    const reader = client.withConfig({
      useCdn: false,
      stega: false,
      ...(token ? { token } : {}),
    });

    const [storedPatterns, storedDecisions] = await Promise.all([
      reader.fetch<HistoricalPattern[]>(REPOSITORY_PATTERNS_QUERY, repo),
      reader.fetch<HistoricalDecision[]>(REPOSITORY_PRECEDENT_QUERY, repo),
    ]);

    const matchingPatterns = findMatchingPatterns(issue, patternsForRepository(storedPatterns, repo));
    const precedent = selectPrecedent(issue, storedDecisions, repo);

    let modelPriority: Priority | null = null;
    let reasoning = "";
    let suggestedResolution = "";
    let confidence = 0;

    if (shouldConsultModel(precedent)) {
      if (!apiKey || !provider) {
        return NextResponse.json(
          {
            error:
              "An API key is required when this repository has no maintainer precedent for the issue.",
          },
          { status: 401 }
        );
      }

      const { instructions, prompt } = buildTriagePrompt(issue, matchingPatterns);
      const { object } = await generateObject({
        model: getModel(provider, apiKey),
        output: "object",
        schema: prioritizationSchema,
        instructions,
        prompt,
      });
      modelPriority = object.priority;
      reasoning = object.reasoning;
      suggestedResolution = object.suggestedResolution;
      confidence = object.confidence;
    }

    const resolved = resolveSuggestedPriority(modelPriority, precedent);
    if (!resolved) {
      return NextResponse.json(
        { error: "No priority could be resolved for this issue" },
        { status: 500 }
      );
    }

    if (resolved.source === "precedent") {
      reasoning = `Maintainer precedent in ${repo.repoOwner}/${repo.repoName} sets similar issues to ${resolved.priority}.`;
      suggestedResolution = precedent.find((decision) => decision.resolution)?.resolution || "";
      confidence = 100;
    }

    let issueId: string | undefined;
    let decisionId: string | undefined;
    if (token) {
      const matchedPatternIds = matchingPatterns.map((pattern) => ({
        _key: pattern._id,
        _type: "reference" as const,
        _ref: pattern._id,
      }));
      issueId = await saveGitHubIssue(issue, token, {
        workflowStatus: "prioritized",
        agentPriority: resolved.priority,
        agentReasoning: reasoning,
        matchedPatternIds,
      });

      const decision = await reader.create({
        _type: "triageDecision",
        repoOwner: repo.repoOwner,
        repoName: repo.repoName,
        issueRef: { _type: "reference", _ref: issueId },
        assignedPriority: resolved.priority,
        ...(modelPriority ? { modelPriority } : {}),
        agentSuggestion: reasoning,
        agentAccuracy: null,
        matchedPatterns: matchedPatternIds,
        decidedAt: new Date().toISOString(),
      });
      decisionId = decision._id;
    }

    return NextResponse.json({
      issueId,
      decisionId,
      priority: resolved.priority,
      prioritySource: resolved.source,
      reasoning,
      matchedPatterns: matchingPatterns.map((pattern) => pattern.patternName),
      suggestedResolution,
      confidence,
      historicalPatternsUsed: matchingPatterns.length,
      similarDecisionsFound: precedent.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to prioritize issue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
