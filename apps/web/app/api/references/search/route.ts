import { type NextRequest, NextResponse } from "next/server";

interface SearchResult {
  title: string;
  authors: string;
  year: string;
  journal: string;
  doi: string;
  volume?: string;
  pages?: string;
  citations?: number;
  abstract?: string;
  type: string;
  source?: string;
}

async function resolveDOI(
  query: string,
): Promise<{ results: SearchResult[] } | { error: string; status: number }> {
  const doi = query.replace(/^https?:\/\/doi\.org\//, "");
  const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
  if (!res.ok) return { error: "Could not resolve DOI", status: 404 };
  const data = await res.json();
  const work = data.message;
  return {
    results: [
      {
        title: work.title?.[0] || "",
        authors: (work.author || [])
          .map((a: { family?: string; given?: string }) => `${a.family || ""}, ${a.given || ""}`)
          .join(" and "),
        year: work.published?.["date-parts"]?.[0]?.[0]?.toString() || "",
        journal: work["container-title"]?.[0] || "",
        doi,
        volume: work.volume || "",
        pages: work.page || "",
        type: "article",
      },
    ],
  };
}

async function resolveArxiv(query: string): Promise<{ results: SearchResult[] }> {
  const arxivId = query.replace(/^https?:\/\/arxiv\.org\/abs\//, "");
  const res = await fetch(
    `http://export.arxiv.org/api/query?id_list=${encodeURIComponent(arxivId)}`,
  );
  if (!res.ok) return { results: [] };
  const text = await res.text();
  const titleMatch = text.match(/<title>([^<]+)<\/title>/g);
  const authorMatches = text.match(/<name>([^<]+)<\/name>/g);
  const title = titleMatch?.[1]?.replace(/<\/?title>/g, "").trim() || query;
  const authors = authorMatches
    ? authorMatches.map((a) => a.replace(/<\/?name>/g, "").trim()).join(" and ")
    : "";
  const yearMatch = text.match(/<published>(\d{4})/);
  return {
    results: [
      {
        title,
        authors,
        year: yearMatch?.[1] || "",
        journal: "arXiv",
        doi: "",
        volume: arxivId,
        pages: "",
        type: "article",
      },
    ],
  };
}

async function searchPerplexity(
  query: string,
  perplexityKey: string,
): Promise<{ results: SearchResult[]; citations?: unknown }> {
  const res = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${perplexityKey}` },
    body: JSON.stringify({
      model: "sonar-pro",
      messages: [
        {
          role: "system",
          content:
            "You are an academic citation finder specializing in photovoltaic and solar energy research. Return papers as a JSON array with fields: title, authors, year, journal, doi, citations (number), abstract (brief). Return ONLY valid JSON. No markdown. Find relevant, highly-cited papers. Prefer recent publications.",
        },
        { role: "user", content: `Find academic papers about: ${query}` },
      ],
      max_tokens: 4096,
    }),
  });
  if (!res.ok) return { results: [] };
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "[]";
  try {
    const jsonStr = content
      .replace(/```json?\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();
    const papers = JSON.parse(jsonStr);
    const results: SearchResult[] = (Array.isArray(papers) ? papers : []).map(
      (p: Record<string, unknown>) => ({
        title: (p.title as string) || "",
        authors: (p.authors as string) || "",
        year: String(p.year || ""),
        journal: (p.journal as string) || "",
        doi: (p.doi as string) || "",
        citations: (p.citations as number) || 0,
        abstract: (p.abstract as string) || "",
        type: "article",
        source: "perplexity",
      }),
    );
    return { results, citations: data.citations };
  } catch {
    return { results: [] };
  }
}

async function searchSemanticScholar(query: string): Promise<{ results: SearchResult[] }> {
  const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=10&fields=title,authors,year,externalIds,venue,citationCount`;
  const res = await fetch(url);
  if (!res.ok) return { results: [] };
  const data = await res.json();
  const results: SearchResult[] = (data.data || []).map((p: Record<string, unknown>) => ({
    title: p.title || "",
    authors: Array.isArray(p.authors)
      ? p.authors.map((a: Record<string, string>) => a.name).join(", ")
      : "",
    year: p.year?.toString() || "",
    journal: p.venue || "",
    doi: (p.externalIds as Record<string, string> | null)?.DOI || "",
    citations: p.citationCount || 0,
    type: "article",
  }));
  return { results };
}

export async function POST(req: NextRequest) {
  try {
    const { query, type, source } = await req.json();

    if (type === "doi") {
      const result = await resolveDOI(query);
      if ("error" in result) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }
      return NextResponse.json(result);
    }

    if (type === "arxiv") {
      return NextResponse.json(await resolveArxiv(query));
    }

    if (source === "perplexity") {
      const perplexityKey =
        req.headers.get("x-perplexity-key") || process.env.PERPLEXITY_API_KEY || "";
      if (!perplexityKey) {
        return NextResponse.json(
          { error: "Perplexity API key required. Configure in Settings." },
          { status: 401 },
        );
      }
      return NextResponse.json(await searchPerplexity(query, perplexityKey));
    }

    return NextResponse.json(await searchSemanticScholar(query));
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
