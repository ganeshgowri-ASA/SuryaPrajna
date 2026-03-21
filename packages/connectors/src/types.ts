/**
 * Shared types for @suryaprajna/connectors
 */

// ---------------------------------------------------------------------------
// Generic
// ---------------------------------------------------------------------------

/** Base configuration accepted by every connector. */
export interface ConnectorConfig {
  apiKey: string;
  baseUrl?: string;
  /** Default request timeout in milliseconds. */
  timeoutMs?: number;
}

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

export class ConnectorError extends Error {
  public readonly status: number | undefined;
  public readonly code: string;
  public readonly connector: string;

  constructor(opts: {
    message: string;
    status?: number;
    code: string;
    connector: string;
  }) {
    super(opts.message);
    this.name = "ConnectorError";
    this.status = opts.status;
    this.code = opts.code;
    this.connector = opts.connector;
  }
}

// ---------------------------------------------------------------------------
// Vector / RAG types
// ---------------------------------------------------------------------------

export interface VectorMatch {
  id: string;
  score: number;
  values?: number[];
  metadata?: Record<string, unknown>;
}

export interface VectorRecord {
  id: string;
  values: number[];
  metadata?: Record<string, unknown>;
}

export interface VectorQueryRequest {
  vector: number[];
  topK: number;
  namespace?: string;
  filter?: Record<string, unknown>;
  includeMetadata?: boolean;
  includeValues?: boolean;
}

export interface VectorQueryResponse {
  matches: VectorMatch[];
  namespace: string;
}

export interface VectorUpsertRequest {
  vectors: VectorRecord[];
  namespace?: string;
}

export interface VectorUpsertResponse {
  upsertedCount: number;
}

export interface VectorDeleteRequest {
  ids?: string[];
  deleteAll?: boolean;
  namespace?: string;
  filter?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Search / bibliography types
// ---------------------------------------------------------------------------

export interface SearchResult {
  id: string;
  title: string;
  authors: string[];
  year?: number;
  abstract?: string;
  doi?: string;
  url?: string;
  citationCount?: number;
  source: string;
}

export interface BibliographyItem {
  key: string;
  itemType: string;
  title: string;
  creators: Array<{ firstName?: string; lastName: string; creatorType: string }>;
  date?: string;
  doi?: string;
  url?: string;
  abstractNote?: string;
  tags?: Array<{ tag: string }>;
  collections?: string[];
  extra?: string;
}

export interface ZoteroCollection {
  key: string;
  name: string;
  parentCollection?: string | false;
  numItems: number;
}

// ---------------------------------------------------------------------------
// LLM types
// ---------------------------------------------------------------------------

/** A single message in a chat conversation. */
export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | ContentPart[];
  name?: string;
  tool_call_id?: string;
}

export type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string; detail?: "low" | "high" | "auto" } };

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stop?: string | string[];
  tools?: ToolDefinition[];
  tool_choice?: "auto" | "none" | "required" | { type: "function"; function: { name: string } };
}

export interface ChatCompletionResponse {
  id: string;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: "assistant";
      content: string | null;
      tool_calls?: Array<{
        id: string;
        type: "function";
        function: { name: string; arguments: string };
      }>;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface EmbeddingRequest {
  model: string;
  input: string | string[];
}

export interface EmbeddingResponse {
  data: Array<{ index: number; embedding: number[] }>;
  model: string;
  usage: { prompt_tokens: number; total_tokens: number };
}

export interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
}

// ---------------------------------------------------------------------------
// Anthropic-specific types
// ---------------------------------------------------------------------------

export interface ClaudeMessage {
  role: "user" | "assistant";
  content: string | ClaudeContentBlock[];
}

export type ClaudeContentBlock =
  | { type: "text"; text: string }
  | {
      type: "image";
      source: {
        type: "base64";
        media_type: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
        data: string;
      };
    }
  | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
  | { type: "tool_result"; tool_use_id: string; content: string };

export interface ClaudeMessageRequest {
  model: string;
  messages: ClaudeMessage[];
  max_tokens: number;
  system?: string;
  temperature?: number;
  top_p?: number;
  stop_sequences?: string[];
  stream?: boolean;
  tools?: ClaudeToolDefinition[];
  tool_choice?: { type: "auto" | "any" | "tool"; name?: string };
}

export interface ClaudeToolDefinition {
  name: string;
  description?: string;
  input_schema: Record<string, unknown>;
}

export interface ClaudeMessageResponse {
  id: string;
  type: "message";
  role: "assistant";
  content: ClaudeContentBlock[];
  model: string;
  stop_reason: "end_turn" | "max_tokens" | "stop_sequence" | "tool_use";
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface ClaudeStreamEvent {
  type: string;
  index?: number;
  delta?: {
    type: string;
    text?: string;
    partial_json?: string;
  };
  content_block?: ClaudeContentBlock;
  message?: ClaudeMessageResponse;
  usage?: { output_tokens: number };
}
