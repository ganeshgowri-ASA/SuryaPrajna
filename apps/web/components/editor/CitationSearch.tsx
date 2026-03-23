"use client";

import { useProviderKeys } from "@/lib/useProviderKeys";
import { useCallback, useState } from "react";
import type { Reference } from "./ReferenceManager";

interface CitationSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onAddReference: (ref: Reference) => void;
  onInsertCitation: (key: string) => void;
  existingKeys: Set<string>;
}

interface SearchResult {
  paperId: string;
  title: string;
  authors: string;
  year: string;
  journal: string;
  doi: string;
  citationCount: number;
  abstract: string;
  url: string;
}

type SearchSource = "crossref" | "semanticscholar" | "openalex" | "perplexity";
type CitationStyle = "APA" | "IEEE" | "Chicago" | "MLA" | "Harvard";

function generateKey(title: string, year: string): string {
  const firstWord =
    title
      .split(/\s+/)[0]
      ?.toLowerCase()
      .replace(/[^a-z]/g, "") || "ref";
  return `${firstWord}${year}`;
}

function formatCitation(r: SearchResult, style: CitationStyle): string {
  switch (style) {
    case "APA":
      return `${r.authors} (${r.year}). ${r.title}.${r.journal ? ` *${r.journal}*.` : ""}${r.doi ? ` https://doi.org/${r.doi}` : ""}`;
    case "IEEE":
      return `${r.authors}, "${r.title},"${r.journal ? ` *${r.journal}*,` : ""} ${r.year}.`;
    case "Chicago":
      return `${r.authors}. "${r.title}."${r.journal ? ` *${r.journal}*` : ""} (${r.year}).`;
    case "MLA":
      return `${r.authors}. "${r.title}."${r.journal ? ` *${r.journal}*,` : ""} ${r.year}.`;
    case "Harvard":
      return `${r.authors} (${r.year}) '${r.title}',${r.journal ? ` *${r.journal}*.` : ""}`;
  }
}

function parseSemanticScholarResults(data: Record<string, unknown>): SearchResult[] {
  return ((data.data as Array<Record<string, unknown>>) || []).map((p) => ({
    paperId: p.paperId as string,
    title: (p.title as string) || "",
    authors: ((p.authors as Array<{ name: string }>) || []).map((a) => a.name).join(", "),
    year: String(p.year || ""),
    journal: (p.venue as string) || "",
    doi: (p.externalIds as Record<string, string>)?.DOI || "",
    citationCount: (p.citationCount as number) || 0,
    abstract: (p.abstract as string) || "",
    url: (p.url as string) || "",
  }));
}

function parseCrossrefResults(data: Record<string, unknown>): SearchResult[] {
  const message = data.message as Record<string, unknown> | undefined;
  return ((message?.items as Array<Record<string, unknown>>) || []).map((p) => ({
    paperId: (p.DOI as string) || "",
    title: ((p.title as string[]) || [""])[0],
    authors: ((p.author as Array<{ family?: string; given?: string }>) || [])
      .map((a) => `${a.given || ""} ${a.family || ""}`.trim())
      .join(", "),
    year: String(
      (p.published as Record<string, unknown>)?.["date-parts"]
        ? ((p.published as Record<string, number[][]>)["date-parts"][0] || [])[0]
        : "",
    ),
    journal: ((p["container-title"] as string[]) || [""])[0],
    doi: (p.DOI as string) || "",
    citationCount: (p["is-referenced-by-count"] as number) || 0,
    abstract: "",
    url: (p.URL as string) || "",
  }));
}

function parseOpenAlexResults(data: Record<string, unknown>): SearchResult[] {
  return ((data.results as Array<Record<string, unknown>>) || []).map((p) => ({
    paperId: (p.id as string) || "",
    title: (p.title as string) || "",
    authors: ((p.authorships as Array<{ author: { display_name: string } }>) || [])
      .map((a) => a.author?.display_name || "")
      .join(", "),
    year: String(p.publication_year || ""),
    journal: (p.primary_location as Record<string, unknown>)?.source
      ? (p.primary_location as Record<string, Record<string, string>>).source?.display_name || ""
      : "",
    doi: p.doi ? (p.doi as string).replace("https://doi.org/", "") : "",
    citationCount: (p.cited_by_count as number) || 0,
    abstract: "",
    url: (p.doi as string) || "",
  }));
}

