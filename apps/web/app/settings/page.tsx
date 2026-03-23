"use client";

import {
  type AllProviderKeys,
  PROVIDER_INFO,
  PROVIDER_MODELS,
  type ProviderName,
  type ProviderStatus,
  loadProviderKeys,
  saveProviderKeys,
} from "@/lib/providers";
import { useCallback, useEffect, useState } from "react";

const PROVIDERS: ProviderName[] = [
  "anthropic",
  "openai",
  "perplexity",
  "openrouter",
  "deepseek",
  "groq",
  "ollama",
  "pinecone",
];

function StatusBadge({ status }: { status: ProviderStatus | undefined }) {
  if (!status) {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs bg-gray-800 text-gray-500">Not tested</span>
    );
  }
  if (status.connected) {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/15 text-emerald-400">
        Connected
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/15 text-red-400">Failed</span>
  );
}

function KeyStatusDot({ hasKey }: { hasKey: boolean }) {
  return (
    <span
      className={`w-2 h-2 rounded-full inline-block ${hasKey ? "bg-emerald-500" : "bg-gray-600"}`}
    />
  );
}

export default function SettingsPage() {
  const [keys, setKeys] = useState<AllProviderKeys>({
    anthropicKey: "",
    anthropicModel: "claude-sonnet-4-20250514",
    openaiKey: "",
    openaiModel: "gpt-4o",
    perplexityKey: "",
    perplexityModel: "sonar-pro",
    pineconeKey: "",
    pineconeEnv: "",
    pineconeIndex: "",
    openrouterKey: "",
    openrouterModel: "anthropic/claude-sonnet-4-20250514",
    deepseekKey: "",
    deepseekModel: "deepseek-chat",
    groqKey: "",
    groqModel: "llama-3.3-70b-versatile",
    ollamaModel: "llama3",
    ollamaBaseUrl: "http://localhost:11434",
  });
  const [statuses, setStatuses] = useState<Record<string, ProviderStatus>>({});
  const [testing, setTesting] = useState<Record<string, boolean>>({});
  const [testingAll, setTestingAll] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  // Load keys from localStorage on mount
  useEffect(() => {
    setKeys(loadProviderKeys());
  }, []);

  const updateKey = useCallback((field: keyof AllProviderKeys, value: string) => {
    setKeys((prev) => {
      const updated = { ...prev, [field]: value };
      saveProviderKeys(updated);
      return updated;
    });
  }, []);

  const handleSave = useCallback(() => {
    saveProviderKeys(keys);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [keys]);

  const testProvider = useCallback(
    async (provider: ProviderName) => {
      setTesting((prev) => ({ ...prev, [provider]: true }));
      try {
        const res = await fetch("/api/providers/test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider, keys }),
        });
        const data = await res.json();
        setStatuses((prev) => ({
          ...prev,
          [provider]: {
            provider,
            connected: data.connected,
            lastTested: Date.now(),
            error: data.error,
          },
        }));
      } catch {
        setStatuses((prev) => ({
          ...prev,
          [provider]: {
            provider,
            connected: false,
            lastTested: Date.now(),
            error: "Network error",
          },
        }));
      } finally {
        setTesting((prev) => ({ ...prev, [provider]: false }));
      }
    },
    [keys],
  );

  const getKeyValue = (provider: ProviderName): string => {
    switch (provider) {
      case "anthropic":
        return keys.anthropicKey;
      case "openai":
        return keys.openaiKey;
      case "perplexity":
        return keys.perplexityKey;
      case "pinecone":
        return keys.pineconeKey;
      case "openrouter":
        return keys.openrouterKey;
      case "deepseek":
        return keys.deepseekKey;
      case "groq":
        return keys.groqKey;
      case "ollama":
        return "";
    }
  };

  const testAll = useCallback(async () => {
    setTestingAll(true);
    const keyMap: Record<string, string> = {
      anthropic: keys.anthropicKey,
      openai: keys.openaiKey,
      perplexity: keys.perplexityKey,
      pinecone: keys.pineconeKey,
      openrouter: keys.openrouterKey,
      deepseek: keys.deepseekKey,
      groq: keys.groqKey,
    };
    const providers = PROVIDERS.filter((p) => {
      if (p === "ollama") return true;
      return !!keyMap[p];
    });
    await Promise.all(providers.map((p) => testProvider(p)));
    setTestingAll(false);
  }, [keys, testProvider]);

  const toggleShowKey = (provider: string) => {
    setShowKeys((prev) => ({ ...prev, [provider]: !prev[provider] }));
  };

  const setKeyValue = (provider: ProviderName, value: string) => {
    const fieldMap: Record<ProviderName, keyof AllProviderKeys> = {
      anthropic: "anthropicKey",
      openai: "openaiKey",
      perplexity: "perplexityKey",
      pinecone: "pineconeKey",
      openrouter: "openrouterKey",
      deepseek: "deepseekKey",
      groq: "groqKey",
      ollama: "ollamaBaseUrl",
    };
    updateKey(fieldMap[provider], value);
  };

  const getModelValue = (provider: ProviderName): string => {
    switch (provider) {
      case "anthropic":
        return keys.anthropicModel;
      case "openai":
        return keys.openaiModel;
      case "perplexity":
        return keys.perplexityModel;
      case "openrouter":
        return keys.openrouterModel;
      case "deepseek":
        return keys.deepseekModel;
      case "groq":
        return keys.groqModel;
      case "ollama":
        return keys.ollamaModel;
      default:
        return "";
    }
  };

  const setModelValue = (provider: ProviderName, value: string) => {
    const fieldMap: Record<string, keyof AllProviderKeys> = {
      anthropic: "anthropicModel",
      openai: "openaiModel",
      perplexity: "perplexityModel",
      openrouter: "openrouterModel",
      deepseek: "deepseekModel",
      groq: "groqModel",
      ollama: "ollamaModel",
    };
    const field = fieldMap[provider];
    if (field) updateKey(field, value);
  };

  const hasProviderConfigured = (p: ProviderName): boolean => {
    if (p === "ollama") return true;
    return !!getKeyValue(p);
  };

  const connectedCount = PROVIDERS.filter((p) => hasProviderConfigured(p)).length;
  const lastTestedTime = Object.values(statuses).reduce((latest, s) => {
    if (s.lastTested && s.lastTested > latest) return s.lastTested;
    return latest;
  }, 0);

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
          <p className="text-sm text-gray-400">
            Connect your AI providers and configure API keys to enable all SuryaPrajna features.
          </p>
        </div>

        {/* Connection Status Dashboard */}
        <div className="bg-gray-900 border border-gray-800/60 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Connection Status</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {connectedCount}/{PROVIDERS.length} providers configured
                {lastTestedTime > 0 && (
                  <> &middot; Last tested {new Date(lastTestedTime).toLocaleTimeString()}</>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={testAll}
              disabled={testingAll}
              className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg text-sm font-medium hover:bg-amber-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {testingAll ? "Testing..." : "Test All Connections"}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PROVIDERS.map((provider) => {
              const info = PROVIDER_INFO[provider];
              const hasKey = hasProviderConfigured(provider);
              const status = statuses[provider];
              return (
                <div
                  key={provider}
                  className={`rounded-lg border p-3 transition-colors ${
                    hasKey
                      ? status?.connected
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : status && !status.connected
                          ? "border-red-500/30 bg-red-500/5"
                          : "border-amber-500/30 bg-amber-500/5"
                      : "border-gray-800 bg-gray-900/50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{info.icon}</span>
                    <span className="text-sm font-medium text-white">
                      {info.label.split(" (")[0]}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <KeyStatusDot hasKey={hasKey} />
                    <StatusBadge status={status} />
                  </div>
                  {status?.error && (
                    <p className="text-xs text-red-400/80 mt-1 truncate">{status.error}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Provider Cards */}
        <div className="space-y-6">
          {PROVIDERS.map((provider) => {
            const info = PROVIDER_INFO[provider];
            const models = PROVIDER_MODELS[provider];
            const hasKey = hasProviderConfigured(provider);
            const status = statuses[provider];
            const isTesting = testing[provider];
            const needsApiKey = provider !== "ollama";

            return (
              <div
                key={provider}
                className="bg-gray-900 border border-gray-800/60 rounded-xl overflow-hidden"
              >
                {/* Card header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/40">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{info.icon}</span>
                    <div>
                      <h3 className="text-base font-semibold text-white">{info.label}</h3>
                      <p className="text-xs text-gray-500">{info.description}</p>
                    </div>
                  </div>
                  <StatusBadge status={status} />
                </div>

                {/* Card body */}
                <div className="px-6 py-4 space-y-4">
                  {/* API Key (not for Ollama) */}
                  {needsApiKey && (
                    <div>
                      <label
                        className="block text-xs text-gray-400 mb-1.5 font-medium"
                        htmlFor={`key-${provider}`}
                      >
                        API Key
                      </label>
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <input
                            id={`key-${provider}`}
                            type={showKeys[provider] ? "text" : "password"}
                            value={getKeyValue(provider)}
                            onChange={(e) => setKeyValue(provider, e.target.value)}
                            placeholder={info.placeholder}
                            className="w-full bg-gray-800/60 border border-gray-700/40 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-500/40 pr-10 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => toggleShowKey(provider)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs"
                          >
                            {showKeys[provider] ? "Hide" : "Show"}
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => testProvider(provider)}
                          disabled={!hasKey || isTesting}
                          className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap border border-gray-700/40"
                        >
                          {isTesting ? "Testing..." : "Test"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Ollama base URL + test button */}
                  {provider === "ollama" && (
                    <div>
                      <label
                        className="block text-xs text-gray-400 mb-1.5 font-medium"
                        htmlFor="ollama-base-url"
                      >
                        Base URL
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="ollama-base-url"
                          type="text"
                          value={keys.ollamaBaseUrl}
                          onChange={(e) => updateKey("ollamaBaseUrl", e.target.value)}
                          placeholder="http://localhost:11434"
                          className="flex-1 bg-gray-800/60 border border-gray-700/40 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-500/40 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => testProvider(provider)}
                          disabled={isTesting}
                          className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap border border-gray-700/40"
                        >
                          {isTesting ? "Testing..." : "Test"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Model selector (not for Pinecone) */}
                  {models.length > 0 && (
                    <div>
                      <label
                        className="block text-xs text-gray-400 mb-1.5 font-medium"
                        htmlFor={`model-${provider}`}
                      >
                        Model
                      </label>
                      <select
                        id={`model-${provider}`}
                        value={getModelValue(provider)}
                        onChange={(e) => setModelValue(provider, e.target.value)}
                        className="w-full bg-gray-800/60 border border-gray-700/40 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-amber-500/40"
                      >
                        {models.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Pinecone extra fields */}
                  {provider === "pinecone" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label
                          className="block text-xs text-gray-400 mb-1.5 font-medium"
                          htmlFor="pinecone-env"
                        >
                          Environment
                        </label>
                        <input
                          id="pinecone-env"
                          type="text"
                          value={keys.pineconeEnv}
                          onChange={(e) => updateKey("pineconeEnv", e.target.value)}
                          placeholder="us-east-1-aws"
                          className="w-full bg-gray-800/60 border border-gray-700/40 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-500/40"
                        />
                      </div>
                      <div>
                        <label
                          className="block text-xs text-gray-400 mb-1.5 font-medium"
                          htmlFor="pinecone-index"
                        >
                          Index Name
                        </label>
                        <input
                          id="pinecone-index"
                          type="text"
                          value={keys.pineconeIndex}
                          onChange={(e) => updateKey("pineconeIndex", e.target.value)}
                          placeholder="suryaprajna-index"
                          className="w-full bg-gray-800/60 border border-gray-700/40 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-500/40"
                        />
                      </div>
                    </div>
                  )}

                  {/* Status error detail */}
                  {status?.error && (
                    <div className="bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2">
                      <p className="text-xs text-red-400">{status.error}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Provider Routing Info */}
        <div className="bg-gray-900 border border-gray-800/60 rounded-xl p-6 mt-8">
          <h3 className="text-base font-semibold text-white mb-3">Smart Provider Routing</h3>
          <p className="text-xs text-gray-500 mb-4">
            SuryaPrajna automatically routes tasks to the best provider based on task type. You can
            override this per-request.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { task: "Writing & Editing", provider: "Claude (Anthropic)", icon: "✍️" },
              { task: "Research & Search", provider: "Perplexity", icon: "🔍" },
              { task: "Embeddings", provider: "OpenAI (text-embedding-3-small)", icon: "📐" },
              {
                task: "Knowledge Base (RAG)",
                provider: "Pinecone + OpenAI Embeddings",
                icon: "🌲",
              },
              { task: "Multi-model Access", provider: "OpenRouter (200+ models)", icon: "🔀" },
              { task: "Fast Inference", provider: "Groq (open-source models)", icon: "⚡" },
              { task: "Cost-effective Chat", provider: "DeepSeek", icon: "🌊" },
              { task: "Local / Offline", provider: "Ollama (no API key)", icon: "🏠" },
            ].map((r) => (
              <div
                key={r.task}
                className="flex items-center gap-3 bg-gray-800/30 rounded-lg px-3 py-2"
              >
                <span className="text-lg">{r.icon}</span>
                <div>
                  <p className="text-sm text-gray-200">{r.task}</p>
                  <p className="text-xs text-gray-500">{r.provider}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Environment Variables Info */}
        <div className="bg-gray-900 border border-gray-800/60 rounded-xl p-6 mt-6 mb-8">
          <h3 className="text-base font-semibold text-white mb-3">Environment Variables</h3>
          <p className="text-xs text-gray-500 mb-3">
            Keys entered above are stored in your browser (obfuscated). You can also set them as
            environment variables — browser keys take priority.
          </p>
          <div className="bg-gray-800/40 rounded-lg p-3 font-mono text-xs text-gray-400 space-y-1">
            <p>ANTHROPIC_API_KEY=sk-ant-...</p>
            <p>OPENAI_API_KEY=sk-...</p>
            <p>PERPLEXITY_API_KEY=pplx-...</p>
            <p>OPENROUTER_API_KEY=sk-or-v1-...</p>
            <p>DEEPSEEK_API_KEY=sk-...</p>
            <p>GROQ_API_KEY=gsk_...</p>
            <p>OLLAMA_BASE_URL=http://localhost:11434</p>
            <p>PINECONE_API_KEY=pc-...</p>
            <p>PINECONE_ENVIRONMENT=us-east-1-aws</p>
            <p>PINECONE_INDEX=suryaprajna-index</p>
          </div>
        </div>

        {/* Save button */}
        <div className="fixed bottom-6 right-6 z-40">
          <button
            type="button"
            onClick={handleSave}
            className={`px-6 py-3 rounded-xl shadow-lg font-medium text-sm transition-all ${
              saved ? "bg-emerald-500 text-white" : "bg-amber-500 text-gray-950 hover:bg-amber-400"
            }`}
          >
            {saved ? "Saved!" : "Save All Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
