"use client";

import { useEffect, useState } from "react";
import { getStoredSettings, saveStoredSettings } from "../lib/settings";
import type { Provider } from "../types";

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

  function save() {
    saveStoredSettings({ provider, apiKey, githubToken });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-md" onClick={(event) => event.stopPropagation()}>
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">Settings</h2>
        <div className="space-y-4">
          <label className="block text-sm font-medium text-zinc-400">AI Provider
            <select value={provider} onChange={(event) => setProvider(event.target.value as Provider)} className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100">
              <option value="anthropic">Anthropic (Claude)</option>
              <option value="openai">OpenAI (GPT-4o)</option>
              <option value="google">Google (Gemini)</option>
            </select>
          </label>
          <SettingsInput label={`API Key (${provider === "anthropic" ? "Anthropic" : provider === "openai" ? "OpenAI" : "Google"})`} value={apiKey} onChange={setApiKey} placeholder="sk-..." help="Leave empty to use the app's default key" />
          <SettingsInput label="GitHub Token (optional)" value={githubToken} onChange={setGithubToken} placeholder="ghp_..." help="For higher rate limits (5000 req/hr vs 60)" />
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200">Cancel</button>
          <button onClick={save} className="px-4 py-2 text-sm font-medium rounded bg-zinc-100 text-zinc-900 hover:bg-zinc-200">Save</button>
        </div>
      </div>
    </div>
  );
}

function SettingsInput({ label, value, onChange, placeholder, help }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; help: string }) {
  return (
    <label className="block text-sm font-medium text-zinc-400">{label}
      <input type="password" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600" />
      <span className="block text-xs text-zinc-600 mt-1">{help}</span>
    </label>
  );
}