function buildSearchRequest(
  source: SearchSource,
  query: string,
  yearFilter: string,
): { url: string; parser: (data: Record<string, unknown>) => SearchResult[] } {
  const encodedQuery = encodeURIComponent(query);

  if (source === "semanticscholar") {
    const yearParam = yearFilter !== "all" ? `&year=${yearFilter}-` : "";
    return {
      url: `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodedQuery}&limit=20&fields=title,authors,year,venue,externalIds,citationCount,abstract,url${yearParam}`,
      parser: parseSemanticScholarResults,
    };
  }

  if (source === "crossref") {
    const yearParam = yearFilter !== "all" ? `&filter=from-pub-date:${yearFilter}-01-01` : "";
    return {
      url: `https://api.crossref.org/works?query=${encodedQuery}&rows=20${yearParam}`,
      parser: parseCrossrefResults,
    };
  }

  const yearParam = yearFilter !== "all" ? `,publication_year:>${yearFilter}` : "";
  return {
    url: `https://api.openalex.org/works?search=${encodedQuery}&per_page=20&filter=has_doi:true${yearParam}&mailto=suryaprajna@example.com`,
    parser: parseOpenAlexResults,
  };
}

export default function CitationSearch({
  isOpen,
  onClose,
  onAddReference,
  onInsertCitation,
  existingKeys,
}: CitationSearchProps) {
  const { keys, headers } = useProviderKeys();
  const perplexityKey = keys.perplexityKey;

  const [query, setQuery] = useState("");
  const [source, setSource] = useState<SearchSource>("semanticscholar");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [citationStyle, setCitationStyle] = useState<CitationStyle>("APA");
  const [expandedAbstract, setExpandedAbstract] = useState<string | null>(null);

  const fetchPerplexity = useCallback(
    async (q: string): Promise<SearchResult[]> => {
      const res = await fetch("/api/references/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify({ query: q, source: "perplexity" }),
      });
      if (!res.ok) return [];
      const data = await res.json();
      return (data.results || []).map((p: Record<string, unknown>) => ({
        paperId: (p.doi as string) || `pplx-${Date.now()}-${Math.random()}`,
        title: (p.title as string) || "",
        authors: (p.authors as string) || "",
        year: String(p.year || ""),
        journal: (p.journal as string) || "",
        doi: (p.doi as string) || "",
        citationCount: (p.citations as number) || 0,
        abstract: (p.abstract as string) || "",
        url: p.doi ? `https://doi.org/${p.doi}` : "",
      }));
    },
    [headers],
  );

  const searchPapers = useCallback(async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setResults([]);
    try {
      if (source === "perplexity") {
        setResults(await fetchPerplexity(query));
      } else {
        const { url, parser } = buildSearchRequest(source, query, yearFilter);
        const res = await fetch(url);
        setResults(res.ok ? parser(await res.json()) : []);
      }
    } catch (err) {
      console.error("Search failed:", err);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [query, source, yearFilter, fetchPerplexity]);

  const addAndCite = useCallback(
    (result: SearchResult) => {
      const key = generateKey(result.title, result.year);
      if (!existingKeys.has(key)) {
        const ref: Reference = {
          id: `${Date.now()}-${Math.random()}`,
          key,
          type: "article",
          title: result.title,
          authors: result.authors,
          year: result.year,
          journal: result.journal || undefined,
          doi: result.doi || undefined,
        };
        onAddReference(ref);
      }
      onInsertCitation(key);
    },
    [existingKeys, onAddReference, onInsertCitation],
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700/60 rounded-xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/60 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-white">Literature Search</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Search academic papers across CrossRef, Semantic Scholar, OpenAlex, and Perplexity AI
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 text-xl"
          >
            ×
          </button>
        </div>

        {/* Search controls */}
        <div className="px-6 py-3 border-b border-gray-800/40 flex-shrink-0 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchPapers()}
              placeholder="Search by title, author, DOI, or keywords..."
              className="flex-1 bg-gray-800/60 border border-gray-700/40 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-500/40"
            />
            <button
              type="button"
              onClick={searchPapers}
              disabled={isSearching || !query.trim()}
              className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg text-sm font-medium hover:bg-amber-500/30 transition-colors disabled:opacity-40"
            >
              {isSearching ? "Searching..." : "Search"}
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Source selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Source:</span>
              <div className="flex gap-1">
                {(
                  [
                    { key: "semanticscholar", label: "Semantic Scholar" },
                    { key: "crossref", label: "CrossRef" },
                    { key: "openalex", label: "OpenAlex" },
                    ...(perplexityKey
                      ? [{ key: "perplexity" as const, label: "Perplexity AI" }]
                      : []),
                  ] as const
                ).map((s) => (
                  <button
                    type="button"
                    key={s.key}
                    onClick={() => setSource(s.key)}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      source === s.key
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-gray-800/60 text-gray-400 border border-gray-700/40 hover:border-gray-600"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Year filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Since:</span>
              <div className="flex gap-1">
                {["all", "2024", "2022", "2020", "2018"].map((y) => (
                  <button
                    type="button"
                    key={y}
                    onClick={() => setYearFilter(y)}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      yearFilter === y
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-gray-800/60 text-gray-400 border border-gray-700/40 hover:border-gray-600"
                    }`}
                  >
                    {y === "all" ? "All" : `${y}+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Citation style */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-gray-500">Style:</span>
              <select
                value={citationStyle}
                onChange={(e) => setCitationStyle(e.target.value as CitationStyle)}
                className="bg-gray-800/60 border border-gray-700/40 rounded text-xs text-gray-300 px-2 py-1 focus:outline-none"
              >
                {(["APA", "IEEE", "Chicago", "MLA", "Harvard"] as CitationStyle[]).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-auto min-h-0">
          {results.length === 0 && !isSearching ? (
            <div className="p-8 text-center text-gray-600">
              <p className="text-sm">Search for papers to add to your references</p>
              <p className="text-xs mt-1">All APIs are free and require no API key</p>
            </div>
          ) : isSearching ? (
            <div className="p-8 text-center">
              <span className="text-sm text-amber-400 animate-pulse">Searching {source}...</span>
            </div>
          ) : (
            <div className="divide-y divide-gray-800/40">
              {results.map((r) => (
                <div key={r.paperId} className="px-6 py-3 hover:bg-gray-800/20 group">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm text-white font-medium leading-tight">{r.title}</h3>
                      <p className="text-xs text-gray-400 mt-1">{r.authors}</p>
                      <div className="flex items-center gap-3 mt-1">
                        {r.journal && (
                          <span className="text-xs text-gray-500 italic">{r.journal}</span>
                        )}
                        {r.year && <span className="text-xs text-gray-600">{r.year}</span>}
                        {r.citationCount > 0 && (
                          <span className="text-xs text-gray-600">
                            {r.citationCount.toLocaleString()} citations
                          </span>
                        )}
                        {r.doi && <span className="text-xs text-gray-700 font-mono">{r.doi}</span>}
                      </div>
                      {expandedAbstract === r.paperId && r.abstract && (
                        <p className="text-xs text-gray-400 mt-2 leading-relaxed bg-gray-800/30 rounded p-2">
                          {r.abstract}
                        </p>
                      )}
                      <div className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                        {formatCitation(r, citationStyle)}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => addAndCite(r)}
                        className="px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded text-xs font-medium hover:bg-amber-500/30 transition-colors whitespace-nowrap"
                      >
                        Cite
                      </button>
                      {r.abstract && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedAbstract(expandedAbstract === r.paperId ? null : r.paperId)
                          }
                          className="px-3 py-1 bg-gray-800/60 text-gray-400 rounded text-xs hover:bg-gray-700/60 transition-colors"
                        >
                          {expandedAbstract === r.paperId ? "Hide" : "Abstract"}
                        </button>
                      )}
                      {r.doi && (
                        <a
                          href={`https://doi.org/${r.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-gray-800/60 text-gray-400 rounded text-xs hover:bg-gray-700/60 transition-colors text-center"
                        >
                          DOI
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {results.length > 0 && (
          <div className="px-6 py-2 border-t border-gray-800/60 flex-shrink-0">
            <p className="text-xs text-gray-600">
              {results.length} results from {source} | Style: {citationStyle}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
