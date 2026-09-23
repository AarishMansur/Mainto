import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { getModel, type Provider } from "@/lib/ai/providers";
import { saveGitHubIssue, type GitHubIssueDraft } from "@/lib/sanity-issue";
import { client } from "@/sanity/lib/client";

interface HistoricalPattern {
  _id: string;
  patternName: string;
  keywords: string[];
  labelPatterns: string[];
  avgUrgency: number;
  typicalResolution: string;
  avgResolutionDays: number;
  learnedFrom: number;
}

interface HistoricalDecision {
  assignedPriority: string;
  resolution: string;
  agentAccuracy: number | null;
  issueRef: {
    title: string;
    labels: string[];
  };
}

const prioritizationSchema = z.object({
  priority: z.enum(["P0", "P1", "P2", "P3", "P4"]),
  reasoning: z.string().describe("Why this priority was assigned"),
  matchedPatterns: z.array(z.string()).describe("Which historical patterns matched"),
  suggestedResolution: z.string().describe("Suggested resolution based on history"),
  confidence: z.number().min(0).max(100).describe("Confidence in this suggestion"),
});

async function findMatchingPatterns(
  issue: GitHubIssueDraft,
  patterns: HistoricalPattern[]
): Promise<HistoricalPattern[]> {
  return patterns.filter((pattern) => {
    const titleLower = issue.title.toLowerCase();
    const bodyLower = (issue.body || "").toLowerCase();

    const keywordMatch = pattern.keywords.some(
      (kw) =>
        titleLower.includes(kw.toLowerCase()) ||
        bodyLower.includes(kw.toLowerCase())
    );

    const labelMatch = pattern.labelPatterns.some((lp) =>
      issue.labels.some((l) => l.toLowerCase().includes(lp.toLowerCase()))
    );

    return keywordMatch || labelMatch;
  });
}

async function findSimilarDecisions(
  issue: GitHubIssueDraft,
  decisions: HistoricalDecision[]
): Promise<HistoricalDecision[]> {
  return decisions.filter((decision) => {
    if (!decision.issueRef) return false;
    const titleLower = issue.title.toLowerCase();
    const decisionTitleLower = (decision.issueRef.title || "").toLowerCase();

    const words = titleLower.split(/\s+/).filter((w) => w.length > 3);
    return words.some((word) => decisionTitleLower.includes(word));
  });
}

export async function POST(request: NextRequest) {
  try {
    const { issue, provider, apiKey }: {
      issue: GitHubIssueDraft;
      provider: Provider;
      apiKey: string;
    } = await request.json();

    if (!issue?.repoOwner || !issue.repoName || !Number.isInteger(issue.githubId)) {
      return NextResponse.json(
        { error: "issue repoOwner, repoName, and githubId are required" },
        { status: 400 }
      );
    }

    const token = process.env.NEXT_PUBLIC_SANITY_API_TOKEN;

    const [patterns, decisions] = await Promise.all([
      client.fetch<HistoricalPattern[]>(
        '*[_type == "triagePattern"] | order(learnedFrom desc)'
      ),
      token
        ? client.fetch<HistoricalDecision[]>(
            '*[_type == "triageDecision"]{assignedPriority, resolution, agentAccuracy, issueRef->{title, labels}} | order(decidedAt desc)[0...100]'
          )
        : Promise.resolve([]),
    ]);

    const matchingPatterns = await findMatchingPatterns(issue, patterns);
    const similarDecisions = await findSimilarDecisions(issue, decisions);

    const model = getModel(provider, apiKey);

    const patternContext = matchingPatterns.length > 0
      ? `\n\nHistorical patterns that match this issue:\n${matchingPatterns.map(
          (p) => `- "${p.patternName}": avg urgency ${p.avgUrgency}/10, typical resolution: ${p.typicalResolution}, avg ${p.avgResolutionDays} days to resolve`
        ).join("\n")}`
      : "\n\nNo matching historical patterns found.";

    const decisionContext = similarDecisions.length > 0
      ? `\n\nSimilar past decisions:\n${similarDecisions.slice(0, 5).map(
          (d) => `- Priority: ${d.assignedPriority}, Resolution: ${d.resolution || "N/A"}`
        ).join("\n")}`
      : "\n\nNo similar past decisions found.";

    const prompt = `You are a triage agent for an open source project. Analyze this GitHub issue and assign a priority based on historical patterns.

Issue #${issue.githubId}: ${issue.title}
Labels: ${issue.labels.join(", ") || "none"}
Comments: ${issue.commentsCount}
Body: ${(issue.body || "No description").slice(0, 2000)}
${patternContext}
${decisionContext}

Assign a priority:
- P0: Critical — security vulnerability, production crash, data loss
- P1: High — major feature broken, many users affected
- P2: Medium — important feature request, moderate impact
- P3: Low — minor bug, enhancement, nice to have
- P4: Backlog — question, documentation, low priority

Base your decision on the historical patterns and similar past decisions. If patterns suggest a certain priority, align with that unless the issue clearly warrants different treatment.`;

    const { object } = await generateObject({
      model,
      output: "object",
      schema: prioritizationSchema,
      instructions: "You are a triage agent that assigns priority to GitHub issues based on historical patterns.",
      prompt,
    });

    let issueId: string | undefined;
    if (token) {
      const matchedPatternIds = matchingPatterns.map((pattern) => ({
        _key: pattern._id,
        _type: "reference" as const,
        _ref: pattern._id,
      }));
      issueId = await saveGitHubIssue(issue, token, {
        workflowStatus: "prioritized",
        agentPriority: object.priority,
        agentReasoning: object.reasoning,
        matchedPatternIds,
      });

      await client.withConfig({ useCdn: false, token, stega: false }).create({
        _type: "triageDecision",
        issueRef: { _type: "reference", _ref: issueId },
        assignedPriority: object.priority,
        resolution: object.suggestedResolution,
        agentSuggestion: object.reasoning,
        agentAccuracy: null,
        matchedPatterns: matchedPatternIds,
        decidedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      issueId,
      priority: object.priority,
      reasoning: object.reasoning,
      matchedPatterns: matchingPatterns.map((p) => p.patternName),
      suggestedResolution: object.suggestedResolution,
      confidence: object.confidence,
      historicalPatternsUsed: matchingPatterns.length,
      similarDecisionsFound: similarDecisions.length,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to prioritize issue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
