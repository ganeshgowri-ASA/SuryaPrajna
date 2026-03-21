/**
 * Pinecone vector DB connector for RAG over IEC standards and research papers.
 *
 * Uses the Pinecone REST API via native fetch — no SDK required.
 */

import {
  ConnectorConfig,
  ConnectorError,
  VectorDeleteRequest,
  VectorMatch,
  VectorQueryRequest,
  VectorQueryResponse,
  VectorRecord,
  VectorUpsertRequest,
  VectorUpsertResponse,
} from "./types.js";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export interface PineconeConfig extends ConnectorConfig {
  /** The full host URL for your Pinecone index (e.g. "https://my-index-abc123.svc.environment.pinecone.io"). */
  baseUrl: string;
}

// ---------------------------------------------------------------------------
// Connector
// ---------------------------------------------------------------------------

export class PineconeConnector {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(config: PineconeConfig) {
    if (!config.apiKey) {
      throw new ConnectorError({
        message: "Pinecone API key is required",
        code: "MISSING_API_KEY",
        connector: "pinecone",
      });
    }
    if (!config.baseUrl) {
      throw new ConnectorError({
        message: "Pinecone index host URL (baseUrl) is required",
        code: "MISSING_BASE_URL",
        connector: "pinecone",
      });
    }
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.timeoutMs = config.timeoutMs ?? 30_000;
  }

  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------

  /** Upsert vectors into the index. */
  async upsert(request: VectorUpsertRequest): Promise<VectorUpsertResponse> {
    const body: Record<string, unknown> = { vectors: request.vectors };
    if (request.namespace) body.namespace = request.namespace;

    const res = await this.request<{ upsertedCount: number }>(
      "/vectors/upsert",
      "POST",
      body,
    );
    return { upsertedCount: res.upsertedCount };
  }

  /** Query the index by embedding vector. */
  async query(request: VectorQueryRequest): Promise<VectorQueryResponse> {
    const body: Record<string, unknown> = {
      vector: request.vector,
      topK: request.topK,
      includeMetadata: request.includeMetadata ?? true,
      includeValues: request.includeValues ?? false,
    };
    if (request.namespace) body.namespace = request.namespace;
    if (request.filter) body.filter = request.filter;

    const res = await this.request<{
      matches: VectorMatch[];
      namespace: string;
    }>("/query", "POST", body);

    return {
      matches: res.matches ?? [],
      namespace: res.namespace ?? request.namespace ?? "",
    };
  }

  /** Fetch vectors by ID. */
  async fetch(
    ids: string[],
    namespace?: string,
  ): Promise<Record<string, VectorRecord>> {
    const params = new URLSearchParams();
    for (const id of ids) params.append("ids", id);
    if (namespace) params.set("namespace", namespace);

    const res = await this.request<{
      vectors: Record<
        string,
        { id: string; values: number[]; metadata?: Record<string, unknown> }
      >;
    }>(`/vectors/fetch?${params.toString()}`, "GET");

    return res.vectors ?? {};
  }

  /** Delete vectors by ID, filter, or delete all in a namespace. */
  async delete(request: VectorDeleteRequest): Promise<void> {
    const body: Record<string, unknown> = {};
    if (request.ids) body.ids = request.ids;
    if (request.deleteAll) body.deleteAll = true;
    if (request.namespace) body.namespace = request.namespace;
    if (request.filter) body.filter = request.filter;

    await this.request("/vectors/delete", "POST", body);
  }

  /** Describe index statistics, optionally filtered by namespace. */
  async describeIndexStats(
    filter?: Record<string, unknown>,
  ): Promise<{
    namespaces: Record<string, { vectorCount: number }>;
    dimension: number;
    totalVectorCount: number;
  }> {
    const body: Record<string, unknown> = {};
    if (filter) body.filter = filter;
    return this.request("/describe_index_stats", "POST", body);
  }

  // -----------------------------------------------------------------------
  // Internal helpers
  // -----------------------------------------------------------------------

  private async request<T>(
    path: string,
    method: "GET" | "POST",
    body?: Record<string, unknown>,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Api-Key": this.apiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new ConnectorError({
          message: `Pinecone API error: ${res.status} ${res.statusText} — ${text}`,
          status: res.status,
          code: "API_ERROR",
          connector: "pinecone",
        });
      }

      return (await res.json()) as T;
    } catch (err) {
      if (err instanceof ConnectorError) throw err;
      const message =
        err instanceof Error ? err.message : "Unknown Pinecone error";
      throw new ConnectorError({
        message,
        code: "NETWORK_ERROR",
        connector: "pinecone",
      });
    } finally {
      clearTimeout(timer);
    }
  }
}
