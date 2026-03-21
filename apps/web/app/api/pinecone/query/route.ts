import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { query, topK } = await req.json();
    const pineconeKey = req.headers.get("x-pinecone-key") || "";
    const pineconeEnv = req.headers.get("x-pinecone-env") || "";
    const pineconeIndex = req.headers.get("x-pinecone-index") || "";
    const openaiKey = req.headers.get("x-openai-key") || "";

    if (!pineconeKey || !pineconeIndex) {
      return NextResponse.json(
        { error: "Pinecone API key and index name required. Configure in Settings." },
        { status: 401 }
      );
    }

    if (!openaiKey) {
      return NextResponse.json(
        { error: "OpenAI API key required for embeddings. Configure in Settings." },
        { status: 401 }
      );
    }

    // Generate embedding for the query using OpenAI
    const embRes = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: query,
      }),
    });

    if (!embRes.ok) {
      return NextResponse.json(
        { error: "Failed to generate embedding" },
        { status: 500 }
      );
    }

    const embData = await embRes.json();
    const vector = embData.data?.[0]?.embedding;

    if (!vector) {
      return NextResponse.json(
        { error: "No embedding generated" },
        { status: 500 }
      );
    }

    // Query Pinecone
    const host = pineconeEnv
      ? `https://${pineconeIndex}-${pineconeEnv}.svc.pinecone.io`
      : `https://${pineconeIndex}.svc.pinecone.io`;

    const pcRes = await fetch(`${host}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": pineconeKey,
      },
      body: JSON.stringify({
        vector,
        topK: topK || 5,
        includeMetadata: true,
      }),
    });

    if (!pcRes.ok) {
      const err = await pcRes.text();
      return NextResponse.json(
        { error: `Pinecone query failed: ${err}` },
        { status: pcRes.status }
      );
    }

    const pcData = await pcRes.json();
    return NextResponse.json({ matches: pcData.matches || [] });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
