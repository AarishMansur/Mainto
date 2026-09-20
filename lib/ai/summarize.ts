import { generateObject } from "ai";
import { z } from "zod";
import { getModel, type Provider } from "./providers";
import { SUMMARIZE_SYSTEM_PROMPT } from "../prompts";

export const summarySchema = z.object({
  summary: z.string().describe("2-3 sentence summary in plain English"),
  urgencyScore: z.number().min(1).max(10).describe("Urgency score 1-10"),
  keyPoints: z.array(z.string()).describe("3-5 key points as bullet list"),
  suggestedActions: z.array(z.string()).describe("2-3 suggested actions"),
});

export type IssueSummary = z.infer<typeof summarySchema>;

export interface IssueToSummarize {
  githubId: number;
  title: string;
  body: string | null;
  labels: string[];
  commentsCount: number;
}

export async function summarizeIssue(
  issue: IssueToSummarize,
  provider: Provider,
  apiKey: string
): Promise<IssueSummary> {
  const model = getModel(provider, apiKey);

  const issueText = `
Issue #${issue.githubId}: ${issue.title}
Labels: ${issue.labels.length > 0 ? issue.labels.join(", ") : "none"}
Comments: ${issue.commentsCount}
Body:
${issue.body?.slice(0, 3000) || "No description provided."}
`;

  const { object } = await generateObject({
    model,
    output: "object",
    schema: summarySchema,
    instructions: SUMMARIZE_SYSTEM_PROMPT,
    prompt: issueText,
  });

  return object;
}
