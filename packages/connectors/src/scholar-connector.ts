/**
 * Semantic Scholar API connector for literature search.
 *
 * Uses the public Semantic Scholar Academic Graph API.
 * An API key is optional but recommended for higher rate limits.
 */

import { ConnectorConfig, ConnectorError, SearchResult } from "./types.js";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export interface ScholarConfig extends Omit<ConnectorConfig, "apiKey"> {
  /** Optional Semantic Scholar API key for higher rate limits. */
  apiKey?: string;
}

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export interface ScholarPaper {
  paperId: string;
  title: string;
  abstract?: string;
  year?: number;
  citationCount?: number;
  referenceCount?: number;
  url?: string;
  externalIds?: {
    DOI?: string;
    ArXiv?: string;
    PubMed?: string;
  };
  authors: Array<{ authorId: string; name: string }>;
  venue?: string;
  publicationDate?: string;
  fieldsOfStudy?: string[];
  isOpenAccess?: boolean;
  openAccessPdf?: { url: string };
}

export interface ScholarSearchResponse {
  total: number;
  offset: number;
  next?: number;
  data: ScholarPaper[];
}

export interface ScholarAuthor {
  authorId: string;
  name: string;
  paperCount?: number;
  citationCount?: number;
  hIndex?: number;
}

// ---------------------------------------------------------------------------
// Connector
// ---------------------------------------------------------------------------

const DEFAULT_PAPER_FIELDS =
  "paperId,title,abstract,year,citationCount,referenceCount,url,externalIds,authors,venue,publicationDate,fieldsOfStudy,isOpenAccess,openAccessPdf";

export class ScholarConnector {
  private readonly apiKey: string | undefined;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(config?: ScholarConfig) {
    this.apiKey = config?.apiKey;
    this.baseUrl = (
      config?.baseUrl ?? "https://api.semanticscholar.org/graph/v1"
    ).replace(/\/+$/, "");
    this.timeoutMs = config?.timeoutMs ?? 30_000;
  }

  // -----------------------------------------------------------------------
  // Paper search
  // -----------------------------------------------------------------------

  /** Keyword search for papers. */
  async searchPapers(
    query: string,
    opts?: {
      limit?: number;
      offset?: number;
      year?: string;
      fieldsOfStudy?: string[];
      fields?: string;
    },
  ): Promise<ScholarSearchResponse> {
    const params = new URLSearchParams({
      query,
      fields: opts?.fields ?? DEFAULT_PAPER_FIELDS,
      limit: String(opts?.limit ?? 10),
      offset: String(opts?.offset ?? 0),
    });
    if (opts?.year) params.set("year", opts.year);
    if (opts?.fieldsOfStudy) {
      params.set("fieldsOfStudy", opts.fieldsOfStudy.join(","));
    }

    return this.request<ScholarSearchResponse>(
      `/paper/search?${params.toString()}`,
    );
  }

  /** Get details for a single paper by its Semantic Scholar ID, DOI, or ArXiv ID. */
  async getPaper(
    paperId: string,
    fields?: string,
  ): Promise<ScholarPaper> {
    const params = new URLSearchParams({
      fields: fields ?? DEFAULT_PAPER_FIELDS,
    });
    return this.request<ScholarPaper>(
      `/paper/${encodeURIComponent(paperId)}?${params.toString()}`,
    );
  }

  /** Get papers that cite the given paper. */
  async getCitations(
    paperId: string,
    opts?: { limit?: number; offset?: number; fields?: string },
  ): Promise<{ data: Array<{ citingPaper: ScholarPaper }> }> {
    const params = new URLSearchParams({
      fields: opts?.fields ?? DEFAULT_PAPER_FIELDS,
      limit: String(opts?.limit ?? 10),
      offset: String(opts?.offset ?? 0),
    });
    return this.request(
      `/paper/${encodeURIComponent(paperId)}/citations?${params.toString()}`,
    );
  }

  /** Get papers referenced by the given paper. */
  async getReferences(
    paperId: string,
    opts?: { limit?: number; offset?: number; fields?: string },
  ): Promise<{ data: Array<{ citedPaper: ScholarPaper }> }> {
    const params = new URLSearchParams({
      fields: opts?.fields ?? DEFAULT_PAPER_FIELDS,
      limit: String(opts?.limit ?? 10),
      offset: String(opts?.offset ?? 0),
    });
    return this.request(
      `/paper/${encodeURIComponent(paperId)}/references?${params.toString()}`,
    );
  }

  // -----------------------------------------------------------------------
  // Author search
  // -----------------------------------------------------------------------

  /** Search for authors by name. */
  async searchAuthors(
    query: string,
    opts?: { limit?: number; offset?: number },
  ): Promise<{ data: ScholarAuthor[] }> {
    const params = new URLSearchParams({
      query,
      limit: String(opts?.limit ?? 10),
      offset: String(opts?.offset ?? 0),
    });
    return this.request(`/author/search?${params.toString()}`);
  }

  /** Get papers by a specific author. */
  async getAuthorPapers(
    authorId: string,
    opts?: { limit?: number; offset?: number; fields?: string },
  ): Promise<{ data: Array<{ paperId: string; title: string }> }> {
    const params = new URLSearchParams({
      fields: opts?.fields ?? "paperId,title,year,citationCount",
      limit: String(opts?.limit ?? 10),
      offset: String(opts?.offset ?? 0),
    });
    return this.request(
      `/author/${encodeURIComponent(authorId)}/papers?${params.toString()}`,
    );
  }

  // -----------------------------------------------------------------------
  // Utility: convert to unified SearchResult
  // -----------------------------------------------------------------------

  /** Convert a ScholarPaper to the shared SearchResult type. */
  toSearchResult(paper: ScholarPaper): SearchResult {
    return {
      id: paper.paperId,
      title: paper.title,
      authors: paper.authors.map((a) => a.name),
      year: paper.year,
      abstract: paper.abstract,
      doi: paper.externalIds?.DOI,
      url: paper.url ?? undefined,
      citationCount: paper.citationCount,
      source: "semantic_scholar",
    };
  }

  // -----------------------------------------------------------------------
  // Internal helpers
  // -----------------------------------------------------------------------

  private async request<T>(path: string): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const headers: Record<string, string> = {
        Accept: "application/json",
      };
      if (this.apiKey) headers["x-api-key"] = this.apiKey;

      const res = await fetch(url, { headers, signal: controller.signal });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new ConnectorError({
          message: `Semantic Scholar API error: ${res.status} ${res.statusText} — ${text}`,
          status: res.status,
          code: "API_ERROR",
          connector: "scholar",
        });
      }

      return (await res.json()) as T;
    } catch (err) {
      if (err instanceof ConnectorError) throw err;
      const message =
        err instanceof Error ? err.message : "Unknown Scholar error";
      throw new ConnectorError({
        message,
        code: "NETWORK_ERROR",
        connector: "scholar",
      });
    } finally {
      clearTimeout(timer);
    }
  }
}
