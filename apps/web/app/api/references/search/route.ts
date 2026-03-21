import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { query, type } = await req.json();

    if (type === "doi") {
      // Resolve DOI via Crossref
      const doi = query.replace(/^https?:\/\/doi\.org\//, "");
      const res = await fetch(
        `https://api.crossref.org/works/${encodeURIComponent(doi)}`
      );
      if (!res.ok) {
        return NextResponse.json(
          { error: "Could not resolve DOI" },
          { status: 404 }
        );
      }
      const data = await res.json();
      const work = data.message;
      return NextResponse.json({
        results: [
          {
            title: work.title?.[0] || "",
            authors: (work.author || [])
              .map(
                (a: { family?: string; given?: string }) =>
                  `${a.family || ""}, ${a.given || ""}`
              )
              .join(" and "),
            year: work.published?.["date-parts"]?.[0]?.[0]?.toString() || "",
            journal: work["container-title"]?.[0] || "",
            doi,
            volume: work.volume || "",
            pages: work.page || "",
            type: "article",
          },
        ],
      });
    }

    if (type === "arxiv") {
      // Resolve arXiv ID
      const arxivId = query.replace(/^https?:\/\/arxiv\.org\/abs\//, "");
      const res = await fetch(
        `http://export.arxiv.org/api/query?id_list=${encodeURIComponent(arxivId)}`
      );
      if (!res.ok) {
        return NextResponse.json(
          { error: "Could not resolve arXiv ID" },
          { status: 404 }
        );
      }
      const text = await res.text();
      // Basic XML parsing for arXiv response
      const titleMatch = text.match(/<title>([^<]+)<\/title>/g);
      const authorMatches = text.match(/<name>([^<]+)<\/name>/g);
      const title = titleMatch?.[1]?.replace(/<\/?title>/g, "").trim() || query;
      const authors = authorMatches
        ? authorMatches.map((a) => a.replace(/<\/?name>/g, "").trim()).join(" and ")
        : "";
      const yearMatch = text.match(/<published>(\d{4})/);
      const year = yearMatch?.[1] || "";

      return NextResponse.json({
        results: [
          {
            title,
            authors,
            year,
            journal: "arXiv",
            doi: "",
            volume: arxivId,
            pages: "",
            type: "article",
          },
        ],
      });
    }

    // General search via Semantic Scholar (free, no API key required)
    const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=10&fields=title,authors,year,externalIds,venue,citationCount`;
    const res = await fetch(url);

    if (!res.ok) {
      return NextResponse.json(
        { error: "Search service unavailable" },
        { status: res.status }
      );
    }

    const data = await res.json();
    const results = (data.data || []).map(
      (p: Record<string, unknown>) => ({
        title: p.title || "",
        authors: Array.isArray(p.authors)
          ? p.authors.map((a: Record<string, string>) => a.name).join(", ")
          : "",
        year: p.year?.toString() || "",
        journal: p.venue || "",
        doi: (p.externalIds as Record<string, string> | null)?.DOI || "",
        citations: p.citationCount || 0,
        type: "article",
      })
    );

    return NextResponse.json({ results });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
