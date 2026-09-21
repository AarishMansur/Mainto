"use client";

import { useEffect, useState } from "react";
import { getStoredSettings, saveStoredSettings } from "../lib/settings";
import type { Provider } from "../types";

const PROVIDER_OPTIONS: { value: Provider; label: string; model: string }[] = [
  { value: "anthropic", label: "Anthropic (Claude)", model: "claude-sonnet-4" },
  { value: "openai", label: "OpenAI (GPT-4o)", model: "gpt-4o" },
  { value: "google", label: "Google (Gemini)", model: "gemini-3.1-flash-lite" },
  { value: "groq", label: "Groq (Qwen 3)", model: "qwen/qwen3-32b" },
  { value: "mistral", label: "Mistral (Large)", model: "mistral-large" },
  { value: "deepseek", label: "DeepSeek (Chat)", model: "deepseek-chat" },
  { value: "xai", label: "xAI (Grok 3)", model: "grok-3" },
  { value: "togetherai", label: "Together AI (Llama 3 70B)", model: "llama-3-70b" },
  { value: "cohere", label: "Cohere (Command R+)", model: "command-r-plus" },
  { value: "fireworks", label: "Fireworks (Llama 3.3 70B)", model: "llama-v3.3-70b" },
  { value: "huggingface", label: "Hugging Face (Llama 3.3 70B)", model: "meta-llama/Llama-3.3-70B-Instruct" },
];

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const [provider, setProvider] = useState<Provider>("anthropic");
  const [apiKey, setApiKey] = useState("");
  const [githubToken, setGithubToken] = useState("");

  useEffect(() => {
    const settings = getStoredSettings();
    setProvider(settings.provider);
    setApiKey(settings.apiKey);
    setGithubToken(settings.githubToken);
  }, []);

  function handleProviderChange(newProvider: Provider) {
    if (newProvider !== provider) {
      setApiKey("");
    }
    setProvider(newProvider);
  }

  function save() {
    saveStoredSettings({ provider, apiKey, githubToken });
    onClose();
  }

  const currentProvider = PROVIDER_OPTIONS.find((p) => p.value === provider);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/30 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl border border-zinc-200 bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">Settings</h2>
        <div className="space-y-4">
          <label className="block text-sm font-medium text-zinc-700">
            AI Provider
            <select
              value={provider}
              onChange={(event) => handleProviderChange(event.target.value as Provider)}
              className="mt-1 w-full rounded border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400"
            >
              {PROVIDER_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            {currentProvider && (
                <span className="mt-1 block text-xs text-zinc-500">
                Model: {currentProvider.model}
              </span>
            )}
          </label>
          <SettingsInput
            label={`API Key (${currentProvider?.label || provider})`}
            value={apiKey}
            onChange={setApiKey}
            placeholder={
              provider === "anthropic"
                ? "sk-ant-..."
                : provider === "openai"
                ? "sk-..."
                : provider === "google"
                ? "AIza..."
                : "your-api-key"
            }
            help="Leave empty to use the app's default key"
          />
          <SettingsInput
            label="GitHub Token (optional)"
            value={githubToken}
            onChange={setGithubToken}
            placeholder="ghp_..."
            help="For higher rate limits (5000 req/hr vs 60)"
          />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900">
            Cancel
          </button>
          <button onClick={save} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-black">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsInput({
  label,
  value,
  onChange,
  placeholder,
  help,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  help: string;
}) {
  return (
    <label className="block text-sm font-medium text-zinc-700">
      {label}
      <input
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400"
      />
      <span className="mt-1 block text-xs text-zinc-500">{help}</span>
    </label>
  );
}
