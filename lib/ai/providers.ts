import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export type Provider = "anthropic" | "openai" | "google";

export function getModel(provider: Provider, apiKey: string) {
  switch (provider) {
    case "anthropic":
      return createAnthropic({ apiKey })("claude-sonnet-4-20250514");
    case "openai":
      return createOpenAI({ apiKey })("gpt-4o");
    case "google":
      return createGoogleGenerativeAI({ apiKey })("gemini-2.0-flash");
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}
