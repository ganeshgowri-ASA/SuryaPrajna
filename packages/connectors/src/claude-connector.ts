/**
 * Anthropic Claude API connector for reasoning tasks.
 *
 * Supports message creation, streaming, and tool use via the
 * Anthropic Messages API. Uses native fetch — no SDK required.
 */

import {
  ClaudeContentBlock,
  ClaudeMessageRequest,
  ClaudeMessageResponse,
  ClaudeStreamEvent,
  ConnectorConfig,
  ConnectorError,
} from "./types.js";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export interface ClaudeConfig extends ConnectorConfig {
  /** Default model to use when not specified per-request. */
  defaultModel?: string;
  /** Default max_tokens for responses. */
  defaultMaxTokens?: number;
}

// ---------------------------------------------------------------------------
// Connector
// ---------------------------------------------------------------------------

export class ClaudeConnector {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly defaultModel: string;
  private readonly defaultMaxTokens: number;
  private readonly timeoutMs: number;

  private static readonly API_VERSION = "2023-06-01";

  constructor(config: ClaudeConfig) {
    if (!config.apiKey) {
      throw new ConnectorError({
        message: "Anthropic API key is required",
        code: "MISSING_API_KEY",
        connector: "claude",
      });
    }
    this.apiKey = config.apiKey;
    this.baseUrl = (
      config.baseUrl ?? "https://api.anthropic.com/v1"
    ).replace(/\/+$/, "");
    this.defaultModel = config.defaultModel ?? "claude-sonnet-4-20250514";
    this.defaultMaxTokens = config.defaultMaxTokens ?? 4096;
    this.timeoutMs = config.timeoutMs ?? 120_000;
  }

  // -----------------------------------------------------------------------
  // Messages API (non-streaming)
  // -----------------------------------------------------------------------

  /** Create a message (non-streaming). */
  async createMessage(
    request: Partial<ClaudeMessageRequest> & {
      messages: ClaudeMessageRequest["messages"];
    },
  ): Promise<ClaudeMessageResponse> {
    const body: ClaudeMessageRequest = {
      model: request.model ?? this.defaultModel,
      messages: request.messages,
      max_tokens: request.max_tokens ?? this.defaultMaxTokens,
      system: request.system,
      temperature: request.temperature,
      top_p: request.top_p,
      stop_sequences: request.stop_sequences,
      stream: false,
      tools: request.tools,
      tool_choice: request.tool_choice,
    };

    return this.request<ClaudeMessageResponse>("/messages", "POST", body);
  }

  /**
   * Convenience: send a simple text prompt and get the text response.
   */
  async ask(
    prompt: string,
    opts?: {
      system?: string;
      model?: string;
      maxTokens?: number;
      temperature?: number;
    },
  ): Promise<string> {
    const response = await this.createMessage({
      messages: [{ role: "user", content: prompt }],
      system: opts?.system,
      model: opts?.model,
      max_tokens: opts?.maxTokens,
      temperature: opts?.temperature,
    });

    return response.content
      .filter((b): b is Extract<ClaudeContentBlock, { type: "text" }> => b.type === "text")
      .map((b) => b.text)
      .join("");
  }

  // -----------------------------------------------------------------------
  // Messages API (streaming)
  // -----------------------------------------------------------------------

  /**
   * Create a message with streaming. Returns an async iterable of stream events.
   *
   * Usage:
   * ```ts
   * for await (const event of connector.streamMessage({ messages: [...] })) {
   *   if (event.type === "content_block_delta" && event.delta?.text) {
   *     process.stdout.write(event.delta.text);
   *   }
   * }
   * ```
   */
  async *streamMessage(
    request: Partial<ClaudeMessageRequest> & {
      messages: ClaudeMessageRequest["messages"];
    },
  ): AsyncGenerator<ClaudeStreamEvent> {
    const body: ClaudeMessageRequest = {
      model: request.model ?? this.defaultModel,
      messages: request.messages,
      max_tokens: request.max_tokens ?? this.defaultMaxTokens,
      system: request.system,
      temperature: request.temperature,
      top_p: request.top_p,
      stop_sequences: request.stop_sequences,
      stream: true,
      tools: request.tools,
      tool_choice: request.tool_choice,
    };

    const url = `${this.baseUrl}/messages`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new ConnectorError({
          message: `Anthropic API error: ${res.status} ${res.statusText} — ${text}`,
          status: res.status,
          code: "API_ERROR",
          connector: "claude",
        });
      }

      if (!res.body) {
        throw new ConnectorError({
          message: "No response body for streaming request",
          code: "STREAM_ERROR",
          connector: "claude",
        });
      }

      yield* this.parseSSEStream(res.body);
    } catch (err) {
      if (err instanceof ConnectorError) throw err;
      const message =
        err instanceof Error ? err.message : "Unknown Claude error";
      throw new ConnectorError({
        message,
        code: "NETWORK_ERROR",
        connector: "claude",
      });
    } finally {
      clearTimeout(timer);
    }
  }

  // -----------------------------------------------------------------------
  // Tool use helpers
  // -----------------------------------------------------------------------

  /**
   * Create a message with tool definitions. The response may contain
   * tool_use content blocks that the caller should process.
   */
  async createMessageWithTools(
    request: Partial<ClaudeMessageRequest> & {
      messages: ClaudeMessageRequest["messages"];
      tools: ClaudeMessageRequest["tools"];
    },
  ): Promise<ClaudeMessageResponse> {
    return this.createMessage({
      ...request,
      tools: request.tools,
      tool_choice: request.tool_choice ?? { type: "auto" },
    });
  }

  // -----------------------------------------------------------------------
  // Internal helpers
  // -----------------------------------------------------------------------

  private headers(): Record<string, string> {
    return {
      "x-api-key": this.apiKey,
      "anthropic-version": ClaudeConnector.API_VERSION,
      "Content-Type": "application/json",
    };
  }

  private async request<T>(
    path: string,
    method: "GET" | "POST",
    body?: unknown,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(url, {
        method,
        headers: this.headers(),
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new ConnectorError({
          message: `Anthropic API error: ${res.status} ${res.statusText} — ${text}`,
          status: res.status,
          code: "API_ERROR",
          connector: "claude",
        });
      }

      return (await res.json()) as T;
    } catch (err) {
      if (err instanceof ConnectorError) throw err;
      const message =
        err instanceof Error ? err.message : "Unknown Claude error";
      throw new ConnectorError({
        message,
        code: "NETWORK_ERROR",
        connector: "claude",
      });
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Parse an SSE (Server-Sent Events) stream into ClaudeStreamEvents.
   */
  private async *parseSSEStream(
    body: ReadableStream<Uint8Array>,
  ): AsyncGenerator<ClaudeStreamEvent> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE messages (separated by double newlines)
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const lines = part.split("\n");
          let eventType = "";
          let data = "";

          for (const line of lines) {
            if (line.startsWith("event: ")) {
              eventType = line.slice(7).trim();
            } else if (line.startsWith("data: ")) {
              data = line.slice(6);
            }
          }

          if (!data || eventType === "ping") continue;

          try {
            const parsed = JSON.parse(data) as ClaudeStreamEvent;
            if (!parsed.type && eventType) {
              parsed.type = eventType;
            }
            yield parsed;
          } catch {
            // Skip malformed JSON lines
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}
