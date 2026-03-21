import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    const perplexityKey = req.headers.get("x-perplexity-key") || "";

    if (!perplexityKey) {
      // Fall back to Semantic Scholar (free, no key needed)
      const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=10&fields=title,authors,year,abstract,citationCount,url,externalIds`;
      const res = await fetch(url);

      if (!res.ok) {
        return NextResponse.json(
          { error: "Semantic Scholar API error" },
          { status: res.status }
        );
      }

      const data = await res.json();
      const papers = (data.data || []).map((p: Record<string, unknown>) => ({
        title: p.title,
        authors: Array.isArray(p.authors)
          ? p.authors.map((a: Record<string, string>) => a.name).join(", ")
          : "",
        year: p.year,
        abstract: p.abstract,
        citations: p.citationCount,
        url: p.url,
        doi: (p.externalIds as Record<string, string> | null)?.DOI || null,
      }));

      return NextResponse.json({ papers, source: "semantic_scholar" });
    }

    // Use Perplexity for AI-powered literature review
    const res = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${perplexityKey}`,
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          {
            role: "system",
            content:
              "You are an academic research assistant. Search for and summarize relevant academic papers on the given topic. Include paper titles, authors, year, DOI when available, and a brief summary of findings. Focus on peer-reviewed sources.",
          },
          { role: "user", content: `Find relevant academic papers about: ${query}` },
        ],
        max_tokens: 2048,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: `Perplexity API error: ${res.status} - ${err}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";
    return NextResponse.json({ content: text, source: "perplexity" });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
