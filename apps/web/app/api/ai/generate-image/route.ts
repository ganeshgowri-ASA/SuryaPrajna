import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt, size } = await req.json();
    const openaiKey = req.headers.get("x-openai-key") || "";

    if (!openaiKey) {
      return NextResponse.json(
        { error: "OpenAI API key required for image generation. Add it in Settings." },
        { status: 401 }
      );
    }

    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: size || "1024x1024",
        response_format: "url",
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: `OpenAI API error: ${res.status} - ${err}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const imageUrl = data.data?.[0]?.url || "";
    const revisedPrompt = data.data?.[0]?.revised_prompt || prompt;

    return NextResponse.json({ url: imageUrl, revisedPrompt });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
