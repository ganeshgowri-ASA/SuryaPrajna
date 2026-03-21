import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { texts, metadata } = await req.json();
    const pineconeKey = req.headers.get("x-pinecone-key") || "";
    const pineconeEnv = req.headers.get("x-pinecone-env") || "";
    const pineconeIndex = req.headers.get("x-pinecone-index") || "";
    const openaiKey = req.headers.get("x-openai-key") || "";

    if (!pineconeKey || !pineconeIndex || !openaiKey) {
      return NextResponse.json(
        { error: "Pinecone and OpenAI API keys required. Configure in Settings." },
        { status: 401 }
      );
    }

    // Generate embeddings
    const embRes = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: texts,
      }),
    });

    if (!embRes.ok) {
      return NextResponse.json(
        { error: "Failed to generate embeddings" },
        { status: 500 }
      );
    }

    const embData = await embRes.json();
    const embeddings = embData.data || [];

    // Upsert into Pinecone
    const vectors = embeddings.map(
      (emb: { embedding: number[]; index: number }, i: number) => ({
        id: `doc-${Date.now()}-${i}`,
        values: emb.embedding,
        metadata: {
          text: texts[i],
          ...(metadata?.[i] || {}),
        },
      })
    );

    const host = pineconeEnv
      ? `https://${pineconeIndex}-${pineconeEnv}.svc.pinecone.io`
      : `https://${pineconeIndex}.svc.pinecone.io`;

    const pcRes = await fetch(`${host}/vectors/upsert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": pineconeKey,
      },
      body: JSON.stringify({ vectors }),
    });

    if (!pcRes.ok) {
      const err = await pcRes.text();
      return NextResponse.json(
        { error: `Pinecone upsert failed: ${err}` },
        { status: pcRes.status }
      );
    }

    const result = await pcRes.json();
    return NextResponse.json({
      success: true,
      upsertedCount: result.upsertedCount || vectors.length,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
