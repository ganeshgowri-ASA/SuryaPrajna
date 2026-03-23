// SuryaPrajna — lib/providers.ts
// Provider router, key storage, and connection management.

export type ProviderName = "anthropic" | "openai" | "perplexity" | "pinecone";

export type TaskType = "chat" | "research" | "writing" | "embedding" | "rag";

export interface ProviderConfig {
  apiKey: string;
  model?: string;
  // Pinecone-specific
  environment?: string;
  indexName?: string;
}

export interface ProviderStatus {
  provider: ProviderName;
  connected: boolean;
  lastTested: number | null;
  error?: string;
}

export interface AllProviderKeys {
  anthropicKey: string;
  anthropicModel: string;
  openaiKey: string;
  openaiModel: string;
  perplexityKey: string;
  perplexityModel: string;
  pineconeKey: string;
  pineconeEnv: string;
  pineconeIndex: string;
}

const STORAGE_KEY = "suryaprajna_provider_keys";

// Simple XOR-based obfuscation for localStorage (not true encryption,
// but prevents casual inspection of stored keys).
const OBFUSCATION_KEY = "SuryaPrajna2026";

function obfuscate(text: string): string {
  if (!text) return "";
  const key = OBFUSCATION_KEY;
  let result = "";
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(result);
}

function deobfuscate(encoded: string): string {
  if (!encoded) return "";
  try {
    const decoded = atob(encoded);
    const key = OBFUSCATION_KEY;
    let result = "";
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  } catch {
    return "";
  }
}

const DEFAULT_KEYS: AllProviderKeys = {
  anthropicKey: "",
  anthropicModel: "claude-sonnet-4-20250514",
  openaiKey: "",
  openaiModel: "gpt-4o",
  perplexityKey: "",
  perplexityModel: "sonar-pro",
  pineconeKey: "",
  pineconeEnv: "",
  pineconeIndex: "",
};

// Sensitive fields that should be obfuscated
const SENSITIVE_FIELDS: (keyof AllProviderKeys)[] = [
  "anthropicKey",
  "openaiKey",
  "perplexityKey",
  "pineconeKey",
];

export function saveProviderKeys(keys: AllProviderKeys): void {
  if (typeof window === "undefined") return;
  try {
    const toStore = { ...keys };
    for (const field of SENSITIVE_FIELDS) {
      if (toStore[field]) {
        toStore[field] = obfuscate(toStore[field]);
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch {
    // Storage unavailable
  }
}

export function loadProviderKeys(): AllProviderKeys {
  if (typeof window === "undefined") return { ...DEFAULT_KEYS };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { ...DEFAULT_KEYS };
    const parsed = JSON.parse(stored) as AllProviderKeys;
    // Deobfuscate sensitive fields
    for (const field of SENSITIVE_FIELDS) {
      if (parsed[field]) {
        parsed[field] = deobfuscate(parsed[field]);
      }
    }
    return { ...DEFAULT_KEYS, ...parsed };
  } catch {
    return { ...DEFAULT_KEYS };
  }
}

export function getProviderHeaders(keys: AllProviderKeys): Record<string, string> {
  return {
    "x-anthropic-key": keys.anthropicKey,
    "x-openai-key": keys.openaiKey,
    "x-perplexity-key": keys.perplexityKey,
    "x-pinecone-key": keys.pineconeKey,
    "x-pinecone-env": keys.pineconeEnv,
    "x-pinecone-index": keys.pineconeIndex,
  };
}

// Priority order for each task type
const TASK_PRIORITY: Record<TaskType, ProviderName[]> = {
  research: ["perplexity", "anthropic", "openai"],
  writing: ["anthropic", "openai", "perplexity"],
  chat: ["anthropic", "openai", "perplexity"],
  embedding: ["openai"],
  rag: ["pinecone"],
};

/**
 * Choose the best provider for a given task type.
 * User can override via preferredProvider.
 */
export function routeProvider(
  task: TaskType,
  keys: AllProviderKeys,
  preferredProvider?: ProviderName,
): { provider: ProviderName; model: string } | null {
  // If user explicitly chose a provider and has a key for it, use it
  if (preferredProvider) {
    const key = getKeyForProvider(preferredProvider, keys);
    if (key) {
      return {
        provider: preferredProvider,
        model: getModelForProvider(preferredProvider, keys),
      };
    }
  }

  // RAG needs both Pinecone and OpenAI
  if (task === "rag") {
    if (keys.pineconeKey && keys.openaiKey) {
      return { provider: "pinecone", model: "text-embedding-3-small" };
    }
    return null;
  }

  // Find first available provider in priority order
  const priorities = TASK_PRIORITY[task];
  for (const provider of priorities) {
    const key = getKeyForProvider(provider, keys);
    if (key) {
      const model =
        task === "embedding" ? "text-embedding-3-small" : getModelForProvider(provider, keys);
      return { provider, model };
    }
  }

  return null;
}

function getKeyForProvider(provider: ProviderName, keys: AllProviderKeys): string {
  switch (provider) {
    case "anthropic":
      return keys.anthropicKey;
    case "openai":
      return keys.openaiKey;
    case "perplexity":
      return keys.perplexityKey;
    case "pinecone":
      return keys.pineconeKey;
  }
}

function getModelForProvider(provider: ProviderName, keys: AllProviderKeys): string {
  switch (provider) {
    case "anthropic":
      return keys.anthropicModel;
    case "openai":
      return keys.openaiModel;
    case "perplexity":
      return keys.perplexityModel;
    case "pinecone":
      return "";
  }
}

/**
 * Model options for each provider
 */
export const PROVIDER_MODELS: Record<ProviderName, { value: string; label: string }[]> = {
  anthropic: [
    { value: "claude-sonnet-4-20250514", label: "Claude Sonnet 4" },
    { value: "claude-opus-4-20250514", label: "Claude Opus 4" },
    { value: "claude-3-5-haiku-20241022", label: "Claude 3.5 Haiku" },
  ],
  openai: [
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
    { value: "o1", label: "o1" },
  ],
  perplexity: [
    { value: "sonar", label: "Sonar" },
    { value: "sonar-pro", label: "Sonar Pro" },
    { value: "sonar-reasoning", label: "Sonar Reasoning" },
  ],
  pinecone: [],
};

export const PROVIDER_INFO: Record<
  ProviderName,
  { label: string; icon: string; description: string; placeholder: string }
> = {
  anthropic: {
    label: "Anthropic (Claude)",
    icon: "🧠",
    description: "Primary AI for writing, editing, and skill execution",
    placeholder: "sk-ant-api03-...",
  },
  openai: {
    label: "OpenAI",
    icon: "🤖",
    description: "Embeddings (text-embedding-3-small) and GPT-4 fallback",
    placeholder: "sk-...",
  },
  perplexity: {
    label: "Perplexity",
    icon: "🔍",
    description: "Web search, literature discovery, fact-checking, research questions",
    placeholder: "pplx-...",
  },
  pinecone: {
    label: "Pinecone",
    icon: "🌲",
    description: "RAG knowledge base, semantic search over uploaded papers",
    placeholder: "pc-...",
  },
};
