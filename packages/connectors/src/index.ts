/**
 * @suryaprajna/connectors
 *
 * Connector integrations for external services used by the
 * SuryaPrajna PV scientific skills platform.
 */

// Shared types and error classes
export type {
  ConnectorConfig,
  VectorMatch,
  VectorRecord,
  VectorQueryRequest,
  VectorQueryResponse,
  VectorUpsertRequest,
  VectorUpsertResponse,
  VectorDeleteRequest,
  SearchResult,
  BibliographyItem,
  ZoteroCollection,
  ChatMessage,
  ContentPart,
  ChatCompletionRequest,
  ChatCompletionResponse,
  EmbeddingRequest,
  EmbeddingResponse,
  ToolDefinition,
  ClaudeMessage,
  ClaudeContentBlock,
  ClaudeMessageRequest,
  ClaudeMessageResponse,
  ClaudeToolDefinition,
  ClaudeStreamEvent,
} from "./types.js";

export { ConnectorError } from "./types.js";

// Pinecone vector DB connector
export { PineconeConnector } from "./pinecone-connector.js";
export type { PineconeConfig } from "./pinecone-connector.js";

// Zotero bibliography connector
export { ZoteroConnector } from "./zotero-connector.js";
export type { ZoteroConfig, BibFormat } from "./zotero-connector.js";

// Semantic Scholar connector
export { ScholarConnector } from "./scholar-connector.js";
export type {
  ScholarConfig,
  ScholarPaper,
  ScholarSearchResponse,
  ScholarAuthor,
} from "./scholar-connector.js";

// OpenAI connector (GPT-4o multimodal / embeddings)
export { OpenAIConnector } from "./openai-connector.js";
export type { OpenAIConfig } from "./openai-connector.js";

// Anthropic Claude connector (reasoning / tool use)
export { ClaudeConnector } from "./claude-connector.js";
export type { ClaudeConfig } from "./claude-connector.js";
