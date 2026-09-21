import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { createMistral } from "@ai-sdk/mistral";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { createXai } from "@ai-sdk/xai";
import { createTogetherAI } from "@ai-sdk/togetherai";
import { createCohere } from "@ai-sdk/cohere";
import { createFireworks } from "@ai-sdk/fireworks";
import { createHuggingFace } from "@ai-sdk/huggingface";

export type Provider =
  | "anthropic"
  | "openai"
  | "google"
  | "groq"
  | "mistral"
  | "deepseek"
  | "xai"
  | "togetherai"
  | "cohere"
  | "fireworks"
  | "huggingface";

export const PROVIDER_LABELS: Record<Provider, string> = {
  anthropic: "Anthropic (Claude)",
  openai: "OpenAI (GPT-4o)",
  google: "Google (Gemini)",
  groq: "Groq (Llama/Mixtral)",
  mistral: "Mistral",
  deepseek: "DeepSeek",
  xai: "xAI (Grok)",
  togetherai: "Together AI",
  cohere: "Cohere",
  fireworks: "Fireworks",
  huggingface: "Hugging Face (Llama 3.3 70B)",
};

export const PROVIDER_MODELS: Record<Provider, string> = {
  anthropic: "claude-sonnet-4-20250514",
  openai: "gpt-4o",
  google: "gemini-2.0-flash",
  groq: "qwen/qwen3-32b",
  mistral: "mistral-large-latest",
  deepseek: "deepseek-chat",
  xai: "grok-3",
  togetherai: "meta-llama/Llama-3-70b-chat-hf",
  cohere: "command-r-plus",
  fireworks: "accounts/fireworks/models/llama-v3p3-70b-instruct",
  huggingface: "meta-llama/Llama-3.3-70B-Instruct",
};

export function getModel(provider: Provider, apiKey: string) {
  switch (provider) {
    case "anthropic":
      return createAnthropic({ apiKey })(PROVIDER_MODELS.anthropic);
    case "openai":
      return createOpenAI({ apiKey })(PROVIDER_MODELS.openai);
    case "google":
      return createGoogleGenerativeAI({ apiKey })(PROVIDER_MODELS.google);
    case "groq":
      return createGroq({ apiKey })(PROVIDER_MODELS.groq);
    case "mistral":
      return createMistral({ apiKey })(PROVIDER_MODELS.mistral);
    case "deepseek":
      return createDeepSeek({ apiKey })(PROVIDER_MODELS.deepseek);
    case "xai":
      return createXai({ apiKey })(PROVIDER_MODELS.xai);
    case "togetherai":
      return createTogetherAI({ apiKey })(PROVIDER_MODELS.togetherai);
    case "cohere":
      return createCohere({ apiKey })(PROVIDER_MODELS.cohere);
    case "fireworks":
      return createFireworks({ apiKey })(PROVIDER_MODELS.fireworks);
    case "huggingface":
      return createHuggingFace({ apiKey })(PROVIDER_MODELS.huggingface);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}
