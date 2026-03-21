/**
 * Zotero API connector for bibliography management.
 *
 * Supports user and group libraries. Uses Zotero Web API v3 via native fetch.
 */

import {
  BibliographyItem,
  ConnectorConfig,
  ConnectorError,
  ZoteroCollection,
} from "./types.js";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export interface ZoteroConfig extends ConnectorConfig {
  /** Zotero user ID (numeric). Required for user-library operations. */
  userId?: string;
  /** Zotero group ID. If provided, operations target the group library. */
  groupId?: string;
}

/** Supported bibliography export formats. */
export type BibFormat =
  | "bibtex"
  | "biblatex"
  | "ris"
  | "csljson"
  | "coins"
  | "mods"
  | "refer"
  | "tei";

// ---------------------------------------------------------------------------
// Connector
// ---------------------------------------------------------------------------

export class ZoteroConnector {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly libraryPrefix: string;
  private readonly timeoutMs: number;

  constructor(config: ZoteroConfig) {
    if (!config.apiKey) {
      throw new ConnectorError({
        message: "Zotero API key is required",
        code: "MISSING_API_KEY",
        connector: "zotero",
      });
    }
    if (!config.userId && !config.groupId) {
      throw new ConnectorError({
        message: "Either userId or groupId must be provided",
        code: "MISSING_LIBRARY_ID",
        connector: "zotero",
      });
    }

    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl ?? "https://api.zotero.org").replace(
      /\/+$/,
      "",
    );
    this.libraryPrefix = config.groupId
      ? `/groups/${config.groupId}`
      : `/users/${config.userId}`;
    this.timeoutMs = config.timeoutMs ?? 30_000;
  }

  // -----------------------------------------------------------------------
  // Items
  // -----------------------------------------------------------------------

  /** Full-text search across items in the library. */
  async searchItems(
    query: string,
    opts?: { limit?: number; start?: number; sort?: string },
  ): Promise<BibliographyItem[]> {
    const params = new URLSearchParams({ q: query, format: "json" });
    if (opts?.limit) params.set("limit", String(opts.limit));
    if (opts?.start) params.set("start", String(opts.start));
    if (opts?.sort) params.set("sort", opts.sort);

    const items = await this.request<ZoteroItemResponse[]>(
      `${this.libraryPrefix}/items?${params.toString()}`,
    );
    return items.map(mapItem);
  }

  /** Get a single item by key. */
  async getItem(key: string): Promise<BibliographyItem> {
    const item = await this.request<ZoteroItemResponse>(
      `${this.libraryPrefix}/items/${key}?format=json`,
    );
    return mapItem(item);
  }

  /** Create a new item in the library. */
  async createItem(
    item: Partial<BibliographyItem> & { itemType: string; title: string },
  ): Promise<{ key: string; version: number }> {
    const payload = [
      {
        itemType: item.itemType,
        title: item.title,
        creators: item.creators ?? [],
        date: item.date ?? "",
        DOI: item.doi ?? "",
        url: item.url ?? "",
        abstractNote: item.abstractNote ?? "",
        tags: item.tags ?? [],
        collections: item.collections ?? [],
      },
    ];

    const res = await this.request<{
      successful: Record<string, { key: string; version: number; data: unknown }>;
      failed: Record<string, { code: number; message: string }>;
    }>(`${this.libraryPrefix}/items`, "POST", payload);

    const first = Object.values(res.successful)[0];
    if (!first) {
      const failMsg = Object.values(res.failed)[0]?.message ?? "Unknown error";
      throw new ConnectorError({
        message: `Failed to create item: ${failMsg}`,
        code: "CREATE_FAILED",
        connector: "zotero",
      });
    }
    return { key: first.key, version: first.version };
  }

  /** Delete an item by key. */
  async deleteItem(key: string, version: number): Promise<void> {
    await this.request(
      `${this.libraryPrefix}/items/${key}`,
      "DELETE",
      undefined,
      { "If-Unmodified-Since-Version": String(version) },
    );
  }

  /** Export bibliography for given item keys in the specified format. */
  async exportBibliography(
    keys: string[],
    format: BibFormat = "bibtex",
  ): Promise<string> {
    const params = new URLSearchParams({
      itemKey: keys.join(","),
      format,
    });
    const text = await this.requestText(
      `${this.libraryPrefix}/items?${params.toString()}`,
    );
    return text;
  }

  // -----------------------------------------------------------------------
  // Collections
  // -----------------------------------------------------------------------

  /** List all collections in the library. */
  async getCollections(): Promise<ZoteroCollection[]> {
    const collections = await this.request<ZoteroCollectionResponse[]>(
      `${this.libraryPrefix}/collections?format=json`,
    );
    return collections.map((c) => ({
      key: c.key,
      name: c.data.name,
      parentCollection: c.data.parentCollection,
      numItems: c.meta?.numItems ?? 0,
    }));
  }

  /** List items in a specific collection. */
  async getCollectionItems(
    collectionKey: string,
    opts?: { limit?: number; start?: number },
  ): Promise<BibliographyItem[]> {
    const params = new URLSearchParams({ format: "json" });
    if (opts?.limit) params.set("limit", String(opts.limit));
    if (opts?.start) params.set("start", String(opts.start));

    const items = await this.request<ZoteroItemResponse[]>(
      `${this.libraryPrefix}/collections/${collectionKey}/items?${params.toString()}`,
    );
    return items.map(mapItem);
  }

  // -----------------------------------------------------------------------
  // Internal helpers
  // -----------------------------------------------------------------------

  private async request<T>(
    path: string,
    method: "GET" | "POST" | "DELETE" = "GET",
    body?: unknown,
    extraHeaders?: Record<string, string>,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const headers: Record<string, string> = {
        "Zotero-API-Key": this.apiKey,
        "Zotero-API-Version": "3",
        "Content-Type": "application/json",
        ...extraHeaders,
      };

      const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new ConnectorError({
          message: `Zotero API error: ${res.status} ${res.statusText} — ${text}`,
          status: res.status,
          code: "API_ERROR",
          connector: "zotero",
        });
      }

      if (method === "DELETE") return undefined as unknown as T;
      return (await res.json()) as T;
    } catch (err) {
      if (err instanceof ConnectorError) throw err;
      const message =
        err instanceof Error ? err.message : "Unknown Zotero error";
      throw new ConnectorError({
        message,
        code: "NETWORK_ERROR",
        connector: "zotero",
      });
    } finally {
      clearTimeout(timer);
    }
  }

  private async requestText(path: string): Promise<string> {
    const url = `${this.baseUrl}${path}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(url, {
        headers: {
          "Zotero-API-Key": this.apiKey,
          "Zotero-API-Version": "3",
        },
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new ConnectorError({
          message: `Zotero export error: ${res.status} ${res.statusText}`,
          status: res.status,
          code: "API_ERROR",
          connector: "zotero",
        });
      }

      return await res.text();
    } catch (err) {
      if (err instanceof ConnectorError) throw err;
      throw new ConnectorError({
        message:
          err instanceof Error ? err.message : "Unknown Zotero error",
        code: "NETWORK_ERROR",
        connector: "zotero",
      });
    } finally {
      clearTimeout(timer);
    }
  }
}

// ---------------------------------------------------------------------------
// Internal Zotero response shapes
// ---------------------------------------------------------------------------

interface ZoteroItemResponse {
  key: string;
  data: {
    itemType: string;
    title: string;
    creators: Array<{
      firstName?: string;
      lastName: string;
      creatorType: string;
    }>;
    date?: string;
    DOI?: string;
    url?: string;
    abstractNote?: string;
    tags?: Array<{ tag: string }>;
    collections?: string[];
    extra?: string;
  };
}

interface ZoteroCollectionResponse {
  key: string;
  data: {
    name: string;
    parentCollection: string | false;
  };
  meta?: { numItems?: number };
}

function mapItem(item: ZoteroItemResponse): BibliographyItem {
  return {
    key: item.key,
    itemType: item.data.itemType,
    title: item.data.title,
    creators: item.data.creators,
    date: item.data.date,
    doi: item.data.DOI,
    url: item.data.url,
    abstractNote: item.data.abstractNote,
    tags: item.data.tags,
    collections: item.data.collections,
    extra: item.data.extra,
  };
}
