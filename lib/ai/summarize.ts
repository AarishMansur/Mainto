import { generateObject } from "ai";
import { z } from "zod";
import { getModel, type Provider } from "./providers";
import { buildSummaryPrompt } from "../prompts";

export const summarySchema = z.object({
  summary: z.string().describe("2-3 sentence summary in plain English"),
  urgencyScore: z.number().min(1).max(10).describe("Urgency score 1-10"),
  keyPoints: z.array(z.string()).describe("3-5 key points as bullet list"),
  suggestedActions: z.array(z.string()).describe("2-3 suggested actions"),
});

export type IssueSummary = z.infer<typeof summarySchema>;

export interface IssueToSummarize {
  githubId: number;
  repoOwner: string;
  repoName: string;
  title: string;
  body: string | null;
  labels: string[];
  commentsCount: number;
  state?: string;
  url?: string;
}

export async function summarizeIssue(
  issue: IssueToSummarize,
  provider: Provider,
  apiKey: string
): Promise<IssueSummary> {
  const model = getModel(provider, apiKey);

  const { instructions, prompt } = buildSummaryPrompt(issue);

  const { object } = await generateObject({
    model,
    output: "object",
    schema: summarySchema,
    instructions,
    prompt,
  });

  return object;
}
