// SuryaPrajna — lib/providers.ts
// Provider router, key storage, and connection management.

export type ProviderName =
  | "anthropic"
  | "openai"
  | "perplexity"
  | "pinecone"
  | "openrouter"
  | "deepseek"
  | "groq"
  | "ollama";

export type TaskType = "chat" | "research" | "writing" | "embedding" | "rag";

export interface ProviderConfig {
  apiKey: string;
  model?: string;
  // Pinecone-specific
  environment?: string;
  indexName?: string;
  // Ollama-specific
  baseUrl?: string;
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
  openrouterKey: string;
  openrouterModel: string;
  deepseekKey: string;
  deepseekModel: string;
  groqKey: string;
  groqModel: string;
  ollamaModel: string;
  ollamaBaseUrl: string;
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
  openrouterKey: "",
  openrouterModel: "anthropic/claude-sonnet-4-20250514",
  deepseekKey: "",
  deepseekModel: "deepseek-chat",
  groqKey: "",
  groqModel: "llama-3.3-70b-versatile",
  ollamaModel: "llama3",
  ollamaBaseUrl: "http://localhost:11434",
};

// Sensitive fields that should be obfuscated
const SENSITIVE_FIELDS: (keyof AllProviderKeys)[] = [
  "anthropicKey",
  "openaiKey",
  "perplexityKey",
  "pineconeKey",
  "openrouterKey",
  "deepseekKey",
  "groqKey",
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
    "x-openrouter-key": keys.openrouterKey,
    "x-deepseek-key": keys.deepseekKey,
    "x-groq-key": keys.groqKey,
    "x-ollama-base-url": keys.ollamaBaseUrl || "http://localhost:11434",
  };
}

// Priority order for each task type
const TASK_PRIORITY: Record<TaskType, ProviderName[]> = {
  research: ["perplexity", "anthropic", "openai", "openrouter", "deepseek", "groq", "ollama"],
  writing: ["anthropic", "openai", "openrouter", "deepseek", "groq", "perplexity", "ollama"],
  chat: ["anthropic", "openai", "openrouter", "deepseek", "groq", "perplexity", "ollama"],
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
    if (key || preferredProvider === "ollama") {
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
    if (key || provider === "ollama") {
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
    case "openrouter":
      return keys.openrouterKey;
    case "deepseek":
      return keys.deepseekKey;
    case "groq":
      return keys.groqKey;
    case "ollama":
      return "";
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
    case "openrouter":
      return keys.openrouterModel;
    case "deepseek":
      return keys.deepseekModel;
    case "groq":
      return keys.groqModel;
    case "ollama":
      return keys.ollamaModel;
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
  openrouter: [
    { value: "anthropic/claude-sonnet-4-20250514", label: "Claude Sonnet 4" },
    { value: "openai/gpt-4o", label: "GPT-4o" },
    { value: "google/gemini-2.5-pro-preview", label: "Gemini 2.5 Pro" },
    { value: "meta-llama/llama-3.3-70b-instruct", label: "Llama 3.3 70B" },
  ],
  deepseek: [
    { value: "deepseek-chat", label: "DeepSeek Chat (V3)" },
    { value: "deepseek-reasoner", label: "DeepSeek Reasoner (R1)" },
  ],
  groq: [
    { value: "llama-3.3-70b-versatile", label: "Llama 3.3 70B" },
    { value: "llama-3.1-8b-instant", label: "Llama 3.1 8B" },
    { value: "mixtral-8x7b-32768", label: "Mixtral 8x7B" },
  ],
  ollama: [
    { value: "llama3", label: "Llama 3" },
    { value: "llama3.1", label: "Llama 3.1" },
    { value: "mistral", label: "Mistral" },
    { value: "codellama", label: "Code Llama" },
  ],
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
  openrouter: {
    label: "OpenRouter",
    icon: "🔀",
    description: "Unified API gateway to 200+ models from multiple providers",
    placeholder: "sk-or-v1-...",
  },
  deepseek: {
    label: "DeepSeek",
    icon: "🌊",
    description: "Cost-effective reasoning and chat models",
    placeholder: "sk-...",
  },
  groq: {
    label: "Groq",
    icon: "⚡",
    description: "Ultra-fast inference for open-source models",
    placeholder: "gsk_...",
  },
  ollama: {
    label: "Ollama (Local)",
    icon: "🏠",
    description: "Run open-source models locally, no API key needed",
    placeholder: "",
  },
};
