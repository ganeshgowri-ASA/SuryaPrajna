/**
 * OpenAI API connector for GPT-4o multimodal analysis.
 *
 * Supports chat completions (including vision for EL/IR image analysis)
 * and embedding generation. Uses the OpenAI REST API via native fetch.
 */

import {
  ChatCompletionRequest,
  ChatCompletionResponse,
  ConnectorConfig,
  ConnectorError,
  ContentPart,
  EmbeddingRequest,
  EmbeddingResponse,
} from "./types.js";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export interface OpenAIConfig extends ConnectorConfig {
  /** Organization ID (optional). */
  organization?: string;
  /** Default model to use when not specified per-request. */
  defaultModel?: string;
}

// ---------------------------------------------------------------------------
// Connector
// ---------------------------------------------------------------------------

export class OpenAIConnector {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly organization: string | undefined;
  private readonly defaultModel: string;
  private readonly timeoutMs: number;

  constructor(config: OpenAIConfig) {
    if (!config.apiKey) {
      throw new ConnectorError({
        message: "OpenAI API key is required",
        code: "MISSING_API_KEY",
        connector: "openai",
      });
    }
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl ?? "https://api.openai.com/v1").replace(
      /\/+$/,
      "",
    );
    this.organization = config.organization;
    this.defaultModel = config.defaultModel ?? "gpt-4o";
    this.timeoutMs = config.timeoutMs ?? 60_000;
  }

  // -----------------------------------------------------------------------
  // Chat Completions
  // -----------------------------------------------------------------------

  /** Create a chat completion. */
  async chatCompletion(
    request: Partial<ChatCompletionRequest> & {
      messages: ChatCompletionRequest["messages"];
    },
  ): Promise<ChatCompletionResponse> {
    const body: ChatCompletionRequest = {
      model: request.model ?? this.defaultModel,
      messages: request.messages,
      temperature: request.temperature,
      max_tokens: request.max_tokens,
      top_p: request.top_p,
      stop: request.stop,
      tools: request.tools,
      tool_choice: request.tool_choice,
    };

    return this.request<ChatCompletionResponse>(
      "/chat/completions",
      "POST",
      body,
    );
  }

  // -----------------------------------------------------------------------
  // Vision / Multimodal (EL/IR image analysis)
  // -----------------------------------------------------------------------

  /**
   * Analyze an image using GPT-4o vision capabilities.
   *
   * Useful for EL (electroluminescence) and IR (infrared) image analysis
   * of PV modules to detect cracks, hot spots, and defects.
   *
   * @param imageUrl  URL of the image or a base64 data URI (data:image/...).
   * @param prompt    Text prompt describing the analysis to perform.
   * @param detail    Image detail level: "low", "high", or "auto".
   */
  async analyzeImage(
    imageUrl: string,
    prompt: string,
    detail: "low" | "high" | "auto" = "auto",
  ): Promise<ChatCompletionResponse> {
    const content: ContentPart[] = [
      { type: "text", text: prompt },
      { type: "image_url", image_url: { url: imageUrl, detail } },
    ];

    return this.chatCompletion({
      model: this.defaultModel,
      messages: [{ role: "user", content }],
      max_tokens: 4096,
    });
  }

  /**
   * Analyze multiple images in a single request.
   *
   * Useful for comparing before/after EL images or analyzing a set of
   * IR thermography captures from a PV array.
   */
  async analyzeMultipleImages(
    images: Array<{ url: string; detail?: "low" | "high" | "auto" }>,
    prompt: string,
  ): Promise<ChatCompletionResponse> {
    const content: ContentPart[] = [
      { type: "text", text: prompt },
      ...images.map(
        (img): ContentPart => ({
          type: "image_url",
          image_url: { url: img.url, detail: img.detail ?? "auto" },
        }),
      ),
    ];

    return this.chatCompletion({
      model: this.defaultModel,
      messages: [{ role: "user", content }],
      max_tokens: 4096,
    });
  }

  // -----------------------------------------------------------------------
  // Embeddings
  // -----------------------------------------------------------------------

  /** Generate embeddings for one or more texts. */
  async createEmbedding(
    request: Partial<EmbeddingRequest> & { input: string | string[] },
  ): Promise<EmbeddingResponse> {
    const body: EmbeddingRequest = {
      model: request.model ?? "text-embedding-3-small",
      input: request.input,
    };

    return this.request<EmbeddingResponse>("/embeddings", "POST", body);
  }

  /**
   * Convenience method: embed a single text and return the vector.
   */
  async embed(text: string, model?: string): Promise<number[]> {
    const res = await this.createEmbedding({
      input: text,
      model: model ?? "text-embedding-3-small",
    });
    return res.data[0].embedding;
  }

  // -----------------------------------------------------------------------
  // Internal helpers
  // -----------------------------------------------------------------------

  private async request<T>(
    path: string,
    method: "GET" | "POST",
    body?: unknown,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      };
      if (this.organization) {
        headers["OpenAI-Organization"] = this.organization;
      }

      const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new ConnectorError({
          message: `OpenAI API error: ${res.status} ${res.statusText} — ${text}`,
          status: res.status,
          code: "API_ERROR",
          connector: "openai",
        });
      }

      return (await res.json()) as T;
    } catch (err) {
      if (err instanceof ConnectorError) throw err;
      const message =
        err instanceof Error ? err.message : "Unknown OpenAI error";
      throw new ConnectorError({
        message,
        code: "NETWORK_ERROR",
        connector: "openai",
      });
    } finally {
      clearTimeout(timer);
    }
  }
}
