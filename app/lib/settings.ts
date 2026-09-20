import type { Provider } from "../types";

export interface StoredSettings {
  provider: Provider;
  apiKey: string;
  githubToken: string;
}

export function getStoredSettings(): StoredSettings {
  if (typeof window === "undefined") {
    return { provider: "anthropic", apiKey: "", githubToken: "" };
  }

  return {
    provider: (localStorage.getItem("ai-provider") || "anthropic") as Provider,
    apiKey: localStorage.getItem("ai-key") || "",
    githubToken: localStorage.getItem("github-token") || "",
  };
}

export function saveStoredSettings(settings: StoredSettings) {
  localStorage.setItem("ai-provider", settings.provider);
  localStorage.setItem("ai-key", settings.apiKey);
  localStorage.setItem("github-token", settings.githubToken);
}
